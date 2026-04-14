export function formatDateTime(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatNumber(value, digits = 2) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "-";
  return Number(value).toFixed(digits);
}

export function formatDelta(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "-";
  const number = Number(value);
  return `${number > 0 ? "+" : ""}${number.toFixed(2)}%`;
}

export function directionClass(value) {
  if (value > 0) return "up";
  if (value < 0) return "down";
  return "flat";
}

export function setHtml(el, html) {
  el.innerHTML = html;
}

export function getRangeLabel(rangeKey) {
  if (rangeKey === "7d") return "近7天";
  if (rangeKey === "30d") return "近30天";
  if (rangeKey === "conflict") return "冲突至今";
  if (rangeKey === "custom") return "自定义区间";
  return "全部";
}

function normalizeRangeSelection(selection) {
  if (!selection) return { mode: "all" };
  if (typeof selection === "string") return { mode: selection };
  return { mode: selection.mode || "all", start: selection.start || "", end: selection.end || "" };
}

function dateStringFromIso(value) {
  return value ? new Date(value).toISOString().slice(0, 10) : "";
}

export function getRangeStartIso(rangeKey, conflictStartDate, endIso, customStart = "") {
  if (rangeKey === "conflict") {
    return new Date(`${conflictStartDate}T00:00:00Z`).toISOString();
  }
  if (rangeKey === "custom" && customStart) {
    return new Date(`${customStart}T00:00:00Z`).toISOString();
  }
  if (rangeKey === "30d" || rangeKey === "7d") {
    const days = rangeKey === "30d" ? 30 : 7;
    const end = new Date(endIso);
    const start = new Date(end);
    start.setUTCDate(start.getUTCDate() - (days - 1));
    return start.toISOString();
  }
  return null;
}

function getRangeEndIso(selection, fallbackEndIso) {
  const normalized = normalizeRangeSelection(selection);
  if (normalized.mode === "custom" && normalized.end) {
    return new Date(`${normalized.end}T23:59:59Z`).toISOString();
  }
  return fallbackEndIso || null;
}

export function filterPointsByRange(points, selection, conflictStartDate, fallbackEndIso = null, options = {}) {
  const safePoints = (points || []).filter((point) => point?.iso);
  const normalized = normalizeRangeSelection(selection);
  if (safePoints.length <= 2 || !normalized.mode || normalized.mode === "all") return safePoints;

  const endIso = getRangeEndIso(normalized, fallbackEndIso || safePoints.at(-1)?.iso) || safePoints.at(-1)?.iso;
  const startIso = getRangeStartIso(normalized.mode, conflictStartDate, endIso, normalized.start);
  if (!startIso) return safePoints;

  const visible = safePoints.filter((point) => point.iso >= startIso && point.iso <= endIso);
  if (!visible.length) return safePoints.slice(-2);

  if (options.includePrevious !== true) {
    return visible;
  }

  const firstVisibleIndex = safePoints.findIndex((point) => point.iso === visible[0].iso);
  if (firstVisibleIndex > 0) {
    return [safePoints[firstVisibleIndex - 1], ...visible];
  }

  return visible;
}

export function filterSeriesByRange(seriesList, selection, conflictStartDate, fallbackEndIso = null, options = {}) {
  return (seriesList || [])
    .map((series) => ({
      ...series,
      points: filterPointsByRange(series.points || [], selection, conflictStartDate, fallbackEndIso, options),
    }))
    .filter((series) => (series.points || []).length >= 2);
}

