(function () {
  const PANEL_ID = "watermark-free-media-panel";
  const DOUBAO_PLAY_INFO_URL = "https://www.doubao.com/samantha/media/get_play_info?version_code=20800&language=zh-CN&device_platform=web&aid=497858&real_aid=497858&pkg_type=release_version&device_id=&pc_version=2.51.7&region=&sys_region=&samantha_web=1&use-olympus-account=1&web_tab_id=";
  const ACCOUNT_STORAGE_KEY = "doubaoDolaHelperAccounts";
  const AUTO_DISCOVERY_STORAGE_KEY = "doubaoDolaHelperAutoDiscovery";
  const RESTORED_PROFILE_HINT_KEY = "doubaoDolaHelperRestoredProfileHint";

  const items = new Map();
  const selectedUrls = new Set();
  let currentSourceKey = "";
  let statusText = "等待捕获资源";
  let panelState = "open";
  let activeFilter = "all";
  let panelLeft = null;
  let panelTop = null;
  let launcherLeft = null;
  let launcherTop = null;
  let dragState = null;
  let launcherDragState = null;
  let settings = {
    enabled: true,
    durationOverrideEnabled: true,
    durationSeconds: 15,
    watermarkEnabled: true,
    darkModeEnabled: false
  };
  let accountProfile = null;
  let accountsById = {};
  let autoDiscoveryEnabled = true;

  if (document.getElementById(PANEL_ID)) {
    return;
  }

  const host = document.createElement("div");
  host.id = PANEL_ID;
  document.documentElement.appendChild(host);

  const shadow = host.attachShadow({ mode: "open" });
  shadow.innerHTML = `
    <style>
      :host {
        --bg: #f6f7f9;
        --surface: #ffffff;
        --surface-subtle: #f8fafc;
        --border: #dfe3e8;
        --border-strong: #cbd3dc;
        --primary: #2563eb;
        --primary-hover: #1d4ed8;
        --primary-soft: #eff6ff;
        --text: #1f2937;
        --text-secondary: #667085;
        --text-muted: #98a2b3;
        --danger: #dc2626;
        --danger-soft: #fef2f2;
        --success: #16803d;
        --radius: 8px;
        --radius-small: 6px;
        --control-height: 34px;
        --shadow: 0 14px 38px rgba(15, 23, 42, 0.14);
        --space-1: 4px;
        --space-2: 8px;
        --space-3: 12px;
        --space-4: 16px;
        --space-5: 20px;
        all: initial;
        position: fixed;
        inset: 0;
        z-index: 2147483647;
        pointer-events: none;
        font-family: Inter, "Segoe UI", "Microsoft YaHei", Arial, sans-serif;
        color: var(--text);
      }

      :host(.is-dark) {
        --bg: #111827;
        --surface: #1f2937;
        --surface-subtle: #273244;
        --border: #374151;
        --border-strong: #4b5563;
        --primary: #60a5fa;
        --primary-hover: #3b82f6;
        --primary-soft: #172554;
        --text: #f8fafc;
        --text-secondary: #cbd5e1;
        --text-muted: #94a3b8;
        --danger: #f87171;
        --danger-soft: #451a1a;
        --success: #4ade80;
        --shadow: 0 18px 44px rgba(0, 0, 0, 0.42);
      }

      *, *::before, *::after {
        box-sizing: border-box;
      }

      button, input, select {
        font: inherit;
      }

      button {
        -webkit-tap-highlight-color: transparent;
      }

      .launcher {
        position: fixed;
        right: 16px;
        bottom: 16px;
        width: 42px;
        height: 42px;
        display: none;
        align-items: center;
        justify-content: center;
        padding: 0;
        color: #ffffff;
        appearance: none;
        background: none;
        border: 0;
        border-radius: 12px;
        box-shadow: none;
        cursor: pointer;
        pointer-events: auto;
        touch-action: none;
        transition: border-color 150ms ease, box-shadow 150ms ease, transform 150ms ease;
      }

      .launcher:hover {
        transform: translateY(-1px);
      }

      :host(.is-dark) .settings-popover {
        box-shadow: 0 14px 34px rgba(0, 0, 0, 0.38);
      }

      .launcher.is-visible {
        display: flex;
      }

      .launcher-icon {
        width: 42px;
        height: 42px;
        display: block;
        border-radius: 12px;
        filter: drop-shadow(0 10px 18px rgba(15, 23, 42, 0.2));
      }

      .badge {
        min-width: 24px;
        height: 20px;
        padding: 0 7px;
        border-radius: 999px;
        color: var(--primary);
        background: var(--primary-soft);
        font-size: 12px;
        line-height: 20px;
        text-align: center;
        font-weight: 700;
      }

      .shell {
        position: fixed;
        left: 50%;
        top: 50%;
        width: min(1000px, calc(100vw - 32px));
        height: min(720px, calc(100vh - 32px));
        display: flex;
        flex-direction: column;
        transform: translate(-50%, -50%);
        color: var(--text);
        background: var(--bg);
        border: 1px solid var(--border-strong);
        border-radius: 10px;
        box-shadow: var(--shadow);
        overflow: hidden;
        pointer-events: auto;
      }

      .shell.is-hidden {
        display: none;
      }

      .topbar {
        min-height: 56px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--space-4);
        padding: 0 14px 0 18px;
        border-bottom: 1px solid var(--border);
        background: var(--surface);
        cursor: move;
        user-select: none;
      }

      .brand {
        min-width: 0;
        display: flex;
        align-items: baseline;
        gap: 10px;
      }

      .title {
        min-width: 0;
        margin: 0;
        overflow: hidden;
        color: var(--text);
        font-size: 16px;
        line-height: 24px;
        font-weight: 700;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .resource-count {
        flex: 0 0 auto;
        color: var(--text-secondary);
        font-size: 12px;
        white-space: nowrap;
      }

      .actions, .toolbar-actions, .filter-tabs {
        display: flex;
        align-items: center;
      }

      .actions {
        gap: 6px;
        flex: 0 0 auto;
        cursor: default;
      }

      .icon-button, .tool-button, .primary-button, .secondary-button, .card-button {
        min-height: var(--control-height);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 7px;
        border: 1px solid transparent;
        border-radius: var(--radius-small);
        cursor: pointer;
        white-space: nowrap;
        transition: color 150ms ease, background-color 150ms ease, border-color 150ms ease, box-shadow 150ms ease;
      }

      .icon-button {
        width: 34px;
        padding: 0;
        color: var(--text-secondary);
        background: transparent;
      }

      .icon-button:hover {
        color: var(--text);
        background: var(--surface-subtle);
      }

      .icon-button.close-button:hover {
        color: var(--danger);
        background: var(--danger-soft);
      }

      .icon {
        width: 16px;
        height: 16px;
        display: block;
        flex: 0 0 auto;
        fill: none;
        stroke: currentColor;
        stroke-width: 1.8;
        stroke-linecap: round;
        stroke-linejoin: round;
      }

      .settings-popover {
        position: absolute;
        z-index: 5;
        right: 14px;
        top: 50px;
        width: 292px;
        padding: 8px;
        visibility: hidden;
        opacity: 0;
        transform: translateY(-4px);
        color: var(--text);
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: var(--radius);
        box-shadow: 0 10px 28px rgba(15, 23, 42, 0.14);
        pointer-events: none;
        transition: opacity 150ms ease, transform 150ms ease, visibility 150ms ease;
      }

      .settings-popover.is-open {
        visibility: visible;
        opacity: 1;
        transform: translateY(0);
        pointer-events: auto;
      }

      .settings-heading {
        margin: 0;
        padding: 8px 10px 6px;
        font-size: 13px;
        font-weight: 700;
      }

      .switch {
        min-height: 58px;
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        align-items: center;
        gap: 12px;
        padding: 9px 10px;
        border-radius: var(--radius-small);
        cursor: pointer;
      }

      .switch:hover {
        background: var(--surface-subtle);
      }

      .switch-copy {
        min-width: 0;
      }

      .switch-name {
        display: block;
        color: var(--text);
        font-size: 13px;
        line-height: 19px;
        font-weight: 650;
      }

      .switch-description {
        display: block;
        margin-top: 1px;
        color: var(--text-secondary);
        font-size: 11px;
        line-height: 16px;
      }

      .switch input {
        position: absolute;
        opacity: 0;
        pointer-events: none;
      }

      .switch-track {
        position: relative;
        width: 34px;
        height: 19px;
        border-radius: 999px;
        background: #c7cdd4;
        transition: background-color 150ms ease;
      }

      .switch-track::after {
        content: "";
        position: absolute;
        left: 2px;
        top: 2px;
        width: 15px;
        height: 15px;
        border-radius: 50%;
        background: var(--surface);
        box-shadow: 0 1px 2px rgba(15, 23, 42, 0.2);
        transition: transform 150ms ease;
      }

      .switch input:checked + .switch-track {
        background: var(--primary);
      }

      .switch input:checked + .switch-track::after {
        transform: translateX(15px);
      }

      .switch input:focus-visible + .switch-track {
        outline: 2px solid rgba(37, 99, 235, 0.32);
        outline-offset: 2px;
      }

      .duration-control {
        margin: 0 10px 8px;
        padding: 8px 10px 10px;
        border: 1px solid var(--border);
        border-radius: var(--radius-small);
        background: var(--surface-subtle);
        transition: opacity 150ms ease;
      }

      .duration-control.is-disabled {
        opacity: 0.5;
      }

      .duration-control-head,
      .duration-marks {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .duration-control-head {
        margin-bottom: 5px;
        color: var(--text);
        font-size: 12px;
        line-height: 18px;
        font-weight: 650;
      }

      .duration-value {
        color: var(--primary);
        font: inherit;
        font-weight: 700;
      }

      .duration-range {
        display: block;
        width: 100%;
        height: 20px;
        margin: 0;
        accent-color: var(--primary);
        cursor: pointer;
      }

      .duration-range:disabled {
        cursor: not-allowed;
      }

      .duration-marks {
        color: var(--text-muted);
        font-size: 10px;
        line-height: 14px;
      }

      .account-panel {
        display: grid;
        grid-template-columns: auto minmax(0, 1fr) auto;
        align-items: center;
        gap: 10px;
        padding: 10px 16px;
        border-bottom: 1px solid var(--border);
        background: var(--surface);
      }

      .account-avatar {
        width: 34px;
        height: 34px;
        display: grid;
        place-items: center;
        border-radius: 50%;
        color: #fff;
        background: var(--account-color, #2563eb);
        font-size: 13px;
        font-weight: 800;
      }

      .account-copy {
        min-width: 0;
      }

      .account-title {
        min-width: 0;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .account-name {
        min-width: 0;
        overflow: hidden;
        color: var(--text);
        font-size: 13px;
        font-weight: 700;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .account-chip {
        flex: 0 0 auto;
        height: 20px;
        padding: 0 7px;
        border-radius: 999px;
        color: var(--success);
        background: #ecfdf3;
        font-size: 11px;
        line-height: 20px;
        font-weight: 700;
      }

      .launcher-count {
        position: absolute;
        right: -5px;
        top: -5px;
        min-width: 21px;
        height: 21px;
        padding: 0 6px;
        color: #ffffff;
        background: #1d4ed8;
        border: 2px solid var(--surface);
        line-height: 17px;
        box-shadow: 0 2px 8px rgba(15, 23, 42, 0.22);
      }

      :host(.is-dark) .account-chip {
        background: rgba(34, 197, 94, 0.16);
      }

      .account-meta {
        margin-top: 2px;
        overflow: hidden;
        color: var(--text-secondary);
        font-size: 11px;
        line-height: 16px;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .account-editor,
      .account-session-panel {
        display: none;
        grid-template-columns: minmax(0, 1fr);
        gap: 8px;
        padding: 10px 16px;
        border-bottom: 1px solid var(--border);
        background: var(--surface-subtle);
      }

      .account-editor.is-open,
      .account-session-panel.is-open {
        display: grid;
      }

      .account-alias-input,
      .account-note-input,
      .account-color-select,
      .account-save-button {
        display: none;
      }

      .account-field {
        min-width: 0;
        height: var(--control-height);
        padding: 0 10px;
        color: var(--text);
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: var(--radius-small);
        font-size: 12px;
      }

      :host(.is-dark) .account-field {
        color-scheme: dark;
      }

      .account-field::placeholder {
        color: var(--text-muted);
      }

      select.account-field {
        cursor: pointer;
      }

      .session-tools {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto auto auto auto auto;
        gap: 8px;
        align-items: start;
      }

      .session-profile-browser {
        display: grid;
        gap: 8px;
        min-width: 0;
      }

      .session-profile-search {
        width: 100%;
      }

      .session-profile-select {
        height: 112px;
        padding: 6px;
        overflow-y: auto;
      }

      .session-profile-select option {
        padding: 6px 8px;
      }

      .backup-file-input {
        display: none;
      }

      .auto-discovery-row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 8px 12px;
      }

      .auto-discovery-toggle {
        min-height: 28px;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        color: var(--text);
        font-size: 12px;
        font-weight: 650;
        cursor: pointer;
      }

      .auto-discovery-toggle input {
        width: 15px;
        height: 15px;
        margin: 0;
        accent-color: var(--primary);
      }

      .account-session-status {
        min-width: 0;
        color: var(--text-secondary);
        font-size: 12px;
        line-height: 18px;
      }

      .session-warning {
        color: var(--text-secondary);
        font-size: 11px;
        line-height: 16px;
      }

      .toolbar {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px 12px;
        padding: 10px 16px;
        border-bottom: 1px solid var(--border);
        background: var(--surface);
      }

      .filter-tabs {
        height: var(--control-height);
        padding: 3px;
        gap: 2px;
        border: 1px solid var(--border);
        border-radius: var(--radius-small);
        background: var(--surface-subtle);
      }

      .filter-button {
        height: 26px;
        min-width: 48px;
        padding: 0 11px;
        color: var(--text-secondary);
        background: transparent;
        border: 0;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
      }

      .filter-button:hover {
        color: var(--text);
      }

      .filter-button.is-active {
        color: var(--primary);
        background: var(--surface);
        box-shadow: 0 1px 3px rgba(15, 23, 42, 0.09);
      }

      .toolbar-actions {
        flex: 1 1 420px;
        flex-wrap: wrap;
        justify-content: flex-end;
        gap: 7px;
      }

      .tool-button, .secondary-button, .primary-button {
        height: var(--control-height);
        padding: 0 11px;
        font-size: 12px;
        font-weight: 650;
      }

      .tool-button {
        color: var(--text-secondary);
        background: transparent;
        border-color: var(--border);
      }

      .tool-button:hover {
        color: var(--text);
        border-color: var(--border-strong);
        background: var(--surface-subtle);
      }

      .secondary-button {
        color: var(--text);
        background: var(--surface);
        border-color: var(--border-strong);
      }

      .secondary-button:hover {
        background: var(--surface-subtle);
        border-color: #b8c2ce;
      }

      :host(.is-dark) .secondary-button:hover {
        border-color: var(--border-strong);
      }

      .primary-button {
        color: #fff;
        background: var(--primary);
        border-color: var(--primary);
      }

      .primary-button:hover {
        background: var(--primary-hover);
        border-color: var(--primary-hover);
      }

      .primary-button.is-active {
        box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.16);
      }

      button:disabled {
        cursor: not-allowed;
        opacity: 0.45;
        box-shadow: none !important;
      }

      button:disabled:hover {
        color: inherit;
        background: inherit;
        border-color: inherit;
      }

      button:focus-visible, input:focus-visible {
        outline: 2px solid rgba(37, 99, 235, 0.42);
        outline-offset: 2px;
      }

      .statusbar {
        min-height: 34px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 0 16px;
        color: var(--text-secondary);
        background: var(--bg);
        border-bottom: 1px solid var(--border);
        font-size: 12px;
      }

      .status-summary {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .toast {
        min-width: 0;
        color: var(--success);
        opacity: 0;
        transition: opacity 150ms ease;
        white-space: nowrap;
      }

      .toast.is-visible {
        opacity: 1;
      }

      .toast.is-error {
        color: var(--danger);
      }

      .content {
        flex: 1;
        min-height: 0;
        overflow: auto;
        padding: 14px 16px 18px;
        scrollbar-width: thin;
        scrollbar-color: #c7cdd4 transparent;
      }

      :host(.is-dark) .content {
        scrollbar-color: #4b5563 transparent;
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(240px, 280px));
        justify-content: start;
        align-items: start;
        gap: 12px;
      }

      .card {
        position: relative;
        min-width: 0;
        overflow: hidden;
        border: 1px solid var(--border);
        border-radius: var(--radius);
        background: var(--surface);
        transition: border-color 150ms ease, box-shadow 150ms ease, background-color 150ms ease;
      }

      .card:hover {
        border-color: var(--border-strong);
        box-shadow: 0 3px 10px rgba(15, 23, 42, 0.06);
      }

      :host(.is-dark) .card:hover {
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.22);
      }

      .card.is-selected {
        border-color: var(--primary);
        background: var(--primary-soft);
        box-shadow: 0 0 0 1px var(--primary);
      }

      .check-wrap {
        position: absolute;
        z-index: 2;
        right: 9px;
        top: 9px;
        width: 26px;
        height: 26px;
        display: grid;
        place-items: center;
        border-radius: 5px;
        background: rgba(255, 255, 255, 0.92);
        box-shadow: 0 1px 4px rgba(15, 23, 42, 0.12);
      }

      :host(.is-dark) .check-wrap {
        background: rgba(15, 23, 42, 0.86);
      }

      .check {
        width: 16px;
        height: 16px;
        margin: 0;
        accent-color: var(--primary);
        cursor: pointer;
      }

      .preview {
        position: relative;
        width: 100%;
        height: auto;
        aspect-ratio: var(--media-aspect, 9 / 16);
        display: grid;
        place-items: center;
        overflow: hidden;
        background: #eef1f4;
        border-bottom: 1px solid var(--border);
      }

      :host(.is-dark) .preview {
        background: #0f172a;
      }

      .preview.is-video {
        background: #161b22;
      }

      .preview img, .preview video {
        width: 100%;
        height: 100%;
        display: block;
        object-fit: contain;
      }

      .preview video {
        background: #161b22;
      }

      .type-pill {
        position: absolute;
        left: 9px;
        top: 9px;
        height: 22px;
        padding: 0 8px;
        border: 1px solid rgba(255, 255, 255, 0.62);
        border-radius: 999px;
        color: #344054;
        background: rgba(255, 255, 255, 0.9);
        font-size: 11px;
        line-height: 20px;
        font-weight: 700;
      }

      .preview.is-video .type-pill {
        color: #f8fafc;
        border-color: rgba(255, 255, 255, 0.22);
        background: rgba(15, 23, 42, 0.72);
      }

      .card-body {
        padding: 10px 11px 11px;
      }

      .card-meta {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        min-height: 20px;
      }

      .capture-time {
        min-width: 0;
        overflow: hidden;
        color: var(--text-secondary);
        font-size: 11px;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .card-actions {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 7px;
        margin-top: 9px;
      }

      .card-button {
        height: 32px;
        min-height: 32px;
        padding: 0 9px;
        color: var(--text-secondary);
        background: var(--surface);
        border-color: var(--border);
        font-size: 12px;
        font-weight: 650;
      }

      .card-button:hover {
        color: var(--text);
        border-color: var(--border-strong);
        background: var(--surface-subtle);
      }

      .card.is-selected .card-button {
        background: rgba(255, 255, 255, 0.82);
      }

      :host(.is-dark) .card.is-selected .card-button {
        background: rgba(15, 23, 42, 0.72);
      }

      .empty {
        min-height: 250px;
        display: grid;
        place-items: center;
        padding: 32px 16px;
        color: var(--text-secondary);
        text-align: center;
      }

      .empty-inner {
        display: grid;
        justify-items: center;
        gap: 8px;
      }

      .empty-icon {
        width: 34px;
        height: 34px;
        color: var(--text-muted);
      }

      .empty-icon .icon {
        width: 34px;
        height: 34px;
      }

      .empty-title {
        color: var(--text);
        font-size: 14px;
        font-weight: 650;
      }

      .empty-detail {
        max-width: 320px;
        font-size: 12px;
        line-height: 18px;
      }

      @media (max-width: 860px) {
        .toolbar-actions {
          flex-basis: 100%;
          justify-content: flex-start;
        }
      }

      @media (max-width: 760px) {
        .shell {
          left: 10px;
          top: 10px;
          right: 10px;
          bottom: 10px;
          width: auto;
          height: auto;
          transform: none;
        }

        .topbar {
          min-height: 52px;
          padding-left: 13px;
        }

        .title {
          font-size: 14px;
        }

        .toolbar {
          padding: 10px;
        }

        .statusbar {
          padding: 0 10px;
        }

        .content {
          padding: 10px;
        }
      }

      @media (max-width: 520px) {
        .shell {
          left: 6px;
          top: 6px;
          right: 6px;
          bottom: 6px;
          border-radius: 8px;
        }

        .brand {
          gap: 6px;
        }

        .title {
          max-width: calc(100vw - 150px);
        }

        .settings-popover {
          left: 8px;
          right: 8px;
          top: 48px;
          width: auto;
        }

        .filter-tabs {
          width: 100%;
        }

        .filter-button {
          flex: 1;
        }

        .toolbar-actions {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .account-panel {
          grid-template-columns: auto minmax(0, 1fr);
        }

        .account-edit-button {
          grid-column: 1 / -1;
          width: 100%;
        }

        .account-session-panel {
          grid-template-columns: 1fr;
          padding: 10px;
        }

        .session-tools {
          grid-template-columns: 1fr;
        }

        .toolbar-actions .primary-button,
        .toolbar-actions .secondary-button {
          width: 100%;
        }

        .grid {
          grid-template-columns: minmax(0, 280px);
        }

        .preview {
          aspect-ratio: var(--media-aspect, 9 / 16);
        }

        .statusbar {
          align-items: flex-start;
          flex-direction: column;
          justify-content: center;
          gap: 2px;
          padding-block: 6px;
        }

        .toast {
          min-height: 16px;
        }
      }
    </style>

    <button class="launcher" type="button" title="打开资源助手" aria-label="打开豆包和 Dola 资源助手">
      <svg class="launcher-icon" viewBox="0 0 128 128" aria-hidden="true">
        <defs>
          <linearGradient id="launcher-bg" x1="18" y1="14" x2="112" y2="118" gradientUnits="userSpaceOnUse">
            <stop offset="0" stop-color="#0f172a"></stop>
            <stop offset="0.52" stop-color="#1d4ed8"></stop>
            <stop offset="1" stop-color="#06b6d4"></stop>
          </linearGradient>
          <linearGradient id="launcher-mark" x1="38" y1="28" x2="92" y2="104" gradientUnits="userSpaceOnUse">
            <stop offset="0" stop-color="#ffffff"></stop>
            <stop offset="1" stop-color="#dbeafe"></stop>
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="128" height="128" rx="32" fill="url(#launcher-bg)"></rect>
        <text x="57" y="82" fill="url(#launcher-mark)" font-family="Segoe UI, Arial, sans-serif" font-size="62" font-weight="800" text-anchor="middle">D</text>
        <path d="M68 22v20m-10-10h20" fill="none" stroke="#67e8f9" stroke-width="7" stroke-linecap="round"></path>
        <path d="M88 74v23m0 0 10-10m-10 10L78 87" fill="none" stroke="#22d3ee" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"></path>
        <path d="M39 104h58" fill="none" stroke="#bae6fd" stroke-width="7" stroke-linecap="round" opacity="0.9"></path>
      </svg>
      <span class="badge launcher-count">0</span>
    </button>

    <section class="shell" role="dialog" aria-label="豆包和 Dola 资源助手">
      <header class="topbar">
        <div class="brand">
          <h2 class="title">豆包 / Dola 资源助手</h2>
          <span class="resource-count">0 项</span>
        </div>
        <div class="actions">
          <button class="icon-button settings-button" type="button" title="设置" aria-label="打开设置" aria-expanded="false">
            <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21h-4v-.1A1.7 1.7 0 0 0 8.6 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H3v-4h.1A1.7 1.7 0 0 0 4.6 8.6a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V3h4v.1A1.7 1.7 0 0 0 15.4 4a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9c.12.38.34.72.64 1 .3.27.68.42 1.08.42H21v4h-.1A1.7 1.7 0 0 0 19.4 15Z"></path></svg>
          </button>
          <button class="icon-button collapse-button" type="button" title="最小化面板" aria-label="最小化面板">
            <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"></path></svg>
          </button>
          <button class="icon-button close-button" type="button" title="关闭面板" aria-label="关闭面板">
            <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"></path></svg>
          </button>
        </div>
      </header>

      <aside class="settings-popover" aria-label="功能设置" aria-hidden="true">
        <h3 class="settings-heading">功能设置</h3>
        <label class="switch">
          <span class="switch-copy">
            <span class="switch-name">启用插件</span>
            <span class="switch-description">关闭后放行所有目标接口</span>
          </span>
          <input class="setting-toggle" data-setting="enabled" type="checkbox" />
          <span class="switch-track" aria-hidden="true"></span>
        </label>
        <label class="switch">
          <span class="switch-copy">
            <span class="switch-name">自定义视频时长</span>
            <span class="switch-description">生成时按插件设置覆盖豆包时长</span>
          </span>
          <input class="setting-toggle" data-setting="durationOverrideEnabled" type="checkbox" />
          <span class="switch-track" aria-hidden="true"></span>
        </label>
        <div class="duration-control">
          <div class="duration-control-head">
            <span>生成时长</span>
            <output class="duration-value">15 秒</output>
          </div>
          <input class="duration-range" type="range" min="4" max="15" step="1" value="15" aria-label="自定义视频时长" />
          <div class="duration-marks" aria-hidden="true">
            <span>4 秒</span>
            <span>15 秒</span>
          </div>
        </div>
        <label class="switch">
          <span class="switch-copy">
            <span class="switch-name">无水印资源</span>
            <span class="switch-description">控制原始图片和视频资源提取</span>
          </span>
          <input class="setting-toggle" data-setting="watermarkEnabled" type="checkbox" />
          <span class="switch-track" aria-hidden="true"></span>
        </label>
        <label class="switch">
          <span class="switch-copy">
            <span class="switch-name">夜晚模式</span>
            <span class="switch-description">切换资源助手面板深色外观</span>
          </span>
          <input class="setting-toggle" data-setting="darkModeEnabled" type="checkbox" />
          <span class="switch-track" aria-hidden="true"></span>
        </label>
      </aside>

      <section class="account-panel" aria-label="账号管理">
        <div class="account-avatar" aria-hidden="true">?</div>
        <div class="account-copy">
          <div class="account-title">
            <span class="account-name">正在识别当前账号</span>
            <span class="account-chip">本地记录</span>
          </div>
          <div class="account-meta">自定义视频时长和无水印资源开关为所有账号共享</div>
        </div>
        <button class="tool-button account-edit-button" type="button">账号备注</button>
      </section>

      <section class="account-editor" aria-label="账号备注编辑">
        <input class="account-field account-alias-input" type="text" maxlength="32" placeholder="账号别名，例如：主号 / 客户 A" />
        <input class="account-field account-note-input" type="text" maxlength="80" placeholder="备注，例如：视频生成 / 测试账号" />
        <select class="account-field account-color-select" aria-label="账号颜色">
          <option value="#2563eb">蓝色</option>
          <option value="#16803d">绿色</option>
          <option value="#c2410c">橙色</option>
          <option value="#7c3aed">紫色</option>
          <option value="#475467">灰色</option>
        </select>
        <button class="primary-button account-save-button" type="button">保存</button>
        <div class="auto-discovery-row">
          <label class="auto-discovery-toggle" hidden>
            <input class="auto-discovery-checkbox" type="checkbox" checked />
            <span>自动识别当前账号</span>
          </label>
          <div class="account-session-status">正在检查当前账号</div>
        </div>
        <div class="session-tools">
          <div class="session-profile-browser">
            <input class="account-field session-profile-search" type="search" placeholder="搜索账号名称" aria-label="搜索账号名称" autocomplete="off" />
            <select class="account-field session-profile-select" aria-label="历史账号记录" size="5">
              <option value="">暂无历史账号记录</option>
            </select>
          </div>
          <button class="secondary-button session-save-button" type="button" hidden disabled>登录态保存已停用</button>
          <button class="primary-button session-restore-button" type="button" disabled>切换已停用</button>
          <button class="tool-button session-delete-button" type="button" disabled>删除</button>
          <div class="session-warning">安全保护：历史登录态可能已被豆包作废，切换会覆盖当前全部账号，因此该功能已停用。多批账号请使用不同的 Chrome 用户配置。</div>
        </div>
      </section>

      <div class="toolbar">
        <div class="filter-tabs" role="group" aria-label="资源类型筛选">
          <button class="filter-button is-active" data-filter="all" type="button" aria-pressed="true">全部</button>
          <button class="filter-button" data-filter="video" type="button" aria-pressed="false">视频</button>
          <button class="filter-button" data-filter="image" type="button" aria-pressed="false">图片</button>
        </div>

        <div class="toolbar-actions">
          <button class="tool-button select-all-button" type="button" title="选择当前筛选结果中的全部资源">全选当前结果</button>
          <button class="tool-button clear-selection-button" type="button" title="取消全部资源选择">取消选择</button>
          <button class="tool-button source-button" type="button" title="复制当前筛选结果中的资源链接" aria-label="复制当前结果" disabled>
            <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="11" height="11" rx="2"></rect><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"></path></svg>
            <span>复制当前结果</span>
          </button>
          <button class="primary-button download-selected" type="button" title="下载当前筛选结果中已选中的资源" disabled>
            <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m0 0 4-4m-4 4-4-4M5 20h14"></path></svg>
            <span>下载选中</span>
          </button>
          <button class="secondary-button download-all" type="button" title="下载当前筛选结果中的全部资源" disabled>
            <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m0 0 4-4m-4 4-4-4M5 20h14"></path></svg>
            <span>下载当前结果</span>
          </button>
        </div>
      </div>

      <div class="statusbar">
        <span class="status-summary">已捕获 0 个资源 · 当前显示 0 个 · 已选择 0 个</span>
        <span class="toast" role="status" aria-live="polite"></span>
      </div>

      <main class="content">
        <div class="empty">等待捕获资源</div>
      </main>
    </section>
  `;

  const shell = shadow.querySelector(".shell");
  const launcher = shadow.querySelector(".launcher");
  const launcherCount = shadow.querySelector(".launcher-count");
  const content = shadow.querySelector(".content");
  const topbar = shadow.querySelector(".topbar");
  const resourceCount = shadow.querySelector(".resource-count");
  const settingToggles = Array.from(shadow.querySelectorAll(".setting-toggle"));
  const settingsButton = shadow.querySelector(".settings-button");
  const settingsPopover = shadow.querySelector(".settings-popover");
  const durationControl = shadow.querySelector(".duration-control");
  const durationRange = shadow.querySelector(".duration-range");
  const durationValue = shadow.querySelector(".duration-value");
  const filterButtons = Array.from(shadow.querySelectorAll(".filter-button"));
  const selectAllButton = shadow.querySelector(".select-all-button");
  const clearSelectionButton = shadow.querySelector(".clear-selection-button");
  const downloadSelectedButton = shadow.querySelector(".download-selected");
  const downloadSelectedLabel = downloadSelectedButton.querySelector("span");
  const downloadAllButton = shadow.querySelector(".download-all");
  const downloadAllLabel = downloadAllButton.querySelector("span");
  const sourceButton = shadow.querySelector(".source-button");
  const statusSummary = shadow.querySelector(".status-summary");
  const toast = shadow.querySelector(".toast");
  const collapseButton = shadow.querySelector(".collapse-button");
  const closeButton = shadow.querySelector(".close-button");
  const accountPanel = shadow.querySelector(".account-panel");
  const accountAvatar = shadow.querySelector(".account-avatar");
  const accountName = shadow.querySelector(".account-name");
  const accountMeta = shadow.querySelector(".account-meta");
  const accountEditor = shadow.querySelector(".account-editor");
  const accountEditButton = shadow.querySelector(".account-edit-button");
  const accountAliasInput = shadow.querySelector(".account-alias-input");
  const accountNoteInput = shadow.querySelector(".account-note-input");
  const accountColorSelect = shadow.querySelector(".account-color-select");
  const accountSaveButton = shadow.querySelector(".account-save-button");
  const sessionProfileSearch = shadow.querySelector(".session-profile-search");
  const sessionProfileSelect = shadow.querySelector(".session-profile-select");
  const sessionSaveButton = shadow.querySelector(".session-save-button");
  const sessionSaveNewButton = document.createElement("button");
  const sessionRestoreButton = shadow.querySelector(".session-restore-button");
  const sessionDeleteButton = shadow.querySelector(".session-delete-button");
  const backupExportButton = document.createElement("button");
  const backupImportButton = document.createElement("button");
  const backupFileInput = document.createElement("input");
  const autoDiscoveryCheckbox = shadow.querySelector(".auto-discovery-checkbox");
  const accountSessionStatus = shadow.querySelector(".account-session-status");
  let toastTimer = null;
  let sessionProfiles = [];
  let sessionProfileQuery = "";
  const promptedAccountIds = new Set();

  setupBackupControls();

  launcher.addEventListener("pointerdown", startLauncherDrag);
  launcher.addEventListener("click", (event) => {
    if (launcherDragState?.moved) {
      event.preventDefault();
      return;
    }
    panelState = "open";
    updatePanelVisibility();
  });

  collapseButton.addEventListener("click", () => {
    panelState = "minimized";
    updatePanelVisibility();
  });

  closeButton.addEventListener("click", () => {
    panelState = "closed";
    updatePanelVisibility();
  });

  accountEditButton.addEventListener("click", () => {
    accountEditor.classList.toggle("is-open");
  });
  accountEditButton.textContent = "账号管理";

  accountSaveButton.addEventListener("click", () => {
    saveAccountProfile();
  });

  autoDiscoveryCheckbox.addEventListener("change", () => {
    autoDiscoveryEnabled = autoDiscoveryCheckbox.checked;
    chrome.storage.local.set({ [AUTO_DISCOVERY_STORAGE_KEY]: autoDiscoveryEnabled });
    updateAccountSessionStatus();
    maybePromptSaveDetectedAccount();
  });

  sessionProfileSelect.addEventListener("change", updateSessionButtons);
  sessionProfileSearch.addEventListener("input", () => {
    sessionProfileQuery = sessionProfileSearch.value.trim();
    renderSessionProfiles(sessionProfileSelect.value);
  });
  sessionDeleteButton.addEventListener("click", deleteSelectedSessionProfile);
  backupExportButton.addEventListener("click", exportSessionBackup);
  backupImportButton.addEventListener("click", () => backupFileInput.click());
  backupFileInput.addEventListener("change", importSessionBackup);

  settingsButton.addEventListener("click", () => {
    setSettingsOpen(!settingsPopover.classList.contains("is-open"));
  });

  window.addEventListener("pointerdown", (event) => {
    if (!settingsPopover.classList.contains("is-open")) {
      return;
    }
    const path = event.composedPath();
    if (!path.includes(settingsPopover) && !path.includes(settingsButton)) {
      setSettingsOpen(false);
    }
  });

  settingToggles.forEach((toggle) => {
    toggle.addEventListener("change", () => {
      settings = {
        ...settings,
        [toggle.dataset.setting]: toggle.checked
      };
      applySettings(settings);
      persistSettings();
    });
  });

  durationRange.addEventListener("input", () => {
    settings = {
      ...settings,
      durationSeconds: clampDuration(durationRange.value)
    };
    updateDurationControl();
  });

  durationRange.addEventListener("change", () => {
    settings = {
      ...settings,
      durationSeconds: clampDuration(durationRange.value)
    };
    applySettings(settings);
    persistSettings();
  });

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.filter;
      updateFilterUI();
      render();
    });
  });

  selectAllButton.addEventListener("click", () => {
    getFilteredItems().forEach((item) => selectedUrls.add(item.url));
    updateVisibleSelectionUI();
    updateToolbarState();
  });

  clearSelectionButton.addEventListener("click", () => {
    selectedUrls.clear();
    updateVisibleSelectionUI();
    updateToolbarState();
  });

  topbar.addEventListener("pointerdown", startDrag);
  topbar.addEventListener("dblclick", () => {
    panelLeft = null;
    panelTop = null;
    applyPanelPosition();
  });
  window.addEventListener("pointermove", moveDrag);
  window.addEventListener("pointermove", moveLauncherDrag);
  window.addEventListener("pointerup", endDrag);
  window.addEventListener("pointerup", endLauncherDrag);
  window.addEventListener("resize", applyPanelPosition);

  downloadSelectedButton.addEventListener("click", () => {
    downloadUrls(getSelectedFilteredUrls());
  });

  downloadAllButton.addEventListener("click", () => {
    downloadUrls(getFilteredItems().map((item) => item.url));
  });

  sourceButton.addEventListener("click", async () => {
    const urls = getFilteredItems().map((item) => item.url);
    if (!urls.length) {
      return;
    }

    try {
      await navigator.clipboard.writeText(urls.join("\n"));
      showToast("已复制当前结果", "success");
    } catch {
      showToast("复制失败，请检查剪贴板权限", "error");
    }
  });

  chrome.runtime.sendMessage({ type: "GET_SETTINGS" }, (response) => {
    if (response?.settings) {
      settings = response.settings;
      applySettings(settings);
    }
  });

  loadAccountProfile();
  loadAutoDiscoverySetting();
  loadSessionProfiles();

  chrome.runtime.onMessage.addListener((message) => {
    if (!message) {
      return;
    }

    if (message.type === "SHOW_PANEL") {
      panelState = "open";
      updatePanelVisibility();
      return;
    }

    if (message.type === "SETTINGS_UPDATED" && message.settings) {
      settings = message.settings;
      applySettings(settings);
      return;
    }

    if (message.type === "DURATION_APPLIED") {
      showToast(`已按插件设置使用 ${clampDuration(message.duration)} 秒`, "success");
      return;
    }

    if (message.type === "MEDIA_STATUS" && typeof message.text === "string") {
      resetForSource(message.sourceKey);
      items.clear();
      selectedUrls.clear();
      statusText = message.text;
      render();
      return;
    }

    if (message.type === "MEDIA_FOUND" && Array.isArray(message.items)) {
      resetForSource(message.sourceKey);
      items.clear();
      selectedUrls.clear();
      addItems(message.items);
      statusText = items.size ? "" : "未提取到资源";
      render();
      return;
    }

    if (message.type === "DOUBAO_VIDS_FOUND" && Array.isArray(message.vids)) {
      resetForSource(message.sourceKey);
      fetchDoubaoVideos(message.sourceKey, message.vids);
    }
  });

  function setupBackupControls() {
    const sessionTools = shadow.querySelector(".session-tools");
    if (!sessionTools) {
      return;
    }

    backupExportButton.className = "tool-button backup-export-button";
    backupExportButton.type = "button";
    backupExportButton.textContent = "导出备份";

    backupImportButton.className = "tool-button backup-import-button";
    backupImportButton.type = "button";
    backupImportButton.textContent = "导入备份";

    backupFileInput.className = "backup-file-input";
    backupFileInput.type = "file";
    backupFileInput.accept = "application/json,.json";

    sessionSaveNewButton.className = "secondary-button session-save-new-button";
    sessionSaveNewButton.type = "button";
    sessionSaveNewButton.textContent = "登录态保存已停用";
    sessionSaveNewButton.hidden = true;
    sessionSaveNewButton.disabled = true;

    sessionSaveButton.insertAdjacentElement("afterend", sessionSaveNewButton);
    sessionDeleteButton.insertAdjacentElement("afterend", backupExportButton);
    backupExportButton.insertAdjacentElement("afterend", backupImportButton);
    backupImportButton.insertAdjacentElement("afterend", backupFileInput);
  }

  async function loadAccountProfile() {
    const detected = detectCurrentAccount();
    try {
      const stored = await chrome.storage.local.get(ACCOUNT_STORAGE_KEY);
      accountsById = stored[ACCOUNT_STORAGE_KEY] || {};
    } catch {
      accountsById = {};
    }

    const existing = accountsById[detected.id] || {};
    accountProfile = {
      id: detected.id,
      detectedName: detected.name,
      hasIdentity: detected.hasIdentity,
      alias: existing.alias || "",
      note: existing.note || "",
      color: existing.color || "#2563eb",
      firstSeenAt: existing.firstSeenAt || Date.now(),
      lastSeenAt: Date.now(),
      lastCapturedAt: existing.lastCapturedAt || 0,
      capturedCount: Number(existing.capturedCount || 0)
    };
    accountsById[accountProfile.id] = accountProfile;
    await persistAccounts();
    renderAccountProfile();
    updateAccountSessionStatus();
    maybePromptSaveDetectedAccount();
  }

  async function loadAutoDiscoverySetting() {
    try {
      const stored = await chrome.storage.local.get(AUTO_DISCOVERY_STORAGE_KEY);
      autoDiscoveryEnabled = stored[AUTO_DISCOVERY_STORAGE_KEY] !== false;
    } catch {
      autoDiscoveryEnabled = true;
    }
    autoDiscoveryCheckbox.checked = autoDiscoveryEnabled;
    updateAccountSessionStatus();
    maybePromptSaveDetectedAccount();
  }

  async function saveAccountProfile() {
    if (!accountProfile) {
      return;
    }

    accountProfile = {
      ...accountProfile,
      alias: accountAliasInput.value.trim(),
      note: accountNoteInput.value.trim(),
      color: accountColorSelect.value || "#2563eb",
      lastSeenAt: Date.now()
    };
    accountsById[accountProfile.id] = accountProfile;
    await persistAccounts();
    renderAccountProfile();
    accountEditor.classList.remove("is-open");
    showToast("账号备注已保存", "success");
  }

  async function noteAccountCapture(count) {
    if (!accountProfile || count <= 0) {
      return;
    }

    accountProfile = {
      ...accountProfile,
      capturedCount: Number(accountProfile.capturedCount || 0) + count,
      lastCapturedAt: Date.now(),
      lastSeenAt: Date.now()
    };
    accountsById[accountProfile.id] = accountProfile;
    renderAccountProfile();
    try {
      await persistAccounts();
    } catch {
      // Account notes are best-effort only; resource capture should not fail.
    }
  }

  async function persistAccounts() {
    await chrome.storage.local.set({ [ACCOUNT_STORAGE_KEY]: accountsById });
  }

  async function loadSessionProfiles() {
    chrome.runtime.sendMessage({ type: "GET_SESSION_PROFILES" }, (response) => {
      sessionProfiles = Array.isArray(response?.profiles) ? response.profiles : [];
      renderSessionProfiles();
      updateAccountSessionStatus();
      maybePromptSaveDetectedAccount();
    });
  }

  async function saveCurrentSessionProfile(options = {}) {
    const name = accountProfile?.detectedName || "未命名账号";
    const profileId = options.forceNew ? "" : (options.profileId || getProfileForCurrentAccount()?.id || "");
    if (!options.skipConfirm) {
      const confirmed = window.confirm(profileId
        ? `更新「${name}」的本机登录态？`
        : `保存「${name}」的当前豆包/Dola 登录态到本机？`);
      if (!confirmed) {
        return;
      }
    }

    if (!accountProfile?.id || !accountProfile.hasIdentity) {
      showToast("当前页面未确认登录账号，请先完成登录", "error");
      return;
    }

    sessionSaveButton.disabled = true;
    chrome.runtime.sendMessage({
      type: "SAVE_SESSION_PROFILE",
      profileId,
      name,
      accountId: accountProfile.id,
      url: location.href,
      localStorage: collectSessionStorage(window.localStorage),
      sessionStorage: collectSessionStorage(window.sessionStorage)
    }, (response) => {
      sessionSaveButton.disabled = false;
      if (!response?.ok) {
        showToast(formatSessionSaveError(response?.error), "error");
        return;
      }
      sessionProfiles = response.profiles || [];
      renderSessionProfiles(response.profile?.id);
      updateAccountSessionStatus();
      showToast(profileId ? "当前登录态已更新" : "当前登录态已保存", "success");
    });
  }

  async function restoreSelectedSessionProfile() {
    showToast("为保护当前已登录账号，登录态切换功能已停用", "error");
  }

  async function deleteSelectedSessionProfile() {
    const profileId = sessionProfileSelect.value;
    const profile = sessionProfiles.find((item) => item.id === profileId);
    if (!profile || !window.confirm(`删除本机保存的「${profile.name}」登录态？`)) {
      return;
    }

    chrome.runtime.sendMessage({ type: "DELETE_SESSION_PROFILE", profileId }, (response) => {
      if (!response?.ok) {
        showToast(response?.error || "删除登录态失败", "error");
        return;
      }
      sessionProfiles = response.profiles || [];
      renderSessionProfiles();
      showToast("登录态已删除", "success");
    });
  }

  async function exportSessionBackup() {
    if (!sessionProfiles.length) {
      showToast("暂无可导出的登录态", "error");
      return;
    }
    const confirmed = window.confirm("导出的备份包含本机登录态，等同账号钥匙。请只保存在自己的电脑，不要发送给别人。继续导出？");
    if (!confirmed) {
      return;
    }

    chrome.runtime.sendMessage({ type: "EXPORT_SESSION_BACKUP" }, (response) => {
      if (!response?.ok) {
        showToast(response?.error || "导出备份失败", "error");
        return;
      }
      showToast(`已导出 ${response.count || 0} 个登录态`, "success");
    });
  }

  async function importSessionBackup(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }

    const confirmed = window.confirm("导入备份会把文件中的登录态合并到本机账号列表。请确认这是你自己的备份文件。继续导入？");
    if (!confirmed) {
      return;
    }

    try {
      const text = await file.text();
      const backup = JSON.parse(text);
      chrome.runtime.sendMessage({ type: "IMPORT_SESSION_BACKUP", backup }, (response) => {
        if (!response?.ok) {
          showToast(response?.error || "导入备份失败", "error");
          return;
        }
        sessionProfiles = response.profiles || [];
        renderSessionProfiles();
        updateAccountSessionStatus();
        showToast(`已导入，当前共 ${sessionProfiles.length} 个登录态`, "success");
      });
    } catch {
      showToast("备份文件不是有效 JSON", "error");
    }
  }

  function renderSessionProfiles(selectedId = "") {
    sessionProfileSelect.textContent = "";
    const currentProfile = getProfileForCurrentAccount();
    const normalizedQuery = normalizeName(sessionProfileQuery);
    const filteredProfiles = sessionProfiles.filter((profile) => (
      !normalizedQuery || normalizeName(profile.name).includes(normalizedQuery)
    ));
    const effectiveSelectedId = selectedId || currentProfile?.id || "";
    if (!sessionProfiles.length) {
      const option = document.createElement("option");
      option.value = "";
      option.textContent = "暂无历史账号记录";
      sessionProfileSelect.append(option);
      updateSessionButtons();
      return;
    }

    for (const profile of filteredProfiles) {
      const option = document.createElement("option");
      option.value = profile.id;
      option.textContent = `${profile.name} · ${formatShortTime(profile.savedAt)} · 历史快照`;
      sessionProfileSelect.append(option);
    }

    if (!sessionProfileSelect.options.length) {
      const option = document.createElement("option");
      option.value = "";
      option.textContent = `未找到名称包含“${sessionProfileQuery}”的账号`;
      sessionProfileSelect.append(option);
    } else if (effectiveSelectedId && Array.from(sessionProfileSelect.options).some((option) => option.value === effectiveSelectedId)) {
      sessionProfileSelect.value = effectiveSelectedId;
    }
    updateSessionButtons();
  }

  function getProfileForCurrentAccount() {
    if (!accountProfile?.id) {
      return null;
    }
    return sessionProfiles.find((profile) => profile.accountId === accountProfile.id)
      || sessionProfiles.find((profile) => normalizeName(profile.name) === normalizeName(accountProfile.detectedName));
  }

  function updateAccountSessionStatus() {
    if (!accountSessionStatus || !accountProfile) {
      return;
    }

    sessionSaveButton.disabled = true;
    sessionSaveNewButton.disabled = true;
    if (!accountProfile.hasIdentity) {
      accountSessionStatus.textContent = "当前页面未确认登录账号 · 登录态切换已停用";
      return;
    }

    const profile = getProfileForCurrentAccount();
    if (profile) {
      accountSessionStatus.textContent = `历史记录：${profile.name} · 登录态切换已停用`;
      return;
    }

    accountSessionStatus.textContent = `当前账号：${accountProfile.detectedName || "当前账号"} · 不保存登录态`;
  }

  function maybePromptSaveDetectedAccount() {
    // Account identity is recorded locally, but session cookies are never saved automatically.
  }

  function updateSessionButtons() {
    const hasProfile = Boolean(sessionProfileSelect.value);
    sessionRestoreButton.disabled = true;
    sessionDeleteButton.disabled = !hasProfile;
  }

  function normalizeName(value) {
    return String(value || "").trim().toLowerCase();
  }

  function setRestoredProfileHint(profile) {
    try {
      window.sessionStorage.setItem(RESTORED_PROFILE_HINT_KEY, JSON.stringify({
        profileId: profile.id,
        name: profile.name,
        accountId: profile.accountId || "",
        savedAt: Date.now()
      }));
    } catch {
      // The hint only avoids duplicate save prompts after a switch.
    }
  }

  function getRestoredProfileHint() {
    try {
      const parsed = safeParseJson(window.sessionStorage.getItem(RESTORED_PROFILE_HINT_KEY));
      if (!parsed || Date.now() - Number(parsed.savedAt || 0) > 5 * 60 * 1000) {
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  }

  function formatSessionSaveError(error) {
    const message = String(error || "");
    if (/quota|QuotaBytes|QUOTA_BYTES/i.test(message)) {
      return "本地存储空间不足。请重新加载插件后再保存；新版本已扩展账号备份容量。";
    }
    return message || "保存登录态失败";
  }

  function collectSessionStorage(storage) {
    const data = {};
    const maxEntryBytes = 64 * 1024;
    const maxTotalBytes = 512 * 1024;
    let totalBytes = 0;
    try {
      for (let i = 0; i < storage.length; i += 1) {
        const key = storage.key(i);
        if (key) {
          const value = storage.getItem(key);
          const entryBytes = String(key).length + String(value || "").length;
          if (entryBytes > maxEntryBytes || totalBytes + entryBytes > maxTotalBytes) {
            continue;
          }
          data[key] = value;
          totalBytes += entryBytes;
        }
      }
    } catch {
      return {};
    }
    return data;
  }

  function restoreStorage(storage, data) {
    try {
      storage.clear();
      for (const [key, value] of Object.entries(data || {})) {
        storage.setItem(key, value);
      }
    } catch (error) {
      console.warn("restore storage failed:", error);
    }
  }

  function renderAccountProfile() {
    if (!accountProfile) {
      return;
    }

    const displayName = accountProfile.detectedName || "当前账号";
    const color = "#2563eb";
    accountPanel.style.setProperty("--account-color", color);
    accountAvatar.textContent = getAccountInitial(displayName);
    accountName.textContent = displayName;

    const captured = accountProfile.capturedCount ? ` · 已记录 ${accountProfile.capturedCount} 个资源` : "";
    const lastCaptured = accountProfile.lastCapturedAt ? ` · 最近 ${formatShortTime(accountProfile.lastCapturedAt)}` : "";
    accountMeta.textContent = `全局共享：自定义视频时长 / 无水印资源${captured}${lastCaptured}`;
  }

  function detectCurrentAccount() {
    const storedIdentity = findStoredAccountIdentity();
    const sidebarName = findSidebarAccountName();
    const visibleName = findVisibleAccountName();
    const storedName = isUsefulAccountName(storedIdentity.name) ? storedIdentity.name : "";
    const name = sidebarName || visibleName || storedName || "当前账号";
    const hasIdentity = !isLikelyLoggedOutPage()
      && Boolean(sidebarName || visibleName || storedName || storedIdentity.id || storedIdentity.tokenHint);
    const rawId = storedIdentity.id || storedIdentity.tokenHint || name || location.hostname;
    return {
      id: `account_${hashString(`${location.hostname}:${rawId}`)}`,
      name,
      hasIdentity
    };
  }

  function isLikelyLoggedOutPage() {
    const loginLabels = /^(登录|立即登录|扫码登录|手机号登录|验证码登录|Log in|Sign in)$/i;
    const controls = Array.from(document.querySelectorAll("button, a, [role='button']")).slice(0, 300);
    return controls.some((control) => {
      const label = cleanAccountCandidate(
        control.getAttribute("aria-label")
          || control.getAttribute("title")
          || getDirectText(control)
          || control.textContent
          || ""
      );
      if (!loginLabels.test(label)) {
        return false;
      }
      const rect = control.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    });
  }

  function findStoredAccountIdentity() {
    const result = { id: "", name: "", tokenHint: "" };
    const keys = [
      "userInfo",
      "user_info",
      "accountInfo",
      "account_info",
      "currentUser",
      "current_user",
      "user",
      "profile"
    ];

    for (const storage of [window.localStorage, window.sessionStorage]) {
      for (const key of keys) {
        const value = safeGetStorageItem(storage, key);
        if (!value) {
          continue;
        }
        const parsed = safeParseJson(value);
        if (parsed && typeof parsed === "object") {
          result.id = result.id || String(parsed.id || parsed.userId || parsed.user_id || parsed.uid || "");
          result.name = result.name || String(parsed.name || parsed.nickname || parsed.nickName || parsed.userName || parsed.username || "");
        } else if (!result.tokenHint && value.length > 12) {
          result.tokenHint = hashString(`${key}:${value}`);
        }
        if (result.id || result.name) {
          return result;
        }
      }
    }
    return result;
  }

  function findVisibleAccountName() {
    const sidebarName = findSidebarAccountName();
    if (sidebarName) {
      return sidebarName;
    }

    const selectors = [
      "[class*='user'] [title]",
      "[class*='account'] [title]",
      "[class*='avatar'][title]",
      "[class*='profile'] [title]",
      "[class*='user']",
      "[class*='account']",
      "[class*='profile']",
      "img[alt]"
    ];
    for (const selector of selectors) {
      const nodes = Array.from(document.querySelectorAll(selector)).slice(0, 80);
      for (const node of nodes) {
        const candidate = cleanAccountCandidate(node.getAttribute("title") || node.getAttribute("alt") || getDirectText(node) || node.textContent || "");
        if (isUsefulAccountName(candidate)) {
          return candidate;
        }
      }
    }

    return "";
  }

  function findSidebarAccountName() {
    const candidates = [];
    const nodes = Array.from(document.querySelectorAll("button, a, div, span, [title], [aria-label]"));
    for (const node of nodes) {
      const candidate = cleanAccountCandidate(
        node.getAttribute("title")
          || node.getAttribute("aria-label")
          || getDirectText(node)
          || node.textContent
          || ""
      );
      if (!isUsefulAccountName(candidate)) {
        continue;
      }

      const rect = node.getBoundingClientRect();
      if (!rect.width || !rect.height || rect.left > 360) {
        continue;
      }

      let score = 0;
      if (rect.bottom > window.innerHeight - 140) score += 40;
      if (rect.bottom > window.innerHeight - 80) score += 30;
      if (rect.left < 120) score += 12;
      if (/号|hao|account|user|profile/i.test(candidate)) score += 18;
      if (/豆包.*\d+\s*号|闲鱼.*\d+\s*号|咸鱼.*\d+\s*号/.test(candidate)) score += 26;
      if (node.closest("[class*='user'], [class*='account'], [class*='profile'], [class*='avatar']")) score += 16;
      if (node.querySelector("img, svg") || node.parentElement?.querySelector("img, svg")) score += 8;
      candidates.push({ candidate, score, top: rect.top });
    }

    candidates.sort((a, b) => b.score - a.score || b.top - a.top);
    return candidates[0]?.candidate || "";
  }

  function getDirectText(node) {
    return Array.from(node.childNodes || [])
      .filter((child) => child.nodeType === Node.TEXT_NODE)
      .map((child) => child.textContent)
      .join(" ");
  }

  function cleanAccountCandidate(value) {
    return String(value || "")
      .replace(/\s+/g, " ")
      .replace(/[›>]+$/g, "")
      .trim();
  }

  function isUsefulAccountName(value) {
    if (!value || value.length < 2 || value.length > 24) {
      return false;
    }
    if (/当前账号|有什么|我能帮|帮你|提示词|生成|建议|问题|回答|新对话|主对话|\?|\？/.test(value)) {
      return false;
    }
    if (/\d+\s*号$|号$|hao$/i.test(value)) {
      return true;
    }
    return !/豆包|Dola|logo|avatar|image|icon|搜索|下载|新对话|新办公任务|AI 创作|云盘|更多|收藏夹|文件夹|历史对话|主对话|Ctrl|Shift|全部|视频|图片|资源|助手|备注|保存/i.test(value);
  }

  function safeGetStorageItem(storage, key) {
    try {
      return storage.getItem(key);
    } catch {
      return "";
    }
  }

  function safeParseJson(value) {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }

  function getAccountInitial(name) {
    return String(name || "?").trim().slice(0, 1).toUpperCase() || "?";
  }

  function hashString(value) {
    let hash = 2166136261;
    for (let i = 0; i < value.length; i += 1) {
      hash ^= value.charCodeAt(i);
      hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    }
    return (hash >>> 0).toString(36);
  }

  function formatShortTime(timestamp) {
    return new Intl.DateTimeFormat("zh-CN", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(timestamp));
  }

  async function fetchDoubaoVideos(sourceKey, vids) {
    const uniqueVids = Array.from(new Set(vids.filter((vid) => typeof vid === "string" && vid)));
    if (!uniqueVids.length) {
      return;
    }

    statusText = items.size ? "" : "正在获取豆包无水印视频";
    render();

    const foundItems = [];
    for (const vid of uniqueVids) {
      const url = await getDoubaoOriginalVideoUrl(vid);
      if (isHttpUrl(url)) {
        foundItems.push({ type: "video", url });
      }
    }

    if (sourceKey !== currentSourceKey) {
      return;
    }

    addItems(foundItems);
    statusText = items.size ? "" : "未提取到资源";
    render();
  }

  async function getDoubaoOriginalVideoUrl(vid) {
    try {
      const response = await fetch(DOUBAO_PLAY_INFO_URL, {
        method: "POST",
        credentials: "omit",
        headers: {
          "accept": "application/json, text/plain, */*",
          "content-type": "application/json"
        },
        body: JSON.stringify({ key: vid })
      });
      const json = await response.json();
      const url = json?.data?.original_media_info?.main_url;
      return isHttpUrl(url) ? url : "";
    } catch (error) {
      console.warn("doubao play info failed:", error);
      return "";
    }
  }

  function resetForSource(sourceKey) {
    if (typeof sourceKey !== "string" || !sourceKey) {
      return;
    }

    if (sourceKey !== currentSourceKey) {
      currentSourceKey = sourceKey;
      items.clear();
      selectedUrls.clear();
      statusText = "";
    }
  }

  function render() {
    launcherCount.textContent = String(items.size);
    resourceCount.textContent = `${items.size} 项`;
    updatePanelVisibility();

    const filteredItems = getFilteredItems();
    updateToolbarState(filteredItems);
    renderResourceList(filteredItems);
  }

  function updatePanelVisibility() {
    shell.classList.toggle("is-hidden", panelState !== "open");
    launcher.classList.toggle("is-visible", panelState === "minimized");
    applyPanelPosition();
  }

  function updateToolbarState(filteredItems = getFilteredItems()) {
    const selectedCount = filteredItems.reduce(
      (count, item) => count + (selectedUrls.has(item.url) ? 1 : 0),
      0
    );

    downloadSelectedButton.classList.toggle("is-active", selectedCount > 0);
    downloadSelectedLabel.textContent = selectedCount ? `下载选中 ${selectedCount}` : "下载选中";
    downloadSelectedButton.disabled = selectedCount === 0;

    downloadAllLabel.textContent = filteredItems.length
      ? `下载当前结果 ${filteredItems.length}`
      : "下载当前结果";
    downloadAllButton.disabled = filteredItems.length === 0;
    sourceButton.disabled = filteredItems.length === 0;
    selectAllButton.disabled = filteredItems.length === 0
      || filteredItems.every((item) => selectedUrls.has(item.url));
    clearSelectionButton.disabled = selectedUrls.size === 0;

    statusSummary.textContent = settings.enabled
      ? `已捕获 ${items.size} 个资源 · 当前显示 ${filteredItems.length} 个 · 已选择 ${selectedCount} 个`
      : `插件已关闭 · 已捕获 ${items.size} 个资源 · 当前显示 ${filteredItems.length} 个`;
  }

  function renderResourceList(filteredItems) {
    content.textContent = "";

    if (!filteredItems.length) {
      content.appendChild(createEmptyState());
      return;
    }

    const grid = document.createElement("div");
    grid.className = "grid";

    filteredItems.forEach((item, index) => {
      grid.appendChild(createCard(item, index));
    });

    content.appendChild(grid);
  }

  function createCard(item, index) {
    const card = document.createElement("article");
    card.className = "card";
    card.dataset.resourceUrl = item.url;
    card.classList.toggle("is-selected", selectedUrls.has(item.url));

    const checkbox = document.createElement("input");
    checkbox.className = "check";
    checkbox.type = "checkbox";
    checkbox.checked = selectedUrls.has(item.url);
    checkbox.title = "选择资源";
    checkbox.addEventListener("change", () => {
      updateSelection(item.url, checkbox.checked, card);
    });

    const checkWrap = document.createElement("label");
    checkWrap.className = "check-wrap";
    checkWrap.title = "选择资源";
    checkWrap.append(checkbox);

    const preview = document.createElement("div");
    preview.className = "preview";
    preview.classList.toggle("is-video", item.type === "video");
    preview.title = item.url;

    const pill = document.createElement("span");
    pill.className = "type-pill";
    pill.textContent = item.type === "image" ? "图片" : "视频";

    if (item.type === "image") {
      const image = document.createElement("img");
      image.src = item.url;
      image.alt = `无水印图片 ${index + 1}`;
      image.loading = "lazy";
      image.addEventListener("load", () => {
        updatePreviewAspect(preview, image.naturalWidth, image.naturalHeight);
      }, { once: true });
      preview.append(image);
    } else {
      const video = document.createElement("video");
      video.src = item.url;
      video.controls = true;
      video.muted = true;
      video.preload = "metadata";
      video.playsInline = true;
      video.addEventListener("loadedmetadata", () => {
        updatePreviewAspect(preview, video.videoWidth, video.videoHeight);
      }, { once: true });
      preview.append(video);
    }

    preview.append(pill);

    const body = document.createElement("div");
    body.className = "card-body";

    const meta = document.createElement("div");
    meta.className = "card-meta";
    const captureTime = document.createElement("span");
    captureTime.className = "capture-time";
    captureTime.textContent = `捕获于 ${formatCapturedAt(item.capturedAt)}`;
    meta.append(captureTime);

    const actions = document.createElement("div");
    actions.className = "card-actions";

    const copyButton = document.createElement("button");
    copyButton.className = "card-button";
    copyButton.type = "button";
    copyButton.title = "复制此资源链接";
    copyButton.setAttribute("aria-label", `复制${item.type === "image" ? "图片" : "视频"}链接`);
    copyButton.innerHTML = `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="11" height="11" rx="2"></rect><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"></path></svg><span>复制链接</span>`;
    copyButton.addEventListener("click", () => copyUrl(item.url, copyButton));

    const downloadButton = document.createElement("button");
    downloadButton.className = "card-button";
    downloadButton.type = "button";
    downloadButton.title = "下载此资源";
    downloadButton.innerHTML = `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m0 0 4-4m-4 4-4-4M5 20h14"></path></svg><span>下载</span>`;
    downloadButton.addEventListener("click", () => downloadUrls([item.url]));

    actions.append(copyButton, downloadButton);
    body.append(meta, actions);
    card.append(checkWrap, preview, body);
    return card;
  }

  function updatePreviewAspect(preview, width, height) {
    if (width > 0 && height > 0) {
      preview.style.setProperty("--media-aspect", `${width} / ${height}`);
    }
  }

  async function copyUrl(url, button) {
    const label = button.querySelector("span");
    try {
      await navigator.clipboard.writeText(url);
      showTemporaryText(label, "已复制", "复制链接", 1000);
      showToast("链接已复制", "success");
    } catch {
      showTemporaryText(label, "复制失败", "复制链接", 1600);
      showToast("复制失败，请检查剪贴板权限", "error");
    }
  }

  function showTemporaryText(target, temporaryText, originalText, delay) {
    target.textContent = temporaryText;
    window.setTimeout(() => {
      target.textContent = originalText;
    }, delay);
  }

  function showToast(message, type = "success") {
    if (toastTimer) {
      window.clearTimeout(toastTimer);
    }
    toast.textContent = message;
    toast.classList.toggle("is-error", type === "error");
    toast.classList.add("is-visible");
    toastTimer = window.setTimeout(() => {
      toast.classList.remove("is-visible");
      toastTimer = null;
    }, type === "error" ? 2200 : 1500);
  }

  function setSettingsOpen(isOpen) {
    settingsPopover.classList.toggle("is-open", isOpen);
    settingsPopover.setAttribute("aria-hidden", String(!isOpen));
    settingsButton.setAttribute("aria-expanded", String(isOpen));
    settingsButton.setAttribute("aria-label", isOpen ? "关闭设置" : "打开设置");
  }

  function updateFilterUI() {
    filterButtons.forEach((button) => {
      const isActive = button.dataset.filter === activeFilter;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
  }

  function updateVisibleSelectionUI() {
    shadow.querySelectorAll(".card").forEach((card) => {
      const isSelected = selectedUrls.has(card.dataset.resourceUrl);
      card.classList.toggle("is-selected", isSelected);
      const checkbox = card.querySelector(".check");
      if (checkbox) {
        checkbox.checked = isSelected;
      }
    });
  }

  function formatCapturedAt(timestamp) {
    if (!timestamp) {
      return "刚刚";
    }
    return new Intl.DateTimeFormat("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    }).format(new Date(timestamp));
  }

  function createEmptyState() {
    const empty = document.createElement("div");
    empty.className = "empty";

    const inner = document.createElement("div");
    inner.className = "empty-inner";
    const icon = document.createElement("div");
    icon.className = "empty-icon";
    icon.innerHTML = `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="m3 15 5-5 4 4 2-2 7 7"></path></svg>`;

    const title = document.createElement("div");
    title.className = "empty-title";
    const detail = document.createElement("div");
    detail.className = "empty-detail";

    if (!settings.enabled) {
      title.textContent = "插件已关闭";
      detail.textContent = "在设置中重新启用后继续捕获资源";
    } else if (statusText.includes("正在")) {
      title.textContent = "正在获取资源";
      detail.textContent = "解析完成后会自动显示在这里";
    } else if (items.size) {
      title.textContent = "当前筛选无结果";
      detail.textContent = "调整资源类型或日期范围后重试";
    } else if (statusText === "未提取到资源") {
      title.textContent = "未提取到资源";
      detail.textContent = "请确认生成任务已完成，或重新尝试";
    } else {
      title.textContent = "等待捕获资源";
      detail.textContent = "在豆包或 Dola 中生成图片或视频";
    }

    inner.append(icon, title, detail);
    empty.append(inner);
    return empty;
  }

  function updateSelection(url, isSelected, card) {
    if (isSelected) {
      selectedUrls.add(url);
    } else {
      selectedUrls.delete(url);
    }

    card.classList.toggle("is-selected", isSelected);
    updateToolbarState();
  }

  function getSelectedFilteredUrls() {
    return getFilteredItems()
      .filter((item) => selectedUrls.has(item.url))
      .map((item) => item.url);
  }

  function getFilteredItems() {
    return Array.from(items.values()).filter((item) => {
      return activeFilter === "all" || item.type === activeFilter;
    });
  }

  function applySettings(nextSettings) {
    settings = {
      enabled: nextSettings?.enabled !== false,
      durationOverrideEnabled: typeof nextSettings?.durationOverrideEnabled === "boolean"
        ? nextSettings.durationOverrideEnabled
        : nextSettings?.duration15Enabled !== false,
      durationSeconds: clampDuration(nextSettings?.durationSeconds ?? 15),
      watermarkEnabled: nextSettings?.watermarkEnabled !== false,
      darkModeEnabled: nextSettings?.darkModeEnabled === true
    };

    host.classList.toggle("is-dark", settings.darkModeEnabled);
    settingToggles.forEach((toggle) => {
      toggle.checked = Boolean(settings[toggle.dataset.setting]);
    });
    updateDurationControl();
    updateToolbarState();
    if (!getFilteredItems().length) {
      renderResourceList([]);
    }
  }

  function updateDurationControl() {
    durationRange.value = String(clampDuration(settings.durationSeconds));
    durationRange.disabled = !settings.durationOverrideEnabled;
    durationControl.classList.toggle("is-disabled", !settings.durationOverrideEnabled);
    durationValue.textContent = `${clampDuration(settings.durationSeconds)} 秒`;
  }

  function clampDuration(value) {
    const duration = Math.round(Number(value));
    if (!Number.isFinite(duration)) {
      return 15;
    }
    return Math.min(15, Math.max(4, duration));
  }

  function persistSettings() {
    chrome.runtime.sendMessage({ type: "SET_SETTINGS", settings }, (response) => {
      if (response?.settings) {
        settings = response.settings;
        applySettings(settings);
      }
    });
  }

  function downloadUrls(urls) {
    for (const url of urls) {
      if (isHttpUrl(url)) {
        chrome.runtime.sendMessage({ type: "DOWNLOAD_MEDIA", url });
      }
    }
  }

  function addItems(nextItems) {
    let addedCount = 0;
    for (const item of nextItems) {
      if (!item || typeof item.url !== "string" || !isHttpUrl(item.url)) {
        continue;
      }
      const type = item.type === "image" ? "image" : "video";
      if (!items.has(item.url)) {
        addedCount += 1;
      }
      items.set(item.url, { type, url: item.url, capturedAt: Date.now() });
      selectedUrls.add(item.url);
    }
    noteAccountCapture(addedCount);
  }

  function startDrag(event) {
    if (isCompactViewport() || event.button !== 0 || event.target.closest("button, input, select, label")) {
      return;
    }

    const rect = shell.getBoundingClientRect();
    panelLeft = rect.left;
    panelTop = rect.top;
    dragState = {
      startX: event.clientX,
      startY: event.clientY,
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height
    };
    topbar.setPointerCapture?.(event.pointerId);
    event.preventDefault();
  }

  function moveDrag(event) {
    if (!dragState) {
      return;
    }

    const nextLeft = dragState.left + event.clientX - dragState.startX;
    const nextTop = dragState.top + event.clientY - dragState.startY;
    panelLeft = clamp(nextLeft, 8, Math.max(8, window.innerWidth - dragState.width - 8));
    panelTop = clamp(nextTop, 8, Math.max(8, window.innerHeight - dragState.height - 8));
    applyPanelPosition();
  }

  function endDrag() {
    dragState = null;
  }

  function startLauncherDrag(event) {
    if (event.button !== 0) {
      return;
    }

    const rect = launcher.getBoundingClientRect();
    launcherLeft = rect.left;
    launcherTop = rect.top;
    launcherDragState = {
      startX: event.clientX,
      startY: event.clientY,
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
      moved: false
    };
    launcher.setPointerCapture?.(event.pointerId);
  }

  function moveLauncherDrag(event) {
    if (!launcherDragState) {
      return;
    }

    const deltaX = event.clientX - launcherDragState.startX;
    const deltaY = event.clientY - launcherDragState.startY;
    if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
      launcherDragState.moved = true;
      event.preventDefault();
    }
    launcherLeft = clamp(launcherDragState.left + deltaX, 8, Math.max(8, window.innerWidth - launcherDragState.width - 8));
    launcherTop = clamp(launcherDragState.top + deltaY, 8, Math.max(8, window.innerHeight - launcherDragState.height - 8));
    applyLauncherPosition();
  }

  function endLauncherDrag() {
    if (!launcherDragState) {
      return;
    }
    const moved = launcherDragState.moved;
    window.setTimeout(() => {
      if (launcherDragState?.moved === moved) {
        launcherDragState = null;
      }
    }, 0);
  }

  function applyPanelPosition() {
    if (isCompactViewport()) {
      const edge = window.innerWidth <= 520 ? 6 : 10;
      shell.style.left = `${edge}px`;
      shell.style.top = `${edge}px`;
      shell.style.right = `${edge}px`;
      shell.style.bottom = `${edge}px`;
      shell.style.width = "auto";
      shell.style.height = "auto";
      shell.style.transform = "none";
      applyLauncherPosition();
      return;
    }

    shell.style.width = "";
    shell.style.height = "";
    applyLauncherPosition();

    if (panelLeft == null || panelTop == null) {
      shell.style.left = "50%";
      shell.style.top = "50%";
      shell.style.right = "auto";
      shell.style.bottom = "auto";
      shell.style.transform = "translate(-50%, -50%)";
      return;
    }

    shell.style.left = `${panelLeft}px`;
    shell.style.top = `${panelTop}px`;
    shell.style.right = "auto";
    shell.style.bottom = "auto";
    shell.style.transform = "none";
  }

  function applyLauncherPosition() {
    if (launcherLeft == null || launcherTop == null) {
      launcher.style.left = "auto";
      launcher.style.top = "auto";
      launcher.style.right = "16px";
      launcher.style.bottom = "16px";
      return;
    }

    const rect = launcher.getBoundingClientRect();
    const width = rect.width || 52;
    const height = rect.height || 52;
    launcherLeft = clamp(launcherLeft, 8, Math.max(8, window.innerWidth - width - 8));
    launcherTop = clamp(launcherTop, 8, Math.max(8, window.innerHeight - height - 8));
    launcher.style.left = `${launcherLeft}px`;
    launcher.style.top = `${launcherTop}px`;
    launcher.style.right = "auto";
    launcher.style.bottom = "auto";
  }

  function isCompactViewport() {
    return window.innerWidth <= 760;
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function isHttpUrl(url) {
    return /^https?:\/\//i.test(url);
  }
})();
