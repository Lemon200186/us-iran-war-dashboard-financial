import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, "public");
const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || "127.0.0.1";

const FUND_CONFIG = [
  { code: "021074", name: "华夏中证沪深港黄金产业股票ETF联接A", category: "黄金产业股票" },
  { code: "023255", name: "汇添富中证全指软件ETF联接C", category: "软件科技" },
  { code: "000218", name: "国泰黄金ETF联接A", category: "黄金ETF联接" },
  { code: "016664", name: "天弘全球高端制造混合(QDII)A", category: "全球高端制造QDII" },
];

const PERSONAL_FUND_POSITION = {
  fundCode: "023255",
  buyDate: "2026-01-14",
  investedAmount: 100,
};

const MARKET_CONFIG = [
  {
    symbol: "DCOILWTICO",
    name: "WTI原油",
    unit: "USD/桶",
    sourceLabel: "FRED",
    url: "https://fred.stlouisfed.org/series/DCOILWTICO",
    type: "fred",
  },
  {
    symbol: "FREEGOLD",
    name: "国际金价",
    unit: "USD/盎司",
    sourceLabel: "GiaVang.now",
    url: "https://giavang.now/api/prices?type=XAUUSD&days=10",
    type: "freegold",
  },
  {
    symbol: "DGS10",
    name: "美国10年期国债收益率",
    unit: "%",
    sourceLabel: "FRED",
    url: "https://fred.stlouisfed.org/series/DGS10",
    type: "fred",
  },
  {
    symbol: "DGS5",
    name: "美国5年期国债收益率",
    unit: "%",
    sourceLabel: "FRED",
    url: "https://fred.stlouisfed.org/series/DGS5",
    type: "fred",
  },
  {
    symbol: "DTB3",
    name: "美国13周国库券收益率",
    unit: "%",
    sourceLabel: "FRED",
    url: "https://fred.stlouisfed.org/series/DTB3",
    type: "fred",
  },
];

const NEWS_FEEDS = [
  {
    name: "冲突主线",
    url: "https://news.google.com/rss/search?q=%22United+States%22+Iran+war+OR+strike+OR+missile+OR+Hormuz&hl=en-US&gl=US&ceid=US:en",
  },
  {
    name: "能源扰动",
    url: "https://news.google.com/rss/search?q=Iran+oil+gas+Hormuz+attack&hl=en-US&gl=US&ceid=US:en",
  },
  {
    name: "伤亡口径",
    url: "https://news.google.com/rss/search?q=Iran+casualties+Israel+US+soldiers+killed+injured&hl=en-US&gl=US&ceid=US:en",
  },
  {
    name: "外交反应",
    url: "https://news.google.com/rss/search?q=Iran+US+ceasefire+warning+sanctions+gulf+states&hl=en-US&gl=US&ceid=US:en",
  },
];

const START_DATE = "2026-02-28";
const START_DATE_SOURCE = {
  label: "Al Jazeera AJLabs",
  url: "https://www.aljazeera.com/author/ajlabs",
};

const FALLBACK_TOTAL_SUMMARY = {
  iranDead: 1255,
  israelDead: 13,
  usDead: 8,
  gulfDead: 17,
};

const FALLBACK_TIMELINE = [
  {
    date: "2026-02-28",
    actor: "双边/交火",
    title: "美以对伊朗发动首轮打击，伊朗随后向以色列与海湾地区目标实施报复。",
    source: "Al Jazeera",
    link: "https://www.aljazeera.com/news/2026/2/28/mapping-us-and-israeli-attacks-on-iran-and-tehrans-retaliatory-strikes",
  },
  {
    date: "2026-03-01",
    actor: "多方伤亡",
    title: "公开媒体开始滚动更新伊朗、以色列、美军及海湾国家伤亡总数。",
    source: "Al Jazeera",
    link: "https://www.aljazeera.com/news/2026/3/1/us-israel-attacks-on-iran-death-toll-and-injuries-live-tracker",
  },
];

const CASUALTY_CONFIRMED_CHECKPOINTS = {
  iran: [
    {
      date: "2026-03-01",
      value: 201,
      source: "Al Jazeera AMP live tracker",
      link: "https://www.aljazeera.com/amp/news/2026/3/1/us-israel-attacks-on-iran-death-toll-and-injuries-live-tracker",
    },
    {
      date: "2026-03-02",
      value: 555,
      source: "Al Jazeera",
      link: "https://www.aljazeera.com/news/2026/3/2/iran-death-toll-reaches-555-as-us-israel-escalate-attacks",
    },
    {
      date: "2026-03-05",
      value: 1230,
      source: "Al Jazeera",
      link: "https://www.aljazeera.com/news/2026/3/5/iran-fires-more-missiles-drones-across-gulf-region-amid-us-israeli-attacks",
    },
    {
      date: "2026-03-09",
      value: 1255,
      source: "Al Jazeera",
      link: "https://www.aljazeera.com/news/2026/3/9/iran-says-1255-killed-in-us-israeli-attacks-mostly-civilians",
    },
  ],
  israel: [
    {
      date: "2026-03-01",
      value: 9,
      source: "Al Jazeera AMP live tracker",
      link: "https://www.aljazeera.com/amp/news/2026/3/1/us-israel-attacks-on-iran-death-toll-and-injuries-live-tracker",
    },
    {
      date: "2026-03-05",
      value: 11,
      source: "Al Jazeera",
      link: "https://www.aljazeera.com/news/2026/3/5/iran-fires-more-missiles-drones-across-gulf-region-amid-us-israeli-attacks",
    },
    {
      date: "2026-03-11",
      value: 13,
      source: "Al Jazeera live tracker update",
      link: "https://www.aljazeera.com/news/2026/3/1/us-israel-attacks-on-iran-death-toll-and-injuries-live-tracker",
    },
  ],
  us: [
    {
      date: "2026-03-05",
      value: 6,
      source: "Al Jazeera",
      link: "https://www.aljazeera.com/news/2026/3/5/iran-fires-more-missiles-drones-across-gulf-region-amid-us-israeli-attacks",
    },
    {
      date: "2026-03-11",
      value: 8,
      source: "Al Jazeera live tracker update",
      link: "https://www.aljazeera.com/news/2026/3/1/us-israel-attacks-on-iran-death-toll-and-injuries-live-tracker",
    },
  ],
  gulf: [
    {
      date: "2026-03-01",
      value: 6,
      source: "Al Jazeera AMP live tracker",
      link: "https://www.aljazeera.com/amp/news/2026/3/1/us-israel-attacks-on-iran-death-toll-and-injuries-live-tracker",
    },
    {
      date: "2026-03-05",
      value: 3,
      source: "Al Jazeera UAE-specific tally",
      link: "https://www.aljazeera.com/news/2026/3/5/iran-fires-more-missiles-drones-across-gulf-region-amid-us-israeli-attacks",
    },
    {
      date: "2026-03-11",
      value: 17,
      source: "Al Jazeera live tracker update",
      link: "https://www.aljazeera.com/news/2026/3/1/us-israel-attacks-on-iran-death-toll-and-injuries-live-tracker",
    },
  ],
};

