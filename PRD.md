# PRD：Hawkins Atlas — 怪奇物语互动地理时空网站

## 项目概述

Hawkins Atlas 是一个纯静态单页面交互式网站，以时空地图的形式呈现《怪奇物语》的世界观。用户在艺术化的霍金斯镇地图上漫游，通过拖动时间轴切换关键剧情时刻——人物、地点、事件随时间轴的变化而浮现、发光、可点击，营造出沉浸式的影院感体验，也适合作为屏保式环境展示。

网站的核心设计原则：
- **完全静态** — 无需后端，可直接部署到 GitHub Pages
- **数据驱动** — 所有剧情内容存放在结构化 JSON 中，增加新内容无需修改应用代码
- **可扩展** — 数据、逻辑、展示层分离，未来可以持续叠加新的季度内容和功能

---

## 目标

| 目标 | 说明 |
|---|---|
| **沉浸式地图集** | 呈现一张有氛围感、有生命力的霍金斯艺术地图 |
| **时间轴导航** | 让用户拖动时间轴切换关键时刻，地图状态随之更新 |
| **可点击的世界** | 人物、地点、事件均可点击，弹出英文详情卡片 |
| **自动播放 / 屏保模式** | 自动推进时刻，适合作为环境展示屏或屏保 |
| **静态部署** | 整站构建为静态资源，部署到 GitHub Pages |
| **可扩展性** | Schema 和架构设计支持后续添加第 2–5 季内容，无需重构 |

## 不做的事（v1 范围外）

- 不做用户账号、不做后端、不做数据库
- 不追求真实地理精确度（艺术化变形是刻意设计）
- v1 不收录第 2–5 季内容（架构支持，内容暂不在范围内）
- 不做移动端优先布局（桌面端优先，移动端为后续目标）
- v1 音频为可选增强，不是核心功能（架构需为其留接口）
- 不做 3D 渲染或大量 WebGL 特效

---

## 目标用户

**主要用户：** 希望以新颖、美观方式探索《怪奇物语》世界的剧迷。  
**次要用户：** 通过社交媒体或 GitHub 发现它的创意 / 技术爱好者。  
**贡献者用户：** 对怪奇物语有热情、想参与共建地图内容或视觉设计的社区成员——包括设计师、剧情编辑、开发者。项目需要对贡献友好：数据格式可读、文档完整、有贡献指南。

---

## 核心功能

### 1. 艺术化霍金斯地图
- 基于 SVG 的手绘风格（不是真实 GIS 地图）
- 地点热点均可独立点击
- 地图图层：底图、雾气 / 氛围、激活高亮、人物标记、事件指示器
- 所有地点坐标以 SVG 画布的相对百分比 `(x%, y%)` 存储，可在数据文件中直接调整

### 2. 时间轴
- 位于屏幕底部的水平拖动条
- 时间轴由离散的 `Moment`（时刻）节点构成，不是连续时钟
- 时刻按 季度 → 集数 → 剧情节点 三层组织
- 用户可以：点击某个时刻节点、拖动滑块、或让其自动播放
- 当前时刻标签（如 *S01E01 — Will Vanishes*）显眼展示

### 3. 每个时刻的地图状态
- 每个时刻定义：哪些地点激活 / 强调，哪些人物出现在哪里，哪些事件触发
- 未激活地点变暗，激活地点发光
- 人物标记出现在对应地点
- 时刻切换动效：交叉淡入 + 细微位移（Framer Motion）

### 4. 详情卡片
- 点击**地点**、**人物**或**事件标记**后弹出详情卡片
- 卡片内容：名称、英文描述、标签、相关剧集引用
- 可关闭；同时只开一张卡片
- 不需要路由，纯 overlay 组件实现

### 5. 自动播放 / 屏保模式
- 右上角按钮：`▶ Auto Play`
- 按固定间隔（约 6 秒）自动推进时刻
- 淡入淡出切换，有电影质感
- 支持全屏模式（按 `F` 键或按钮）
- 无操作数秒后 UI 控件自动淡出隐藏

### 6. 氛围图层
- 深色背景 + 细腻暗角（vignette）
- 激活地点的柔和呼吸光晕
- 轻微胶片颗粒叠加层（纯 CSS，不用 canvas）
- 每个时刻的 `visual.theme` 字段控制整体色调（如 `default`、`nightmare`、`upside-down`）

### 7. 媒体资产支持

网站的视觉和氛围依赖多类媒体资产，架构需从第一天起为其留好接口：

