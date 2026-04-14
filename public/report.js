import {
  bindSourceDrawer,
  bindSparklineInteractivity,
  calculatePointStats,
  directionClass,
  exportNodeToPng,
  filterPointsByRange,
  filterSeriesByRange,
  fetchDashboardData,
  formatDateTime,
  formatDelta,
  formatNumber,
  renderMultiLineChart,
  renderSparkline,
  windowSelectionAround,
  selectionSummary,
  setHtml,
} from "/common.js";

const PANEL_KEYS = ["markets", "funds", "casualties"];

const dateInput = document.querySelector("#report-date-input");
const loadButton = document.querySelector("#load-report-button");
const printButton = document.querySelector("#print-report-button");
const captureButton = document.querySelector("#capture-report-button");
const reportCanvas = document.querySelector("#report-canvas");
const reportDateLabel = document.querySelector("#report-date-label");
const reportTitle = document.querySelector("#report-title");
const reportGeneratedAt = document.querySelector("#report-generated-at");
const reportOverview = document.querySelector("#report-overview");
const reportSummary = document.querySelector("#report-summary");
const reportMarkets = document.querySelector("#report-markets");
const reportFunds = document.querySelector("#report-funds");
const reportTimeline = document.querySelector("#report-timeline");
const reportInsights = document.querySelector("#report-insights");
const reportNews = document.querySelector("#report-news");
const reportCasualtyCurve = document.querySelector("#report-casualty-curve");

let reportState = null;
let selectedTimelineDate = "";

const panelState = {
  markets: { mode: "conflict", start: "", end: "" },
  funds: { mode: "conflict", start: "", end: "" },
  casualties: { mode: "conflict", start: "", end: "" },
};

function buildUiUrl() {
  const url = new URL(window.location.href);
  url.searchParams.set("date", dateInput.value);
  if (selectedTimelineDate) {
    url.searchParams.set("focus", selectedTimelineDate);
  } else {
    url.searchParams.delete("focus");
  }
  for (const key of PANEL_KEYS) {
    const selection = panelState[key];
    url.searchParams.set(`${key}_mode`, selection.mode);
    if (selection.start) url.searchParams.set(`${key}_start`, selection.start);
    else url.searchParams.delete(`${key}_start`);
    if (selection.end) url.searchParams.set(`${key}_end`, selection.end);
    else url.searchParams.delete(`${key}_end`);
  }
  return url;
}

function syncUiUrl() {
  const url = buildUiUrl();
  history.replaceState({}, "", `${url.pathname}${url.search}`);
}

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function getDateFromUrl() {
  const url = new URL(window.location.href);
  return url.searchParams.get("date") || todayString();
}

function hydrateUiStateFromUrl() {
  const url = new URL(window.location.href);
  selectedTimelineDate = url.searchParams.get("focus") || "";
  for (const key of PANEL_KEYS) {
    const mode = url.searchParams.get(`${key}_mode`);
    const start = url.searchParams.get(`${key}_start`);
    const end = url.searchParams.get(`${key}_end`);
    if (mode) panelState[key].mode = mode;
    if (start) panelState[key].start = start;
    if (end) panelState[key].end = end;
  }
}

function getHighlightedIso() {
  return selectedTimelineDate ? new Date(`${selectedTimelineDate}T00:00:00Z`).toISOString() : null;
}

function getPanelLatestDate(panelKey, data) {
  if (panelKey === "markets") {
    return new Date(
      data.markets
        .flatMap((item) => (item.historyPoints || []).map((point) => point.iso))
        .sort()
        .at(-1) ||
        data.markets.map((item) => item.asOf).filter(Boolean).sort().at(-1) ||
        data.snapshotDate
    )
      .toISOString()
      .slice(0, 10);
  }
  if (panelKey === "funds") {
    const latest =
      data.funds
        .flatMap((item) => (item.historyPoints || []).map((point) => point.iso))
        .sort()
        .at(-1) ||
      data.funds.map((item) => item.estimateTime).filter(Boolean).sort().at(-1) ||
      data.snapshotDate;
    return new Date(latest).toISOString().slice(0, 10);
  }
  return new Date(data.casualtySeries?.[0]?.points?.at(-1)?.iso || `${data.snapshotDate}T00:00:00Z`).toISOString().slice(0, 10);
}