function json(data, status = 200) {
  return {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
    body: JSON.stringify(data),
  };
}

function getContentType(filePath) {
  if (filePath.endsWith(".html")) return "text/html; charset=utf-8";
  if (filePath.endsWith(".css")) return "text/css; charset=utf-8";
  if (filePath.endsWith(".js")) return "application/javascript; charset=utf-8";
  if (filePath.endsWith(".json")) return "application/json; charset=utf-8";
  return "text/plain; charset=utf-8";
}

async function fetchText(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 Codex Dashboard",
      Accept: "*/*",
      ...options.headers,
    },
    signal: AbortSignal.timeout(options.timeout ?? 10000),
    redirect: "follow",
  });

  if (!response.ok) {
    throw new Error(`Fetch failed: ${response.status} ${url}`);
  }

  return response.text();
}

async function fetchJson(url, options = {}) {
  return JSON.parse(await fetchText(url, options));
}

function formatNumber(value, digits = 2) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return null;
  return Number(Number(value).toFixed(digits));
}

function compactWhitespace(text) {
  return text.replace(/\s+/g, " ").trim();
}

function stripTags(html) {
  return compactWhitespace(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&#160;/g, " ")
  );
}

function parseNumber(text) {
  return Number(String(text).replace(/,/g, "").replace(/[^\d.-]/g, ""));
}

