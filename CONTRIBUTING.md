# Contributing

Thanks for considering a contribution.

## What helps

- Endpoint compatibility fixes.
- UI improvements.
- Documentation improvements.
- Bug reports with clear reproduction steps.

## Bug reports

Please include:

- Browser name and version.
- Extension version.
- Target site: Doubao or Dola.
- Which feature failed: panel, custom video duration, resource extraction, download, preview.
- Relevant endpoint names if available.

Do not include private cookies, tokens, account data, or private generated content.

## Pull requests

Before opening a pull request:

1. Run JavaScript syntax checks:

   ```bash
   node --check service-worker.js
   node --check content-panel.js
   node --check duration-utils.js
   node tests/duration-utils.test.js
   ```

2. Validate JSON files:

   ```bash
   node -e "JSON.parse(require('fs').readFileSync('manifest.json', 'utf8'))"
   ```

3. Test the unpacked extension in Chrome or Edge.

## Scope

This project is intended for personal resource management and technical research. Contributions that encourage copyright infringement, account abuse, credential harvesting, or other misuse will not be accepted.
