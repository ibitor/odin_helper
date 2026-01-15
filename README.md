# Odin Helper

这是一个使用 Vite 初始化的前端项目，目标是构建一个工具站。

## 已包含工具

- JSON Repair：自动修复常见 JSON 格式问题并格式化输出。

## 使用方式

```bash
npm install
npm run dev
```

## 构建与预览

```bash
npm run build
npm run preview
```

## 部署到 Vercel

在 Vercel 中导入仓库后，默认会识别 Vite 配置：

- Build Command: `npm run build`
- Output Directory: `dist`

### 自动部署（每次更新自动发布）

Vercel 会在以下条件下自动拉取并部署：

1. **通过 Vercel 连接 Git 仓库**：在 Vercel 的项目设置中确保已连接 GitHub/GitLab/Bitbucket，并在项目中完成首次导入。
2. **启用默认的 Git 自动部署**：Vercel 默认开启 `Production` 与 `Preview` 的自动部署。
   - 推送到默认分支（通常是 `main`/`master`）会触发生产环境部署。
   - 推送到其他分支会触发预览环境部署。
3. **确保 Git 触发器未被关闭**：进入 Vercel → Project → Settings → Git，确认 `Deployments` 中的 `Auto Deployments` 为开启状态。

如果需要更改触发分支或关闭某些分支部署，也可以在 `Settings → Git` 中进行设置。
