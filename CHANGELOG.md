# CHANGELOG — Hawkins Atlas

所有重要的设计变更、功能决策、架构调整都记录在这里。
格式参考 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)。

版本号规则（尚未发布时用 `Unreleased`）：
- `Added` — 新增功能 / 设计决策
- `Changed` — 修改已有功能 / 方案
- `Removed` — 移除功能 / 废弃决策
- `Fixed` — 修正错误设计
- `Decision` — 重要设计取舍说明

---

## [Unreleased]

### Added
- **项目初始化**：确立项目名 Hawkins Atlas，定位为纯静态单页面怪奇物语时空地图
- **技术栈选型**：React + Vite + TypeScript + Tailwind CSS + Framer Motion + Zustand，部署到 GitHub Pages
- **核心数据模型设计**：6 个 JSON 文件——`characters`、`locations`、`episodes`、`events`、`moments`、`moment-states`；剧情事实与视觉展示层分离
- **媒体资产架构**：图片（v1 必须）、音频（v2 预留）、视频（v2+ 预留）三层接口设计，`moment-states` 中预留 `audio` / `video` 字段
- **`sortKey` 规范**：格式 `SSEEII`，支持第 1–5 季排序，无需重构
- **氛围主题枚举**：`default` / `tense` / `nightmare` / `upside-down`
- **目标用户扩展**：新增"贡献者用户"——对怪奇物语有热情、想参与共建的社区成员
- **CHANGELOG 建立**：本文件
- **项目脚手架搭建**：`package.json`、`vite.config.ts`、`tsconfig*.json`、`tailwind.config.ts`、`eslint.config.js`、`src/App.tsx`（Hello World 落地页）、`public/favicon.svg`
- **GitHub Actions 工作流**：
  - `deploy.yml` — 推送到 `main` 后自动构建并部署到 GitHub Pages（使用 OIDC + `actions/deploy-pages`）
  - `ci.yml` — PR / push 触发类型检查 → lint → 构建，保证主干质量
- **Copilot Agents**：内置 4 个专用 agent 到 `.github/agents/`：`expert-react-frontend-engineer`、`gem-designer`、`github-actions-expert`、`context7`
- **内容参考来源**：新增 IMDB 和 Wikipedia 到 PRD 参考资料表
- **20 个设计决策确认**（见下方 Decision 节）：时间轴粒度、地图层级、布局、字体、测试、License 等核心决策全部锁定

### Decision
- **为什么不用 Next.js**：静态站不需要 SSR，Vite 构建更轻；GitHub Pages 直接支持静态输出
- **为什么用 SVG 而不是 Canvas / WebGL**：地图热点交互、精确点击、DOM 动画更容易控制；v1 不需要高性能渲染
- **为什么音频 v1 不上**：版权风险未评估；v1 核心是视觉体验；架构已预留字段，不影响后续加入
- **`VITE_BASE_PATH` 动态注入**：`configure-pages` action 自动输出正确的 base path，避免仓库名硬编码在 `vite.config.ts`；本地预览回退到 `/hawkins-atlas/`
- **时间轴粒度**：每集 3–5 个关键节点，第 1 季约 30–50 个时刻
- **地图来源**：参考真实印第安纳州地图追描 SVG，保持大致地理关系，允许艺术变形
- **地图层级**：地点标注 + 人物标记 + 事件图标，三层叠加展示
- **InfoCard**：右侧滑入 overlay；v1 只显示地点名称 + 短描述；单击触发
- **布局**：地图全屏映射整个 viewport，UI 控件浮于上层
- **开场动画**：Upside Down 风格——蓝紫滤镜 + 圆形 iris 展开揭幕，最有代入感
- **字体**：ITC Benguiat Std（已购授权，OTF 文件放 `public/fonts/` 并 .gitignore）；`Special Elite` 作为 fallback；正文 IBM Plex Mono
- **测试策略**：Vitest + React Testing Library（单元/集成），CI 中运行
- **License**：MIT
- **Analytics**：Google Analytics（v1 集成）
- **贡献流程**：Issue 模板 + PR；音效包购买授权；v1 桌面优先，不做移动端
- **社区渠道**：v1 暂不建立独立社区，GitHub Issues 即可
- **为什么 JSON 而不是数据库**：完全静态部署要求；数据量 v1 可控；社区贡献门槛低（直接编辑 JSON）

---

<!-- 发布后按下面格式记录 -->
<!--
## [0.1.0] - YYYY-MM-DD

### Added
- ...

### Changed
- ...
-->
