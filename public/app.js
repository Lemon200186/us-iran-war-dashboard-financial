import {
  bindSourceDrawer,
  bindSparklineInteractivity,
  calculatePointStats,
  directionClass,
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

const summaryGrid = document.querySelector("#summary-grid");
const marketGrid = document.querySelector("#market-grid");
const fundGrid = document.querySelector("#fund-grid");
const casualtyBody = document.querySelector("#casualty-body");
const actionList = document.querySelector("#action-list");
const insightList = document.querySelector("#insight-list");
const newsList = document.querySelector("#news-list");
const methodList = document.querySelector("#method-list");
const generatedAt = document.querySelector("#generated-at");
const startDate = document.querySelector("#start-date");
const startSourceLink = document.querySelector("#start-source-link");
const overviewText = document.querySelector("#overview-text");
const conflictSources = document.querySelector("#conflict-sources");
const warningPanel = document.querySelector("#warning-panel");
const warningList = document.querySelector("#warning-list");
const refreshCountdown = document.querySelector("#refresh-countdown");
const refreshButton = document.querySelector("#refresh-button");
const healthStatus = document.querySelector("#health-status");
const reportLink = document.querySelector('a[href="/report.html"]');
const timelineList = document.querySelector("#timeline-list");
const casualtyCurve = document.querySelector("#casualty-curve");
const timelineModal = document.querySelector("#timeline-modal");
const timelineModalList = document.querySelector("#timeline-modal-list");
const timelineCloseButton = document.querySelector("[data-timeline-close]");

let nextRefreshAt = Date.now() + 60_000;
let dashboardState = null;
let selectedTimelineDate = "";
let runtimeWarnings = [];

const panelState = {
  markets: { mode: "conflict", start: "", end: "" },
  funds: { mode: "conflict", start: "", end: "" },
  casualties: { mode: "conflict", start: "", end: "" },
};

function clonePanelState() {
  return Object.fromEntries(PANEL_KEYS.map((key) => [key, { ...panelState[key] }]));
}

function buildUiUrl(basePath = window.location.pathname, snapshotDate = "") {
  const url = new URL(basePath, window.location.origin);
  if (snapshotDate) url.searchParams.set("date", snapshotDate);
  if (selectedTimelineDate) url.searchParams.set("focus", selectedTimelineDate);
  for (const key of PANEL_KEYS) {
    const selection = panelState[key];
    url.searchParams.set(`${key}_mode`, selection.mode);
    if (selection.start) url.searchParams.set(`${key}_start`, selection.start);
    if (selection.end) url.searchParams.set(`${key}_end`, selection.end);
  }
  return url;
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

function syncUiUrl() {
  const url = buildUiUrl(window.location.pathname, "");
  history.replaceState({}, "", `${url.pathname}${url.search}`);
  if (reportLink && dashboardState) {
    const reportUrl = buildUiUrl("/report.html", dashboardState.snapshotDate);
    reportLink.href = `${reportUrl.pathname}${reportUrl.search}`;
  }
}

function groupInsights(items) {
  const groups = [
    { key: "oil", title: "油价", matcher: (item) => /油价/.test(item.topic) },
    { key: "gold", title: "黄金", matcher: (item) => /金价|黄金/.test(item.topic) },
    { key: "rates", title: "利率", matcher: (item) => /利率|长端/.test(item.topic) },
    { key: "funds", title: "基金", matcher: (item) => /基金|ETF|QDII|软件/.test(item.topic) },
    { key: "conflict", title: "冲突升级影响", matcher: (item) => /伤亡升级/.test(item.topic) },
  ];

  return groups
    .map((group) => ({
      ...group,
      items: items.filter(group.matcher),
    }))
    .filter((group) => group.items.length);
}

function getHighlightedIso() {
  return selectedTimelineDate ? new Date(`${selectedTimelineDate}T00:00:00Z`).toISOString() : null;
}

function getPanelSelection(panelKey) {
  return panelState[panelKey];
}

function getPanelLatestDate(panelKey, data) {
  if (panelKey === "markets") {
    const iso =
      data.markets
        .flatMap((item) => (item.historyPoints || []).map((point) => point.iso))
        .sort()
        .at(-1) || data.markets.map((item) => item.asOf).filter(Boolean).sort().at(-1);
    return iso ? new Date(iso).toISOString().slice(0, 10) : data.snapshotDate;
  }
  if (panelKey === "funds") {
    const iso =
      data.funds
        .flatMap((item) => (item.historyPoints || []).map((point) => point.iso))
        .sort()
        .at(-1) ||
      data.funds.map((item) => item.estimateTime).filter(Boolean).sort().at(-1) ||
      data.snapshotDate;
    return iso ? new Date(iso).toISOString().slice(0, 10) : data.snapshotDate;
  }
  const iso =
    data.casualtySeries?.[0]?.points?.at(-1)?.iso ||
    new Date(`${data.snapshotDate || data.conflict.timeline?.[0]?.date}T00:00:00Z`).toISOString();
  return new Date(iso).toISOString().slice(0, 10);
}

function ensureCustomSelection(panelKey, data) {
  const selection = getPanelSelection(panelKey);
  const latestDate = getPanelLatestDate(panelKey, data);
  if (!selection.start) selection.start = data.conflict.startDate;
  if (!selection.end) selection.end = latestDate;
  if (selection.start > selection.end) {
    selection.end = selection.start;
  }
}

function syncPanelControls(panelKey, data) {
  const tools = document.querySelector(`[data-panel-tools="${panelKey}"]`);
  if (!tools) return;

  const selection = getPanelSelection(panelKey);
  ensureCustomSelection(panelKey, data);

  tools.querySelectorAll(`[data-panel-range="${panelKey}"]`).forEach((chip) => {
    chip.classList.toggle("is-active", chip.dataset.range === selection.mode);
  });

  const customRange = tools.querySelector(`[data-custom-range="${panelKey}"]`);
  if (customRange) {
    customRange.hidden = selection.mode !== "custom";
  }

  const startInput = tools.querySelector(`[data-custom-start="${panelKey}"]`);
  const endInput = tools.querySelector(`[data-custom-end="${panelKey}"]`);
  if (startInput) startInput.value = selection.start;
  if (endInput) endInput.value = selection.end;

  const label = tools.querySelector(`[data-range-label="${panelKey}"]`);
  if (label) {
    label.textContent = `当前按${selectionSummary(selection, data.conflict.startDate, data.snapshotDate)}展示`;
  }
}

function renderWarnings(warnings) {
  if (warnings?.length) {
    warningPanel.hidden = false;
    setHtml(
      warningList,
      warnings
        .map(
          (item) => `
            <article class="insight-item">
              <span class="tag">告警</span>
              <p>${item}</p>
            </article>
          `
        )
        .join("")
    );
    return;
  }

  warningPanel.hidden = true;
  warningList.innerHTML = "";
}

function resetRuntimeWarnings() {
  runtimeWarnings = [];
}

function pushRuntimeWarning(message) {
  if (!message || runtimeWarnings.includes(message)) return;
  runtimeWarnings.push(message);
}

function combinedWarnings(data) {
  return [...(data?.warnings || []), ...runtimeWarnings];
}

function safeRenderSection(name, renderFn, fallbackFn = null) {
  try {
    renderFn();
  } catch (error) {
    pushRuntimeWarning(`${name}渲染失败，已降级显示：${error.message}`);
    fallbackFn?.(error);
  }
}

function setHealthState(state, text) {
  if (!healthStatus) return;
  healthStatus.dataset.state = state;
  healthStatus.textContent = text;
}

async function refreshHealthStatus() {
  try {
    const response = await fetch("/healthz", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const payload = await response.json();
    setHealthState("ok", `服务正常 · ${formatDateTime(payload.timestamp)}`);
  } catch (error) {
    setHealthState("degraded", "服务检查失败");
    pushRuntimeWarning(`健康检查未通过：${error.message}`);
  }
}

function renderMarketFallback(message) {
  setHtml(
    marketGrid,
    `
      <article class="market-card">
        <span class="label">金融与利率波动</span>
        <p class="error">当前无法完整渲染金融与利率面板。</p>
        <p class="error-subtle">${message}</p>
      </article>
    `
  );
}

function renderFundFallback(message) {
  setHtml(
    fundGrid,
    `
      <article class="fund-card">
        <span class="label">基金监控</span>
        <p class="error">当前无法完整渲染基金监控面板。</p>
        <p class="error-subtle">${message}</p>
      </article>
    `
  );
}

function renderCasualtyFallback(message) {
  setHtml(casualtyCurve, `<div class="error">伤亡曲线暂时不可用。</div><p class="error-subtle">${message}</p>`);
  setHtml(
    casualtyBody,
    `<tr><td colspan="3">伤亡明细暂时不可用：${message}。页面保留其余模块，稍后会自动重试。</td></tr>`
  );
}

function renderTimelineFallback(message) {
  setHtml(
    timelineList,
    `<article class="timeline-item"><div class="timeline-content"><p class="error">关键时间线暂时不可用。</p><p class="error-subtle">${message}</p></div></article>`
  );
  if (timelineModalList) {
    setHtml(
      timelineModalList,
      `<article class="timeline-item"><div class="timeline-content"><p class="error">完整时间线暂时不可用。</p><p class="error-subtle">${message}</p></div></article>`
    );
  }
}

function renderActionsFallback(message) {
  setHtml(
    actionList,
    `<article class="action-item"><p class="error">关键动作暂时不可用。</p><p class="error-subtle">${message}</p></article>`
  );
}

function renderNewsFallback(message) {
  setHtml(
    newsList,
    `<article class="news-item"><p class="error">关键相关新闻暂时不可用。</p><p class="error-subtle">${message}</p></article>`
  );
}

function renderMethodFallback(message) {
  setHtml(methodList, `<li>方法与口径说明暂时不可用：${message}</li>`);
}

function renderSummaryFallback(message = "冲突总览暂时不可用。") {
  overviewText.textContent = message;
  setHtml(summaryGrid, `<article class="stat-card"><span>状态</span><strong>待重试</strong></article>`);
  setHtml(conflictSources, "");
  startSourceLink.removeAttribute("href");
  startSourceLink.textContent = "起点来源暂不可用";
}

function renderInsightsFallback(message) {
  setHtml(
    insightList,
    `<article class="insight-item"><span class="tag">解释层</span><p>波动原因分析暂时不可用。</p><p class="error-subtle">${message}</p></article>`
  );
}

function renderBootstrapFallback(message) {
  generatedAt.textContent = "-";
  startDate.textContent = "-";
  nextRefreshAt = Date.now() + 60_000;
  renderSummaryFallback(`主数据暂时不可达：${message}。页面会在下一次自动刷新时重试。`);
  renderMarketFallback(message);
  renderFundFallback(message);
  renderCasualtyFallback(message);
  renderTimelineFallback(message);
  renderActionsFallback(message);
  renderNewsFallback(message);
  renderInsightsFallback(message);
  renderMethodFallback(message);
}

function renderSummary(data) {
  const summaryCards = data.conflict.totalSummary
    ? [
        { label: "伊朗死亡", value: data.conflict.totalSummary.iranDead },
        { label: "以色列死亡", value: data.conflict.totalSummary.israelDead },
        { label: "美军死亡", value: data.conflict.totalSummary.usDead },
        { label: "海湾国家死亡", value: data.conflict.totalSummary.gulfDead },
      ]
    : [];

  setHtml(
    summaryGrid,
    summaryCards
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
  const selection = getPanelSelection("markets");
  const highlightIso = getHighlightedIso();

  setHtml(
    marketGrid,
    data.markets
      .map((item) => {
        if (item.error) {
          return `<article class="market-card"><span class="label">${item.name}</span><p class="error">${item.error}</p></article>`;
        }

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
              highlightedIso: highlightIso,
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
  const selection = getPanelSelection("funds");
  const highlightIso = getHighlightedIso();
  const personalMonitor = data.personalMonitor;
  const positionPoints = personalMonitor
    ? filterPointsByRange(personalMonitor.historyPoints || [], selection, personalMonitor.actualBuyDate || personalMonitor.buyDate, personalMonitor.currentDate, {
        includePrevious: true,
      })
    : [];

  setHtml(
    fundGrid,
    data.funds
      .flatMap((item) => {
        if (item.error) {
          return [`
            <article class="fund-card">
              <span class="label">${item.name}</span>
              <p class="error">${item.error}</p>
            </article>
          `];
        }

        const visiblePoints = filterPointsByRange(item.historyPoints || [], selection, data.conflict.startDate, item.estimateTime, {
          includePrevious: true,
        });
        const statsPoints = filterPointsByRange(item.historyPoints || [], selection, data.conflict.startDate, item.estimateTime);
        const stats = calculatePointStats(statsPoints, 4);

        const cards = [`
          <article class="fund-card">
            <a href="${item.codeUrl}" target="_blank" rel="noreferrer">${item.name}</a>
            <div class="value-row">
              <strong class="value">${formatNumber(stats.last ?? item.estimatedValue, 4)}</strong>
              <span class="delta ${directionClass(stats.changePct)}">${formatDelta(stats.changePct)}</span>
            </div>
            <div class="meta-line"><span>最新净值 ${formatNumber(item.lastNav, 4)}</span><span>${item.lastNavDate || "-"}</span></div>
            <div class="meta-line"><span>${selectionSummary(selection, data.conflict.startDate, item.estimateTime)}变化</span><span>${formatDelta(stats.changePct)}</span></div>
            ${renderSparkline(visiblePoints, {
              unit: "净值",
              variant: "fund",
              axisDigits: 4,
              highlightedIso: highlightIso,
              panelKey: "funds",
              brushable: true,
            })}
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
              <div class="meta-line"><span>买入净值 ${formatNumber(personalMonitor.buyNav, 4)}</span><span>估算份额 ${formatNumber(personalMonitor.shares, 4)}</span></div>
              <div class="meta-line"><span>当前建议 ${personalMonitor.stance}</span><span>回撤 ${formatDelta(personalMonitor.drawdownPct)}</span></div>
              ${renderSparkline(positionPoints, {
                unit: "元",
                variant: "fund",
                axisDigits: 2,
                highlightedIso: highlightIso,
                panelKey: "funds",
                brushable: true,
              })}
              <div class="position-plan">
                <p class="position-summary">${personalMonitor.stanceReason}</p>
                <ul class="position-rule-list">
                  ${personalMonitor.rules
                    .map(
                      (rule) => `
                        <li>
                          <strong>${rule.trigger}</strong>
                          <span>${rule.action}</span>
                          <p>${rule.reason}</p>
                        </li>
                      `
                    )
                    .join("")}
                </ul>
                <p class="position-disclaimer">${personalMonitor.disclaimer}</p>
                <div class="source-list">
                  ${personalMonitor.sources
                    .map(
                      (source) => `
                        <a class="source-pill" href="${source.url}" target="_blank" rel="noreferrer">${source.label}</a>
                      `
                    )
                    .join("")}
                </div>
              </div>
            </article>
          `);
        }

        return cards;
      })
      .join("")
  );
}

function renderCasualties(data) {
  const selection = getPanelSelection("casualties");
  const casualtyRows = (data.conflict?.casualties || []).filter(
    (item) => item && (item.country || item.killed || item.injured)
  );
  setHtml(
    casualtyBody,
    casualtyRows.length
      ? casualtyRows
          .map(
            (item) => `
              <tr>
                <td>${item.country || "待核实"}</td>
                <td>${item.killed || "待核实"}</td>
                <td>${item.injured || "待核实"}</td>
              </tr>
            `
          )
          .join("")
      : `<tr><td colspan="3">当前未能提取到分国别伤亡明细，请查看上方来源链接获取最新口径。</td></tr>`
  );

  setHtml(
    casualtyCurve,
    renderMultiLineChart(filterSeriesByRange(data.casualtySeries || [], selection, data.conflict.startDate, null, { includePrevious: true }), {
      unit: "累计人数",
      axisDigits: 0,
      highlightedIso: getHighlightedIso(),
      panelKey: "casualties",
      brushable: true,
    })
  );
}

function renderTimeline(items) {
  const topItems = items.slice(0, 5);
  const renderItem = (item) => `
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
  `;

  setHtml(
    timelineList,
    `
      <div class="timeline-top">${topItems.map(renderItem).join("")}</div>
      ${items.length > 5 ? `<button type="button" class="timeline-toggle" data-timeline-toggle>查看之前总结的全部关键时间线（${items.length} 条）</button>` : ""}
    `
  );

  if (timelineModalList) {
    setHtml(timelineModalList, items.map(renderItem).join(""));
  }
}

function renderInsights(data) {
  setHtml(
    insightList,
    data.insights.length
      ? groupInsights(data.insights)
          .map(
            (group) => `
              <section class="insight-group">
                <div class="insight-group-head">
                  <h3>${group.title}</h3>
                </div>
                <div class="insight-group-grid">
                  ${group.items
                    .map(
                      (item) => `
                        <article class="insight-item">
                          <span class="tag">${item.topic}</span>
                          <p>${item.text}</p>
                          <p class="insight-explain">${item.explainLikeImNew || ""}</p>
                          ${
                            item.sources?.length
                              ? `<div class="source-list">
                                  ${item.sources
                                    .map(
                                      (source) => `
                                        <a class="source-pill" href="${source.url}" target="_blank" rel="noreferrer">${source.label}</a>
                                      `
                                    )
                                    .join("")}
                                </div>`
                              : ""
                          }
                        </article>
                      `
                    )
                    .join("")}
                </div>
              </section>
            `
          )
          .join("")
      : `<article class="insight-item"><p>当前市场解释层正在等待新闻与行情同时到位后再生成。</p></article>`
  );
}

function renderStaticSections(data) {
  nextRefreshAt = Date.now() + (data.refreshIntervalMs || 60_000);
  safeRenderSection("顶部摘要", () => {
    generatedAt.textContent = formatDateTime(data.generatedAt);
    startDate.textContent = data.conflict.startDate;
    startSourceLink.href = data.conflict.startDateSource.url;
    startSourceLink.textContent = data.conflict.startDateSource.label;
  });

  safeRenderSection("战争总览", () => {
    overviewText.textContent = data.conflict.overview;
    renderSummary(data);
    setHtml(
      conflictSources,
      data.conflict.sources
        .map(
          (source) => `
            <a class="source-pill" href="${source.url}" target="_blank" rel="noreferrer">${source.label}</a>
          `
        )
        .join("")
    );
  }, (error) => renderSummaryFallback(error.message));

  safeRenderSection("关键动作", () => {
    setHtml(
      actionList,
      data.news.actions.length
        ? data.news.actions
            .map(
              (item) => `
                <article class="action-item">
                  <span class="tag">${item.actor}</span>
                  <p><a href="${item.link}" target="_blank" rel="noreferrer">${item.title}</a></p>
                  <div class="meta-line"><span>${item.source}</span><span>${formatDateTime(item.publishedAt)}</span></div>
                </article>
              `
            )
            .join("")
        : `<article class="action-item"><p>当前未抓到动作类新闻，请稍后刷新。</p></article>`
    );
  }, (error) => renderActionsFallback(error.message));

  safeRenderSection("关键新闻", () => {
    setHtml(
      newsList,
      data.news.top5.length
        ? data.news.top5
            .map(
              (item) => `
                <article class="news-item">
                  <header>
                    <span>${item.source}</span>
                    <span>${formatDateTime(item.publishedAt)}</span>
                  </header>
                  <p><a href="${item.link}" target="_blank" rel="noreferrer">${item.title}</a></p>
                </article>
              `
            )
            .join("")
        : `<article class="news-item"><p>当前未抓到 TOP5 新闻，可能是 RSS 源暂时不可达。</p></article>`
    );
  }, (error) => renderNewsFallback(error.message));

  safeRenderSection("方法与口径", () => {
    setHtml(methodList, data.methodology.map((item) => `<li>${item}</li>`).join(""));
  }, (error) => renderMethodFallback(error.message));

  safeRenderSection("波动原因分析", () => {
    renderInsights(data);
  }, (error) => renderInsightsFallback(error.message));
}

function renderDynamicSections() {
  if (!dashboardState) return;
  safeRenderSection("面板时间控件", () => {
    PANEL_KEYS.forEach((panelKey) => syncPanelControls(panelKey, dashboardState));
  });
  safeRenderSection("金融与利率波动", () => renderMarkets(dashboardState), (error) => renderMarketFallback(error.message));
  safeRenderSection("基金监控", () => renderFunds(dashboardState), (error) => renderFundFallback(error.message));
  safeRenderSection("伤亡口径", () => renderCasualties(dashboardState), (error) => renderCasualtyFallback(error.message));
  safeRenderSection("关键时间线", () => renderTimeline(dashboardState.conflict.timeline || []), (error) => renderTimelineFallback(error.message));
  safeRenderSection("图表交互", () => {
    bindSparklineInteractivity(document);
    bindSourceDrawer(document);
  });
  renderWarnings(combinedWarnings(dashboardState));
  syncUiUrl();
}

async function loadDashboard() {
  resetRuntimeWarnings();
  try {
    const nextState = await fetchDashboardData();
    dashboardState = nextState;
    renderStaticSections(dashboardState);
    renderDynamicSections();
    await refreshHealthStatus();
  } catch (error) {
    pushRuntimeWarning(
      dashboardState
        ? `主数据刷新失败，页面已保留上一次成功内容：${error.message}`
        : `主数据刷新失败：${error.message}`
    );
    if (dashboardState) {
      renderWarnings(combinedWarnings(dashboardState));
    } else {
      renderBootstrapFallback(error.message);
      renderWarnings(combinedWarnings({ warnings: [] }));
    }
    setHealthState("degraded", "服务降级中");
  }
}

function updateCountdown() {
  const seconds = Math.max(0, Math.ceil((nextRefreshAt - Date.now()) / 1000));
  refreshCountdown.textContent = `下一次刷新 ${seconds}s`;
}

refreshButton.addEventListener("click", () => {
  nextRefreshAt = Date.now() + 60_000;
  loadDashboard();
});

document.addEventListener("click", (event) => {
  const rangeButton = event.target.closest("[data-panel-range]");
  if (rangeButton && dashboardState) {
    const panelKey = rangeButton.dataset.panelRange;
    const selection = getPanelSelection(panelKey);
    selection.mode = rangeButton.dataset.range;
    if (selection.mode === "custom") {
      ensureCustomSelection(panelKey, dashboardState);
    }
    renderDynamicSections();
    return;
  }

  const applyButton = event.target.closest("[data-custom-apply]");
  if (applyButton && dashboardState) {
    const panelKey = applyButton.dataset.customApply;
    const tools = document.querySelector(`[data-panel-tools="${panelKey}"]`);
    const startInput = tools?.querySelector(`[data-custom-start="${panelKey}"]`);
    const endInput = tools?.querySelector(`[data-custom-end="${panelKey}"]`);
    const selection = getPanelSelection(panelKey);
    selection.mode = "custom";
    selection.start = startInput?.value || dashboardState.conflict.startDate;
    selection.end = endInput?.value || getPanelLatestDate(panelKey, dashboardState);
    if (selection.start > selection.end) {
      selection.end = selection.start;
      if (endInput) endInput.value = selection.end;
    }
    renderDynamicSections();
    return;
  }

  const timelineToggle = event.target.closest("[data-timeline-toggle]");
  if (timelineToggle && timelineModal) {
    timelineModal.hidden = false;
    return;
  }

  const windowButton = event.target.closest("[data-event-window]");
  if (windowButton) {
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

  if (event.target === timelineModal) {
    timelineModal.hidden = true;
  }
});

document.addEventListener("chartbrush", (event) => {
  if (!dashboardState) return;
  const { panelKey, startDate, endDate } = event.detail || {};
  if (!panelKey || !startDate || !endDate || !panelState[panelKey]) return;
  panelState[panelKey] = { mode: "custom", start: startDate, end: endDate };
  renderDynamicSections();
});

timelineCloseButton?.addEventListener("click", () => {
  if (timelineModal) timelineModal.hidden = true;
});

hydrateUiStateFromUrl();
loadDashboard();
updateCountdown();
setInterval(updateCountdown, 1000);
setInterval(loadDashboard, 60_000);
