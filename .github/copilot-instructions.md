# Copilot 开发指引 — Hawkins Atlas

## 项目简介

Hawkins Atlas 是一个**纯静态单页 React + Vite + TypeScript** 应用，部署到 GitHub Pages。
渲染《怪奇物语》霍金斯镇的艺术化 SVG 地图，配合时间轴滑块，切换时地图上的人物、地点、事件随之变化。

**没有后端。** 所有内容存放在 `src/data/*.json`。应用只需构建为 `dist/` 下的静态资源。
**网站所有展示给用户的文字内容（UI 文案、卡片内容、地点描述等）全部使用英文。**

---

## 架构一句话

> **数据层（JSON）→ 类型层（TypeScript/Zod）→ 状态层（Zustand）→ UI 层（React + SVG + Framer Motion）**

最重要的架构原则：**剧情事实与视觉展示分离**。
- `moments.json` 记录故事里发生了什么
- `moment-states.json` 记录每个时刻地图该怎么显示
- 组件只从 store 读数据，不直接导入 JSON

---

## 关键文件

| 路径 | 作用 |
|---|---|
| `src/data/*.json` | 全部内容 — 人物、地点、事件、时刻 |
| `src/types/index.ts` | 与每个 JSON schema 对应的 TypeScript 接口 |
| `src/store/atlasStore.ts` | Zustand store — 当前时刻、选中实体、播放状态 |
| `src/hooks/useTimeline.ts` | 推进、跳转、解析当前时刻状态 |
| `src/hooks/useMomentState.ts` | 合并指定 momentId 的 `moments` + `moment-states` |
| `src/components/Map/HawkinsMap.tsx` | 主 SVG 地图，以 props 接收解析后的状态 |
| `src/components/Timeline/Timeline.tsx` | 底部滑块，触发 `onSeek(momentId)` |
| `src/components/InfoCard/InfoCard.tsx` | 右侧地点 / 人物 / 事件详情卡片 |
| `public/map.svg` | 霍金斯底图 SVG 资源 |
| `.github/workflows/deploy.yml` | GitHub Actions → GitHub Pages 部署 |

---

## 数据规范

- 所有实体 ID 使用 **kebab-case 字符串**：`"eleven"`、`"hawkins-lab"`、`"s01e01"`
- 关系始终用 **ID 引用**，不嵌套对象
- `moments.json` ID 格式：`s{SS}e{EE}-{slug}`，如 `s01e01-will-vanishes`
- `sortKey` 格式：`SSEEII`（季度、集数、节点序号），如 `10102` = S01E01 第 2 个节点
- 地点坐标 `map.x` / `map.y` 是 SVG 画布的 **0–100 百分比**，不是像素
- 视觉主题枚举：`"default"` | `"tense"` | `"nightmare"` | `"upside-down"`

新增 JSON 条目时：
1. 加入对应的 `src/data/*.json` 文件
2. `src/types/index.ts` 中的 TypeScript 类型必须同步
3. 不同文件间不复制实体数据 — 用 ID 引用

---

## 组件规范

- 每个组件单独一个文件，文件名与组件名一致（PascalCase）
- 组件通过 props 接收已解析的数据，**不直接导入 JSON**
- 所有 store 访问通过自定义 hook（`useTimeline`、`useMomentState` 等）
- 条件渲染的卡片或 overlay 用 Framer Motion `<AnimatePresence>` 包裹
- 地图热点点击事件调用 `atlasStore.setSelected({ type, id })`，不用组件内部 state

---

## 样式规范

- 使用 Tailwind CSS 工具类
- 暗色主题是唯一主题
- 颜色常量在 `tailwind.config.ts` 的 `theme.extend.colors` 中定义：
  - `hawkins-red`: `#C62828`
  - `hawkins-amber`: `#F57F17`
  - `upside-blue`: `#1A237E`
  - `dim`: `#0D0D14`
- 除动态值（如从数据读取的 SVG 标记位置）外，避免行内样式
- 氛围效果（暗角、颗粒感、雾气）用纯 CSS 实现，不需要 canvas

---

## 动画规范

- **时刻切换**：在状态层通过 Framer Motion `animate={{ opacity }}` 交叉淡入
- **地点光晕**：`filter: drop-shadow(...)` 由 moment-states 的 `emphasis`（0.0–1.0）驱动
- **人物标记**：用 `<motion.g>` 加 `initial={{ opacity: 0 }}` / `animate={{ opacity: 1 }}`
- **详情卡片**：从右侧滑入，`x: 40 → 0`，`opacity: 0 → 1`
- 时刻切换动效控制在 **400ms** 以内；详情卡片 **250ms**
- 已被 Framer Motion 控制的元素不要再加 CSS `transition`

---

## GitHub Pages 部署

推送到 `main` 分支时自动部署。

```yaml
# .github/workflows/deploy.yml
# 构建：npm run build → dist/
# 部署：peaceiris/actions-gh-pages → gh-pages 分支
```

`vite.config.ts` 必须设置 `base: '/hawkins-atlas/'`（或仓库名）以确保 GitHub Pages 资源路径正确。
如果仓库挂载在自定义域名根路径，则 `base: '/'`。

---

## 禁止事项

