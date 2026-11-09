<div align="center">

# TabZero

**✨ 极简高效、颜值至上的现代化浏览器新标签页扩展**

[English](README.md) | [简体中文](README_zh.md)

<p align="center">
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"></a>
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" alt="React 19"></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript" alt="TypeScript 5.9"></a>
  <a href="https://vitejs.dev/"><img src="https://img.shields.io/badge/Vite-7-646CFF?logo=vite" alt="Vite 7"></a>
  <a href="https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto"><img src="https://img.shields.io/badge/Encryption-AES--256--GCM-green" alt="AES-256-GCM"></a>
  <a href="https://developer.chrome.com/docs/extensions/mv3/intro/"><img src="https://img.shields.io/badge/Chrome%20Extension-Manifest%20V3-blue" alt="Manifest V3"></a>
  <img src="https://img.shields.io/badge/Version-v4.3.1-brightgreen" alt="Version: v4.3.1">
</p>

</div>

---

### 预览

<p align="center">
  <img src="./screenshots/preview-dark.png" alt="深色模式预览" width="100%">
</p>

<p align="center">
  <img src="./screenshots/preview-light.png" alt="浅色模式预览" width="100%">
</p>

---

### ✨ 核心亮点

- **🎯 极致极简视觉设计**
  - 现代视觉排版，采用 *Outfit* 与 *JetBrains Mono* 字体，辅以 64px 舒适留白间距，视觉焦点更通透自然。
  - 内置自适应视觉护盾（Readability Shield）与暗角阴影，确保在任何复杂浅色或深色壁纸下文字均清晰易读。
- **🔒 WebDAV 云端同步 (AES-256-GCM 端到端强加密)**
  - 支持任意标准 WebDAV 服务（Nextcloud、群晖 NAS、Alist 等私有云及商业云存储）。
  - **真正的零知识隐私**：所有书签与分类在本地浏览器内调用原生 Web Crypto API，通过用户设置的密码派生密钥（PBKDF2 10万次哈希），进行 AES-256-GCM 强加密后传输，服务器端仅存储密文。
  - 设置面板提供一键「🔍 测试连接」，配备动态呼吸指示灯（🟢 绿色已连接 / 🔴 红色未连接），连接健康状态一目了然。
- **🖼️ 微软官方国内 CDN 壁纸流 (120+ 绝不重复大片 & Fisher-Yates 洗牌活水机制)**
  - **120 张去重精选底库**：精选 120 张 100% 独立且互不重名的微软 Bing 经典摄影原图，直连国内官方 CDN（`cn.bing.com`），毫秒级极速秒开。
  - **Fisher-Yates 洗牌播放列表算法**：彻底抛弃放回式随机抽取，采用歌单式乱序轮播。**在连续点击 120 次之内，100% 绝对保证每一张都是全新壁纸，绝不重复**！
  - **每日活水机制**：联网时后台静默探查微软当天最新发布的壁纸，自动无缝注入队列，让底库越用越新。
  - **纯净零水印离线兜底原图**：内置两张纯净 1080P 零水印官方代表作（深色：冰岛极光；浅色：多洛米蒂湖景）。且看过的壁纸由浏览器磁盘自动缓存，断网打开绝不白屏、绝不跳回默认。
- **📑 书签与分类深度整合管理**
  - 菜单项精简合并为「书签管理」，坚持**垂直上下一体化滚动布局**。
  - **原位流光呼吸灯编辑**：点击分类名称即可原位直接修改，输入时光标聚焦并在底部呈现极简流光呼吸灯底线，回车或失焦即刻保存。
  - **整行点击修改书签**：书签管理支持全部分类筛选联动，整行点击直接呼出修改弹窗，去除了冗余丑陋的编辑按钮，右侧仅保留分类标签与冒泡拦截删除。
- **📂 本地数据双轨导入与导出**
  - **浏览器原生 HTML 书签无缝解析导入**：完美兼容 Chrome / Edge / Safari / Firefox 导出的标准 Netscape 格式书签 HTML 文件，自动提取文件夹树、分类及 Favicon 图标。
  - **离线 JSON 备份与导出**：一键导出结构化 JSON 备份文件，纯本地操作，自主可控。
