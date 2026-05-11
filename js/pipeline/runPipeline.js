/**
 * 批量处理：解码 → 单张规格化 → 返回结果与全局提示。
 */

import { loadImageFromFile } from "../io/loadImageFromFile.js";
import { ASSET_SPECS, EMOJI_SET_MAX, EMOJI_SET_MIN, parseAssetMode } from "../rules/assetSpecsByMode.js";
import { dropEmptyLines } from "./dropEmptyLines.js";
import { processSingleAsset } from "./processSingleAsset.js";

/**
 * @typedef {Object} ProcessedAsset
 * @property {string} sourceName
 * @property {string} outName
 * @property {Blob} blob
 * @property {string} mime
 * @property {string[]} warnings
 */

/**
 * @param {import('./types.js').FileChunk[]} chunks
 * @param {import('./types.js').PipelineOptions} options
 * @returns {Promise<{ assets: ProcessedAsset[], globalWarnings: string[] }>}
 */
export async function runPipeline(chunks, options) {
  const mode = parseAssetMode(options.assetMode ?? "emoji");
  const spec = ASSET_SPECS[mode];
  const globalWarnings = [];

  const withFile = dropEmptyLines(chunks).filter((c) => c.file);
  if (!withFile.length) {
    return {
      assets: [],
      globalWarnings: ["没有可处理的图片文件（请确认选择的是 png / jpg / gif / webp 等图片）。"],
    };
  }

  if (mode === "emoji") {
    const n = withFile.length;
    if (n < EMOJI_SET_MIN || n > EMOJI_SET_MAX) {
      globalWarnings.push(
        `表情一套建议 ${EMOJI_SET_MIN}～${EMOJI_SET_MAX} 张，当前 ${n} 张（仍可导出）。`,
      );
    }
    const hasGif = withFile.some((c) => c.ext === "gif" || /gif/i.test(c.type));
    const hasNonGif = withFile.some((c) => c.ext !== "gif" && !/gif/i.test(c.type));
    if (hasGif && hasNonGif) {
      globalWarnings.push(
        "同一套表情不可混用静态与动态：当前同时包含 GIF 与其它格式，请拆成两套分别导出。",
      );
    }
    if (hasGif) {
      globalWarnings.push(
        "浏览器内处理动图仅使用首帧；完整循环 GIF 请用 ImageMagick、ScreenToGif 等工具制作。",
      );
    }
  }

  /** @type {import('./types.js').FileChunk[]} */
  let ordered = [...withFile];
  if (options.merge?.order === "filename") {
    ordered.sort((a, b) =>
      a.name.localeCompare(b.name, "zh-Hans-CN", { sensitivity: "base" }),
    );
  }

  /** @type {ProcessedAsset[]} */
  const assets = [];
  for (const chunk of ordered) {
    const file = /** @type {File} */ (chunk.file);
    const bitmap = await loadImageFromFile(file);
    try {
      const r = await processSingleAsset(file, spec, bitmap);
      assets.push({
        sourceName: chunk.name,
        outName: r.outName,
        blob: r.blob,
        mime: r.mime,
        warnings: r.warnings,
      });
    } finally {
      if ("close" in bitmap && typeof bitmap.close === "function") {
        bitmap.close();
      }
    }
  }

  return { assets, globalWarnings };
}
