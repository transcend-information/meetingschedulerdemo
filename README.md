# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

---

GitHub Pages 網址： https://transcend-information.github.io/meetingschedulerdemo

---

**Windows 環境完整部署步驟**

**Step 1 — 安裝必要工具**

1. 下載安裝 [Node.js LTS](https://nodejs.org) — 一路 Next 即可
2. 下載安裝 [Git for Windows](https://git-scm.com/download/win) — 安裝時選 **Git Bash** 選項
3. 安裝完成後，開啟 **命令提示字元（cmd）** 確認三個都有顯示版本號即成功。：

```cmd
node -v
npm -v
git --version
```

---

**Step 2 — 建立專案資料夾**

開啟 **cmd** 或 **PowerShell**，執行：

```cmd
cd C:\Users\username\projectfolderpath
npm create vite@latest meeting-scheduler -- --template react
cd meeting-scheduler
npm install
npm install gh-pages --save-dev
```

---

**Step 3 — 用VS Code 編輯檔案**

安裝 [VS Code](https://code.visualstudio.com)，然後：

```cmd
code .
```
直接在 VS Code 開啟整個專案資料夾。

---

**Step 4 — 修改 `vite.config.js`**

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/meetingschedulerdemo/',
})
```

---

**Step 5 — 修改 `package.json`**

找到 `scripts` 區塊，加入 `predeploy` 和 `deploy`：

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
},
"homepage": "https://transcend-information.github.io/meetingschedulerdemo"

```

注意 `homepage` 這行加在 `scripts` **外面**，跟 `"name"` 同層。

---

**Step 6 — 推送程式碼**

回到 cmd，在專案資料夾內執行：

```cmd
git init
git add .
git commit -m "init"
git branch -M main
git remote add origin https://github.com/transcend-information/meetingschedulerdemo
git push -u origin main
```

第一次 push 會彈出 **GitHub 登入視窗**，登入授權即可。

---

**Step 7 — 部署到 GitHub Pages**

```cmd
npm run deploy
```

執行完看到 `Published` 字樣即成功。


**之後更新只需：**

```cmd
cd C:\Users\username\projectfolderpath
npm run deploy
```

---
