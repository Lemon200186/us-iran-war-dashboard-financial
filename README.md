# 美国-伊朗战争实时看板

本项目是一个零依赖的本地 Node 看板，用于追踪：

- 美国与伊朗冲突的起点、伤亡与关键动作
- 油价、金价、美债收益率波动
- 华夏中证沪深港黄金产业股票ETF联接A、汇添富中证全指软件ETF联接C、国泰黄金ETF联接A、天弘全球高端制造混合(QDII)A
- TOP5 相关新闻与可追溯来源
- 市场波动背后的可能原因

## 运行

```bash
npm start
```

然后打开 `http://localhost:3000`。

实时看板：

- `/`

晨报导出页：

- `/report.html`
- 可追加 `?date=YYYY-MM-DD`
- 可追加 `&autoprint=1` 自动调起打印为 PDF
- 可追加 `&autocapture=1` 自动导出 PNG 截图

## 公网部署

仓库已经包含 `render.yaml`，可以直接部署到 Render。

1. 登录 [Render](https://render.com/)
2. 选择 `New` -> `Blueprint`
3. 连接 GitHub 仓库 `Lemon200186/us-iran-war-dashboard-financial`
4. 确认创建 Web Service
5. 部署完成后会得到一个公开可访问的 `onrender.com` 地址

默认部署配置：

- `npm install`
- `npm start`
- `HOST=0.0.0.0`

## 数据来源

- FRED
- GiaVang.now（国际金价，失败时回退到 FreeGoldAPI）
- 东方财富公开基金接口
- Al Jazeera AJLabs
- Google News RSS

## 说明

- 基金估值为盘中估算值，不等于最终确认净值。
- 当传入特定日期时，基金会自动回退为“该日期可得的最近净值快照”。
- 伤亡数据属于滚动口径，会随来源修订而变化。
- 新闻链接来自 RSS 聚合入口，仍可追溯到原始报道来源。
