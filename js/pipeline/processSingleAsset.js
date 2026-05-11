/**
 * 单张图片：按规格绘制到画布并编码。
 */

import { drawImageFit } from "./canvasFitDraw.js";
import { encodeImageUnderLimit } from "./encodeImageUnderLimit.js";

/**
 * @param {File} file
 * @param {import('../rules/assetSpecsByMode.js').AssetSpec} spec
 * @param {CanvasImageSource} bitmap
 * @returns {Promise<{ blob: Blob, mime: string, outName: string, warnings: string[] }>}
 */
export async function processSingleAsset(file, spec, bitmap) {
  const warnings = [];
  const canvas = document.createElement("canvas");
  canvas.width = spec.width;
  canvas.height = spec.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("无法创建 Canvas 上下文");

  if (spec.transparentCanvas) {
    ctx.clearRect(0, 0, spec.width, spec.height);
  } else {
    ctx.fillStyle = spec.opaqueFill ?? "#f0f0f0";
    ctx.fillRect(0, 0, spec.width, spec.height);
  }

  drawImageFit(ctx, spec.width, spec.height, bitmap, spec.fit);

  const preferPngFirst = spec.outputKind !== "jpeg";
  const { blob, mime } = await encodeImageUnderLimit(canvas, spec.maxBytes, {
    preferPngFirst,
    warnOnJpeg: () => {
      if (spec.transparentCanvas) {
        warnings.push(
          `${file.name}：体积仍偏大，已改用 JPEG（不透明）；若必须透明 PNG 请在本地用专业工具压图。`,
        );
      }
    },
  });

  const base = file.name.replace(/\.[^/.]+$/, "");
  const ext = mime === "image/png" ? "png" : "jpg";
  const outName = `${base}_${spec.width}x${spec.height}.${ext}`;

  if (blob.size > spec.maxBytes) {
    warnings.push(`${file.name}：导出约 ${(blob.size / 1024).toFixed(0)}KB，仍略高于建议上限 ${(spec.maxBytes / 1024).toFixed(0)}KB。`);
  }

  return { blob, mime, outName, warnings };
}