function dedupeBy(items, selector) {
  const seen = new Set();
  return items.filter((item) => {
    const key = selector(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function getDirection(change) {
  if (change > 0) return "up";
  if (change < 0) return "down";
  return "flat";
}

function parseCsvRows(csvText) {
  return csvText
    .trim()
    .split("\n")
    .slice(1)
    .map((line) => line.split(","))
    .filter((row) => row.length >= 2);
}

function isValidDate(dateString) {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateString);
}

function normalizeSnapshotDate(input) {
  return input && isValidDate(input) ? input : null;
}

function isoFromDate(dateString) {
  return new Date(`${dateString}T23:59:59.999Z`).toISOString();
}

function pointLabelFromIso(iso, includeTime = false) {
  const date = new Date(iso);
  if (includeTime) {
    return new Intl.DateTimeFormat("zh-CN", { dateStyle: "medium", timeStyle: "short" }).format(date);
  }
  return new Intl.DateTimeFormat("zh-CN", { dateStyle: "medium" }).format(date);
}

function filterSeriesByDate(series, snapshotDate) {
  if (!snapshotDate) return series;
  const end = isoFromDate(snapshotDate);
  return series.filter((point) => point.timestamp <= end);
}

function calculateSeriesStats(series) {
  const last = series.at(-1)?.close ?? null;
  const prev = series.at(-2)?.close ?? null;
  const change = last !== null && prev !== null ? last - prev : null;
  const changePct = last !== null && prev ? (change / prev) * 100 : null;

  return {
    last,
    prev,
    change,
    changePct,
    asOf: series.at(-1)?.timestamp ?? null,
  };
}

function buildHistoryPoints(series, digits = 3) {
  return series.map((point) => ({
    label: pointLabelFromIso(point.timestamp),
    iso: point.timestamp,
    value: formatNumber(point.close, digits),
  }));
}

function buildCumulativeCasualtySeries(conflict, snapshotDate) {
  const numericRows = (conflict.casualties || []).map((item) => ({
    killed: parseNumber(item.killed),
    injured: parseNumber(item.injured),
  }));
  const latestKnownTotal = numericRows.reduce(
    (sum, row) => sum + (Number.isFinite(row.killed) ? row.killed : 0) + (Number.isFinite(row.injured) ? row.injured : 0),
    0
  );
  const endDate =
    snapshotDate ||
    conflict.timeline?.[0]?.date ||
    new Date().toISOString().slice(0, 10);

  return [
    {
      label: START_DATE,
      iso: new Date(`${START_DATE}T00:00:00Z`).toISOString(),
      value: 0,
      confirmed: true,
    },
    {
      label: endDate,
      iso: new Date(`${endDate}T00:00:00Z`).toISOString(),
      value: latestKnownTotal,
      confirmed: true,
    },
  ];
}

function buildCountryCasualtySeries(conflict, news, snapshotDate) {
  const endDate =
    snapshotDate ||
    conflict.timeline?.[0]?.date ||
    new Date().toISOString().slice(0, 10);

  const countryMap = [
    { match: /iran/i, name: "伊朗", key: "iran" },
    { match: /israel/i, name: "以色列", key: "israel" },
    { match: /us\b|美国/i, name: "美军/美国", key: "us" },
    { match: /gulf|海湾/i, name: "海湾国家", key: "gulf" },
  ];

  return countryMap.map((country) => {
    const row = (conflict.casualties || []).find((item) => country.match.test(item.country));
    const total = Number.isFinite(parseNumber(row?.killed)) ? parseNumber(row.killed) : 0;
    const curatedPoints = (CASUALTY_CONFIRMED_CHECKPOINTS[country.key] || [])
      .filter((point) => !snapshotDate || point.date <= snapshotDate)
      .map((point) => ({
        label: point.date,
        iso: new Date(`${point.date}T00:00:00Z`).toISOString(),
        value: point.value,
        confirmed: true,
        source: point.source,
        link: point.link,
      }));
    const newsPoints = (news.casualtyTimeline || [])
      .find((item) => item.key === country.key)
      ?.points.filter((point) => !snapshotDate || point.label <= snapshotDate)
      .map((point) => ({ ...point, confirmed: true })) || [];
    const mergedPoints = [
      {
        label: START_DATE,
        iso: new Date(`${START_DATE}T00:00:00Z`).toISOString(),
        value: 0,
        confirmed: true,
      },
      ...curatedPoints,
      ...newsPoints,
    ];
    const deduped = [];
    const seen = new Set();
    for (const point of mergedPoints) {
      if (seen.has(point.label)) continue;
      seen.add(point.label);
      deduped.push(point);
    }

    const tailValue = deduped.at(-1)?.value ?? 0;
    const finalValue = Math.max(total, tailValue);
    if (!deduped.find((point) => point.label === endDate)) {
      deduped.push({
        label: endDate,
        iso: new Date(`${endDate}T00:00:00Z`).toISOString(),
        value: finalValue,
        confirmed: true,
        source: "Latest conflict summary",
      });
    } else {
      deduped[deduped.length - 1].value = finalValue;
      deduped[deduped.length - 1].confirmed = true;
    }

    return {
      key: country.key,
      name: country.name,
      points: deduped
        .sort((a, b) => a.label.localeCompare(b.label))
        .map((point, index, list) => ({
          ...point,
          value: index === 0 ? point.value : Math.max(point.value, list[index - 1].value),
        })),
    };
  });
}

async function getFredSeries(seriesId) {
  const csvText = await fetchText(`https://fred.stlouisfed.org/graph/fredgraph.csv?id=${seriesId}`);
  return parseCsvRows(csvText)
    .map(([date, value]) => ({
      timestamp: new Date(date).toISOString(),
      close: value === "." ? null : Number(value),
    }))
    .filter((point) => Number.isFinite(point.close))
    .slice(-60);
}

async function getFreeGoldSeries() {
  const giavangSeries = await getGiavangGoldSeries().catch(() => []);
  if (giavangSeries.length) return giavangSeries;

  const csvText = await fetchText("https://freegoldapi.com/data/latest.csv");
  return parseCsvRows(csvText)
    .map(([date, price]) => ({
      timestamp: new Date(date).toISOString(),
      close: Number(price),
    }))
    .filter((point) => Number.isFinite(point.close) && point.timestamp.startsWith("202"))
    .slice(-60);
}

async function getGiavangGoldSeries() {
  const payload = await fetchJson("https://giavang.now/api/prices?type=XAUUSD&days=60");
  return (payload?.history || [])
    .map((entry) => {
      const price = Number(entry?.prices?.XAUUSD?.buy);
      if (!entry?.date || !Number.isFinite(price)) return null;
      return {
        timestamp: new Date(entry.date).toISOString(),
        close: price,
      };
    })
    .filter(Boolean)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .slice(-60);
}

async function getMarketData(snapshotDate) {
  return Promise.all(
    MARKET_CONFIG.map(async (config) => {
      try {
        const rawSeries =
          config.type === "fred" ? await getFredSeries(config.symbol) : await getFreeGoldSeries();
        const series = filterSeriesByDate(rawSeries, snapshotDate);
        const stats = calculateSeriesStats(series);
        const digits = config.unit === "%" ? 3 : 2;

        return {
          ...config,
          value: formatNumber(stats.last, digits),
          change: formatNumber(stats.change, digits),
          changePct: formatNumber(stats.changePct, 2),
          direction: getDirection(stats.change ?? 0),
          asOf: stats.asOf,
          history: series.map((point) => formatNumber(point.close, 3)),
          historyPoints: buildHistoryPoints(series, 3),
        };
      } catch (error) {
        return { ...config, error: error.message };
      }
    })
  );
}

function parseFundEstimate(payloadText) {
  const match = payloadText.match(/jsonpgz\((\{.*\})\);?/);
  if (!match) throw new Error("Unable to parse fund estimate payload");
  return JSON.parse(match[1]);
}

async function getFundHistory(code) {
  const payload = await fetchJson(
    `https://api.fund.eastmoney.com/f10/lsjz?fundCode=${code}&pageIndex=1&pageSize=120`,
    { headers: { Referer: "https://fundf10.eastmoney.com/" } }
  );

  return (payload?.Data?.LSJZList || [])
    .map((row) => ({
      date: row.FSRQ,
      nav: Number(row.DWJZ),
      dailyPct: Number(row.JZZZL),
    }))
    .filter((row) => Number.isFinite(row.nav))
    .reverse();
}

async function getFundsData(snapshotDate) {
  return Promise.all(
    FUND_CONFIG.map(async (fund) => {
      try {
        const [estimateResult, history] = await Promise.all([
          fetchText(`https://fundgz.1234567.com.cn/js/${fund.code}.js?rt=${Date.now()}`).then((text) => ({
            ok: true,
            text,
          })).catch((error) => ({ ok: false, error })),
          getFundHistory(fund.code),
        ]);

        const filteredHistory = snapshotDate
          ? history.filter((point) => point.date <= snapshotDate)
          : history;
        const latestHistory = filteredHistory.at(-1) ?? history.at(-1);
        const previousHistory = filteredHistory.at(-2) ?? history.at(-2);
        const weeklyBase = filteredHistory.at(Math.max(0, filteredHistory.length - 6))?.nav ?? null;
        const weeklyPct =
          latestHistory?.nav && weeklyBase ? ((latestHistory.nav - weeklyBase) / weeklyBase) * 100 : null;
        const usingHistoricalView = Boolean(snapshotDate);
        const estimate =
          estimateResult.ok && !usingHistoricalView ? parseFundEstimate(estimateResult.text) : null;

        return {
          ...fund,
          codeUrl: `https://fund.eastmoney.com/${fund.code}.html`,
          estimatedValue: usingHistoricalView
            ? formatNumber(latestHistory?.nav ?? null, 4)
            : formatNumber(estimate ? Number(estimate.gsz) : latestHistory?.nav ?? null, 4),
          estimatedChangePct: usingHistoricalView
            ? formatNumber(latestHistory?.dailyPct ?? null, 2)
            : formatNumber(estimate ? Number(estimate.gszzl) : latestHistory?.dailyPct ?? null, 2),
          lastNav: formatNumber(latestHistory?.nav ?? null, 4),
          lastNavDate: latestHistory?.date ?? null,
          lastDailyPct: formatNumber(latestHistory?.dailyPct ?? null, 2),
          previousNav: formatNumber(previousHistory?.nav ?? null, 4),
          weeklyPct: formatNumber(weeklyPct, 2),
          history: filteredHistory.map((point) => formatNumber(point.nav, 4)),
          historyPoints: filteredHistory.map((point) => ({
            label: point.date,
            iso: new Date(`${point.date}T00:00:00Z`).toISOString(),
            value: formatNumber(point.nav, 4),
          })),
          estimateTime: usingHistoricalView ? latestHistory?.date ?? null : estimate?.gztime || latestHistory?.date || null,
          sourceLabel: "东方财富",
          snapshotMode: usingHistoricalView ? "historical_nav" : "intraday_estimate",
        };
      } catch (error) {
        return {
          ...fund,
          error: error.message,
          codeUrl: `https://fund.eastmoney.com/${fund.code}.html`,
          sourceLabel: "东方财富",
        };
      }
    })
  );
}

function buildPersonalFundMonitor(funds, markets, news, snapshotDate) {
  const fund = funds.find((item) => item.code === PERSONAL_FUND_POSITION.fundCode);
  if (!fund || fund.error || !fund.historyPoints?.length) return null;

  const history = fund.historyPoints
    .map((point) => ({
      ...point,
      date: new Date(point.iso).toISOString().slice(0, 10),
      value: Number(point.value),
    }))
    .filter((point) => Number.isFinite(point.value));

  if (!history.length) return null;

  const buyPoint =
    history.find((point) => point.date >= PERSONAL_FUND_POSITION.buyDate) ||
    history.find((point) => point.date === PERSONAL_FUND_POSITION.buyDate) ||
    history[0];
  if (!buyPoint) return null;

  const investedAmount = PERSONAL_FUND_POSITION.investedAmount;
  const shares = investedAmount / buyPoint.value;
  const currentNav = Number(fund.estimatedValue ?? fund.lastNav ?? buyPoint.value);
  const currentDate = snapshotDate || fund.estimateTime || fund.lastNavDate || history.at(-1)?.date || buyPoint.date;
  const currentValue = shares * currentNav;
  const totalPnl = currentValue - investedAmount;
  const totalPnlPct = investedAmount ? (totalPnl / investedAmount) * 100 : null;

  const previousNav = Number(fund.previousNav ?? buyPoint.value);
  const dailyPnl = Number.isFinite(previousNav) ? shares * (currentNav - previousNav) : null;
  const previousValue = Number.isFinite(previousNav) ? shares * previousNav : null;
  const dailyPnlPct = previousValue ? (dailyPnl / previousValue) * 100 : null;

  const positionHistory = history
    .filter((point) => point.date >= buyPoint.date)
    .map((point) => {
      const positionValue = shares * point.value;
      return {
        label: point.label,
        iso: point.iso,
        value: formatNumber(positionValue, 2),
        pnl: formatNumber(positionValue - investedAmount, 2),
      };
    });

  const peakValue = Math.max(...positionHistory.map((point) => Number(point.value)));
  const drawdownPct = peakValue ? ((currentValue - peakValue) / peakValue) * 100 : null;
  const shortWindow = history.slice(-5);
  const shortMomentumPct =
    shortWindow.length >= 2
      ? ((shortWindow.at(-1).value - shortWindow[0].value) / shortWindow[0].value) * 100
      : null;

  const tenYear = markets.find((item) => item.symbol === "DGS10");
  const topTitles = news.top5.map((item) => item.title).join(" | ").toLowerCase();
  const conflictRiskHot = /hormuz|missile|strike|attack|power plant|close strait|shipping/.test(topTitles);
  const ratesHeadwind = Number(tenYear?.changePct) > 0;

  let stance = "继续观察";
  let stanceReason = "目前更适合按规则跟踪，而不是情绪化操作。";

  if ((totalPnlPct ?? 0) >= 12) {
    stance = "分批止盈";
    stanceReason = "你的仓位已经有较明显浮盈，软件成长风格在地缘冲突和利率上行环境里波动较大，优先锁定一部分收益更稳。";
  } else if ((totalPnlPct ?? 0) <= -8 && ratesHeadwind) {
    stance = "控制回撤";
    stanceReason = "当前处于明显浮亏且利率环境不友好，高估值软件板块容易继续承压，更适合先收缩仓位而不是盲目补仓。";
  } else if ((shortMomentumPct ?? 0) > 2 && !ratesHeadwind && !conflictRiskHot) {
    stance = "继续持有";
    stanceReason = "短线趋势仍偏正，且外部宏观压制没那么强，可以先继续持有观察。";
  }

  const rules = [
    {
      trigger: "若累计收益达到 +12% 到 +15%",
      action: "先卖出 30% 到 50%",
      reason: "先把盈利落袋，剩余仓位再用移动止盈跟踪，避免软件成长风格把浮盈快速吐回去。",
    },
    {
      trigger: "若从买入成本回撤到 -8% 以下，且美国10年期利率继续上行",
      action: "考虑减仓 30%",
      reason: "软件板块对利率很敏感，在冲突和利率双压时，继续死扛的性价比通常不高。",
    },
    {
      trigger: "若最近 5 个交易日重新转强，且利率不再上冲",
      action: "继续持有，不急着卖",
      reason: "说明资金风险偏好修复，软件类基金更容易出现反弹延续。",
    },
    {
      trigger: "若你想继续加仓",
      action: "只在回到买入成本附近、并且 5 日动量重新转正时小额加",
      reason: "这样做是在等趋势确认，而不是在下跌途中摊平成本。",
    },
  ];

  const sources = [
    { label: "东方财富: 汇添富中证全指软件ETF联接C", url: "https://fund.eastmoney.com/023255.html" },
    { label: "FRED: 美国10年期国债收益率", url: "https://fred.stlouisfed.org/series/DGS10" },
  ];
  if (news.top5[0]?.link) {
    sources.push({ label: `最新冲突新闻: ${news.top5[0].source}`, url: news.top5[0].link });
  }

  return {
    fundCode: fund.code,
    fundName: fund.name,
    buyDate: PERSONAL_FUND_POSITION.buyDate,
    actualBuyDate: buyPoint.date,
    investedAmount: formatNumber(investedAmount, 2),
    buyNav: formatNumber(buyPoint.value, 4),
    shares: formatNumber(shares, 4),
    currentNav: formatNumber(currentNav, 4),
    currentDate,
    currentValue: formatNumber(currentValue, 2),
    totalPnl: formatNumber(totalPnl, 2),
    totalPnlPct: formatNumber(totalPnlPct, 2),
    dailyPnl: formatNumber(dailyPnl, 2),
    dailyPnlPct: formatNumber(dailyPnlPct, 2),
    peakValue: formatNumber(peakValue, 2),
    drawdownPct: formatNumber(drawdownPct, 2),
    shortMomentumPct: formatNumber(shortMomentumPct, 2),
    ratesHeadwind,
    conflictRiskHot,
    stance,
    stanceReason,
    rules,
    historyPoints: positionHistory,
    disclaimer: "以下为基于公开净值、利率与冲突新闻的规则化提示，不构成个性化投顾或收益承诺。",
    sources,
  };
}

function decodeXml(value) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function parseRss(xml) {
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((match) => {
    const item = match[1];
    const getTag = (tag) => {
      const tagMatch = item.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, "i"));
      return tagMatch ? decodeXml(tagMatch[1]).trim() : "";
    };
    const sourceMatch = item.match(/<source[^>]*>([\s\S]*?)<\/source>/i);
    return {
      title: getTag("title"),
      link: getTag("link"),
      pubDate: getTag("pubDate"),
      description: getTag("description"),
      source: sourceMatch ? decodeXml(sourceMatch[1]).trim() : "未知来源",
    };
  });
}

function scoreNews(item) {
  const text = `${item.title} ${item.description}`.toLowerCase();
  let score = 0;
  if (/hormuz|oil|gas|refinery|energy|shipping|strait/.test(text)) score += 4;
  if (/iran|u\.s\.|united states|american|tehran|israel|gulf/.test(text)) score += 3;
  if (/strike|missile|drone|troops|base|attack|killed|injured|casualties|orders|warns|launches/.test(text)) score += 3;
  if (/live|opinion|analysis|video/.test(text)) score -= 2;
  return score;
}

function classifyActor(text) {
  const lower = text.toLowerCase();
  let actor = "其他";
  if (/u\.s\.|united states|american|trump|centcom|pentagon/.test(lower)) actor = "美方";
  if (/iran|tehran|irgc|iranian/.test(lower)) actor = actor === "美方" ? "双边/交火" : "伊朗";
  if (/israel|israeli/.test(lower) && actor === "其他") actor = "以色列";
  if (/gulf|saudi|qatar|uae|bahrain|oman/.test(lower) && actor === "其他") actor = "海湾国家";
  if (/ceasefire|talks|un|sanctions|europe/.test(lower) && actor === "其他") actor = "外交/国际反应";
  return actor;
}

function extractCount(text, keyword) {
  const match = text.match(new RegExp(`([0-9,]+|dozens|hundreds|at least [0-9,]+)\\s+${keyword}`, "i"));
  return match ? compactWhitespace(match[1]) : null;
}

function aggregateCasualtiesFromNews(items) {
  const rules = [
    { label: "Iran / 伊朗", patterns: [/iran/i, /iranian/i] },
    { label: "Israel / 以色列", patterns: [/israel/i, /israeli/i] },
    { label: "US / 美国", patterns: [/u\.s\./i, /united states/i, /american/i, /us soldiers/i] },
    { label: "Gulf States / 海湾国家", patterns: [/gulf/i, /qatar/i, /bahrain/i, /uae/i, /saudi/i, /oman/i] },
  ];

  return rules
    .map((rule) => {
      const matches = items.filter((item) => rule.patterns.some((pattern) => pattern.test(`${item.title} ${item.description}`)));
      const killed = matches
        .map((item) => extractCount(`${item.title} ${item.description}`, "killed"))
        .find(Boolean);
      const injured = matches
        .map((item) => extractCount(`${item.title} ${item.description}`, "injured"))
        .find(Boolean);

      if (!killed && !injured) return null;

      return {
        country: rule.label,
        killed: killed || "待核实",
        injured: injured || "待核实",
        sourceCount: matches.length,
      };
    })
    .filter(Boolean);
}

function buildCountryCasualtyTimelineFromNews(items) {
  const rules = [
    { key: "iran", name: "伊朗", patterns: [/iran/i, /iranian/i] },
    { key: "israel", name: "以色列", patterns: [/israel/i, /israeli/i] },
    { key: "us", name: "美军/美国", patterns: [/u\.s\./i, /united states/i, /american/i, /us soldiers/i] },
    { key: "gulf", name: "海湾国家", patterns: [/gulf/i, /qatar/i, /bahrain/i, /uae/i, /saudi/i, /oman/i] },
  ];

  return rules.map((rule) => {
    const pointsByDate = new Map();
    items.forEach((item) => {
      const text = `${item.title} ${item.description}`;
      if (!rule.patterns.some((pattern) => pattern.test(text))) return;

      const killed = parseNumber(extractCount(text, "killed"));
      const injured = parseNumber(extractCount(text, "injured"));
      const total = (Number.isFinite(killed) ? killed : 0) + (Number.isFinite(injured) ? injured : 0);
      const date = item.publishedAt?.slice(0, 10);

      if (!date || total <= 0) return;
      pointsByDate.set(date, Math.max(pointsByDate.get(date) || 0, total));
    });

    let runningMax = 0;
    const points = [...pointsByDate.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, total]) => {
        runningMax = Math.max(runningMax, total);
        return {
          label: date,
          iso: new Date(`${date}T00:00:00Z`).toISOString(),
          value: runningMax,
          confirmed: true,
        };
      });

    return {
      key: rule.key,
      name: rule.name,
      points,
    };
  });
}

