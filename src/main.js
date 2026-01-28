const baseUrls = [
  {
    name: "Baidu Search",
    url: "https://www.baidu.com/s?wd=",
  },
  {
    name: "Bing Search",
    url: "https://www.bing.com/search?q=",
  },
];

const paramKey = "param";

const paramInput = document.querySelector("#paramInput");
const applyBtn = document.querySelector("#applyParam");
const clearBtn = document.querySelector("#clearParam");
const baseList = document.querySelector("#baseList");
const framesGrid = document.querySelector("#framesGrid");
const emptyState = document.querySelector("#emptyState");
const reloadFramesBtn = document.querySelector("#reloadFrames");
const openAllBtn = document.querySelector("#openAll");
const statusText = document.querySelector("#statusText");

function getParamFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get(paramKey) || "";
}

function updateUrlParam(value) {
  const params = new URLSearchParams(window.location.search);
  if (value) {
    params.set(paramKey, value);
  } else {
    params.delete(paramKey);
  }
  const query = params.toString();
  const newUrl = query
    ? `${window.location.pathname}?${query}`
    : window.location.pathname;
  window.history.replaceState({}, "", newUrl);
}

function renderBaseList() {
  baseList.innerHTML = "";
  baseUrls.forEach((item) => {
    const div = document.createElement("div");
    div.className = "base-item";

    const strong = document.createElement("strong");
    strong.textContent = item.name;
    const span = document.createElement("span");
    span.textContent = item.url;

    div.append(strong, span);
    baseList.append(div);
  });
}

function buildTargetUrl(baseUrl, value) {
  return `${baseUrl}${encodeURIComponent(value)}`;
}

function renderFrames(value) {
  framesGrid.innerHTML = "";

  if (!value) {
    emptyState.style.display = "block";
    statusText.textContent = "请输入参数后生成多窗口视图。";
    return;
  }

  emptyState.style.display = "none";
  statusText.textContent = `已生成 ${baseUrls.length} 个视图 · 参数：${value}`;

  baseUrls.forEach((item) => {
    const targetUrl = buildTargetUrl(item.url, value);
    const drawer = document.createElement("details");
    drawer.className = "frame-drawer";
    drawer.open = true;

    const summary = document.createElement("summary");
    summary.className = "frame-summary";

    const titleSpan = document.createElement("span");
    titleSpan.className = "frame-title";
    const strong = document.createElement("strong");
    strong.textContent = item.name;
    titleSpan.append(strong, document.createTextNode(` · ${targetUrl}`));

    const actions = document.createElement("div");
    actions.className = "frame-actions";
    const link = document.createElement("a");
    link.href = targetUrl;
    link.target = "_blank";
    link.rel = "noreferrer";
    link.textContent = "新窗口打开";
    link.addEventListener("click", (event) => event.stopPropagation());
    actions.append(link);

    summary.append(titleSpan, actions);

    const body = document.createElement("div");
    body.className = "frame-body";

    const frame = document.createElement("iframe");
    frame.title = item.name;
    frame.src = targetUrl;
    frame.loading = "lazy";

    body.append(frame);
    drawer.append(summary, body);
    framesGrid.append(drawer);
  });
}

function refreshFrames() {
  framesGrid.querySelectorAll("iframe").forEach((frame) => {
    frame.src = frame.src;
  });
}

function openAllFrames() {
  const value = paramInput.value.trim();
  if (!value) return;
  baseUrls.forEach((item) => {
    window.open(buildTargetUrl(item.url, value), "_blank");
  });
}

applyBtn.addEventListener("click", () => {
  const value = paramInput.value.trim();
  updateUrlParam(value);
  renderFrames(value);
});

paramInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    applyBtn.click();
  }
});

clearBtn.addEventListener("click", () => {
  paramInput.value = "";
  updateUrlParam("");
  renderFrames("");
});

reloadFramesBtn.addEventListener("click", refreshFrames);
openAllBtn.addEventListener("click", openAllFrames);

renderBaseList();

const initialParam = getParamFromUrl();
paramInput.value = initialParam;
renderFrames(initialParam);
