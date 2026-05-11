/**
 * 应用入口：选图 → 选素材类型 → Canvas 转换 → 预览与下载。
 */

import { readFilesAsText } from "./io/fileReader.js";
import { downloadZip } from "./io/zipDownload.js";
import { runPipeline } from "./pipeline/runPipeline.js";
import { parseAssetMode } from "./rules/assetSpecsByMode.js";

/** @type {File[]} */
let selectedFiles = [];

/** @type {{ outName: string; blob: Blob; objectUrl: string }[]} */
let lastResults = [];

const dropzone = document.getElementById("dropzone");
const fileInput = document.getElementById("file-input");
const btnClear = document.getElementById("btn-clear");
const btnRun = document.getElementById("btn-run");
const btnZip = document.getElementById("btn-zip");
const fileList = document.getElementById("file-list");
const warnUnknown = document.getElementById("warn-unknown");
const copyStatus = document.getElementById("copy-status");
const previewGrid = document.getElementById("preview-grid");

function formatBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

/** @param {string} name */
function fileExtFromName(name) {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i + 1).toLowerCase() : "";
}

function revokeLastUrls() {
  for (const r of lastResults) {
    URL.revokeObjectURL(r.objectUrl);
  }
  lastResults = [];
}

function renderFileList() {
  fileList.innerHTML = "";
  for (const f of selectedFiles) {
    const row = document.createElement("div");
    row.className = "file-item";
    const left = document.createElement("span");
    left.textContent = f.name;
    const meta = document.createElement("span");
    meta.className = "meta";
    meta.textContent = formatBytes(f.size);
    row.appendChild(left);
    row.appendChild(meta);
    fileList.appendChild(row);
  }
  warnUnknown.hidden = true;
  warnUnknown.textContent = "";
}

/** @param {FileList|File[]} list */
function addFiles(list) {
  const incoming = Array.from(list);
  const seen = new Set(selectedFiles.map((f) => `${f.name}:${f.size}:${f.lastModified}`));
  for (const f of incoming) {
    const key = `${f.name}:${f.size}:${f.lastModified}`;
    if (!seen.has(key)) {
      seen.add(key);
      selectedFiles.push(f);
    }
  }
  renderFileList();
}

function getAssetMode() {
  const el = document.querySelector('input[name="asset-mode"]:checked');
  return parseAssetMode(el?.value ?? "emoji");
}

function getMergeOptions() {
  const orderEl = document.querySelector('input[name="order"]:checked');
  return {
    order: orderEl?.value === "filename" ? "filename" : "selection",
    separator: "none",
  };
}

function renderPreviews(assets, globalWarnings) {
  revokeLastUrls();
  previewGrid.innerHTML = "";
  const lines = [...globalWarnings];
  for (const a of assets) {
    lines.push(...a.warnings);
  }
  copyStatus.textContent = lines.length ? lines.join(" ") : `共 ${assets.length} 张，点击缩略图下方按钮可单张下载。`;

  for (const a of assets) {
    const url = URL.createObjectURL(a.blob);
    lastResults.push({ outName: a.outName, blob: a.blob, objectUrl: url });

    const card = document.createElement("div");
    card.className = "preview-card";

    const img = document.createElement("img");
    img.className = "preview-thumb";
    img.src = url;
    img.alt = a.outName;

    const cap = document.createElement("div");
    cap.className = "preview-caption";
    cap.textContent = a.outName;

    const meta = document.createElement("div");
    meta.className = "preview-meta";
    meta.textContent = `${formatBytes(a.blob.size)} · ${a.mime}`;

    const dl = document.createElement("button");
    dl.type = "button";
    dl.className = "btn secondary btn-dl";
    dl.textContent = "下载此张";
    dl.addEventListener("click", () => {
      const link = document.createElement("a");
      link.href = url;
      link.download = a.outName;
      link.click();
    });

    card.appendChild(img);
    card.appendChild(cap);
    card.appendChild(meta);
    card.appendChild(dl);
    previewGrid.appendChild(card);
  }

  btnZip.disabled = assets.length === 0;
}

async function run() {
  copyStatus.textContent = "";
  revokeLastUrls();
  previewGrid.innerHTML = "";
  btnZip.disabled = true;

  if (!selectedFiles.length) {
    copyStatus.textContent = "请先选择图片。";
    return;
  }

  try {
    const chunks = await readFilesAsText(selectedFiles);
    const { assets, globalWarnings } = await runPipeline(chunks, {
      merge: getMergeOptions(),
      assetMode: getAssetMode(),
    });

    if (!assets.length) {
      copyStatus.textContent = globalWarnings.join(" ") || "没有成功导出的图片。";
      return;
    }

    renderPreviews(assets, globalWarnings);
  } catch (e) {
    copyStatus.textContent = e instanceof Error ? e.message : "处理失败";
  }
}

btnZip?.addEventListener("click", async () => {
  if (!lastResults.length) return;
  copyStatus.textContent = "正在打包…";
  try {
    await downloadZip(`sticker_${getAssetMode()}`, lastResults.map((r) => ({ outName: r.outName, blob: r.blob })));
    copyStatus.textContent = "已下载 ZIP。";
  } catch (e) {
    copyStatus.textContent =
      e instanceof Error ? e.message : "ZIP 失败（请检查网络能否访问 esm.sh 以加载 JSZip）";
  }
});

dropzone?.addEventListener("click", () => fileInput?.click());

dropzone?.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    fileInput?.click();
  }
});

fileInput?.addEventListener("change", () => {
  if (fileInput.files?.length) addFiles(fileInput.files);
  fileInput.value = "";
});

dropzone?.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropzone.classList.add("dragover");
});

dropzone?.addEventListener("dragleave", () => {
  dropzone.classList.remove("dragover");
});

dropzone?.addEventListener("drop", (e) => {
  e.preventDefault();
  dropzone.classList.remove("dragover");
  if (e.dataTransfer?.files?.length) addFiles(e.dataTransfer.files);
});

btnClear?.addEventListener("click", () => {
  selectedFiles = [];
  revokeLastUrls();
  previewGrid.innerHTML = "";
  btnZip.disabled = true;
  renderFileList();
  copyStatus.textContent = "";
});

btnRun?.addEventListener("click", () => {
  void run();
});

document.querySelectorAll('input[name="order"], input[name="asset-mode"]').forEach((el) => {
  el.addEventListener("change", () => {
    /* 切换类型时不自动重跑，避免误触；用户点「转换并预览」 */
  });
});

renderFileList();