async function getNewsData(snapshotDate) {
  const feedItems = await Promise.allSettled(
    NEWS_FEEDS.map(async (feed) => {
      const xml = await fetchText(feed.url);
      return parseRss(xml).map((item) => ({ ...item, feed: feed.name }));
    })
  );

  const end = snapshotDate ? isoFromDate(snapshotDate) : null;
  const combined = dedupeBy(
    feedItems.flatMap((result) => (result.status === "fulfilled" ? result.value : [])),
    (item) => item.title
  )
    .map((item) => ({
      ...item,
      score: scoreNews(item),
      actor: classifyActor(`${item.title} ${item.description}`),
      publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : null,
    }))
    .filter((item) => !end || (item.publishedAt && item.publishedAt <= end))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
    });

  const top5 = combined.slice(0, 5);
  const actions = combined
    .filter((item) => /strike|attack|missile|drone|troops|base|orders|warns|launches|seizes|retaliat/i.test(item.title))
    .slice(0, 12)
    .map((item) => ({
      actor: item.actor,
      title: item.title,
      source: item.source,
      link: item.link,
      publishedAt: item.publishedAt,
    }));

  const timeline = combined
    .filter((item) => item.publishedAt)
    .slice(0, 18)
    .map((item) => ({
      date: item.publishedAt.slice(0, 10),
      actor: item.actor,
      title: item.title,
      source: item.source,
      link: item.link,
      publishedAt: item.publishedAt,
    }));

  const casualtyMentions = aggregateCasualtiesFromNews(combined.slice(0, 30));
  const casualtyTimeline = buildCountryCasualtyTimelineFromNews(combined.slice(0, 30));

  return { top5, actions, timeline, casualtyMentions, casualtyTimeline, all: combined.slice(0, 30) };
}

