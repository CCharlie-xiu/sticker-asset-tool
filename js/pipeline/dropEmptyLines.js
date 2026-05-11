/**
 * 去掉无效条目，且仅保留带 File 的图片类型。
 * @param {import('./types.js').FileChunk[]} chunks
 * @returns {import('./types.js').FileChunk[]}
 */

const IMAGE_EXT = new Set(["png", "gif", "webp", "jpg", "jpeg", "bmp", "avif", "svg"]);

/**
 * @param {import('./types.js').FileChunk} c
 */
function isImageChunk(c) {
  if (!c.file || c.size <= 0 || !c.name.trim()) return false;
  const t = (c.type || "").toLowerCase();
  if (t.startsWith("image/")) return true;
  return IMAGE_EXT.has((c.ext || "").toLowerCase());
}

export function dropEmptyLines(chunks) {
  return chunks.filter(isImageChunk);
}
