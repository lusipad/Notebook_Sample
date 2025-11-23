# 📘 NotebookLM Clone (智能知识库助手)

这是一个基于 **Next.js 15** 和 **Tailwind CSS v4** 构建的现代化 AI 知识库应用。它复刻了 Google NotebookLM 的核心体验，提供沉浸式的 Mac 风格界面、RAG 检索模拟以及可视化的思维导图生成功能。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15.0-black)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-v4-cyan)

## ✨ 核心功能

- **🎨 Mac 风格磨砂玻璃 UI**: 采用极致的 Glassmorphism 设计，全屏沉浸式体验，支持深色模式 (Dark Mode)。
- **🤖 模拟 RAG 检索**: 内置模拟的企业知识库（产品规格、售后政策），支持引用溯源（Citation），点击角标即可查看原文片段。
- **📝 Markdown 富文本支持**: AI 回复支持表格、列表、代码块等丰富格式。
- **🧠 自动生成思��导图**: 集成 Mermaid.js，支持通过对话生成可交互的思维导图和流程图。
- **🗂️ 智能侧边栏**: 包含“资料来源”与“历史会话”管理，支持移动端响应式收折。
- **⚡️ 快捷指令系统**: 首页提供常见问题的快捷入口（Starter Chips）。

## 🛠️ 技术栈

- **框架**: [Next.js 15](https://nextjs.org/) (App Router)
- **样式**: [Tailwind CSS v4](https://tailwindcss.com/) + `clsx` + `tailwind-merge`
- **动画**: [Framer Motion](https://www.framer.com/motion/)
- **图标**: [Lucide React](https://lucide.dev/)
- **渲染**: `react-markdown` + `remark-gfm` + `mermaid`

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/your-username/notebook-client.git
cd notebook-client
```

### 2. 安装依赖

```bash
npm install
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 即可查看效果。

## 🔧 配置 (可选)

如果需要连接真实的 Google NotebookLM API 或 Gemini API，请复制环境变量文件并配置：

```bash
cp .env.local.example .env.local
```

在 `.env.local` 中填入您的 API Key：

```env
NOTEBOOK_API_ENDPOINT=your_api_endpoint
GOOGLE_API_KEY=your_google_api_key
```

> **注意**: 目前项目默认运行在“模拟模式”，无需配置 API 即可体验完整 UI 交互。

## 📂 目录结构

```
src/
├── app/
│   ├── api/chat/      # 模拟 RAG 后端逻辑
│   ├── globals.css    # 全局样式 & Tailwind 配置
│   ├── layout.tsx     # 应用骨架
│   └── page.tsx       # 首页
├── components/
│   ├── ChatInterface.tsx  # 核心聊天组件 (含侧边栏、引用逻辑)
│   └── MermaidDiagram.tsx # 思维导图渲染组件
└── lib/               # 工具函数
```

## 🤝 贡献

欢迎提交 Issue 或 Pull Request 来改进这个项目！

---
Designed with ❤️ by Gemini