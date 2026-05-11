/**
 * 微信表情素材规格（与运营文档图1～图4 对齐）。
 * 扩展新模式：在此增加键与字段，并在 processSingleAsset / UI 中接入。
 */

/** @typedef {'emoji'|'banner'|'cover'|'icon'} AssetMode */

/**
 * @typedef {Object} AssetSpec
 * @property {number} width
 * @property {number} height
 * @property {number} maxBytes 单张体积上限（超出则自动降 JPEG 质量等）
 * @property {'png'|'jpeg'|'png-or-jpeg'} outputKind png=透明优先；jpeg=不透明；png-or-jpeg=先 png 超限再转 jpeg
 * @property {boolean} transparentCanvas 是否在绘制前 clearRect（透明底）
 * @property {string} [opaqueFill] 非透明底时的 CSS 颜色（横幅避免纯白底）
 * @property {'cover'|'contain'} fit cover=铺满裁切；contain=完整放入、余下透明或底色
 * @property {string} label 中文说明
 */

/** @type {Record<AssetMode, AssetSpec>} */
export const ASSET_SPECS = {
  /** 图1 表情：240×240；静态 JPG/PNG/GIF，动态须 GIF（本工具动图仅保留首帧，见 README） */
  emoji: {
    width: 240,
    height: 240,
    maxBytes: 500 * 1024,
    outputKind: "png-or-jpeg",
    transparentCanvas: false,
    opaqueFill: "#f0f0f0",
    fit: "cover",
    label: "表情 240×240，≤500KB",
  },
  /** 图2 详情页横幅：750×400，JPG/PNG，≤500KB，无字、避免白底等由设计侧保证 */
  banner: {
    width: 750,
    height: 400,
    maxBytes: 500 * 1024,
    outputKind: "png-or-jpeg",
    transparentCanvas: false,
    opaqueFill: "#f5f5f5",
    fit: "cover",
    label: "横幅 750×400，≤500KB",
  },
  /** 图3 封面：240×240 PNG，透明底，≤500KB */
  cover: {
    width: 240,
    height: 240,
    maxBytes: 500 * 1024,
    outputKind: "png-or-jpeg",
    transparentCanvas: true,
    fit: "contain",
    label: "封面 240×240 PNG，≤500KB，透明底",
  },
  /** 图4 聊天页图标：50×50 PNG，透明底，≤100KB */
  icon: {
    width: 50,
    height: 50,
    maxBytes: 100 * 1024,
    outputKind: "png-or-jpeg",
    transparentCanvas: true,
    fit: "contain",
    label: "图标 50×50 PNG，≤100KB，透明底",
  },
};

/** 表情一套建议 8～24 张（仅提示，不拦截） */
export const EMOJI_SET_MIN = 8;
export const EMOJI_SET_MAX = 24;

/** @param {string} v */
export function parseAssetMode(v) {
  if (v === "banner" || v === "cover" || v === "icon") return v;
  return "emoji";
}