function parseCasualtySection(text) {
  const results = [];
  const regex = /([A-Za-z ]+?)\s+[–-]\s+killed:\s*([0-9,]+|Dozens|hundreds|0),\s*injured:\s*([0-9,]+|Dozens|dozens|hundreds|Hundreds|at least [0-9,]+)/g;
  for (const match of text.matchAll(regex)) {
    results.push({
      country: compactWhitespace(match[1]),
      killed: match[2],
      injured: match[3],
      source: "Al Jazeera 伤亡追踪",
    });
  }
  return results;
}

async function getConflictData(news, snapshotDate) {
  const liveTrackerUrl =
    "https://www.aljazeera.com/news/2026/3/1/us-israel-attacks-on-iran-death-toll-and-injuries-live-tracker";
  const mappingUrl =
    "https://www.aljazeera.com/news/2026/2/28/mapping-us-and-israeli-attacks-on-iran-and-tehrans-retaliatory-strikes";

  const fallbackCasualtyRows = [
    { country: "Iran / 伊朗", killed: String(FALLBACK_TOTAL_SUMMARY.iranDead), injured: "待核实", source: "回退总口径" },
    { country: "Israel / 以色列", killed: String(FALLBACK_TOTAL_SUMMARY.israelDead), injured: "待核实", source: "回退总口径" },
    { country: "US / 美国", killed: String(FALLBACK_TOTAL_SUMMARY.usDead), injured: "待核实", source: "回退总口径" },
    { country: "Gulf States / 海湾国家", killed: String(FALLBACK_TOTAL_SUMMARY.gulfDead), injured: "待核实", source: "回退总口径" },
  ];

  try {
    const [liveHtml, mapHtml] = await Promise.all([fetchText(liveTrackerUrl), fetchText(mappingUrl)]);
    const liveText = stripTags(liveHtml);
    const mapText = stripTags(mapHtml);
    const casualties = parseCasualtySection(liveText);
    const totalMatch = liveText.match(
      /Preliminary figures are ([0-9,]+) dead in Iran, at least ([0-9,]+) in Israel, ([0-9,]+) US soldiers and ([0-9,]+) killed in Gulf states/i
    );

    const overview = mapText.match(
      /The US and Israel launched an attack on Iran\. Tehran has responded by launching missiles at Israel and Gulf states\./i
    )
      ? "2026-02-28 起，美以对伊朗发动打击，随后伊朗以导弹、无人机向以色列及海湾地区美军目标报复。"
      : "冲突已进入多国交火与能源设施受袭阶段，需持续跟踪口径更新。";

    return {
      startDate: START_DATE,
      startDateSource: START_DATE_SOURCE,
      totalSummary: totalMatch
        ? {
            iranDead: parseNumber(totalMatch[1]),
            israelDead: parseNumber(totalMatch[2]),
            usDead: parseNumber(totalMatch[3]),
            gulfDead: parseNumber(totalMatch[4]),
          }
        : FALLBACK_TOTAL_SUMMARY,
      casualties: casualties.length ? casualties : news.casualtyMentions.length ? news.casualtyMentions : fallbackCasualtyRows,
      overview,
      timeline: (news.timeline.length ? news.timeline : FALLBACK_TIMELINE).filter(
        (item) => !snapshotDate || item.date <= snapshotDate
      ),
      sources: [
        { label: "Al Jazeera 伤亡追踪", url: liveTrackerUrl },
        { label: "Al Jazeera 冲突地图", url: mappingUrl },
      ],
    };
  } catch (error) {
    return {
      startDate: START_DATE,
      startDateSource: START_DATE_SOURCE,
      totalSummary: FALLBACK_TOTAL_SUMMARY,
      casualties: news.casualtyMentions.length ? news.casualtyMentions : fallbackCasualtyRows,
      overview:
        "2026-02-28 起，美以对伊朗发动打击，随后伊朗对以色列及海湾地区目标实施报复。当前伤亡页抓取失败，已退回到最近一次已知公开口径。",
      timeline: (news.timeline.length ? news.timeline : FALLBACK_TIMELINE).filter(
        (item) => !snapshotDate || item.date <= snapshotDate
      ),
      sources: [
        { label: "Al Jazeera 伤亡追踪", url: liveTrackerUrl },
        { label: "Al Jazeera 冲突地图", url: mappingUrl },
      ],
      warning: `伤亡数据当前回退为最近一次已知口径：${error.message}`,
    };
  }
}