- **🔍 多搜索引擎一键快捷切换**
  - 预置并支持 25+ 主流引擎（Google、Bing、Baidu、GitHub、DuckDuckGo、知乎、Bilibili、淘宝、MDN 等）。
  - **全键盘轮巡**：按 `Tab` / `Shift + Tab` 顺次快速轮巡切换当前搜索引擎。
  - **前缀快捷直达**：在搜索框输入 `b + 空格` 瞬切 Bing，`g + 空格` 瞬切 Google，直观快捷。
- **⌨️ 全局沉浸式键盘快捷键**
  - `⌘K` / `Ctrl + K`：无论焦点何处，随时唤起全局快速搜索遮罩。
  - 单键 `/` 或中文标点 `、`：一键自动聚焦新标签页主搜索框，提笔即搜。
  - `Esc`：快速关闭所有侧边抽屉与弹出层。
- **⚙️ 清晰层级的系统偏好设置**
  - **深色模式**：深色模式切换、主界面模式切换快捷按钮。
  - **显示设置**：时钟、快捷访问磁贴、书签栏显隐控制。
  - **时间模块**：显示秒数、时钟颜色个性化定制。
  - **通用设置**：多国语言切换、书签默认打开方式（新标签页 `_blank` / 当前标签页 `_self`）。

---

### 🖼️ 壁纸架构与 Fisher-Yates 洗牌轮播机制

TabZero 针对传统浏览器扩展“壁纸频繁复现、加载慢或断网白屏”的痛点，设计了轻量高效的**双轨活水架构**：

```
                    ┌──────────────────────────────────────────────┐
                    │      120 张历年精选历史高清大底库 (纯纯原图)    │
                    └──────────────────────┬───────────────────────┘
                                           │  Fisher-Yates 乱序洗牌
                                           ▼
【用户点击切图】 ◄────► 【 当前专属轮播队列 (本地存储仅 15KB) 】
                                           ▲
                                           │  每日静默探查自动注新
                    ┌──────────────────────┴───────────────────────┐
                    │  微软 Bing 官方当日最新接口 (国内极速直连)     │
                    └──────────────────────────────────────────────┘
```

1. **同图不同名彻底去重**：深入微软跨国 API，彻底剔除仅在后缀挂有 `_ZH-CN` / `_EN-US` 的重复大片，确保入库的 120 张图片完全独立。
2. **Fisher-Yates 真正不重复洗牌**：每次重置时将所有壁纸生成随机乱序队列，指针顺序前移。在连续点击 120 次之内，数学上 100% 绝对保证每一张都是全新大片，绝不出现任何重复！
3. **每日活水无感注入**：在联网切图时，后台异步探查微软当日发布的最新壁纸。一旦发现未见过的今日大片，自动无缝注入轮播队列，让壁纸池越用越丰富。
4. **轻量与磁盘缓存**：安装包仅保存轻量级 URL 文本索引，图片通过微软国内 CDN 极速分发并由 Chrome 磁盘强缓存持久化，断网毫秒级秒开，绝不回退默认图。

---

### 📂 目录结构树

```text
TabZero/
├── TabZero/                  # Chrome 扩展生产分发目录 (可直接加载或打包发布)
│   ├── manifest.json         # Chrome 扩展核心清单文件 (Manifest V3, v4.3)
│   ├── index.html            # 扩展新标签页挂载入口
│   ├── assets/               # 生产核心运行时 (纯净体积仅 ~590KB)
│   │   ├── main.js           # 业务逻辑 bundle (React 19 + 120张洗牌算法 + WebDAV AES-256)
│   │   └── style.css         # 样式与动画定义 (毛玻璃效果、响应式栅格、流光呼吸灯等)
│   ├── icons/                # 扩展图标与内置 25+ 搜索引擎高清矢量 SVG
│   │   ├── icon.svg          # 官方主 Logo 矢量源文件
│   │   ├── icon16.png / 48 / 128
│   │   └── engines/          # 各大搜索引擎专用品牌图标 (Google, Bing, GitHub 等)
│   ├── wallpapers/           # 零水印 1080P 离线兜底壁纸 (冰岛极光 + 阿尔卑斯湖景)
│   └── screenshots/          # 4K 高清演示预览截图
├── public/                   # 公共静态资产目录
├── src/                      # 现代化开发源码 (TypeScript + React 19)
│   ├── components/           # UI 模块化组件
│   │   ├── Bookmarks/        # 书签列表、文件夹树、拖拽排序
│   │   ├── Clock/            # 极简时钟与日期显示
│   │   ├── QuickLinks/       # 快捷磁贴面板与编辑对话框
│   │   ├── SearchBar/        # 搜索输入框、前缀匹配、引擎快捷轮巡
│   │   ├── SettingsDrawer/   # 侧边设置抽屉 (书签管理、同步、外观与系统偏好)
│   │   └── ui/               # 基础设计系统原子组件 (Button, Input, Select, Modal)
│   ├── hooks/                # 自定义 React Hooks (键盘事件监听、拖拽排序等)
│   ├── i18n/                 # 国际化语言包 (zh-CN, en-US)
│   ├── stores/               # Zustand 全局响应式状态总线
│   ├── types/                # 严谨的 TypeScript 类型契约
│   └── utils/                # 核心工具库 (AES-256 加密、WebDAV 通信、洗牌算法、HTML 解析)
├── package.json              # 项目依赖清单与构建指令
├── vite.config.ts            # Vite 7 极速现代化构建配置
└── README.md                 # 英文设计与使用文档
```

