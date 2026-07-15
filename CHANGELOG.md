# Changelog

## 1.6.1

- Fixed account recognition priority so the left-sidebar logged-in account is used before generic page text.
- Filtered chat prompt text such as "有什么我能帮你的吗？" from account-name candidates.

## 1.6.0

- Added local account recognition in the downloader panel.
- Global switches remain shared across all accounts:
  - Enable
  - 15s
  - Watermark-free extraction
- Added optional local session switching for Doubao / Dola accounts.
- Added `cookies` permission for saving and restoring local site sessions.
- Added semi-automatic account discovery:
  - Saved accounts are recognized instead of duplicated.
  - New accounts can be prompted for local session saving.
  - Existing accounts can update their saved session.
- Added local session backup export/import.
- Removed the account alias, note, and color editor from the panel.

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
