(function () {
  const PANEL_ID = "watermark-free-media-panel";
  const DOUBAO_PLAY_INFO_URL = "https://www.doubao.com/samantha/media/get_play_info?version_code=20800&language=zh-CN&device_platform=web&aid=497858&real_aid=497858&pkg_type=release_version&device_id=&pc_version=2.51.7&region=&sys_region=&samantha_web=1&use-olympus-account=1&web_tab_id=";

  const items = new Map();
  const selectedUrls = new Set();
  let currentSourceKey = "";
  let statusText = "等待捕获资源";
  let panelState = "open";
  let activeFilter = "all";
  let dateStart = "";
  let dateEnd = "";
  let panelLeft = null;
  let panelTop = null;
  let dragState = null;
  let settings = {
    enabled: true,
    duration15Enabled: true,
    watermarkEnabled: true
  };

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

      *, *::before, *::after {
        box-sizing: border-box;
      }

      button, input {
        font: inherit;
      }

      button {
        -webkit-tap-highlight-color: transparent;
      }

      .launcher {
        position: fixed;
        right: 16px;
        bottom: 16px;
        min-width: 156px;
        height: 40px;
        display: none;
        align-items: center;
        justify-content: space-between;
        gap: var(--space-3);
        padding: 0 12px;
        color: var(--text);
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: var(--radius);
        box-shadow: 0 8px 24px rgba(15, 23, 42, 0.13);
        cursor: pointer;
        pointer-events: auto;
        transition: border-color 150ms ease, box-shadow 150ms ease;
      }

      .launcher:hover {
        border-color: var(--border-strong);
        box-shadow: 0 10px 26px rgba(15, 23, 42, 0.16);
      }

      .launcher.is-visible {
        display: flex;
      }

      .launcher-title {
        font-size: 13px;
        font-weight: 650;
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

      .actions, .toolbar-actions, .filter-tabs, .date-filters {
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

      .toolbar {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 10px 12px;
        padding: 12px 16px;
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

      .date-filters {
        gap: 6px;
      }

      .date-field {
        height: var(--control-height);
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 0 9px;
        color: var(--text-secondary);
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: var(--radius-small);
      }

      .date-label {
        font-size: 11px;
        white-space: nowrap;
      }

      .date-input {
        width: 112px;
        min-width: 0;
        padding: 0;
        color: var(--text);
        background: transparent;
        border: 0;
        outline: none;
        font-size: 12px;
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

      .grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
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
        height: 168px;
        display: grid;
        place-items: center;
        overflow: hidden;
        background: #eef1f4;
        border-bottom: 1px solid var(--border);
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
        .grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

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

        .date-filters {
          flex: 1 1 100%;
          flex-wrap: wrap;
        }

        .date-field {
          flex: 1 1 150px;
        }

        .date-input {
          width: 100%;
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

        .toolbar-actions .primary-button,
        .toolbar-actions .secondary-button {
          width: 100%;
        }

        .grid {
          grid-template-columns: 1fr;
        }

        .preview {
          height: 190px;
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
      <span class="launcher-title">资源助手</span>
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
            <span class="switch-name">15 秒配置</span>
            <span class="switch-description">控制 15 秒视频配置注入</span>
          </span>
          <input class="setting-toggle" data-setting="duration15Enabled" type="checkbox" />
          <span class="switch-track" aria-hidden="true"></span>
        </label>
        <label class="switch">
          <span class="switch-copy">
            <span class="switch-name">无水印资源</span>
            <span class="switch-description">控制原始图片和视频资源提取</span>
          </span>
          <input class="setting-toggle" data-setting="watermarkEnabled" type="checkbox" />
          <span class="switch-track" aria-hidden="true"></span>
        </label>
      </aside>

      <div class="toolbar">
        <div class="filter-tabs" role="group" aria-label="资源类型筛选">
          <button class="filter-button is-active" data-filter="all" type="button" aria-pressed="true">全部</button>
          <button class="filter-button" data-filter="video" type="button" aria-pressed="false">视频</button>
          <button class="filter-button" data-filter="image" type="button" aria-pressed="false">图片</button>
        </div>

        <div class="date-filters" aria-label="捕获日期筛选">
          <label class="date-field">
            <span class="date-label">开始</span>
            <input class="date-input start-date" type="date" title="开始日期" />
          </label>
          <label class="date-field">
            <span class="date-label">结束</span>
            <input class="date-input end-date" type="date" title="结束日期" />
          </label>
          <button class="tool-button clear-filter-button" type="button" title="清除类型和日期筛选">清除筛选</button>
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
  const filterButtons = Array.from(shadow.querySelectorAll(".filter-button"));
  const startDateInput = shadow.querySelector(".start-date");
  const endDateInput = shadow.querySelector(".end-date");
  const clearFilterButton = shadow.querySelector(".clear-filter-button");
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
  let toastTimer = null;

  launcher.addEventListener("click", () => {
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
      chrome.runtime.sendMessage({ type: "SET_SETTINGS", settings }, (response) => {
        if (response?.settings) {
          settings = response.settings;
          applySettings(settings);
        }
      });
    });
  });

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.filter;
      updateFilterUI();
      render();
    });
  });

  startDateInput.addEventListener("change", () => {
    dateStart = startDateInput.value;
    render();
  });

  endDateInput.addEventListener("change", () => {
    dateEnd = endDateInput.value;
    render();
  });

  clearFilterButton.addEventListener("click", () => {
    activeFilter = "all";
    dateStart = "";
    dateEnd = "";
    startDateInput.value = "";
    endDateInput.value = "";
    updateFilterUI();
    render();
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
  window.addEventListener("pointerup", endDrag);
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
      preview.append(image);
    } else {
      const video = document.createElement("video");
      video.src = item.url;
      video.controls = true;
      video.muted = true;
      video.preload = "metadata";
      video.playsInline = true;
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
    const startMs = dateStart ? new Date(`${dateStart}T00:00:00`).getTime() : 0;
    const endMs = dateEnd ? new Date(`${dateEnd}T23:59:59`).getTime() : Number.POSITIVE_INFINITY;

    return Array.from(items.values()).filter((item) => {
      if (activeFilter !== "all" && item.type !== activeFilter) {
        return false;
      }

      const capturedAt = item.capturedAt || 0;
      return capturedAt >= startMs && capturedAt <= endMs;
    });
  }

  function applySettings(nextSettings) {
    settings = {
      enabled: nextSettings?.enabled !== false,
      duration15Enabled: nextSettings?.duration15Enabled !== false,
      watermarkEnabled: nextSettings?.watermarkEnabled !== false
    };

    settingToggles.forEach((toggle) => {
      toggle.checked = Boolean(settings[toggle.dataset.setting]);
    });
    updateToolbarState();
    if (!getFilteredItems().length) {
      renderResourceList([]);
    }
  }

  function downloadUrls(urls) {
    for (const url of urls) {
      if (isHttpUrl(url)) {
        chrome.runtime.sendMessage({ type: "DOWNLOAD_MEDIA", url });
      }
    }
  }

  function addItems(nextItems) {
    for (const item of nextItems) {
      if (!item || typeof item.url !== "string" || !isHttpUrl(item.url)) {
        continue;
      }
      const type = item.type === "image" ? "image" : "video";
      items.set(item.url, { type, url: item.url, capturedAt: Date.now() });
      selectedUrls.add(item.url);
    }
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
      return;
    }

    shell.style.width = "";
    shell.style.height = "";

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