function explainMarketMoves(markets, funds, news, conflict) {
  const latestTitles = news.top5.map((item) => item.title).join(" | ").toLowerCase();
  const oil = markets.find((item) => item.symbol === "DCOILWTICO");
  const gold = markets.find((item) => item.symbol === "FREEGOLD");
  const tenYear = markets.find((item) => item.symbol === "DGS10");
  const goldStockFund = funds.find((item) => item.code === "021074");
  const goldEtfFund = funds.find((item) => item.code === "000218");
  const softwareFund = funds.find((item) => item.code === "023255");
  const manufacturingFund = funds.find((item) => item.code === "016664");

  const reasons = [];

  if (oil?.changePct > 0) {
    reasons.push({
      topic: "油价上行",
      text: /hormuz|oil|gas|refinery|energy|shipping|south pars|kharg/.test(latestTitles)
        ? "最新新闻聚焦霍尔木兹海峡、油气设施或航运扰动，市场在重新定价中东供给风险与运费溢价。"
        : "战争风险溢价抬升，尤其是海湾能源运输与炼化设施受袭概率上升时，油价通常最先反应。",
      explainLikeImNew:
        "可以把油价理解成“全球能源紧张程度”的温度计。市场担心运油航线或产油设施出问题时，哪怕还没真正断供，交易员也会先把未来可能更贵的风险算进今天价格里。",
      sources: [
        {
          label: "Reuters: Goldman 上调油价预测，因霍尔木兹扰动延长",
          url: "https://www.investing.com/news/commodities-news/goldman-sachs-raises-q4-brent-wti-crude-price-forecast-amid-longer-hormuz-disruption-4556040",
        },
      ],
    });
  }

  if (oil?.changePct < 0) {
    reasons.push({
      topic: "油价回吐",
      text:
        "若油价回落，常见原因是市场认为最坏的供给中断尚未落地，或出现了海峡通航修复、产油设施恢复、外交降温等信号。",
      explainLikeImNew:
        "油价不是只会因为战争一直涨。只要市场觉得“可能没有想象中那么糟”，之前提前涨出来的那部分风险溢价就会先吐回来。",
      sources: [
        {
          label: "市场评论：霍尔木兹风险溢价与运输数据",
          url: "https://www.investing.com/analysis/brent-holds-risk-premium-as-hormuz-tanker-traffic-collapse-tests-supply-math-200676071",
        },
      ],
    });
  }

  if (gold?.changePct > 0) {
    reasons.push({
      topic: "金价走强",
      text:
        "黄金通常受益于避险需求上升。若冲突升级、跨国扩散或美军伤亡上升，资金往往流向美元与黄金等避险资产。",
      explainLikeImNew:
        "很多人会把黄金当作“乱世保险箱”。当地缘风险上升时，部分资金会从股票或高风险资产撤出来，转去买黄金保值。",
      sources: [
        {
          label: "Reuters: 中东冲突推动黄金避险买盘",
          url: "https://www.dawn.com/news/1978214/gold-climbs-over-1pc-as-widening-middle-east-war-fuels-safehaven-demand",
        },
      ],
    });
  }

  if (gold?.changePct < 0) {
    reasons.push({
      topic: "金价下跌也可能发生",
      text:
        "即使在战争中，黄金也可能短线下跌，常见原因包括美元走强、利率上升、交易员为了补保证金而抛售黄金换现金。",
      explainLikeImNew:
        "黄金不是“只会因为战争上涨”的单向资产。如果市场同时在担心高利率和流动性压力，黄金也会被拿来卖掉换现金。",
      sources: [
        {
          label: "MarketWatch: 金价在战争周内也可能大跌",
          url: "https://www.marketwatch.com/story/gold-isnt-your-safe-haven-in-this-war-it-just-logged-its-biggest-weekly-drop-in-over-14-years-c99ffee0",
        },
      ],
    });
  }

  if (tenYear?.changePct < 0) {
    reasons.push({
      topic: "长端利率回落",
      text:
        "10年美债收益率回落往往意味着市场转向避险，买入国债对冲战争冲击；若同时油价上涨，则说明市场在避险和再通胀之间拉扯。",
      explainLikeImNew:
        "美债收益率下降，通常不是“债券变差了”，而是更多人抢着买美国国债避险。债券价格涨，收益率就会反着跌。",
      sources: [
        {
          label: "FRED: 美国10年期国债收益率序列",
          url: "https://fred.stlouisfed.org/series/DGS10",
        },
      ],
    });
  } else if (tenYear?.changePct > 0) {
    reasons.push({
      topic: "长端利率抬升",
      text:
        "若油价与长端利率同步上行，常见原因是市场担心能源冲击推高通胀、迫使未来政策利率维持更久的高位。",
      explainLikeImNew:
        "你可以把它理解成：市场在说“油更贵了，未来物价可能更难降，所以利率可能没法很快降下来”。这会推高长期利率。",
      sources: [
        {
          label: "Reuters: 高油价推高通胀担忧并影响降息预期",
          url: "https://www.dawn.com/news/1978214/gold-climbs-over-1pc-as-widening-middle-east-war-fuels-safehaven-demand",
        },
        {
          label: "FRED: 美国10年期国债收益率",
          url: "https://fred.stlouisfed.org/series/DGS10",
        },
      ],
    });
  }

  if ((goldStockFund?.estimatedChangePct ?? 0) > 0 || (goldEtfFund?.estimatedChangePct ?? 0) > 0) {
    reasons.push({
      topic: "黄金主题基金联动",
      text:
        "华夏黄金产业与国泰黄金ETF联接A分别更偏向黄金股弹性和金价本体，两者同步走强时，通常意味着避险情绪与资源股预期在共同发酵。",
      explainLikeImNew:
        "同样是“黄金相关基金”，也分两类：一类更像直接跟金价走，另一类更像买黄金公司股票。后者通常涨跌更大，因为它还叠加了股票市场情绪。",
      sources: [
        {
          label: "东方财富: 华夏中证沪深港黄金产业股票ETF联接A",
          url: "https://fund.eastmoney.com/021074.html",
        },
        {
          label: "东方财富: 国泰黄金ETF联接A",
          url: "https://fund.eastmoney.com/000218.html",
        },
      ],
    });
  }

  if ((softwareFund?.estimatedChangePct ?? 0) < 0) {
    reasons.push({
      topic: "软件ETF承压",
      text:
        "地缘冲突升级时，资金通常从高估值成长板块撤向防御与资源品，软件类指数容易出现风险偏好折价。",
      explainLikeImNew:
        "软件板块常被视为“成长型、高估值”资产。市场紧张时，投资者通常先卖这类需要未来增长故事支撑的资产，转去买更防御的品种。",
      sources: [
        {
          label: "东方财富: 汇添富中证全指软件ETF联接C",
          url: "https://fund.eastmoney.com/023255.html",
        },
      ],
    });
  }

  if (manufacturingFund && /energy|shipping|tariff|supply/.test(latestTitles)) {
    reasons.push({
      topic: "全球制造QDII波动",
      text:
        "高端制造QDII不仅受全球股市风险偏好影响，也会受到能源成本、海运中断和供应链预期重估的共同影响。",
      explainLikeImNew:
        "制造业基金不是只看股市情绪。油价、运费、零部件运输、工厂成本这些因素，都会一起影响它的表现。",
      sources: [
        {
          label: "东方财富: 天弘全球高端制造混合(QDII)A",
          url: "https://fund.eastmoney.com/016664.html",
        },
        {
          label: "Reuters: 油价与霍尔木兹扰动",
          url: "https://www.investing.com/news/commodities-news/goldman-sachs-raises-q4-brent-wti-crude-price-forecast-amid-longer-hormuz-disruption-4556040",
        },
      ],
    });
  }

  if (conflict.totalSummary?.usDead) {
    reasons.push({
      topic: "伤亡升级的市场含义",
      text:
        "一旦美军伤亡或海湾平民伤亡继续扩大，市场往往会押注美国加码军事行动，进而放大油价、黄金和波动率的二次冲击。",
      explainLikeImNew:
        "市场最怕的不是坏消息本身，而是“坏消息会不会让冲突升级”。如果伤亡扩大，交易员通常会更快押注下一轮升级，因此资产价格波动会放大。",
      sources: [
        {
          label: "Al Jazeera: 伤亡追踪页",
          url: "https://www.aljazeera.com/news/2026/3/1/us-israel-attacks-on-iran-death-toll-and-injuries-live-tracker",
        },
      ],
    });
  }

  return reasons.slice(0, 6);
}