---

### 🚀 安装与使用

#### 方式一：直接载入生产目录（最简单，推荐）

1. 下载或克隆本项目：
   ```bash
   git clone git@github.com:oceanxux/TabZero.git
   ```
2. 打开 Google Chrome 或 Edge 浏览器，访问扩展管理页面：`chrome://extensions/`；
3. 打开右上角的 **「开发者模式」** (Developer Mode)；
4. 点击左上角的 **「加载已解压的扩展程序」** (Load Unpacked)；
5. 在文件选择窗口中选中本项目根目录下的 **`TabZero`** 文件夹即可！

#### 方式二：使用官方打包扩展（CRX / ZIP）

项目已在发布目录中为您预打包了两种标准扩展包：
- **`TabZero-v4.3.crx`**（约 2.0 MB，支持拖入浏览器直接安装）
- **`TabZero-v4.3.zip`**（约 2.0 MB，标准 Chrome Web Store / Edge 商店上架包）

#### 方式三：从源码二次构建

```bash
# 1. 进入项目根目录并安装依赖
npm install

# 2. 启动本地热重载开发服务器
npm run dev

# 3. 编译打包生成生产版本
npm run build
```

---

### ⌨️ 快捷键速查表

| 按键 | 功能说明 | 适用场景 |
| :--- | :--- | :--- |
| **`/`** 或 **`、`** | **聚焦搜索框**（完美兼容中文输入法） | 随时准备输入搜索关键词 |
| **`⌘ + K`** 或 **`Ctrl + K`** | **呼出全局快捷搜索浮层** | 在新标签页任何位置瞬时唤出搜索 |
| **`Tab`** / **`Shift + Tab`** | **向后 / 向前轮巡搜索引擎** | 无需移动鼠标，键盘快速切引擎 |
| **`b `** / **`g `** + 空格 | **输入引擎前缀直达** | 如输入 `b 摄影` 自动使用 Bing 检索 |
| **`Esc`** | **退出 / 关闭浮层** | 快速关闭设置抽屉或搜索浮层 |

---

### 🛡️ 数据安全与加密原理解析

TabZero 秉持真正的「端到端隐私安全」，没有任何中心化收集服务器：

```
[ 用户书签数据 ]
       │
       ▼
[ Web Crypto API (本地浏览器沙盒) ]
  ├── 密码派生密钥：PBKDF2 (100,000 次 SHA-256 迭代计算)
  ├── 随机生成 Salt (16字节) + IV (12字节)
  └── 对称高强度加密：AES-256-GCM 认证加密
       │
       ▼
[ 加密密文数据 (包含 ciphertext, salt, iv) ]
       │
       ▼  (HTTPS 加密通道传输)
[ 您的私有 WebDAV 服务器 (Nextcloud / 群晖 / NAS) ]
```

> **注意**：即使服务器被第三方攻破或截获备份文件，在没有您本地应用密码的情况下，任何人都无法解密密文。

---

### 📄 开源许可

本项目遵循 [MIT License](LICENSE) 开源。

<div align="center">

**Crafted with care for a cleaner, faster web browsing experience.**

</div>
