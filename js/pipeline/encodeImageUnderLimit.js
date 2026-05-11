/**
 * 将 canvas 编码为 Blob，尽量不超过 maxBytes（先 PNG，超限再 JPEG 降质量）。
 */

/**
 * @param {HTMLCanvasElement} canvas
 * @param {number} maxBytes
 * @param {{ preferPngFirst?: boolean, warnOnJpeg?: () => void }} opts
 * @returns {Promise<{ blob: Blob, mime: string }>}
 */
export async function encodeImageUnderLimit(canvas, maxBytes, opts = {}) {
  const preferPngFirst = opts.preferPngFirst !== false;

  const toBlob = (type, quality) =>
    new Promise((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("编码失败"))),
        type,
        quality,
      );
    });

  if (preferPngFirst) {
    const pngBlob = /** @type {Blob} */ (await toBlob("image/png"));
    if (pngBlob.size <= maxBytes) {
      return { blob: pngBlob, mime: "image/png" };
    }
  }

  opts.warnOnJpeg?.();
  /** @type {Blob | null} */
  let last = null;
  for (let q = 0.92; q >= 0.28; q -= 0.06) {
    const j = /** @type {Blob} */ (await toBlob("image/jpeg", q));
    last = j;
    if (j.size <= maxBytes) {
      return { blob: j, mime: "image/jpeg" };
    }
  }
  const fallback = /** @type {Blob} */ (await toBlob("image/jpeg", 0.28));
  return { blob: last ?? fallback, mime: "image/jpeg" };
}
