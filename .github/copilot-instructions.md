# Copilot 开发指引 — Hawkins

## 代码修改与文档同步

**每次代码修改都要揣摩用户意图，然后把长期意图适当更新到 copilot-instructions 中。**

- 不仅改代码，还要同步更新设计文档
- 临时修复不需要更新文档，但有明确长期影响的改动必须更新
- 修改规范、新的禁止事项、架构约定有变化时，一定要更新 `.github/copilot-instructions.md`

---

## 项目简介

Hawkins 是一个**纯静态单页 React + Vite + TypeScript** 应用，部署到 GitHub Pages。
渲染《怪奇物语》霍金斯镇的艺术化 SVG 地图，配合时间轴滑块，切换时地图上的人物、地点、事件随之变化。

**没有后端。** 所有内容存放在 `src/data/*.json`。应用只需构建为 `dist/` 下的静态资源。
**网站所有展示给用户的文字内容（UI 文案、卡片内容、地点描述等）全部使用英文。**

---

## 技术栈

| | |
|---|---|
| 框架 | React 18 + Vite 5 + TypeScript 5 |
| 样式 | Tailwind CSS 3 |
| 动画 | Framer Motion 11 |
| 状态管理 | Zustand 5 |
| Schema 验证 | Zod 3（开发期） |
| 部署 | GitHub Pages + GitHub Actions |

所有内容数据存放于 `src/data/*.json`，静态导入，**零运行时请求**。

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
| `src/data/catalog.ts` | TypeScript 接口 + Zod 校验 + 数据索引（单一数据入口）|
| `src/store.ts` | Zustand store + `useTimeline` + `useMomentState` hooks |
| `src/components/Map.tsx` | 主 SVG 地图 + LocationMarker + CharacterMarker + ThemeOverlay |
| `src/components/Timeline.tsx` | 底部时间轴滑块 |
| `src/components/InfoCard.tsx` | 右侧地点 / 人物 / 事件详情卡片 |
| `public/map.svg` | 霍金斯底图 SVG 资源 |
| `.github/workflows/deploy.yml` | GitHub Actions → GitHub Pages 部署 |

---

## 数据结构

所有内容数据在 `src/data/` 下，6 个扁平化 JSON 文件：

| 文件 | 内容 |
|---|---|
| `characters.json` | 人物档案（ID、英文名、描述、图片路径） |
| `locations.json` | 地点档案（ID、坐标、描述） |
| `episodes.json` | 剧集索引（S01E01 等） |
| `events.json` | 剧情事件（关联人物 / 地点 / 剧集） |
| `moments.json` | 时间轴节点（**剧情事实层**） |
| `moment-states.json` | 时刻地图状态（**视觉展示层**，与剧情事实分离） |

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
2. `src/data/catalog.ts` 中的 TypeScript 类型必须同步
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

## 分支与 PR 规范

**`main` 分支已启用保护，禁止任何人直接 push（含管理员）。**

所有改动必须遵循以下流程：从 `main` 新建 `feat/` 或 `fix/` 分支：`git checkout -b feat/your-feature`；在分支上开发、提交。

---

## 禁止事项

- **不要在运行时 fetch JSON** — 用静态导入 `import data from './data/moments.json'`
- **不要添加后端** — 本项目刻意设计为完全静态
- **不要添加路由** — 单页面；`InfoCard` 是 overlay，不是路由页
- **不要嵌套数据** — moment 里不内嵌完整人物对象，用 ID 引用
- **TypeScript 中不要使用 `any`** — 所有数据形状必须通过 `src/data/catalog.ts` 类型化
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

## 美学规范

本项目视觉风格定位：**1983 年代小镇夜景 × Upside Down 压抑氛围**。所有视觉变更必须对照此规范。

### 调色板

| 角色 | 色值 | 用途 |
|---|---|---|
| 背景 | `#0D0D14` (`dim`) | 页面底色 |
| 道路 | `#4a4a68` | 地图道路线 |
| 水体 | `#1f4a72` | 湖泊河流 |
| 森林 | `#172e17` | 植被区域 |
| 琥珀强调 | `#F57F17` (`hawkins-amber`) | 激活标记、时间轴、选中环 |
| 危机红 | `#C62828` (`hawkins-red`) | 警告、Demogorgon |
| Upside Down 蓝 | `#1A237E` (`upside-blue`) | 维度切换主题 |

