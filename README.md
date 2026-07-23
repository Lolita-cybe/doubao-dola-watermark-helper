# 豆包 / Dola 无水印资源助手

> 一个用于豆包与 Dola 网页端的 Chrome / Edge 浏览器扩展。支持捕获图片、视频资源，提供预览、批量下载、4～15 秒自定义视频时长、无水印资源提取和当前账号识别。

[![Manifest V3](https://img.shields.io/badge/Chrome%20Extension-Manifest%20V3-4285F4)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-active-brightgreen)](#)
[![Release](https://img.shields.io/badge/release-v1.7.0-blue)](https://github.com/Lolita-cybe/doubao-dola-watermark-helper/releases/tag/v1.7.0)

## 项目简介

豆包 / Dola 无水印资源助手是一个浏览器扩展，用于辅助管理豆包和 Dola 页面中生成的图片、视频资源。

插件会在目标页面中注入一个浮动资源面板，自动展示当前捕获到的资源，并支持视频预览、图片预览、复制链接、单个下载、勾选下载和全部下载。

它的核心思路不是对视频画面做后期处理，而是监听网页接口响应，从接口数据中提取可用的原始资源或无水印资源地址。

插件可以识别当前豆包账号，并保留旧版本已经保存的历史账号记录。由于豆包可能在服务器端注销旧登录态，而恢复历史快照会覆盖当前浏览器中的全部账号，从 1.6.8 起已停用登录态保存和切换。多批账号建议使用不同的 Chrome 用户配置。

> 请仅用于你自己生成、拥有版权或已获得授权的内容。使用者需要自行遵守豆包、Dola、浏览器平台规则以及所在地法律法规。

## 功能特性

- 资源面板：在豆包 / Dola 页面显示浮动下载器。
- 视频预览：捕获到视频后可在面板内直接预览播放。
- 图片预览：捕获到图片后显示缩略图。
- 批量操作：支持单个下载、勾选下载、当前结果下载。
- 资源筛选：支持全部、视频、图片筛选。
- 可移动窗口：拖动标题栏移动窗口，双击标题栏恢复居中。
- 可拖动悬浮按钮：最小化后显示图标按钮，可拖动到页面任意可见位置。
- 插件图标唤起：点击浏览器插件图标打开下载器面板。
- 功能开关：
  - `启用插件`：插件总开关，关闭后目标接口直接放行。
  - `自定义视频时长`：在插件内选择 4～15 秒，生成请求发出时覆盖豆包页面当前时长。
  - `无水印资源`：控制无水印资源提取和显示。
  - `夜晚模式`：切换资源助手面板深色外观，刷新后保持设置。
- 本地账号管理：
  - 自动识别当前豆包账号。
  - 保留并搜索旧版本中的历史账号记录。
  - 登录态保存和切换已停用，防止覆盖当前浏览器中的全部账号。
- 持久化设置：功能开关保存到浏览器本地存储。

## 安装方式

1. 下载或克隆本仓库。
2. 打开 Chrome 或 Edge。
3. 进入扩展管理页面：
   - Chrome: `chrome://extensions`
   - Edge: `edge://extensions`
4. 打开“开发者模式”。
5. 点击“加载已解压的扩展程序”。
6. 选择本仓库文件夹。
7. 打开豆包或 Dola 页面，插件角标显示 `ON` 表示已启用。

更详细的安装说明见 [docs/INSTALL.zh-CN.md](docs/INSTALL.zh-CN.md)。

## 使用方式

1. 安装扩展后打开豆包或 Dola 页面。
2. 需要自定义视频时长时，在插件设置中启用“自定义视频时长”并选择 4～15 秒。
3. 正常生成图片或视频。无需再操作豆包官方时长滑杆，插件会在视频生成请求发出时应用所选秒数。
4. 页面中会出现“豆包 / Dola 资源助手”入口。
5. 资源捕获成功后，面板内会展示图片或视频卡片。
6. 可直接预览、复制链接或下载资源。

如果插件图标角标显示 `OFF`，请打开面板并确认顶部“启用插件”开关已打开。

## 多账号使用

同一个 Chrome 用户配置中的豆包账号共享 Cookie 和网站数据。需要管理多批账号时，请创建多个 Chrome 用户配置，例如“豆包 A 组”“豆包 B 组”，每个配置分别登录一批账号并单独加载本扩展。

旧版本导出的 JSON 可能包含登录态数据，等同于账号钥匙。请只保存在自己的电脑上，不要发送给他人，也不要上传到公开位置。

## 权限说明

插件使用以下浏览器权限：

- `debugger`：附加到豆包 / Dola 标签页，读取和处理指定接口请求。
- `tabs`：识别当前是否为目标页面，并唤起面板。
- `downloads`：下载用户选择的资源，以及导出本地备份文件。
- `storage`：保存插件开关、当前账号记录和旧版本历史数据。

Host 权限限制在：

- `*.doubao.com`
- `*.dola.com`
- `*.byteintlapi.com`

详见 [docs/PRIVACY.md](docs/PRIVACY.md)。

## 项目结构

```text
.
├── manifest.json                    # 浏览器扩展配置
├── service-worker.js                # 后台拦截、时长重写、资源解析、下载和设置
├── duration-utils.js                # 视频生成请求时长重写工具
├── content-panel.js                 # 页面浮动下载器 UI
├── tests/                            # 请求重写测试
├── MAINTENANCE_NOTES.md             # 接口字段维护对照
├── docs/
│   ├── INSTALL.zh-CN.md             # 中文安装说明
│   ├── DEVELOPMENT.md               # 开发与维护说明
│   ├── PRIVACY.md                   # 隐私说明
│   └── FAQ.zh-CN.md                 # 常见问题
├── CHANGELOG.md                     # 版本记录
├── CONTRIBUTING.md                  # 贡献指南
└── LICENSE                          # MIT License
```

## 维护说明

这类扩展依赖目标网站当前的接口路径、字段名、资源参数和加密格式。如果豆包或 Dola 更新了接口，插件可能需要同步维护。

排查失效时优先查看：

- [MAINTENANCE_NOTES.md](MAINTENANCE_NOTES.md)
- [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)

## 免责声明

本项目仅用于技术研究和个人资源管理。请勿将本项目用于侵犯他人版权、违反平台规则、绕过付费限制或其他违法违规用途。

使用本项目所产生的任何风险由使用者自行承担。

## English Summary

Doubao / Dola Watermark-Free Resource Helper is a Chrome / Edge Manifest V3 extension for capturing and previewing image/video resources on Doubao and Dola pages. It provides a floating downloader panel, video preview, batch download, optional 4-15 second video-duration override, optional watermark-free resource extraction, and local account history.

Use it only for content you created, own, or are authorized to download. Saved session backups may contain sensitive login-state data and should be kept private.

## License

[MIT](LICENSE)
