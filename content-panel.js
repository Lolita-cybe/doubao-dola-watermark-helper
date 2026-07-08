(function () {
  const PANEL_ID = "watermark-free-media-panel";
  const DOUBAO_PLAY_INFO_URL = "https://www.doubao.com/samantha/media/get_play_info?version_code=20800&language=zh-CN&device_platform=web&aid=497858&real_aid=497858&pkg_type=release_version&device_id=&pc_version=2.51.7&region=&sys_region=&samantha_web=1&use-olympus-account=1&web_tab_id=";

  const items = new Map();
  const selectedUrls = new Set();
  let currentSourceKey = "";
  let statusText = "等待捕获资源";
  let isCollapsed = false;
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
        all: initial;
        position: fixed;
        inset: 0;
        z-index: 2147483647;
        pointer-events: none;
        font-family: Arial, "Microsoft YaHei", sans-serif;
      }

      *, *::before, *::after {
        box-sizing: border-box;
      }

      button, input, select {
        font: inherit;
      }

      .launcher {
        position: fixed;
        right: 18px;
        bottom: 18px;
        width: 172px;
        height: 42px;
        display: none;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 0 12px;
        color: #111827;
        background: #fff;
        border: 1px solid rgba(17, 24, 39, 0.12);
        border-radius: 10px;
        box-shadow: 0 14px 34px rgba(15, 23, 42, 0.18);
        cursor: pointer;
        pointer-events: auto;
      }

      .launcher.is-visible {
        display: flex;
      }

      .launcher-title {
        font-size: 14px;
        font-weight: 700;
      }

      .badge {
        min-width: 28px;
        height: 22px;
        padding: 0 8px;
        border-radius: 999px;
        background: #137333;
        color: #fff;
        font-size: 13px;
        line-height: 22px;
        text-align: center;
        font-weight: 700;
      }

      .shell {
        position: fixed;
        left: 50%;
        top: 50%;
        width: min(890px, calc(100vw - 48px));
        height: min(665px, calc(100vh - 72px));
        display: flex;
        flex-direction: column;
        transform: translate(-50%, -50%);
        color: #202124;
        background: #fff;
        border: 1px solid rgba(17, 24, 39, 0.14);
        border-radius: 12px;
        box-shadow: 0 22px 70px rgba(15, 23, 42, 0.28);
        overflow: hidden;
        pointer-events: auto;
      }

      .shell.is-hidden {
        display: none;
      }

      .topbar {
        height: 66px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        padding: 0 28px;
        border-bottom: 1px solid #edf0f2;
        background: #fff;
        cursor: move;
        user-select: none;
      }

      .title {
        margin: 0;
        color: #202124;
        font-size: 24px;
        line-height: 32px;
        font-weight: 800;
        letter-spacing: 0;
      }

      .switches {
        flex: 1;
        min-width: 0;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 8px;
      }

      .switch {
        height: 32px;
        display: inline-flex;
        align-items: center;
        gap: 7px;
        padding: 0 10px;
        border-radius: 6px;
        background: #f7f8f9;
        color: #3f4349;
        font-size: 13px;
        font-weight: 700;
        cursor: pointer;
      }

      .switch input {
        position: absolute;
        opacity: 0;
        pointer-events: none;
      }

      .switch-track {
        position: relative;
        width: 30px;
        height: 16px;
        border-radius: 999px;
        background: #c7cdd4;
      }

      .switch-track::after {
        content: "";
        position: absolute;
        left: 2px;
        top: 2px;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: #fff;
        transition: transform 0.16s ease;
      }

      .switch input:checked + .switch-track {
        background: #2563eb;
      }

      .switch input:checked + .switch-track::after {
        transform: translateX(14px);
      }

      .actions {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: default;
        flex: 0 0 auto;
      }

      .ghost-button, .icon-button, .primary-button, .quiet-button {
        height: 36px;
        border: 0;
        border-radius: 6px;
        cursor: pointer;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: clip;
      }

      .ghost-button {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 0 14px;
        color: #45484d;
        background: #f7f8f9;
        font-size: 15px;
        font-weight: 700;
      }

      .icon-button {
        width: 36px;
        display: grid;
        place-items: center;
        color: #3c4043;
        background: #f7f8f9;
        font-size: 20px;
        line-height: 1;
      }

      .toolbar {
        margin: 22px 32px 18px;
        min-height: 78px;
        display: grid;
        grid-template-columns: minmax(190px, 224px) minmax(260px, 300px) minmax(92px, 112px) minmax(92px, 112px);
        align-items: center;
        justify-content: center;
        gap: 14px;
        padding: 20px 28px;
        border: 1px solid #e9ecef;
        border-radius: 8px;
        background: #fff;
      }

      .select-wrap, .date-range {
        height: 44px;
        display: flex;
        align-items: center;
        background: #f5f6f7;
        border-radius: 6px;
      }

      .select-wrap {
        position: relative;
      }

      select {
        width: 100%;
        height: 44px;
        padding: 0 44px 0 18px;
        color: #2f3135;
        background: transparent;
        border: 0;
        outline: none;
        appearance: none;
        font-size: 16px;
      }

      .select-arrow {
        position: absolute;
        right: 16px;
        top: 50%;
        width: 12px;
        height: 12px;
        border-right: 2px solid #6b7280;
        border-bottom: 2px solid #6b7280;
        transform: translateY(-70%) rotate(45deg);
        pointer-events: none;
      }

      .date-range {
        justify-content: center;
        gap: 8px;
        padding: 0 10px;
        color: #6b7280;
        font-size: 14px;
      }

      .date-input {
        width: 122px;
        height: 34px;
        border: 0;
        outline: none;
        background: transparent;
        color: #374151;
        font-size: 14px;
      }

      .primary-button, .quiet-button {
        padding: 0 14px;
        font-size: 15px;
        font-weight: 800;
        min-width: 92px;
      }

      .download-selected, .download-all {
        min-width: 108px;
      }

      .primary-button {
        color: #1f2937;
        background: #f1f3f4;
      }

      .primary-button.is-active {
        color: #fff;
        background: #2563eb;
      }

      .quiet-button {
        color: #1f2937;
        background: #f1f3f4;
      }

      .content {
        flex: 1;
        min-height: 0;
        overflow: auto;
        padding: 20px 32px 34px;
        scrollbar-width: auto;
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(232px, 1fr));
        gap: 12px;
      }

      .card {
        position: relative;
        min-height: 314px;
        padding: 40px 28px 26px;
        border: 1px solid #e2e6ea;
        border-radius: 8px;
        background: #fff;
      }

      .check {
        position: absolute;
        top: 10px;
        right: 10px;
        width: 22px;
        height: 22px;
        accent-color: #2563eb;
        cursor: pointer;
      }

      .preview {
        position: relative;
        width: 100%;
        aspect-ratio: 1 / 1;
        overflow: hidden;
        background: #f3f4f6;
        border-radius: 4px;
      }

      .preview img, .preview video {
        width: 100%;
        height: 100%;
        display: block;
        object-fit: cover;
      }

      .preview video {
        background: #111827;
      }

      .type-pill {
        position: absolute;
        left: 8px;
        top: 8px;
        height: 20px;
        padding: 0 7px;
        border-radius: 4px;
        color: #fff;
        background: rgba(91, 33, 182, 0.84);
        font-size: 12px;
        line-height: 20px;
        font-weight: 700;
      }

      .play-mark {
        position: absolute;
        left: 50%;
        top: 50%;
        width: 38px;
        height: 38px;
        display: grid;
        place-items: center;
        color: #fff;
        background: rgba(17, 24, 39, 0.64);
        border-radius: 50%;
        transform: translate(-50%, -50%);
        pointer-events: none;
      }

      .play-mark::before {
        content: "";
        width: 0;
        height: 0;
        margin-left: 3px;
        border-top: 9px solid transparent;
        border-bottom: 9px solid transparent;
        border-left: 13px solid #fff;
      }

      .card-actions {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        margin-top: 18px;
      }

      .card-button {
        height: 44px;
        border: 0;
        border-radius: 4px;
        color: #4a4d52;
        background: #f3f4f6;
        font-size: 18px;
        font-weight: 800;
        cursor: pointer;
      }

      .card-button:hover, .ghost-button:hover, .icon-button:hover, .quiet-button:hover, .primary-button:hover {
        filter: brightness(0.97);
      }

      .empty {
        min-height: 220px;
        display: grid;
        place-items: center;
        color: #69707a;
        font-size: 16px;
        text-align: center;
      }

      @media (max-width: 760px) {
        .shell {
          inset: 10px;
          width: auto;
          height: auto;
        }

        .topbar {
          height: 58px;
          padding: 0 16px;
        }

        .title {
          font-size: 20px;
        }

        .ghost-button span {
          display: none;
        }

        .toolbar {
          grid-template-columns: 1fr 1fr;
          margin: 12px;
          padding: 14px;
          gap: 10px;
        }

        .date-range {
          grid-column: 1 / -1;
          order: 2;
        }

        .content {
          padding: 12px;
        }

        .card {
          padding: 34px 18px 20px;
        }
      }
    </style>

    <button class="launcher" type="button" title="打开下载器">
      <span class="launcher-title">豆包下载器</span>
      <span class="badge launcher-count">0</span>
    </button>

    <section class="shell" aria-label="豆包下载器">
      <header class="topbar">
        <h2 class="title">豆包下载器</h2>
        <div class="switches" aria-label="插件功能开关">
          <label class="switch" title="总开关：关闭后插件放行所有接口">
            <input class="setting-toggle" data-setting="enabled" type="checkbox" />
            <span class="switch-track" aria-hidden="true"></span>
            <span>启用</span>
          </label>
          <label class="switch" title="控制15秒配置注入">
            <input class="setting-toggle" data-setting="duration15Enabled" type="checkbox" />
            <span class="switch-track" aria-hidden="true"></span>
            <span>15秒</span>
          </label>
          <label class="switch" title="控制无水印资源提取">
            <input class="setting-toggle" data-setting="watermarkEnabled" type="checkbox" />
            <span class="switch-track" aria-hidden="true"></span>
            <span>去水印</span>
          </label>
        </div>
        <div class="actions">
          <button class="ghost-button source-button" type="button" title="复制当前资源链接">
            <span aria-hidden="true">◑</span>
            <span>Source Code</span>
          </button>
          <button class="icon-button collapse-button" type="button" title="最小化">−</button>
          <button class="icon-button close-button" type="button" title="关闭">×</button>
        </div>
      </header>

      <div class="toolbar">
        <label class="select-wrap">
          <select class="filter-select" aria-label="资源类型">
            <option value="all">所有资源</option>
            <option value="video">仅视频</option>
            <option value="image">仅图片</option>
          </select>
          <span class="select-arrow" aria-hidden="true"></span>
        </label>
        <div class="date-range" aria-label="捕获日期筛选">
          <input class="date-input start-date" type="date" title="开始日期" />
          <span>~</span>
          <input class="date-input end-date" type="date" title="结束日期" />
        </div>
        <button class="primary-button download-selected" type="button">下载选中</button>
        <button class="quiet-button download-all" type="button">全部下载</button>
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
  const settingToggles = Array.from(shadow.querySelectorAll(".setting-toggle"));
  const filterSelect = shadow.querySelector(".filter-select");
  const startDateInput = shadow.querySelector(".start-date");
  const endDateInput = shadow.querySelector(".end-date");
  const downloadSelectedButton = shadow.querySelector(".download-selected");
  const downloadAllButton = shadow.querySelector(".download-all");
  const sourceButton = shadow.querySelector(".source-button");
  const collapseButton = shadow.querySelector(".collapse-button");
  const closeButton = shadow.querySelector(".close-button");

  launcher.addEventListener("click", () => {
    isCollapsed = false;
    render();
  });

  collapseButton.addEventListener("click", () => {
    isCollapsed = true;
    render();
  });

  closeButton.addEventListener("click", () => {
    isCollapsed = true;
    render();
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

  filterSelect.addEventListener("change", () => {
    activeFilter = filterSelect.value;
    render();
  });

  startDateInput.addEventListener("change", () => {
    dateStart = startDateInput.value;
    render();
  });

  endDateInput.addEventListener("change", () => {
    dateEnd = endDateInput.value;
    render();
  });

  topbar.addEventListener("pointerdown", startDrag);
  topbar.addEventListener("dblclick", () => {
    panelLeft = null;
    panelTop = null;
    applyPanelPosition();
  });
  window.addEventListener("pointermove", moveDrag);
  window.addEventListener("pointerup", endDrag);

  downloadSelectedButton.addEventListener("click", () => {
    const urls = getFilteredItems()
      .filter((item) => selectedUrls.has(item.url))
      .map((item) => item.url);
    downloadUrls(urls);
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
      await navigator.clipboard.writeText(urls.join("\\n"));
      sourceButton.querySelector("span:last-child").textContent = "Copied";
      setTimeout(() => {
        sourceButton.querySelector("span:last-child").textContent = "Source Code";
      }, 1200);
    } catch {
      downloadUrls(urls);
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
      isCollapsed = false;
      render();
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
    const allItems = Array.from(items.values());
    launcherCount.textContent = String(allItems.length);
    shell.classList.toggle("is-hidden", isCollapsed);
    launcher.classList.toggle("is-visible", isCollapsed);
    applyPanelPosition();

    const filteredItems = getFilteredItems();
    downloadSelectedButton.classList.toggle("is-active", filteredItems.some((item) => selectedUrls.has(item.url)));
    downloadSelectedButton.textContent = selectedUrls.size ? `下载选中 ${selectedUrls.size}` : "下载选中";
    downloadAllButton.textContent = filteredItems.length ? `全部下载 ${filteredItems.length}` : "全部下载";

    content.textContent = "";

    if (!filteredItems.length) {
      const empty = document.createElement("div");
      empty.className = "empty";
      empty.textContent = statusText || (items.size ? "当前筛选没有资源，试试清空筛选" : "等待捕获资源");
      content.appendChild(empty);
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

    const checkbox = document.createElement("input");
    checkbox.className = "check";
    checkbox.type = "checkbox";
    checkbox.checked = selectedUrls.has(item.url);
    checkbox.title = "选择资源";
    checkbox.addEventListener("change", () => {
      if (checkbox.checked) {
        selectedUrls.add(item.url);
      } else {
        selectedUrls.delete(item.url);
      }
      render();
    });

    const preview = document.createElement("div");
    preview.className = "preview";
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
      preview.append(video, createPlayMark());
      video.addEventListener("play", () => {
        const marker = preview.querySelector(".play-mark");
        if (marker) {
          marker.remove();
        }
      }, { once: true });
    }

    preview.append(pill);

    const actions = document.createElement("div");
    actions.className = "card-actions";

    const copyButton = document.createElement("button");
    copyButton.className = "card-button";
    copyButton.type = "button";
    copyButton.textContent = "链接";
    copyButton.title = "复制资源链接";
    copyButton.addEventListener("click", () => copyUrl(item.url, copyButton));

    const downloadButton = document.createElement("button");
    downloadButton.className = "card-button";
    downloadButton.type = "button";
    downloadButton.textContent = "下载";
    downloadButton.addEventListener("click", () => downloadUrls([item.url]));

    actions.append(copyButton, downloadButton);
    card.append(checkbox, preview, actions);
    return card;
  }

  function createPlayMark() {
    const playMark = document.createElement("span");
    playMark.className = "play-mark";
    return playMark;
  }

  async function copyUrl(url, button) {
    try {
      await navigator.clipboard.writeText(url);
      const oldText = button.textContent;
      button.textContent = "已复制";
      setTimeout(() => {
        button.textContent = oldText;
      }, 1000);
    } catch {
      downloadUrls([url]);
    }
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
    if (event.button !== 0 || event.target.closest("button, input, select, label")) {
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

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function isHttpUrl(url) {
    return /^https?:\/\//i.test(url);
  }
})();