export async function buildDashboardPayload(snapshotDate) {
  const normalizedDate = normalizeSnapshotDate(snapshotDate);
  const [marketsResult, fundsResult, newsResult] = await Promise.allSettled([
    getMarketData(normalizedDate),
    getFundsData(normalizedDate),
    getNewsData(normalizedDate),
  ]);

  const markets = marketsResult.status === "fulfilled" ? marketsResult.value : [];
  const funds = fundsResult.status === "fulfilled" ? fundsResult.value : [];
  const news =
    newsResult.status === "fulfilled"
      ? newsResult.value
      : { top5: [], actions: [], timeline: [], casualtyMentions: [], casualtyTimeline: [] };
  const conflictResult = await Promise.allSettled([getConflictData(news, normalizedDate)]);
  const conflict =
    conflictResult[0].status === "fulfilled"
      ? conflictResult[0].value
      : {
          startDate: START_DATE,
          startDateSource: START_DATE_SOURCE,
          totalSummary: FALLBACK_TOTAL_SUMMARY,
          casualties: news.casualtyMentions,
          overview: "冲突摘要暂时不可用，请稍后刷新。",
          timeline: FALLBACK_TIMELINE,
          sources: [],
        };
  const personalMonitor = buildPersonalFundMonitor(funds, markets, news, normalizedDate);

  return {
    generatedAt: new Date().toISOString(),
    snapshotDate: normalizedDate,
    title: normalizedDate ? `美国-伊朗战争晨报 ${normalizedDate}` : "美国-伊朗战争实时监控看板",
    refreshIntervalMs: 60 * 1000,
    markets,
    funds,
    personalMonitor,
    news: {
      top5: news.top5,
      actions: news.actions,
    },
    conflict,
    casualtyCurve: buildCumulativeCasualtySeries(conflict, normalizedDate),
    casualtySeries: buildCountryCasualtySeries(conflict, news, normalizedDate),
    insights: explainMarketMoves(markets, funds, news, conflict),
    methodology: [
      "WTI 原油与美债收益率来自 FRED 日线数据；国际金价优先来自 GiaVang.now 的 XAU/USD 历史序列，失败时回退到 FreeGoldAPI。",
      "基金估值与历史净值来自东方财富公开接口；历史日期下基金自动回退到最近可得净值而非盘中估值。",
      "个人持仓监控按“2026-01-14 买入汇添富中证全指软件ETF联接C 100元”的规则化假设计算，默认以该日可得净值估算份额。",
      "战争伤亡与时间线优先使用 Al Jazeera 滚动追踪页，并用 Google News RSS 做动作与伤亡口径补强。",
      "TOP5 新闻来自 Google News RSS 聚合，链接可追溯到原始报道入口。",
    ],
    warnings: [
      marketsResult.status === "rejected" ? `金融数据部分抓取失败：${marketsResult.reason.message}` : null,
      fundsResult.status === "rejected" ? `基金数据部分抓取失败：${fundsResult.reason.message}` : null,
      newsResult.status === "rejected" ? `新闻数据部分抓取失败：${newsResult.reason.message}` : null,
      conflict.warning || null,
    ].filter(Boolean),
  };
}