export function calculatePointStats(points, digits = 2) {
  const safePoints = (points || []).filter((point) => typeof point.value === "number" && !Number.isNaN(point.value));
  const last = safePoints.at(-1)?.value ?? null;
  const first = safePoints[0]?.value ?? null;
  const change = last !== null && first !== null ? last - first : null;
  const changePct = last !== null && first ? (change / first) * 100 : null;

  return {
    first,
    last,
    change,
    changePct,
    asOf: safePoints.at(-1)?.iso ?? null,
    count: safePoints.length,
    digits,
  };
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeAttr(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export function renderSparkline(points, options = {}) {
  const values = points.filter((point) => typeof point.value === "number" && !Number.isNaN(point.value));
  if (values.length < 2) return "";

  const min = Math.min(...values.map((point) => point.value));
  const max = Math.max(...values.map((point) => point.value));
  const mid = min + (max - min) / 2;
  const range = max - min || 1;
  const coords = values
    .map((point, index) => {
      const x = (index / (values.length - 1)) * 100;
      const y = 30 - ((point.value - min) / range) * 26;
      return `${x},${y.toFixed(2)}`;
    })
    .join(" ");

  const encodedPoints = escapeAttr(encodeURIComponent(JSON.stringify(values)));
  const strokeClass =
    options.variant === "fund" ? "fund-line" : options.variant === "casualty" ? "casualty-line" : "market-line";
  const firstLabel = values[0]?.label || "-";
  const middleLabel =
    values.length > 2
      ? values[Math.floor((values.length - 1) / 2)]?.label || "-"
      : new Intl.DateTimeFormat("zh-CN", { dateStyle: "medium" }).format(
          new Date((new Date(values[0]?.iso).getTime() + new Date(values.at(-1)?.iso).getTime()) / 2)
        );
  const lastLabel = values.at(-1)?.label || "-";
  const axisDigits = options.axisDigits ?? 2;
  const highlightTime = options.highlightedIso ? new Date(options.highlightedIso).getTime() : null;
  const startTime = new Date(values[0]?.iso).getTime();
  const endTime = new Date(values.at(-1)?.iso).getTime();
  const highlightX =
    highlightTime !== null && highlightTime >= startTime && highlightTime <= endTime
      ? (((highlightTime - startTime) / (endTime - startTime || 1)) * 100).toFixed(2)
      : null;

  return `
    <div class="chart-shell">
      <div class="chart-y-axis">
        <span>${formatNumber(max, axisDigits)}</span>
        <span>${formatNumber(mid, axisDigits)}</span>
        <span>${formatNumber(min, axisDigits)}</span>
      </div>
      <div class="chart-main">
        <div class="sparkline-shell" tabindex="0" data-points="${encodedPoints}" data-unit="${escapeAttr(options.unit || "")}" data-panel-key="${escapeAttr(options.panelKey || "")}" data-brush-enabled="${options.brushable ? "true" : "false"}">
          <div class="sparkline-tip" hidden></div>
          <div class="sparkline-brush" hidden></div>
          <svg class="sparkline" viewBox="0 0 100 32" preserveAspectRatio="none" aria-hidden="true">
            <line class="sparkline-grid" x1="0" y1="2" x2="100" y2="2"></line>
            <line class="sparkline-grid" x1="0" y1="16" x2="100" y2="16"></line>
            <line class="sparkline-grid" x1="0" y1="30" x2="100" y2="30"></line>
            ${highlightX !== null ? `<line class="sparkline-marker" x1="${highlightX}" y1="0" x2="${highlightX}" y2="32"></line>` : ""}
            <polyline class="${strokeClass}" points="${coords}"></polyline>
            <line class="sparkline-guide" x1="0" y1="0" x2="0" y2="32" hidden></line>
            <circle class="sparkline-focus" cx="0" cy="0" r="2.8" hidden></circle>
          </svg>
        </div>
        <div class="chart-x-axis">
          <span>${firstLabel}</span>
          <span>${middleLabel}</span>
          <span>${lastLabel}</span>
        </div>
      </div>
    </div>
  `;
}

export function renderMultiLineChart(seriesList, options = {}) {
  const normalizedSeries = (seriesList || []).filter((series) => series?.points?.length >= 2);
  if (!normalizedSeries.length) return "";

  const allValues = normalizedSeries.flatMap((series) => series.points.map((point) => point.value));
  const min = Math.min(...allValues);
  const max = Math.max(...allValues);
  const mid = min + (max - min) / 2;
  const range = max - min || 1;
  const labels = normalizedSeries[0].points;
  const firstLabel = labels[0]?.label || "-";
  const lastLabel = labels.at(-1)?.label || "-";
  const axisDigits = options.axisDigits ?? 0;
  const encodedSeries = escapeAttr(encodeURIComponent(JSON.stringify(normalizedSeries)));

  const startTime = Math.min(...normalizedSeries.flatMap((series) => series.points.map((point) => new Date(point.iso).getTime())));
  const endTime = Math.max(...normalizedSeries.flatMap((series) => series.points.map((point) => new Date(point.iso).getTime())));
  const timeRange = endTime - startTime || 1;
  const highlightTime = options.highlightedIso ? new Date(options.highlightedIso).getTime() : null;
  const highlightX =
    highlightTime !== null && highlightTime >= startTime && highlightTime <= endTime
      ? (((highlightTime - startTime) / timeRange) * 100).toFixed(2)
      : null;
  const middleLabel =
    labels.length > 2
      ? labels[Math.floor((labels.length - 1) / 2)]?.label || "-"
      : new Intl.DateTimeFormat("zh-CN", { dateStyle: "medium" }).format(new Date(startTime + timeRange / 2));

  const lines = normalizedSeries
    .map((series) => {
      const segments = [];
      const dots = [];

      series.points.forEach((point, index) => {
        const x = ((new Date(point.iso).getTime() - startTime) / timeRange) * 100;
        const y = 30 - ((point.value - min) / range) * 26;
        if (point.confirmed !== false) {
          const pointPayload = escapeAttr(
            encodeURIComponent(
              JSON.stringify({
                seriesName: series.name,
                date: point.label,
                value: point.value,
                source: point.source || "",
                link: point.link || "",
                note: point.confirmed ? "公开确认值" : "区间插值",
              })
            )
          );
          if (point.link) {
            dots.push(`
              <button
                type="button"
                class="chart-point-link"
                aria-label="${escapeAttr(`${series.name} ${point.label} 原始来源`)}"
                data-point="${pointPayload}"
                style="left:${x}%; top:${(y / 32) * 100}%"
              >
                <span class="casualty-dot casualty-dot-${series.key}"></span>
              </button>
            `);
          } else {
            dots.push(
              `<button type="button" class="chart-point-link chart-point-static" data-point="${pointPayload}" style="left:${x}%; top:${(y / 32) * 100}%"><span class="casualty-dot casualty-dot-${series.key}"></span></button>`
            );
          }
        }

        if (index === series.points.length - 1) return;
        const next = series.points[index + 1];
        const nextX = ((new Date(next.iso).getTime() - startTime) / timeRange) * 100;
        const nextY = 30 - ((next.value - min) / range) * 26;
        const daysGap = Math.round((new Date(next.iso).getTime() - new Date(point.iso).getTime()) / 86400000);
        const segmentClass =
          point.confirmed !== false && next.confirmed !== false && daysGap <= 1
            ? "casualty-segment-solid"
            : "casualty-segment-dashed";
        segments.push(
          `<line class="casualty-line casualty-line-${series.key} ${segmentClass}" x1="${x}" y1="${y}" x2="${nextX}" y2="${nextY}"></line>`
        );
      });

      return `${segments.join("")}${dots.join("")}`;
    })
    .join("");

  const legend = normalizedSeries
    .map(
      (series) => `
        <span class="chart-legend-item">
          <i class="legend-dot legend-dot-${series.key}"></i>${series.name}
        </span>
      `
    )
    .join("");

  return `
    <div class="chart-shell">
      <div class="chart-y-axis">
        <span>${formatNumber(max, axisDigits)}</span>
        <span>${formatNumber(mid, axisDigits)}</span>
        <span>${formatNumber(min, axisDigits)}</span>
      </div>
      <div class="chart-main">
        <div class="chart-legend">${legend}</div>
        <div class="sparkline-shell multi-line-shell" tabindex="0" data-series="${encodedSeries}" data-unit="${escapeAttr(options.unit || "")}" data-panel-key="${escapeAttr(options.panelKey || "")}" data-brush-enabled="${options.brushable ? "true" : "false"}">
          <div class="sparkline-tip" hidden></div>
          <div class="sparkline-brush" hidden></div>
          <svg class="sparkline" viewBox="0 0 100 32" preserveAspectRatio="none" aria-hidden="true">
            <line class="sparkline-grid" x1="0" y1="2" x2="100" y2="2"></line>
            <line class="sparkline-grid" x1="0" y1="16" x2="100" y2="16"></line>
            <line class="sparkline-grid" x1="0" y1="30" x2="100" y2="30"></line>
            ${highlightX !== null ? `<line class="sparkline-marker" x1="${highlightX}" y1="0" x2="${highlightX}" y2="32"></line>` : ""}
            ${lines}
            <line class="sparkline-guide" x1="0" y1="0" x2="0" y2="32" hidden></line>
          </svg>
        </div>
        <div class="chart-x-axis">
          <span>${firstLabel}</span>
          <span>${middleLabel}</span>
          <span>${lastLabel}</span>
        </div>
      </div>
    </div>
  `;
}

export function bindSparklineInteractivity(root = document) {
  root.querySelectorAll(".sparkline-shell").forEach((shell) => {
    if (shell.dataset.bound === "true") return;
    shell.dataset.bound = "true";

    const svg = shell.querySelector("svg");
    const tip = shell.querySelector(".sparkline-tip");
    const guide = shell.querySelector(".sparkline-guide");
    const focus = shell.querySelector(".sparkline-focus");
    const brush = shell.querySelector(".sparkline-brush");
    const points = shell.dataset.points ? JSON.parse(decodeURIComponent(shell.dataset.points || "[]")) : null;
    const series = shell.dataset.series ? JSON.parse(decodeURIComponent(shell.dataset.series || "[]")) : null;
    const unit = shell.dataset.unit || "";
    const panelKey = shell.dataset.panelKey || "";
    const brushable = shell.dataset.brushEnabled === "true";
    let brushing = false;
    let brushStartRatio = 0;

    const showPoint = (index, event) => {
      const basePoints = points || series?.[0]?.points || [];
      const point = basePoints[index];
      if (!point) return;
      let x = basePoints.length === 1 ? 50 : (index / (basePoints.length - 1)) * 100;

      guide.removeAttribute("hidden");
        tip.removeAttribute("hidden");

      if (points) {
        const values = points.map((item) => item.value);
        const min = Math.min(...values);
        const max = Math.max(...values);
        const range = max - min || 1;
        const y = 30 - ((point.value - min) / range) * 26;
        focus.removeAttribute("hidden");
        focus.setAttribute("cx", x);
        focus.setAttribute("cy", y);
        tip.innerHTML = `<strong>${point.label}</strong><span>${point.value}${unit ? ` ${unit}` : ""}</span>`;
      } else if (series) {
        if (focus) focus.setAttribute("hidden", "");
        const firstTime = new Date(series[0].points[0].iso).getTime();
        const lastTime = new Date(series[0].points.at(-1).iso).getTime();
        const rect = svg.getBoundingClientRect();
        const ratio = event
          ? Math.max(0, Math.min(1, rect.width ? (event.clientX - rect.left) / rect.width : 0))
          : 1;
        const targetTime = firstTime + Math.max(0, Math.min(1, ratio)) * (lastTime - firstTime);
        x = ratio * 100;
        const currentLabel = new Intl.DateTimeFormat("zh-CN", { dateStyle: "medium" }).format(new Date(targetTime));
        let nearestConfirmedSource = "";
        let nearestConfirmedLink = "";
        const interpolatedLines = series.map((line) => {
          const linePoints = line.points;
          let value = linePoints[0]?.value ?? 0;
          let exact = false;

          for (let i = 0; i < linePoints.length - 1; i += 1) {
            const left = linePoints[i];
            const right = linePoints[i + 1];
            const leftTime = new Date(left.iso).getTime();
            const rightTime = new Date(right.iso).getTime();
            if (targetTime <= leftTime) {
              value = left.value;
              exact = true;
              if (left.source) nearestConfirmedSource = left.source;
              if (left.link) nearestConfirmedLink = left.link;
              break;
            }
            if (targetTime >= leftTime && targetTime <= rightTime) {
              const localRatio = rightTime === leftTime ? 0 : (targetTime - leftTime) / (rightTime - leftTime);
              value = left.value + (right.value - left.value) * localRatio;
              const nearLeft = Math.abs(targetTime - leftTime) < 12 * 60 * 60 * 1000;
              const nearRight = Math.abs(targetTime - rightTime) < 12 * 60 * 60 * 1000;
              exact = nearLeft || nearRight;
              if (nearLeft && left.source) nearestConfirmedSource = left.source;
              if (nearLeft && left.link) nearestConfirmedLink = left.link;
              if (nearRight && right.source) nearestConfirmedSource = right.source;
              if (nearRight && right.link) nearestConfirmedLink = right.link;
              break;
            }
            value = right.value;
          }

          return { name: line.name, value, exact };
        });

        tip.innerHTML = `
          <strong>${currentLabel}</strong>
          <span>${interpolatedLines.some((line) => !line.exact) ? "区间插值" : "公开确认值"}</span>
          ${
            nearestConfirmedSource
              ? nearestConfirmedLink
                ? `<a class="sparkline-tip-link" href="${nearestConfirmedLink}" target="_blank" rel="noreferrer">${nearestConfirmedSource}</a>`
                : `<span>${nearestConfirmedSource}</span>`
              : ""
          }
          ${interpolatedLines
            .map((line) => `<span>${line.name}: ${Math.round(line.value)}${unit ? ` ${unit}` : ""}</span>`)
            .join("")}
        `;
      }

      guide.setAttribute("x1", x);
      guide.setAttribute("x2", x);

      const shellWidth = shell.clientWidth || 1;
      const left = Math.max(0, Math.min(shellWidth - 140, (x / 100) * shellWidth - 70));
      tip.style.left = `${left}px`;
    };

    const hidePoint = () => {
      guide.setAttribute("hidden", "");
      if (focus) focus.setAttribute("hidden", "");
      tip.setAttribute("hidden", "");
    };

    const list = points || series?.[0]?.points || [];

    const pointerRatio = (event) => {
      const rect = svg.getBoundingClientRect();
      return Math.max(0, Math.min(1, rect.width ? (event.clientX - rect.left) / rect.width : 0));
    };

    const pointerToIndex = (event) => {
      if (brushing) return;
      const ratio = pointerRatio(event);
      const index = Math.max(0, Math.min(list.length - 1, Math.round(ratio * (list.length - 1))));
      showPoint(index, event);
    };

    const hideBrush = () => {
      if (brush) {
        brush.hidden = true;
        brush.style.left = "0%";
        brush.style.width = "0%";
      }
    };

    const updateBrush = (startRatio, endRatio) => {
      if (!brush) return;
      const left = Math.min(startRatio, endRatio) * 100;
      const width = Math.abs(endRatio - startRatio) * 100;
      brush.hidden = false;
      brush.style.left = `${left}%`;
      brush.style.width = `${width}%`;
    };

    const ratioToDate = (ratio) => {
      const firstIso = list[0]?.iso;
      const lastIso = list.at(-1)?.iso;
      if (!firstIso || !lastIso) return "";
      const firstTime = new Date(firstIso).getTime();
      const lastTime = new Date(lastIso).getTime();
      const targetTime = firstTime + ratio * (lastTime - firstTime || 1);
      return new Date(targetTime).toISOString().slice(0, 10);
    };

    shell.addEventListener("mousemove", pointerToIndex);
    shell.addEventListener("mouseenter", pointerToIndex);
    shell.addEventListener("mouseleave", hidePoint);
    shell.addEventListener("focus", () => showPoint(list.length - 1));
    shell.addEventListener("blur", hidePoint);
    shell.addEventListener("touchstart", (event) => {
      const touch = event.touches[0];
      if (touch) pointerToIndex(touch);
    });

    if (brushable) {
      shell.addEventListener("pointerdown", (event) => {
        if (event.target.closest(".chart-point-link")) return;
        brushing = true;
        hidePoint();
        brushStartRatio = pointerRatio(event);
        updateBrush(brushStartRatio, brushStartRatio);
        shell.setPointerCapture?.(event.pointerId);
      });

      shell.addEventListener("pointermove", (event) => {
        if (!brushing) return;
        updateBrush(brushStartRatio, pointerRatio(event));
      });

      const finishBrush = (event) => {
        if (!brushing) return;
        brushing = false;
        const endRatio = pointerRatio(event);
        const startDate = ratioToDate(Math.min(brushStartRatio, endRatio));
        const endDate = ratioToDate(Math.max(brushStartRatio, endRatio));
        const width = Math.abs(endRatio - brushStartRatio);
        hideBrush();
        if (width < 0.03 || !startDate || !endDate || !panelKey) return;
        shell.dispatchEvent(
          new CustomEvent("chartbrush", {
            bubbles: true,
            detail: { panelKey, startDate, endDate },
          })
        );
      };

      shell.addEventListener("pointerup", finishBrush);
      shell.addEventListener("pointercancel", () => {
        brushing = false;
        hideBrush();
      });
    }
  });
}

export function bindSourceDrawer(root = document) {
  const drawer = root.querySelector("#source-drawer");
  if (!drawer || drawer.dataset.bound === "true") return;
  drawer.dataset.bound = "true";

  const titleEl = drawer.querySelector("[data-drawer-title]");
  const metaEl = drawer.querySelector("[data-drawer-meta]");
  const bodyEl = drawer.querySelector("[data-drawer-body]");
  const openLink = drawer.querySelector("[data-drawer-link]");
  const closeButton = drawer.querySelector("[data-drawer-close]");

  const closeDrawer = () => {
    drawer.hidden = true;
    drawer.classList.remove("is-open");
  };

  const openDrawer = (payload) => {
    titleEl.textContent = `${payload.seriesName} · ${payload.date}`;
    metaEl.textContent = payload.note || "公开确认值";
    bodyEl.innerHTML = `
      <p><strong>数值：</strong>${payload.value}</p>
      <p><strong>来源：</strong>${escapeHtml(payload.source || "暂无来源说明")}</p>
    `;
    if (payload.link) {
      openLink.hidden = false;
      openLink.href = payload.link;
    } else {
      openLink.hidden = true;
      openLink.removeAttribute("href");
    }
    drawer.hidden = false;
    drawer.classList.add("is-open");
  };

  closeButton?.addEventListener("click", closeDrawer);
  drawer.addEventListener("click", (event) => {
    if (event.target === drawer) closeDrawer();
  });

  root.addEventListener("click", (event) => {
    const point = event.target.closest(".chart-point-link[data-point]");
    if (!point) return;
    event.preventDefault();
    const payload = JSON.parse(decodeURIComponent(point.dataset.point));
    openDrawer(payload);
  });
}

export async function fetchDashboardData(date) {
  const url = new URL("/api/dashboard", window.location.origin);
  if (date) url.searchParams.set("date", date);
  const response = await fetch(url);
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || "请求失败");
  return data;
}

export function selectionSummary(selection, conflictStartDate, fallbackEndIso) {
  const normalized = normalizeRangeSelection(selection);
  if (normalized.mode !== "custom") return getRangeLabel(normalized.mode);
  const endDate = normalized.end || dateStringFromIso(fallbackEndIso);
  return normalized.start && endDate ? `${normalized.start} 至 ${endDate}` : "自定义区间";
}

export function windowSelectionAround(date, daysBefore, daysAfter = daysBefore) {
  const anchor = new Date(`${date}T00:00:00Z`);
  const start = new Date(anchor);
  const end = new Date(anchor);
  start.setUTCDate(start.getUTCDate() - daysBefore);
  end.setUTCDate(end.getUTCDate() + daysAfter);
  return {
    mode: "custom",
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

export async function exportNodeToPng(node, fileName) {
  const styles = await fetch("/styles.css").then((response) => response.text());
  const clone = node.cloneNode(true);
  clone.setAttribute("xmlns", "http://www.w3.org/1999/xhtml");
  const { width, height } = node.getBoundingClientRect();
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width * 2}" height="${height * 2}">
      <foreignObject width="100%" height="100%" transform="scale(2)">
        <div xmlns="http://www.w3.org/1999/xhtml">
          <style>${styles}</style>
          ${clone.outerHTML}
        </div>
      </foreignObject>
    </svg>
  `;

  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const image = new Image();
  image.src = url;

  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = reject;
  });

  const canvas = document.createElement("canvas");
  canvas.width = width * 2;
  canvas.height = height * 2;
  const context = canvas.getContext("2d");
  context.drawImage(image, 0, 0);
  URL.revokeObjectURL(url);

  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = fileName;
  link.click();
}
