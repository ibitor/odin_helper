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
const viewTitle = document.querySelector("#viewTitle");
const iframeNote = document.querySelector("#iframeNote");
const modeTabs = document.querySelectorAll(".mode-tab");
const logMode = document.querySelector("#logMode");
const jsonMode = document.querySelector("#jsonMode");
const logControls = document.querySelector("#logControls");
const jsonControls = document.querySelector("#jsonControls");
const jsonInput = document.querySelector("#jsonInput");
const jsonOutput = document.querySelector("#jsonOutput");
const jsonStatus = document.querySelector("#jsonStatus");
const repairJsonBtn = document.querySelector("#repairJson");
const copyJsonBtn = document.querySelector("#copyJson");
const clearJsonBtn = document.querySelector("#clearJson");

let currentMode = "log";

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
    if (currentMode === "log") {
      statusText.textContent = "请输入参数后生成多窗口视图。";
    }
    return;
  }

  emptyState.style.display = "none";
  if (currentMode === "log") {
    statusText.textContent = `已生成 ${baseUrls.length} 个视图 · 参数：${value}`;
  }

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

function setMode(mode) {
  currentMode = mode;
  modeTabs.forEach((tab) =>
    tab.classList.toggle("is-active", tab.dataset.mode === mode)
  );
  logMode.classList.toggle("is-hidden", mode !== "log");
  jsonMode.classList.toggle("is-hidden", mode !== "json");
  logControls.classList.toggle("is-hidden", mode !== "log");
  jsonControls.classList.toggle("is-hidden", mode !== "json");
  iframeNote.style.display = mode === "log" ? "block" : "none";
  reloadFramesBtn.style.display = mode === "log" ? "inline-flex" : "none";
  openAllBtn.style.display = mode === "log" ? "inline-flex" : "none";
  if (mode === "json") {
    viewTitle.textContent = "JSON Repair";
    statusText.textContent = "自动修复常见 JSON 问题并格式化输出。";
  } else {
    viewTitle.textContent = "多日志查看";
    renderFrames(paramInput.value.trim());
  }
}

function stripComments(input) {
  let out = "";
  let inString = false;
  let stringChar = "";
  let escape = false;

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    const next = input[i + 1];

    if (inString) {
      out += char;
      if (escape) {
        escape = false;
      } else if (char === "\\") {
        escape = true;
      } else if (char === stringChar) {
        inString = false;
        stringChar = "";
      }
      continue;
    }

    if (char === '"' || char === "'") {
      inString = true;
      stringChar = char;
      out += char;
      continue;
    }

    if (char === "/" && next === "/") {
      while (i < input.length && input[i] !== "\n") i += 1;
      out += "\n";
      continue;
    }

    if (char === "/" && next === "*") {
      i += 2;
      while (i < input.length && !(input[i] === "*" && input[i + 1] === "/")) {
        i += 1;
      }
      i += 1;
      continue;
    }

    out += char;
  }

  return out;
}

function parseSingleQuotedString(input, start) {
  let result = "";
  let i = start;
  while (i < input.length) {
    const char = input[i];
    if (char === "'") {
      return { value: result, end: i };
    }
    if (char === "\\") {
      const next = input[i + 1];
      if (!next) break;
      switch (next) {
        case "n":
          result += "\n";
          break;
        case "r":
          result += "\r";
          break;
        case "t":
          result += "\t";
          break;
        case "b":
          result += "\b";
          break;
        case "f":
          result += "\f";
          break;
        case "'":
          result += "'";
          break;
        case "\"":
          result += "\"";
          break;
        case "\\":
          result += "\\";
          break;
        case "/":
          result += "/";
          break;
        case "u": {
          const hex = input.slice(i + 2, i + 6);
          if (/^[0-9a-fA-F]{4}$/.test(hex)) {
            result += String.fromCharCode(parseInt(hex, 16));
            i += 4;
          } else {
            result += next;
          }
          break;
        }
        default:
          result += next;
      }
      i += 2;
      continue;
    }
    result += char;
    i += 1;
  }
  return null;
}