### 地图底图
- 当前使用程序生成的 SVG；可用 **高精度 PNG（推荐 2400×1600px）** 替换，视觉效果更好
- 替换时修改 `HawkinsMap.tsx` 中的 `src`，坐标系统（0–100 百分比）不需要变化
- 路径必须用 `${import.meta.env.BASE_URL}map.png`，不能用绝对路径 `/map.png`

### 标记尺寸
- Location marker 半径：`r = 2.0`（普通）/ `2.6`（选中）SVG 单位
- Character marker 半径：`r = 1.8`（普通）/ `2.2`（选中）SVG 单位
- Pulse/glow 动画最大缩放：≤ 1.5× 防止光晕过大

### InfoCard
- 人物/地点头图：**1:1 方形**（`aspect-square`），`object-cover`
- 宽度固定 `320px`，从右侧滑入（`x: 40 → 0`）

### 时间轴
- 高度：`h-14`（56px），极简单行布局
- 地图容器必须设置 `bottom-14` 偏移，确保底部标记不被遮挡
- 按钮使用 SVG 内联图标，禁止 emoji 按钮

### 氛围层（CSS, `index.css`）
- `grain`：animated CSS keyframe 颗粒，opacity ≈ 0.03
- `vignette`：80% 暗角 radial-gradient
- `scanlines`：细微扫描线

---

## 视觉调试

**强烈推荐**在做任何 UI / 样式 / 布局更改后，用 Playwright 截图验证效果。

```bash
# 启动开发服务器（在项目目录）
npm run dev

# 在另一个终端，快速截图（Playwright 须已安装）
cd /tmp && npm install playwright   # 一次性安装
node -e "
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:5173/hawkins/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);          // 等动画稳定
  await page.screenshot({ path: '/tmp/debug.png' });

  // 模拟点击标记打开 InfoCard
  await page.mouse.click(X, Y);            // 根据标记坐标计算
  await page.waitForTimeout(600);
  await page.screenshot({ path: '/tmp/debug-infocard.png' });

  await browser.close();
})();
"
```

**坐标换算**（SVG `xMidYMid meet`，1440×(900-56) 视口）：
- SVG 渲染为 `844×844`，水平居中（偏移 298px）
- `screen_x = 298 + loc.map.x / 100 * 844`
- `screen_y = loc.map.y / 100 * 844`

**截图检查清单**：
- [ ] 地图路网、水体、森林对比度是否可读
- [ ] 标记不被时间轴遮挡
- [ ] 选中标记有琥珀色光晕
- [ ] InfoCard 头图为方形 1:1
- [ ] 时间轴单行，不占用过多高度

---

## 锁定设计决策

以下决策已确认，开发时直接遵守，不需要再讨论：

| 决策点 | 确认值 |
|---|---|
| 时间轴粒度 | 每集 3–5 关键节点，第 1 季 30–50 个时刻 |
| 地图来源 | 追描真实地图 SVG，允许艺术变形 |
| 地图层级 | 地点 + 人物 + 事件三层叠加 |
| InfoCard | 右侧滑入 overlay；**1:1 方形头图**；仅名称 + 短描述；单击触发 |
| 页面布局 | 地图全屏 viewport，控件浮层；地图容器设 `bottom-14` 避开时间轴 |
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

## 内容参考

- Fandom Wiki（剧集、人物、地点详情）：https://strangerthings.fandom.com/wiki/Stranger_Things_Wiki
- IMDB（剧集列表、评分、演员表）：https://www.imdb.com/title/tt4574334/
- Wikipedia（背景、综述、季度摘要）：https://en.wikipedia.org/wiki/Stranger_Things
- v1 专注第 1 季；架构必须支持第 1–5 季，无需重构
- **所有 UI 文字和数据内容使用英文**
- 剧集 ID 格式：`s{SS}e{EE}` 补零，范围 `s01e01` 到 `s04e09`
