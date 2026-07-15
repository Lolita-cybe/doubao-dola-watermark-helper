# 豆包 / Dola 无水印资源助手

> 一个用于豆包与 Dola 网页端的 Chrome / Edge 浏览器扩展。支持捕获页面接口中的图片、视频资源，提供预览、勾选、批量下载、15 秒配置开关、无水印资源提取、本地账号切换和登录态备份。

[![Manifest V3](https://img.shields.io/badge/Chrome%20Extension-Manifest%20V3-4285F4)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-active-brightgreen)](#)
[![Release](https://img.shields.io/badge/release-v1.6.0-blue)](https://github.com/Lolita-cybe/doubao-dola-watermark-helper/releases/tag/v1.6.0)

## 项目简介

豆包 / Dola 无水印资源助手是一个浏览器扩展，用于辅助管理豆包和 Dola 页面中生成的图片、视频资源。

插件会在目标页面中注入一个浮动资源面板，自动展示当前捕获到的资源，并支持视频预览、图片预览、复制链接、单个下载、勾选下载和全部下载。

它的核心思路不是对视频画面做后期处理，而是监听网页接口响应，从接口数据中提取可用的原始资源或无水印资源地址。

从 v1.6.0 开始，插件还加入了本地账号管理能力：可以识别当前豆包账号，保存本机登录态，在已保存账号之间切换，并支持导入 / 导出本地登录态备份。

> 请仅用于你自己生成、拥有版权或已获得授权的内容。使用者需要自行遵守豆包、Dola、浏览器平台规则以及所在地法律法规。

## 功能特性

- 资源面板：在豆包 / Dola 页面显示浮动下载器。
- 视频预览：捕获到视频后可在面板内直接预览播放。
- 图片预览：捕获到图片后显示缩略图。
- 批量操作：支持单个下载、勾选下载、当前结果下载。
- 资源筛选：支持全部、视频、图片筛选。
- 可移动窗口：拖动标题栏移动窗口，双击标题栏恢复居中。
- 插件图标唤起：点击浏览器插件图标打开下载器面板。
- 功能开关：
  - `启用插件`：插件总开关，关闭后目标接口直接放行。
  - `15 秒配置`：控制 15 秒视频配置注入。
  - `无水印资源`：控制无水印资源提取和显示。
- 本地账号管理：
  - 自动识别当前豆包账号。
  - 自动发现新账号并提示保存。
  - 已保存账号再次登录时不会重复保存。
  - 支持更新当前账号登录态。
  - 支持在已保存账号之间切换。
- 备份与恢复：
  - 支持导出本地登录态 JSON 备份。
  - 支持导入备份恢复账号列表。
- 持久化设置：开关状态和账号登录态保存到浏览器本地存储。

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
2. 正常生成图片或视频。
3. 页面中会出现“豆包 / Dola 资源助手”入口。
4. 资源捕获成功后，面板内会展示图片或视频卡片。
5. 可直接预览、复制链接或下载资源。

如果插件图标角标显示 `OFF`，请打开面板并确认顶部“启用插件”开关已打开。

## 多账号使用

账号管理功能只保存在本机浏览器中，不会上传到作者服务器。

常见流程：

1. 登录一个豆包账号。
2. 打开资源助手面板中的“账号管理”。
3. 如果开启了自动发现，插件会提示保存新账号登录态。
4. 切换到另一个豆包账号后重复保存。
5. 后续可在账号下拉框中选择已保存账号并切换。

导出的备份 JSON 包含登录态数据，等同于账号钥匙。请只保存在自己的电脑上，不要发送给他人，也不要上传到公开位置。

## 权限说明

插件使用以下浏览器权限：

- `debugger`：附加到豆包 / Dola 标签页，读取和处理指定接口请求。
- `tabs`：识别当前是否为目标页面，并唤起面板。
- `downloads`：下载用户选择的资源，以及导出本地备份文件。
- `storage`：保存插件开关、账号列表和本地登录态。
- `cookies`：保存和恢复豆包 / Dola 本地登录态，用于账号切换。

Host 权限限制在：

- `*.doubao.com`
- `*.dola.com`
- `*.byteintlapi.com`

详见 [docs/PRIVACY.md](docs/PRIVACY.md)。

## 项目结构

```text
.
├── manifest.json                    # 浏览器扩展配置
├── service-worker.js                # 后台拦截、解析、下载、设置和账号登录态逻辑
├── content-panel.js                 # 页面浮动下载器 UI
├── doubao-skill-pack-response.json  # 豆包 15 秒配置响应
├── dola-skill-pack-response.json    # Dola 15 秒配置响应
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

Doubao / Dola Watermark-Free Resource Helper is a Chrome / Edge Manifest V3 extension for capturing and previewing image/video resources on Doubao and Dola pages. It provides a floating downloader panel, video preview, batch download, optional 15-second configuration injection, optional watermark-free resource extraction, local account switching, and local session backup import/export.

Use it only for content you created, own, or are authorized to download. Saved session backups may contain sensitive login-state data and should be kept private.

## License

[MIT](LICENSE)
