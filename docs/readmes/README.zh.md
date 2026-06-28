# Codex Game Studio

**把一次 Codex 会话变成结构化、本地优先的游戏工作室。**

[🇺🇸 English](../../README.md) | [🇨🇳 简体中文](README.zh.md) | [🇯🇵 日本語](README.ja.md) | [🇰🇷 한국어](README.ko.md)

Codex Game Studio 是一个 TypeScript CLI。它为游戏项目创建 Codex 可直接使用的工作区：角色提示词、工作流提示词、项目文件、任务状态和验证信息都保存在普通的、可通过 Git 审查的文件中。

它不是游戏引擎，也不是托管式项目管理器。它的目标是给 Codex 更清晰的工作契约，同时让创意决策和最终审查继续由人类掌握。

## 快速开始

需要 Node.js 24 或更新版本。`run <role>` 需要 Codex CLI。

```sh
git clone git@github.com:merlinhu1/codex-game-studio.git
cd codex-game-studio
npm install
npm run build

./codex-game-studio init --name "Signal Cartographer" --engine godot --mode prototype --non-interactive \
  --concept "A compact puzzle game about routing trains through haunted switchyards"

./codex-game-studio status --project projects/signal-cartographer
./codex-game-studio validate --project projects/signal-cartographer
```

在真正运行 Codex 之前，可以先检查角色提示词：

```sh
./codex-game-studio run producer --project projects/signal-cartographer \
  "Create the initial market overview." --print-prompt
```

详细命令说明见英文版 [User Guide](../user-guide.md)。

## 为什么需要它

空白 AI 编程聊天很灵活，但游戏开发需要更稳定的工作室结构：

- 制作人需要里程碑、交接和发布检查。
- 设计师需要 GDD、系统规格、玩家旅程和调参循环。
- 工程师需要边界清晰的实现提示词和验证门槛。
- 美术、QA、音频、本地化和运营也需要各自的上下文。
- 审查者需要能在 Git 中检查的文件，而不是消失在聊天历史里的决策。

Codex Game Studio 把这些结构变成本地项目文件，让 Codex 能读取，也让人类能审查。

## 你会得到什么

| 能力 | 含义 |
| --- | --- |
| 本地项目脚手架 | 在 `projects/<slug>/` 下创建确定性的游戏工作区。 |
| Codex 原生工作室角色 | 为制作、设计、工程、美术、QA、本地化和发布生成聚焦的角色提示词。 |
| 工作流提示词 | 提供市场、数据、规格、交接、发布检查、UI 审查等可复用提示词。 |
| 引擎覆盖层 | 添加 Godot、Unity 或 Unreal 上下文，但不把本项目变成引擎包装器。 |
| 文件化任务状态 | 在 `.codex/**` 下保存任务、锁和运行元数据。 |
| 执行前检查 | 支持 dry-run 和打印提示词，避免直接让 Codex 修改项目。 |
| 严格验证 | 检测过期生成文件、格式错误元数据、缺失资源和未来功能漂移。 |

## 深入阅读

| 需要 | 文档 |
| --- | --- |
| 安装、命令、工作流和验证 | [User Guide](../user-guide.md) |
| 角色目录 | [Studio Roles](../studio-roles.md) |
| 生成项目结构 | [Project Anatomy](../project-anatomy.md) |
| 使用场景 | [Examples](../examples/README.md) |
| 完整文档地图 | [Docs Index](../README.md) |

## 项目状态

Codex Game Studio 当前支持确定性项目脚手架、Codex 角色执行、工作流提示词渲染、文件化任务编排，以及仓库/项目验证。

它目前不提供 planner 或 `next` 命令、遥测、托管编排、无限并行、强制输出所有权，或生成 `CODEX.md` / `project_orchestrator.md`。

## 许可证

Codex Game Studio 使用 MIT License。见 [`LICENSE`](../../LICENSE)。