- **不要在运行时 fetch JSON** — 用静态导入 `import data from './data/moments.json'`
- **不要添加后端** — 本项目刻意设计为完全静态
- **不要添加路由** — 单页面；`InfoCard` 是 overlay，不是路由页
- **不要嵌套数据** — moment 里不内嵌完整人物对象，用 ID 引用
- **TypeScript 中不要使用 `any`** — 所有数据形状必须通过 `src/types/index.ts` 类型化
- **不要引入 Three.js 或 PixiJS**（除非明确要求）— v1 用 SVG 足够
- **不要在组件文件里写剧情内容** — 所有文案存在 JSON 中
- **不要硬编码媒体路径** — 图片 / 音频 / 视频路径必须来自 JSON 字段
- **音频 / 视频字段为空时不能报错** — 所有媒体引用必须做 null check

---

## 媒体资产规范

### 图片（v1 必须）
- 所有图片放在 `public/images/` 下：
  - `characters/` — 人物头像（推荐 WebP，回退 PNG）
  - `locations/` — 地点配图
  - `textures/` — 氛围纹理（颗粒、纸张等）
  - `map/` — 地图相关素材
- 路径存在对应 JSON 字段（`image`、`thumbnail`）中，不在组件里硬编码

### 音频（v2 预留，v1 字段为空 / undefined）
- 音频文件放 `public/audio/`
- 路径存在 `momentStates[].audio.ambient` / `.sfx` 字段
- 渲染逻辑必须 null check，不因缺音频报错

### 视频（v2+ 预留，v1 字段为空 / undefined）
- 视频文件放 `public/video/`
- 路径存在 `momentStates[].video.background` 字段
- v1 跳过渲染即可

### 设计资产获取流程（按优先级）
1. **通知所有者** — 说明需要什么（尺寸、风格、用途），由人提供
2. **在线搜索** — 找版权许可素材（CC0 / CC-BY），标注来源
3. **AI 生成** — 界面原型、SVG 图标、占位图可在对话中直接生成

---

## 文档维护规则

设计或架构有任何变更时，**必须同步更新**以下文件，不能只改代码：

| 文件 | 更新时机 |
|---|---|
| `PRD.md` | 功能范围变化、新决策、废弃功能 |
| `.github/copilot-instructions.md` | 架构约定变化、新禁止事项、新规范 |
| `CHANGELOG.md` | 每次有意义的变更，说明做了什么、为什么 |

---

## 社区贡献原则

本项目对怪奇物语爱好者开放贡献：
- JSON 格式简单，任何人可直接编辑添加内容
- 贡献者添加新地点 / 人物 / 时刻只需改 JSON，不需要改代码
- 新字段必须同步更新 `src/types/index.ts`

---

## 锁定设计决策

以下决策已确认，开发时直接遵守，不需要再讨论：

| 决策点 | 确认值 |
|---|---|
| 时间轴粒度 | 每集 3–5 关键节点，第 1 季 30–50 个时刻 |
| 地图来源 | 追描真实地图 SVG，允许艺术变形 |
| 地图层级 | 地点 + 人物 + 事件三层叠加 |
| InfoCard | 右侧滑入 overlay；仅名称 + 短描述；单击触发 |
| 页面布局 | 地图全屏 viewport，控件浮层 |
| 开场动画 | Upside Down 风格，圆形 iris 揭幕，蓝紫滤镜 |
| 自动播放速度 | 6 秒/时刻 |
| 字体 | ITC Benguiat Std（授权 OTF，gitignore）+ IBM Plex Mono |
| 测试 | Vitest + React Testing Library |
| License | MIT |
| Analytics | Google Analytics |
| 贡献流程 | Issue 模板 + PR |
| 移动端 | v1 不做，桌面端优先 |
| 自定义域名 | 无，GitHub Pages 默认地址 |

---

## 开发命令

```bash
npm run dev       # 本地开发服务器
npm run build     # 生产构建 → dist/
npm run preview   # 本地预览生产构建
npm run typecheck # tsc --noEmit 类型检查
npm run lint      # ESLint 检查
npm test          # Vitest 单元测试（待配置）
```

---

## 内容参考

- Fandom Wiki（剧集、人物、地点详情）：https://strangerthings.fandom.com/wiki/Stranger_Things_Wiki
- IMDB（剧集列表、评分、演员表）：https://www.imdb.com/title/tt4574334/
- Wikipedia（背景、综述、季度摘要）：https://en.wikipedia.org/wiki/Stranger_Things
- v1 专注第 1 季；架构必须支持第 1–5 季，无需重构
- **所有 UI 文字和数据内容使用英文**
- 剧集 ID 格式：`s{SS}e{EE}` 补零，范围 `s01e01` 到 `s04e09`

---

## 推荐 Copilot Agents

项目 `.github/agents/` 目录已内置以下专用 agent，遇到对应任务时优先调用：

| Agent 文件 | 用途 |
|---|---|
| `expert-react-frontend-engineer.agent.md` | React 组件、hooks、TypeScript、Framer Motion 动画 |
| `gem-designer.agent.md` | UI/UX 设计规范、色彩方案、布局、无障碍（只输出规范，不写代码） |
| `github-actions-expert.agent.md` | CI/CD 工作流、action pinning、OIDC、安全加固 |
| `context7.agent.md` | 获取 Framer Motion / Zustand / Tailwind 等库的最新文档 |

使用方式：在 Copilot Chat 中输入 `@agent-name` 或通过 `/agents` 命令调用。
