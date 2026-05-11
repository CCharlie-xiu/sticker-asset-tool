/**
 * 浏览器内打包 ZIP 并触发下载（依赖 esm.sh 上的 JSZip，需联网一次）。
 */

/**
 * @param {string} baseName 不含扩展名
 * @param {{ outName: string, blob: Blob }[]} entries
 */
export async function downloadZip(baseName, entries) {
  const { default: JSZip } = await import("https://esm.sh/jszip@3.10.1");
  const zip = new JSZip();
  for (const e of entries) {
    zip.file(e.outName, e.blob);
  }
  const blob = await zip.generateAsync({ type: "blob" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${baseName}.zip`;
  a.click();
  URL.revokeObjectURL(a.href);
}