function convertSingleQuotes(input) {
  let out = "";
  let inDouble = false;
  let escape = false;

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];

    if (inDouble) {
      out += char;
      if (escape) {
        escape = false;
      } else if (char === "\\") {
        escape = true;
      } else if (char === "\"") {
        inDouble = false;
      }
      continue;
    }

    if (char === "\"") {
      inDouble = true;
      out += char;
      continue;
    }

    if (char === "'") {
      const parsed = parseSingleQuotedString(input, i + 1);
      if (!parsed) {
        out += char;
        continue;
      }
      out += JSON.stringify(parsed.value);
      i = parsed.end;
      continue;
    }

    out += char;
  }

  return out;
}

function quoteUnquotedKeys(input) {
  let out = "";
  let inString = false;
  let stringChar = "";
  let escape = false;

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];

    if (inString) {
      out += char;
      if (escape) {
        escape = false;
      } else if (char === "\\") {
        escape = true;
      } else if (char === stringChar) {
        inString = false;
        stringChar = "";
      }
      continue;
    }

    if (char === '"' || char === "'") {
      inString = true;
      stringChar = char;
      out += char;
      continue;
    }

    if (char === "{" || char === ",") {
      out += char;
      let j = i + 1;
      while (j < input.length && /\s/.test(input[j])) {
        out += input[j];
        j += 1;
      }

      if (input[j] === '"' || input[j] === "'") {
        i = j - 1;
        continue;
      }

      if (/[A-Za-z_$]/.test(input[j])) {
        let k = j + 1;
        while (k < input.length && /[A-Za-z0-9_$-]/.test(input[k])) {
          k += 1;
        }
        let m = k;
        while (m < input.length && /\s/.test(input[m])) {
          m += 1;
        }
        if (input[m] === ":") {
          const key = input.slice(j, k);
          out += `"${key}"`;
          out += input.slice(k, m);
          i = m - 1;
          continue;
        }
      }

      i = j - 1;
      continue;
    }

    out += char;
  }

  return out;
}

function removeTrailingCommas(input) {
  let out = "";
  let inString = false;
  let stringChar = "";
  let escape = false;

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];

    if (inString) {
      out += char;
      if (escape) {
        escape = false;
      } else if (char === "\\") {
        escape = true;
      } else if (char === stringChar) {
        inString = false;
        stringChar = "";
      }
      continue;
    }

    if (char === '"' || char === "'") {
      inString = true;
      stringChar = char;
      out += char;
      continue;
    }

    if (char === ",") {
      let j = i + 1;
      while (j < input.length && /\s/.test(input[j])) j += 1;
      if (input[j] === "}" || input[j] === "]") {
        continue;
      }
    }

    out += char;
  }

  return out;
}

function repairJson(input) {
  let text = input.trim();
  if (!text) {
    return { ok: false, error: "请输入 JSON 内容。" };
  }

  try {
    const parsed = JSON.parse(text);
    return { ok: true, value: JSON.stringify(parsed, null, 2) };
  } catch (error) {
    // Fallthrough to repair steps
  }

  text = text.replace(/^\uFEFF/, "");
  text = text.replace(/[“”]/g, "\"").replace(/[‘’]/g, "'");
  text = stripComments(text);
  text = convertSingleQuotes(text);
  text = quoteUnquotedKeys(text);
  text = removeTrailingCommas(text);

  try {
    const parsed = JSON.parse(text);
    return { ok: true, value: JSON.stringify(parsed, null, 2) };
  } catch (error) {
    return { ok: false, error: `修复失败：${error.message}` };
  }
}

function renderJsonRepair() {
  const { ok, value, error } = repairJson(jsonInput.value);
  if (ok) {
    jsonOutput.textContent = value;
    jsonOutput.classList.remove("is-error");
    jsonStatus.textContent = "修复完成，已输出标准 JSON。";
  } else {
    jsonOutput.textContent = error;
    jsonOutput.classList.add("is-error");
    jsonStatus.textContent = "无法修复，请检查输入内容。";
  }
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
repairJsonBtn.addEventListener("click", renderJsonRepair);
copyJsonBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(jsonOutput.textContent || "");
});
clearJsonBtn.addEventListener("click", () => {
  jsonInput.value = "";
  jsonOutput.textContent = "等待修复…";
  jsonOutput.classList.remove("is-error");
  jsonStatus.textContent = "支持去除注释、修复尾逗号、补全引号等。";
});

modeTabs.forEach((tab) => {
  tab.addEventListener("click", () => setMode(tab.dataset.mode));
});

renderBaseList();

const initialParam = getParamFromUrl();
paramInput.value = initialParam;
renderFrames(initialParam);
setMode("log");
