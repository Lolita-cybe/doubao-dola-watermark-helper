# Changelog

## Unreleased

- Added local account notes in the downloader panel.
- Account notes store aliases, colors, notes, and capture counters in `chrome.storage.local`.
- Global switches remain shared across all accounts:
  - Enable
  - 15s
  - Watermark-free extraction
- The account feature does not save cookies, passwords, or session tokens.
- Added optional local session switching for Doubao / Dola accounts.
- Added `cookies` permission for saving and restoring local site sessions.
- Added semi-automatic account discovery:
  - Saved accounts are recognized instead of duplicated.
  - New accounts can be prompted for local session saving.
  - Existing accounts can update their saved session.
- Removed the account alias, note, and color editor from the panel.
- Added local session backup export/import.

## 1.4.0

- Added browser action click support to open the downloader panel.
- Added persistent feature switches:
  - Enable
  - 15s
  - Watermark-free extraction
- Added `storage` permission for local settings persistence.
- Added `ON` / `OFF` badge state.

## 1.3.x

- Added movable centered downloader panel.
- Added date filtering by captured resource date.
- Improved toolbar layout.
- Replaced the minimize icon with a standard horizontal mark.

## 1.2.0

- Added video preview.
- Added image preview.
- Added selected download and download-all controls.
- Added resource type filtering.

## 1.1.0

- Cleaned extension metadata.
- Added maintainability notes and debug switch.
- Centralized endpoint configuration.

## 1.0.0

- Initial functional version.
- Captures Doubao / Dola resources.
- Supports local 15-second configuration response replacement.
- Supports download panel.