function ensureCustomSelection(panelKey, data) {
  const selection = panelState[panelKey];
  if (!selection.start) selection.start = data.conflict.startDate;
  if (!selection.end) selection.end = getPanelLatestDate(panelKey, data);
  if (selection.start > selection.end) selection.end = selection.start;
}

function syncPanelControls(panelKey, data) {
  const tools = document.querySelector(`[data-panel-tools="${panelKey}"]`);
  if (!tools) return;
  const selection = panelState[panelKey];
  ensureCustomSelection(panelKey, data);

  tools.querySelectorAll(`[data-panel-range="${panelKey}"]`).forEach((chip) => {
    chip.classList.toggle("is-active", chip.dataset.range === selection.mode);
  });

  const customRange = tools.querySelector(`[data-custom-range="${panelKey}"]`);
  if (customRange) customRange.hidden = selection.mode !== "custom";

  const startInput = tools.querySelector(`[data-custom-start="${panelKey}"]`);
  const endInput = tools.querySelector(`[data-custom-end="${panelKey}"]`);
  if (startInput) startInput.value = selection.start;
  if (endInput) endInput.value = selection.end;

  const label = tools.querySelector(`[data-range-label="${panelKey}"]`);
  if (label) {
    label.textContent = `当前按${selectionSummary(selection, data.conflict.startDate, data.snapshotDate)}展示`;
  }
}

function renderSummary(data) {
  setHtml(
    reportSummary,
    [
      { label: "伊朗死亡", value: data.conflict.totalSummary?.iranDead ?? "-" },
      { label: "以色列死亡", value: data.conflict.totalSummary?.israelDead ?? "-" },
      { label: "美军死亡", value: data.conflict.totalSummary?.usDead ?? "-" },
      { label: "海湾国家死亡", value: data.conflict.totalSummary?.gulfDead ?? "-" },
    ]
      .map(
        (item) => `
          <article class="stat-card">
            <span>${item.label}</span>
            <strong>${item.value}</strong>
          </article>
        `
      )
      .join("")
  );
}

function renderMarkets(data) {
  const selection = panelState.markets;
  setHtml(
    reportMarkets,
    data.markets
      .map((item) => {
        const visiblePoints = filterPointsByRange(item.historyPoints || [], selection, data.conflict.startDate, item.asOf, {
          includePrevious: true,
        });
        const statsPoints = filterPointsByRange(item.historyPoints || [], selection, data.conflict.startDate, item.asOf);
        const stats = calculatePointStats(statsPoints, item.unit === "%" ? 3 : 2);
        return `
          <article class="market-card">
            <span class="label">${item.name}</span>
            <div class="value-row">
              <strong class="value">${formatNumber(stats.last ?? item.value, item.unit === "%" ? 3 : 2)}</strong>
              <span class="delta ${directionClass(stats.changePct)}">${formatDelta(stats.changePct)}</span>
            </div>
            <div class="meta-line"><span>${item.unit}</span><span>${formatDateTime(stats.asOf || item.asOf)}</span></div>
            <div class="meta-line"><span>${selectionSummary(selection, data.conflict.startDate, item.asOf)}变化</span><span>${formatNumber(stats.change, item.unit === "%" ? 3 : 2)}</span></div>
            ${renderSparkline(visiblePoints, {
              unit: item.unit,
              variant: "market",
              axisDigits: item.unit === "%" ? 3 : 2,
              highlightedIso: getHighlightedIso(),
              panelKey: "markets",
              brushable: true,
            })}
          </article>
        `;
      })
      .join("")
  );
}

