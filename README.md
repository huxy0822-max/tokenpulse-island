# OpenToken 反馈小岛

这是我们自己的 OpenToken 反馈小岛版本。它会把本机 OpenToken 使用量变成一个右上角菜单栏小插件：显示折算 Token、排名压力、任务、成就、工具占比、7 日节奏和公开仓库行为信号。

这个项目是在阅读 `ehomekevin/opentoken-island` 之后从零写的。上游仓库没有声明许可证，所以本仓库不复用它的代码。

许可证：MIT。

线上演示：https://tokenpulse.huxy.club

## 本地运行

```bash
npm install
npm run dev
```

Vite 开发服务会以演示数据展示完整界面。

如果要读取本机真实 OpenToken 数据，先构建，再运行本地 Node 桥：

```bash
npm run build
npm start
```

本地桥会同时提供界面和接口：

- `GET /api/summary`：尽量读取 `opentoken preview --json`
- `GET /api/health`：返回本地服务状态

如果 OpenToken 不在默认路径，可以手动指定：

```bash
OPENTOKEN_BIN=/Users/huxy/.local/bin/opentoken npm start
```

## macOS 菜单栏小插件

安装原生菜单栏外壳：

```bash
bash scripts/install-macos-app.sh
```

安装脚本会构建 `/Applications/TokenPulse Island.app`，启动本地服务 `http://127.0.0.1:4188`，并打开菜单栏小插件。它不会出现在 Dock 里，会缩在 macOS 右上角菜单栏，点击后弹出本地面板，右键菜单提供打开本地面板、刷新、重启本地服务和退出。

## 部署

静态部署可直接使用演示数据；如果要显示真实 OpenToken 数据，需要在安装了 OpenToken 的 Mac 上运行本地 Node 桥。
