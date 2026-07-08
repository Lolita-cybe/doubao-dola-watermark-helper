# Doubao Dola Watermark-Free Resource Helper

A Chrome / Edge Manifest V3 extension for Doubao and Dola pages. It adds a floating downloader panel, supports previewing captured image/video resources, and provides optional switches for 15-second video configuration and watermark-free resource extraction.

> Use this project only for content you created, own, or are authorized to download. You are responsible for complying with Doubao, Dola, browser, and local legal requirements.

## Features

- Floating "Doubao Downloader" panel on Doubao / Dola pages.
- Preview captured images and videos before downloading.
- Select individual resources, download selected resources, or download all.
- Date filtering based on when the extension captured the resource.
- Movable panel. Drag the title bar to move it, double-click the title bar to re-center.
- Browser action click opens the downloader panel.
- Persistent toggles:
  - Enable: global extension switch.
  - 15s: controls 15-second configuration injection.
  - Watermark-free: controls watermark-free resource extraction.

## Install

1. Download or clone this repository.
2. Open Chrome or Edge.
3. Go to `chrome://extensions` or `edge://extensions`.
4. Enable Developer mode.
5. Click "Load unpacked".
6. Select this repository folder.
7. Open a Doubao or Dola page. The extension badge should show `ON`.

## Files

- `manifest.json`: extension manifest and permissions.
- `service-worker.js`: request interception, configuration patching, resource extraction, downloads, and feature switches.
- `content-panel.js`: floating downloader UI and preview panel.
- `doubao-skill-pack-response.json`: Doubao skill-pack response used for 15-second configuration.
- `dola-skill-pack-response.json`: Dola skill-pack response used for 15-second configuration.
- `MAINTENANCE_NOTES.md`: endpoint and field checklist for future maintenance.

## Permissions

This extension uses these permissions:

- `debugger`: attach to Doubao / Dola tabs and inspect selected network requests.
- `tabs`: detect target Doubao / Dola pages and open the panel.
- `downloads`: download selected resources.
- `storage`: persist feature switch settings.

Host permissions are limited to:

- `*.doubao.com`
- `*.dola.com`
- `*.byteintlapi.com`

## Maintenance

This type of extension depends on page and API response details. If Doubao or Dola changes endpoints, field names, token formats, or resource parameters, the extension may need updates.

Start with `MAINTENANCE_NOTES.md` when debugging a breakage.

## License

MIT