function renderFunds(data) {
  const selection = panelState.funds;
  const personalMonitor = data.personalMonitor;
  const positionPoints = personalMonitor
    ? filterPointsByRange(personalMonitor.historyPoints || [], selection, personalMonitor.actualBuyDate || personalMonitor.buyDate, personalMonitor.currentDate, {
        includePrevious: true,
      })
    : [];
  setHtml(
    reportFunds,
    data.funds
      .flatMap((item) => {
        const visiblePoints = filterPointsByRange(item.historyPoints || [], selection, data.conflict.startDate, item.estimateTime, {
          includePrevious: true,
        });
        const statsPoints = filterPointsByRange(item.historyPoints || [], selection, data.conflict.startDate, item.estimateTime);
        const stats = calculatePointStats(statsPoints, 4);
        const cards = [`
          <article class="fund-card">
            <span class="label">${item.name}</span>
            <div class="value-row">
              <strong class="value">${formatNumber(stats.last ?? item.estimatedValue, 4)}</strong>
              <span class="delta ${directionClass(stats.changePct)}">${formatDelta(stats.changePct)}</span>
            </div>
            <div class="meta-line"><span>${item.lastNavDate || "-"}</span><span>${item.snapshotMode === "historical_nav" ? "历史净值视角" : "盘中估值视角"}</span></div>
            <div class="meta-line"><span>${selectionSummary(selection, data.conflict.startDate, item.estimateTime)}变化</span><span>${formatDelta(stats.changePct)}</span></div>
            ${renderSparkline(visiblePoints, { unit: "净值", variant: "fund", axisDigits: 4, highlightedIso: getHighlightedIso(), panelKey: "funds", brushable: true })}
          </article>
        `];
        if (item.code === personalMonitor?.fundCode) {
          cards.push(`
            <article class="fund-card position-card">
              <span class="label">我的持仓监控 · ${personalMonitor.fundName}</span>
              <div class="value-row">
                <strong class="value">${formatNumber(personalMonitor.currentValue, 2)}</strong>
                <span class="delta ${directionClass(personalMonitor.totalPnlPct)}">${formatDelta(personalMonitor.totalPnlPct)}</span>
              </div>
              <div class="meta-line"><span>累计盈亏 ${formatNumber(personalMonitor.totalPnl, 2)} 元</span><span>${personalMonitor.currentDate || "-"}</span></div>
              <div class="meta-line"><span>当日盈亏 ${formatNumber(personalMonitor.dailyPnl, 2)} 元</span><span>${formatDelta(personalMonitor.dailyPnlPct)}</span></div>
              <div class="meta-line"><span>当前建议 ${personalMonitor.stance}</span><span>买入净值 ${formatNumber(personalMonitor.buyNav, 4)}</span></div>
              ${renderSparkline(positionPoints, { unit: "元", variant: "fund", axisDigits: 2, highlightedIso: getHighlightedIso(), panelKey: "funds", brushable: true })}
              <p class="position-summary">${personalMonitor.stanceReason}</p>
            </article>
          `);
        }
        return cards;
      })
      .join("")
  );
}

function renderTimeline(data) {
  setHtml(
    reportTimeline,
    (data.conflict.timeline || [])
      .map(
        (item) => `
          <article class="timeline-item ${selectedTimelineDate === item.date ? "is-highlighted" : ""}" data-timeline-date="${item.date}">
            <div class="timeline-rail"><span></span></div>
            <div class="timeline-content">
              <div class="meta-line"><span>${item.date}</span><span>${item.actor}</span></div>
              <p><a href="${item.link}" target="_blank" rel="noreferrer">${item.title}</a></p>
              <div class="meta-line"><span>${item.source}</span><span>${formatDateTime(item.publishedAt || item.date)}</span></div>
              ${
                selectedTimelineDate === item.date
                  ? `<div class="timeline-window-actions">
                      <button type="button" class="timeline-window-button" data-event-window="${item.date}" data-window-days="3">前后3天</button>
                      <button type="button" class="timeline-window-button" data-event-window="${item.date}" data-window-days="7">前后7天</button>
                      <button type="button" class="timeline-window-button" data-event-window="${item.date}" data-window-days="14">前后14天</button>
                    </div>`
                  : ""
              }
            </div>
          </article>
        `
      )
      .join("")
  );
}

function renderCasualties(data) {
  setHtml(
    reportCasualtyCurve,
    renderMultiLineChart(filterSeriesByRange(data.casualtySeries || [], panelState.casualties, data.conflict.startDate, null, { includePrevious: true }), {
      unit: "累计人数",
      axisDigits: 0,
      highlightedIso: getHighlightedIso(),
      panelKey: "casualties",
      brushable: true,
    })
  );
}

function renderInsights(data) {
  setHtml(
    reportInsights,
    data.insights
      .map(
        (item) => `
          <article class="insight-item">
            <span class="tag">${item.topic}</span>
            <p>${item.text}</p>
          </article>
        `
      )
      .join("")
  );
}

