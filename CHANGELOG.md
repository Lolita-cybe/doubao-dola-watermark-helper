# Changelog

## 1.6.7

- Added a custom extension icon set for Chrome / Edge toolbar and extension management pages.
- Replaced the minimized launcher text with the new icon and resource-count badge.
- Made the minimized launcher draggable like a floating button.
- Removed the extra launcher frame so the minimized icon displays cleanly.

## 1.6.6

- Added a persistent night mode switch for the downloader panel.
- Fixed saved-account switching so restored accounts are not prompted as new accounts after refresh.
- Improved left-sidebar account-name recognition for numbered Doubao accounts.

## 1.6.5

- Added account-name search for filtering the saved multi-account list.

## 1.6.4

- Added unlimited local storage permission for multi-account session backups.
- Limited per-account webpage storage snapshots to avoid large page caches exhausting extension storage.
- Replaced the raw browser quota error with a clear Chinese recovery message.

## 1.6.3

- Fixed account names that include product words such as `豆包大王10号` being filtered as non-account text.
- Changed the saved-account selector into a scrollable multi-account list.
- Show the currently detected unsaved account in the account list so it is clear when it still needs to be saved.

## 1.6.2

- Added "save as current account" support so multiple Doubao accounts can be recorded without overwriting the detected current account profile.

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