#### 图片（v1 必须）
- **人物头像**：详情卡片内展示，`public/images/characters/`
- **地点图片**：地点卡片内展示，`public/images/locations/`
- **地图底图**：`public/map.svg`（主 SVG 文件）
- **纹理素材**：胶片颗粒、纸张纹理等氛围叠加，`public/images/textures/`

所有图片路径存在对应 JSON 字段中（`image`、`thumbnail` 等），不硬编码在组件里。

#### 音频（v2 可选，架构预留）
- **环境音效**：按 `visual.theme` 切换（如雨声、森林、Lab 低频嗡鸣）
- **时刻音效**：特定时刻触发的短音效（如 Demogorgon 出现）
- 音频路径存在 `momentStates[].audio` 字段（v1 可为空），不影响当前渲染逻辑

#### 视频（v2+ 可选，架构预留）
- **地图背景循环视频**：替代或叠加在 SVG 底图之上，作为氛围增强
- **时刻片段**：特定剧情时刻触发短剪辑（需版权确认后再做）
- 视频路径存在 `momentStates[].video` 字段（v1 可为空）

#### 设计资产获取工作流
开发过程中如需新的视觉设计资产，按以下优先顺序：
1. **通知所有者（你）来提供** — 告知需要什么格式和尺寸的设计图，由人来决策
2. **在线搜索获取** — 在版权许可范围内（CC0、CC-BY 等）搜索合适的参考图或素材
3. **AI 生成** — 对于界面原型、SVG 图标、占位图等，可直接在对话中生成

---

## 数据模型

所有内容存放在 `src/data/` 下，使用扁平化、规范化的 JSON。关系用 ID 引用表示，不做对象嵌套。

### `characters.json` — 人物档案
```ts
{
  id: string               // "eleven"
  name: string             // "Eleven"（英文，展示用）
  aliases: string[]        // ["El", "Jane Hopper"]
  description: string      // 英文人物简介段落
  tags: string[]           // ["main", "lab-escapee", "party"]
  homeLocationId: string   // 无时刻覆盖时的默认所在地点
  color: string            // hex，用于标记和卡片强调色
  image: string            // 人物头像路径（如 "/images/characters/eleven.png"）
  thumbnail?: string       // 可选小头像，用于时间轴标记
}
```

### `locations.json` — 地点档案
```ts
{
  id: string
  name: string             // 英文地点名，展示用
  type: string             // "house" | "school" | "lab" | "woods" | "road" | "other"
  description: string      // 英文描述
  tags: string[]
  map: {
    x: number              // SVG 画布宽度的 0–100 百分比
    y: number              // SVG 画布高度的 0–100 百分比
    labelOffset?: { x: number; y: number }
    radius?: number        // 点击热区半径，默认 20
  }
  image?: string
}
```

### `episodes.json` — 剧集索引
```ts
{
  id: string               // "s01e01"
  season: number
  episode: number
  title: string            // "Chapter One: The Vanishing of Will Byers"（英文）
}
```

### `events.json` — 剧情事件
```ts
{
  id: string               // "will-disappears"
  title: string            // 英文标题
  description: string      // 英文描述
  episodeIds: string[]
  locationIds: string[]
  characterIds: string[]
  tags: string[]
}
```

### `moments.json` ← **时间轴的核心单元**
```ts
{
  id: string               // "s01e01-will-vanishes"
  title: string            // "Will Vanishes"（英文，时间轴展示）
  timeLabel: string        // "Night — November 6, 1983"（英文）
  sortKey: number          // 排序键，规则见下
  episodeId: string
  eventIds: string[]
  activeCharacterIds: string[]
  activeLocationIds: string[]
  focusLocationId?: string // 地图软聚焦目标（地点 ID）
  summary: string          // 1–2 句英文叙事说明
  nextMomentId?: string
}
```

`sortKey` 规则：
- 格式 `SSEEII`：SS = 季度（01–05），EE = 集数（01–09），II = 集内节点序号（00–99）
- 示例：第 1 季第 3 集第 2 个节点 → `10302`

### `moment-states.json` ← **展示层，与剧情事实分离**
```ts
{
  momentId: string
  locationStates: Array<{
    locationId: string
    status: "active" | "foreshadowed" | "dim" | "hidden"
    emphasis: number       // 0.0–1.0，控制光晕强度
  }>
  characterStates: Array<{
    characterId: string
    locationId: string
    status: "present" | "missing" | "trapped" | "dead"
  }>
  visual: {
    theme: "default" | "tense" | "nightmare" | "upside-down"
    fog: number            // 0.0–1.0
    glow: string           // hex 颜色
    cameraTarget?: string  // 软聚焦目标地点 ID
  }
  audio?: {
    ambient?: string       // 环境音路径（v2，v1 可省略）
    sfx?: string           // 时刻音效路径（v2，v1 可省略）
  }
  video?: {
    background?: string    // 背景循环视频路径（v2+，v1 可省略）
  }
}
```

