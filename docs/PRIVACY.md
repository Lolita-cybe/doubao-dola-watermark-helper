# 隐私说明

本扩展主要在豆包 / Dola 页面内运行，用于捕获页面接口返回的图片和视频资源地址。

## 数据处理

插件会在本地浏览器中处理以下信息：

- 当前页面中的部分网络请求和响应。
- 从响应中提取到的图片 / 视频资源 URL。
- 用户在插件面板中设置的功能开关状态。

## 本地存储

插件使用 `chrome.storage.local` 保存以下设置：

- 是否启用插件。
- 是否启用自定义视频时长，以及选择的 4～15 秒时长。
- 是否启用无水印资源提取。

这些设置保存在浏览器本地。

## 下载

当用户点击下载按钮时，插件会调用浏览器下载能力下载对应资源。

## 不做的事情

本扩展不会主动将数据上传到作者服务器。

本扩展不会收集账号密码。

本扩展不会主动读取非目标域名页面内容。

## 权限说明

- `debugger`：用于监听目标页面的指定网络请求。
- `tabs`：用于识别目标页面并打开插件面板。
- `downloads`：用于下载用户选择的资源。
- `storage`：用于保存插件开关状态。

Host 权限限制在：

- `*.doubao.com`
- `*.dola.com`
- `*.byteintlapi.com`

## Account notes

The local account notes feature stores only helper metadata in `chrome.storage.local`:

- Account alias.
- Account note.
- Account color.
- Last seen time and captured resource count.

It does not store account passwords or create new cookie snapshots. The custom video-duration setting and watermark-free resource switch remain global extension settings shared by all accounts.

## Local session switching

Session saving and switching are disabled from version 1.6.8 because restoring an expired site snapshot can overwrite every currently signed-in Doubao account in the same browser profile. Existing snapshots created by older versions are retained locally only so the user can review, export, or delete them.

This data is not uploaded by the extension and is not exported by the UI. It is sensitive local login-state data, so users should only save sessions for accounts they control on a trusted computer.

The semi-automatic discovery option only checks the currently visible account identity on the active Doubao / Dola page and compares it with locally saved session profiles. It does not scan other browser profiles or upload account information.

Backup export/import is local. Exported backup files contain saved login-state data and should be stored privately. The extension does not upload backup files.
