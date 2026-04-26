# Hawkins

**一个《怪奇物语》的互动地理时空地图** — 在艺术化的霍金斯小镇地图上，随时间轴漫游第一季的每一个关键时刻。

[![CI](https://github.com/YOUR_USERNAME/hawkins/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/hawkins/actions/workflows/ci.yml)
[![Deploy](https://github.com/YOUR_USERNAME/hawkins/actions/workflows/deploy.yml/badge.svg)](https://github.com/YOUR_USERNAME/hawkins/actions/workflows/deploy.yml)

---

## 关于本项目

Hawkins 是一个**纯静态单页面**网站，无需后端，直接部署到 GitHub Pages。

核心体验：
- 🗺 **全屏艺术地图** — 追描自真实印第安纳州地图的 SVG，允许艺术变形，充满氛围感
- ⏱ **时间轴导航** — 拖动底部滑块，地图状态随时刻切换：地点发光、人物移动、事件浮现
- 🃏 **可点击世界** — 地点、人物、事件均可点击，弹出英文详情卡片
- 🎬 **自动播放 / 屏保** — 每 6 秒自动推进，支持全屏环境展示
- 🌀 **Upside Down 开场** — 蓝紫滤镜 + 圆形 iris 揭幕动画

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

## 本地开发

```bash
# 克隆仓库
git clone https://github.com/YOUR_USERNAME/hawkins.git
cd hawkins

# 安装依赖
npm install

# 将字体文件放入（已购授权，不在仓库中）
# 将 OTF 文件放到 public/fonts/ 目录

# 启动开发服务器
npm run dev

# 生产构建
npm run build

# 类型检查 + Lint
npm run typecheck
npm run lint
```

> **字体说明**：展示字体 ITC Benguiat Std 已购授权，文件置于 `public/fonts/`（已加入 `.gitignore`）。未放置字体时自动回退到 *Special Elite*，不影响运行。

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

详细 Schema 定义见 [`.github/copilot-instructions.md`](./.github/copilot-instructions.md)。

---

## 路线图

| 阶段 | 内容 | 状态 |
|---|---|---|
| **阶段一** | 项目脚手架 + CI/CD + 数据类型 | ✅ 完成 |
| **阶段二** | 霍金斯 SVG 地图 + 地点热点 + InfoCard | 🔲 进行中 |
| **阶段三** | 时间轴引擎 + 时刻切换动效 | 🔲 待开始 |
| **阶段四** | 氛围图层 + 自动播放 + Upside Down 开场 | 🔲 待开始 |
| **阶段五** | S2 数据验证 + CONTRIBUTING.md + 社区准备 | 🔲 待开始 |

v1 目标：第 1 季 ≥ 20 个完整时刻，≥ 8 个核心人物，所有主要霍金斯地点可点击。

---

## 如何贡献

欢迎所有对怪奇物语有热情的朋友参与！贡献方式：

1. **添加/修善数据** — 直接编辑 `src/data/*.json`，不需要改代码
2. **提交地图坐标调整** — 修改 `locations.json` 中的 `map.x / map.y`
3. **提交流程** — 通过 GitHub Issue 描述想添加的内容，然后提交 PR

新字段必须同步更新 `src/types/index.ts`。

---

## 参考资料

- [Stranger Things Wiki（Fandom）](https://strangerthings.fandom.com/wiki/Stranger_Things_Wiki)
- [IMDB](https://www.imdb.com/title/tt4574334/)
- [Wikipedia](https://en.wikipedia.org/wiki/Stranger_Things)

---

## 许可证

[MIT](./LICENSE) — 代码开源。《怪奇物语》相关内容版权归 Netflix 及原作者所有，本项目为非商业粉丝作品。