### `map-layout.json` — 地图画布配置
```ts
{
  canvasWidth: number      // SVG 逻辑宽度，如 1200
  canvasHeight: number     // SVG 逻辑高度，如 800
  svgPath: string          // 底图 SVG 资源路径
  defaultTheme: string
  regions: Array<{
    id: string
    label: string          // 英文区域名
    bounds: { x: number; y: number; w: number; h: number }
  }>
}
```

---

## 文件 / 目录结构

```
hawkins-atlas/
├── public/
│   ├── images/
│   │   ├── characters/     ← 人物头像
│   │   ├── locations/      ← 地点配图
│   │   ├── textures/       ← 氛围纹理（颗粒、纸张、雾等）
│   │   └── map/            ← 地图相关图片素材
│   ├── audio/              ← 音效 / 环境音（v2，目录先建好）
│   ├── video/              ← 背景视频（v2+，目录先建好）
│   └── map.svg             ← 霍金斯底图 SVG
├── src/
│   ├── data/
│   │   ├── characters.json
│   │   ├── locations.json
│   │   ├── episodes.json
│   │   ├── events.json
│   │   ├── moments.json
│   │   ├── moment-states.json
│   │   └── map-layout.json
│   ├── components/
│   │   ├── Map/
│   │   │   ├── HawkinsMap.tsx      ← SVG 地图 + 热点
│   │   │   ├── LocationMarker.tsx
│   │   │   ├── CharacterMarker.tsx
│   │   │   └── AtmosphereLayer.tsx
│   │   ├── Timeline/
│   │   │   ├── Timeline.tsx
│   │   │   ├── MomentDot.tsx
│   │   │   └── TimelineLabel.tsx
│   │   ├── InfoCard/
│   │   │   ├── InfoCard.tsx
│   │   │   ├── CharacterCard.tsx
│   │   │   ├── LocationCard.tsx
│   │   │   └── EventCard.tsx
│   │   └── UI/
│   │       ├── AutoPlayButton.tsx
│   │       └── FullscreenButton.tsx
│   ├── hooks/
│   │   ├── useTimeline.ts          ← 当前时刻状态、推进、跳转
│   │   ├── useMomentState.ts       ← 合并当前时刻的 moments + moment-states
│   │   └── useAutoPlay.ts
│   ├── store/
│   │   └── atlasStore.ts           ← Zustand store：选中实体、当前时刻、播放状态
│   ├── types/
│   │   └── index.ts                ← 与 JSON schema 对应的 TypeScript 类型
│   ├── App.tsx
│   └── main.tsx
├── .github/
│   ├── workflows/
│   │   ├── deploy.yml              ← GitHub Actions → GitHub Pages
│   │   └── ci.yml                  ← 类型检查 / lint / 构建质量门禁
│   ├── agents/
│   │   ├── expert-react-frontend-engineer.agent.md
│   │   ├── gem-designer.agent.md
│   │   ├── github-actions-expert.agent.md
│   │   └── context7.agent.md
│   └── copilot-instructions.md
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── PRD.md
```

---

## 技术栈

| 关注点 | 选型 | 原因 |
|---|---|---|
| 框架 | React + Vite + TypeScript | 开发快、静态输出、强类型 |
| 样式 | Tailwind CSS | 工具类优先，暗色主题方便 |
| 动画 | Framer Motion | 声明式，与 React 深度集成 |
| 地图渲染 | SVG（手工绘制） | 完全艺术控制，热点点击方便 |
| 状态管理 | Zustand | 轻量，无样板代码 |
| 数据 | 本地 JSON 静态导入 | 无运行时请求，完全静态 |
| Schema 验证 | Zod（仅开发期） | 尽早发现 JSON 错误 |
| 部署 | GitHub Pages + GitHub Actions | 免费、自动化 |

---

## 用户流程

### 流程一：进入并自由探索
1. 用户进入霍金斯全屏地图
2. 默认时刻：第 1 季开始（Will 失踪之前）
3. 氛围感光效，地点轻微发光
4. 用户点击某个地点 → 右侧弹出详情卡片
5. 关闭卡片，点击另一个地点

### 流程二：在时间轴上导航
1. 用户看到底部时间轴
2. 拖动滑块或点击某个时刻节点
3. 地图过渡：部分地点激活，部分变暗，人物标记移动
4. 焦点地点上方短暂出现事件指示

