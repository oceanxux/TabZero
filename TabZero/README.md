<div align="center">

# TabZero

**✨ 极简高效、颜值至上的现代化浏览器新标签页扩展**

一个基于 React 19 + TypeScript 构建的极致极简、注重隐私与交互体验的浏览器新标签页。

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite)](https://vitejs.dev/)
[![Security: AES-256-GCM](https://img.shields.io/badge/Encryption-AES--256--GCM-green)](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto)

[English](#english) | [中文](#中文)

</div>

---

## 中文

### 预览

<p align="center">
  <img src="./screenshots/preview-dark.png" alt="深色主题预览" width="100%">
</p>

<p align="center">
  <img src="./screenshots/preview-light.png" alt="浅色主题预览" width="100%">
</p>

### ✨ 核心亮点

- **🎯 极致极简设计** - 现代排版（Outfit + JetBrains Mono 字体），64px 黄金视觉间距，毛玻璃半透明质感，自带文本阅读保护护盾。
- **🔒 WebDAV 云端同步 (AES-256-GCM 强加密)** - 支持任意标准 WebDAV 服务（Nextcloud、群晖 NAS、Alist 等）。备份数据在本地浏览器端通过原生 Web Crypto API 进行 AES-256-GCM 加密，云端仅存放密文，零隐私泄露风险。
- **💡 智能同步状态** - 支持「测试连接」一键探活，配备动态呼吸灯（🟢 绿色已连接 / 🔴 红色未连接），连接状态一目了然。
- **📂 本地数据自由导入/导出**：
  - **原生 HTML 浏览器书签导入**：一键解析 Chrome/Edge/Safari/Firefox 导出的标准 HTML 书签文件，自动提取文件夹分类与 Favicon 图标。
  - **JSON 离线备份导出**：书签数据随时随地导出到本地保存，完全离线自主可控。
- **🔍 多搜索引擎一键轮巡**：
  - 支持 **Tab / Shift+Tab** 快速轮巡切换搜索引擎。
  - 支持输入框前缀快捷直达（输入 `b `、`bing ` 切换 Bing；`g ` 切换 Google 等）。
  - 支持快捷搜索抽屉与自定义搜索引擎扩展。
- **⌨️ 全局沉浸式快捷键**：
  - `⌘K` / `Ctrl+K`：随时呼出全局搜索浮层。
  - `/` 或中文输入法 `、`：一键自动聚焦输入框，敲击即搜。
  - `Esc`：快速关闭抽屉与弹窗。
- **🖼️ 微软官方每日 4K 高清壁纸**：
  - 剔除海外第三方代理中转，直连国内官方高速 CDN，毫秒级快速响应。
  - 智能利用浏览器原生 HTTP 缓存，离线流畅秒开，杜绝膨胀存储。
- **⚙️ 贴心细节偏好**：
  - 书签支持新标签页（`_blank`）或当前标签页（`_self`）打开方式自由切换。
  - 系统设置独立收纳：时钟、快捷链接、书签栏、主题切换按钮皆可按需自由显隐。

---

### 安装与使用

#### 方式一：加载解压版安装（推荐）

1. 下载项目 Release 包或克隆本项目：
   ```bash
   git clone git@github.com:oceanxux/TabZero.git
   ```
2. 打开 Chrome / Edge 浏览器，访问：`chrome://extensions/`
3. 开启右上角 **「开发者模式」** (Developer mode)；
4. 点击 **「加载已解压的扩展程序」** (Load unpacked)；
5. 选择本项目中的 `TabZero` 文件夹，即可立刻开启全新标签页体验！

#### 方式二：从源码构建

```bash
# 1. 安装依赖
npm install

# 2. 本地开发调试
npm run dev

# 3. 编译打包生产版本
npm run build
```

---

### 快捷键指南

| 快捷键 | 功能说明 |
|--------|----------|
| `/` 或 `、` | 一键聚焦搜索框（支持中文输入法标点） |
| `⌘ + K` / `Ctrl + K` | 呼出全局搜索快捷弹窗 |
| `Tab` / `Shift + Tab` | 顺次轮巡切换搜索引擎 |
| `b ` / `g ` / `bd ` + 空格 | 输入前缀快捷切换至对应引擎 |
| `Esc` | 关闭当前弹窗或侧边设置抽屉 |

---

## English

### ✨ Key Features

- **🎯 Ultra Minimalist Aesthetics** - Modern typography with Outfit & JetBrains Mono fonts, 64px optimized hero spacing, frosted glass effects, and smart readability shields.
- **🔒 WebDAV End-to-End Encrypted Sync** - Sync bookmarks with any WebDAV provider (Nextcloud, Synology NAS, Alist, etc.). Data is encrypted locally before transmission using native Web Crypto API (AES-256-GCM + PBKDF2), ensuring true zero-knowledge privacy.
- **💡 Real-time Connection Status** - Built-in connection testing with breathing status indicators (🟢 Connected / 🔴 Disconnected).
- **📂 Native Browser Bookmark Import & Export**:
  - Direct parsing of standard HTML bookmark exports from Chrome, Edge, Safari, and Firefox with automatic folder categorization and icons.
  - JSON backup and restore with complete offline privacy.
- **🔍 Instant Search Engine Switching**:
  - Cycle through 20+ search engines with `Tab` / `Shift+Tab`.
  - Prefix shortcuts like `b + Space` for Bing, `g + Space` for Google.
- **⌨️ Keyboard Centric Workflow**:
  - `⌘K` / `Ctrl+K`: Global search overlay.
  - `/` or Chinese punctuation `、`: Instant search focus.
- **🖼️ Official Bing 4K Daily Wallpapers** - Direct CDN streaming with native browser caching, ensuring instant 1ms loads without local storage bloating.
- **⚙️ Custom Preferences** - Flexible bookmark open targets (`_blank` vs `_self`), toggleable UI modules (Clock, Bookmarks, Quick Links).

---

### License

This project is licensed under the [MIT License](LICENSE).

<div align="center">

**Built with ❤️ for a cleaner, faster web browsing experience.**

</div>
