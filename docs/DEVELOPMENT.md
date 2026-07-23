# Development Guide

This project is a browser extension built with plain JavaScript and Manifest V3. There is no build step.

## Important files

- `manifest.json`: extension metadata, permissions, content script registration, and background service worker registration.
- `service-worker.js`: network interception, feature toggles, resource extraction, downloads, and badge state.
- `duration-utils.js`: safe 4-15 second video request rewriting and setting normalization.
- `content-panel.js`: floating downloader UI injected into Doubao / Dola pages.
- `tests/duration-utils.test.js`: duration request rewriting regression tests.
- `MAINTENANCE_NOTES.md`: endpoint and field checklist.

## Local validation

Run syntax checks:

```bash
node --check service-worker.js
node --check content-panel.js
node --check duration-utils.js
node tests/duration-utils.test.js
```

Validate JSON files:

```bash
node -e "JSON.parse(require('fs').readFileSync('manifest.json', 'utf8'))"
```

## Debug logging

In `service-worker.js`, set:

```js
const DEBUG_LOG_ENABLED = true;
```

Then open the extension service worker console from the browser extension management page.

## Maintenance workflow

When Doubao or Dola changes and the extension stops working:

1. Confirm the extension badge shows `ON`.
2. Check whether `自定义视频时长` and `去水印` switches are enabled.
3. Open browser DevTools Network tab.
4. Search for these endpoints:
   - `chat/completion`
   - `chain/single`
   - `fallback_api`
5. Compare returned fields with `MAINTENANCE_NOTES.md`.
6. Update endpoint constants, field extraction logic, or token decoding logic as needed.

## Release checklist

1. Run syntax and JSON checks.
2. Update `CHANGELOG.md`.
3. Update README if user-visible behavior changed.
4. Load unpacked extension in Chrome / Edge.
5. Test on a fresh Doubao / Dola page.