function renderNews(data) {
  setHtml(
    reportNews,
    data.news.top5
      .map(
        (item) => `
          <article class="news-item">
            <header><span>${item.source}</span><span>${formatDateTime(item.publishedAt)}</span></header>
            <p><a href="${item.link}" target="_blank" rel="noreferrer">${item.title}</a></p>
          </article>
        `
      )
      .join("")
  );
}

function renderDynamicSections() {
  if (!reportState) return;
  PANEL_KEYS.forEach((panelKey) => syncPanelControls(panelKey, reportState));
  renderMarkets(reportState);
  renderFunds(reportState);
  renderTimeline(reportState);
  renderCasualties(reportState);
  bindSparklineInteractivity(document);
  bindSourceDrawer(document);
  syncUiUrl();
}

async function loadReport(date) {
  reportState = await fetchDashboardData(date);
  reportDateLabel.textContent = date;
  reportTitle.textContent = reportState.title;
  reportGeneratedAt.textContent = `生成时间：${formatDateTime(reportState.generatedAt)}`;
  reportOverview.textContent = reportState.conflict.overview;

  renderSummary(reportState);
  renderInsights(reportState);
  renderNews(reportState);
  renderDynamicSections();

  const url = new URL(window.location.href);
  if (url.searchParams.get("autoprint") === "1") {
    setTimeout(() => window.print(), 300);
  }
  if (url.searchParams.get("autocapture") === "1") {
    setTimeout(() => exportNodeToPng(reportCanvas, `us-iran-report-${date}.png`), 300);
  }
}

dateInput.value = getDateFromUrl();
hydrateUiStateFromUrl();
loadButton.addEventListener("click", () => {
  syncUiUrl();
  loadReport(dateInput.value);
});

printButton.addEventListener("click", () => {
  window.print();
});

captureButton.addEventListener("click", async () => {
  await exportNodeToPng(reportCanvas, `us-iran-report-${dateInput.value}.png`);
});

document.addEventListener("click", (event) => {
  const rangeButton = event.target.closest("[data-panel-range]");
  if (rangeButton && reportState) {
    const panelKey = rangeButton.dataset.panelRange;
    panelState[panelKey].mode = rangeButton.dataset.range;
    if (panelState[panelKey].mode === "custom") {
      ensureCustomSelection(panelKey, reportState);
    }
    renderDynamicSections();
    return;
  }

  const applyButton = event.target.closest("[data-custom-apply]");
  if (applyButton && reportState) {
    const panelKey = applyButton.dataset.customApply;
    const tools = document.querySelector(`[data-panel-tools="${panelKey}"]`);
    const startInput = tools?.querySelector(`[data-custom-start="${panelKey}"]`);
    const endInput = tools?.querySelector(`[data-custom-end="${panelKey}"]`);
    panelState[panelKey].mode = "custom";
    panelState[panelKey].start = startInput?.value || reportState.conflict.startDate;
    panelState[panelKey].end = endInput?.value || getPanelLatestDate(panelKey, reportState);
    if (panelState[panelKey].start > panelState[panelKey].end) {
      panelState[panelKey].end = panelState[panelKey].start;
      if (endInput) endInput.value = panelState[panelKey].end;
    }
    renderDynamicSections();
    return;
  }

  const windowButton = event.target.closest("[data-event-window]");
  if (windowButton && reportState) {
    const eventDate = windowButton.dataset.eventWindow;
    const days = Number(windowButton.dataset.windowDays || 7);
    selectedTimelineDate = eventDate;
    for (const key of PANEL_KEYS) {
      panelState[key] = windowSelectionAround(eventDate, days, days);
    }
    renderDynamicSections();
    return;
  }

  const timelineItem = event.target.closest("[data-timeline-date]");
  if (timelineItem && !event.target.closest("a")) {
    selectedTimelineDate = selectedTimelineDate === timelineItem.dataset.timelineDate ? "" : timelineItem.dataset.timelineDate;
    renderDynamicSections();
    return;
  }
});

document.addEventListener("chartbrush", (event) => {
  if (!reportState) return;
  const { panelKey, startDate, endDate } = event.detail || {};
  if (!panelKey || !panelState[panelKey]) return;
  panelState[panelKey] = { mode: "custom", start: startDate, end: endDate };
  renderDynamicSections();
});

loadReport(dateInput.value);
