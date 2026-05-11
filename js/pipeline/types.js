/**
 * 流水线类型约定（与姊妹项目文件名一致，字段按图片处理场景扩展）。
 */

/**
 * @typedef {Object} FileChunk
 * @property {string} name
 * @property {string} ext
 * @property {number} size
 * @property {string} type
 * @property {string} text 占位，恒为空串
 * @property {File} [file] 原始文件引用
 */

/**
 * @typedef {'selection'|'filename'} MergeOrder
 */

/**
 * @typedef {'none'|'blank'|'filename'} MergeSeparator
 */

/**
 * @typedef {Object} MergeOptions
 * @property {MergeOrder} order
 * @property {MergeSeparator} [separator] 预留
 */

/**
 * @typedef {import('../rules/assetSpecsByMode.js').AssetMode} AssetMode
 */

/**
 * @typedef {Object} PipelineOptions
 * @property {MergeOptions} merge
 * @property {AssetMode} [assetMode] 表情 | 横幅 | 封面 | 图标 | 赞赏引导 | 赞赏致谢
 */

export {};