### 流程三：自动播放 / 屏保
1. 用户点击 `▶ Auto Play`
2. 每约 6 秒自动推进一个时刻
3. 3 秒无操作后 UI 控件淡出
4. 地图成为环境展示屏，适合副屏循环播放
5. 任意操作恢复控件；按 `Esc` 或按钮停止自动播放

---

## 视觉设计原则

- **配色方案：** 极深海军蓝 / 炭灰底色；怪奇物语红（#C62828）；暖琥珀光晕；颠倒世界用去饱和蓝色系
- **字体：** 展示字体参考 80 年代风格（可用开源替代如 *Special Elite* 作为占位）；正文用简洁无衬线字体
- **地图美学：** 手绘 / 插画感，不是 GIS 写实；粗糙边缘、轻微纹理
- **氛围预设：**
  - `default` — 阴天的霍金斯白天
  - `tense` — 昏暗，琥珀色高亮
  - `nightmare` — 深红色光晕，浓雾
  - `upside-down` — 去饱和，蓝绿色调，重暗角

---

## 实施阶段

### 阶段一 — 基础搭建（第 1 周）
- Repo + Vite + Tailwind + TypeScript 初始化
- GitHub Pages 部署流水线（GitHub Actions）
- 6 个数据文件的 TypeScript 类型 + Zod schema
- 第 1 季角色、地点、剧集种子数据

### 阶段二 — 地图 + 热点（第 1–2 周）
- 霍金斯 SVG 底图
- 地点标记，点击 → 详情卡片
- 静态展示（尚无时间轴）

### 阶段三 — 时间轴引擎（第 2 周）
- 第 1 季 `moments.json` + `moment-states.json` 种子数据
- `useTimeline` hook：当前时刻、跳转、上一个 / 下一个
- 时刻切换时地图状态更新（发光、变暗、标记移动）
- 时间轴滑块 UI 组件

### 阶段四 — 氛围 + 打磨（第 3 周）
- Framer Motion 时刻切换动效
- 氛围图层（雾气、暗角、主题色变化）
- 自动播放 + 全屏支持
- 人物、地点、事件详情卡片

### 阶段五 — 可扩展性 + 社区准备（第 3–4 周）
- 添加 2–3 个第 2 季时刻验证 schema 稳定性
- 确认添加数据不需要改代码
- README + 数据编写指南（面向贡献者）
- `CONTRIBUTING.md`：如何提交新地点 / 人物 / 时刻数据
- 建立 `CHANGELOG.md`，记录每次重要设计变更

---

## 成功标准（v1）

- [ ] 推送到 `main` 后自动部署到 GitHub Pages
- [ ] 第 1 季有 ≥ 20 个完整编写的时刻
- [ ] 所有主要霍金斯地点在地图上，可点击查看详情
- [ ] 8 个以上核心人物有头像和英文描述
- [ ] 时间轴滑块能正确切换地图状态
- [ ] 自动播放模式可连续运行 5 分钟以上无 UI 故障
- [ ] 添加新时刻只需修改 JSON，无需改代码
- [ ] 标准网络连接下页面加载时间 < 3 秒

---

## 待确认问题

| 问题 | 状态 |
|---|---|
| SVG 地图是全新绘制还是参考图追描？ | 待定 |
| 第 1 季时刻粒度：按集的关键节点还是按场景？ | 待定 — v1 建议按集的关键节点 |
| Fandom wiki 内容是手工整理还是脚本抓取？ | 待定 |
| 字体授权 — 是否需要开源 ITC Benguiat 替代字体？ | 先用 *Special Elite* 占位 |
| 音效素材版权方案？ | 待定 — 优先 CC0 素材库 |
| 贡献者如何提交内容？Issue 模板 + PR 还是 Discussion？ | 待定 — 建议 Issue 模板 |

---

## 文档维护规则

> **设计有变动时，必须同步更新以下两个文件，不能只改代码：**
> - `PRD.md` — 记录新决策、修改范围、废弃功能
> - `.github/copilot-instructions.md` — 更新架构规范、禁止事项、约定
> - `CHANGELOG.md` — 记录本次变更做了什么、为什么

---

## 内容参考资料

| 来源 | 链接 | 用途 |
|---|---|---|
| Fandom Wiki | https://strangerthings.fandom.com/wiki/Stranger_Things_Wiki | 剧集、人物、地点详情 |
| IMDB | https://www.imdb.com/title/tt4574334/ | 剧集列表、评分、演员表 |
| Wikipedia | https://en.wikipedia.org/wiki/Stranger_Things | 季度综述、背景信息 |