async function serveStatic(reqPath) {
  const normalizedPath = reqPath === "/" ? "/index.html" : reqPath;
  const resolved = path.join(publicDir, path.normalize(normalizedPath));

  if (!resolved.startsWith(publicDir)) {
    return { status: 403, body: "Forbidden", headers: { "Content-Type": "text/plain; charset=utf-8" } };
  }

  const content = await fs.readFile(resolved);
  return {
    status: 200,
    headers: { "Content-Type": getContentType(resolved) },
    body: content,
  };
}

function createServer() {
  return http.createServer(async (req, res) => {
    try {
      const requestUrl = new URL(req.url, `http://${req.headers.host}`);

      if (requestUrl.pathname === "/api/dashboard") {
        const payload = await buildDashboardPayload(requestUrl.searchParams.get("date"));
        const response = json(payload);
        res.writeHead(response.status, response.headers);
        res.end(response.body);
        return;
      }

      const response = await serveStatic(requestUrl.pathname);
      res.writeHead(response.status, response.headers);
      res.end(response.body);
    } catch (error) {
      res.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ error: "Dashboard request failed", detail: error.message }));
    }
  });
}

if (process.argv[1] === __filename) {
  const server = createServer();
  server.listen(port, host, () => {
    console.log(`Dashboard running at http://${host}:${port}`);
  });
}
