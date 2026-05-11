/**
 * 将所选图片文件整理为流水线输入块（保留 File 引用供解码）。
 */

/**
 * @param {File[]} files
 * @returns {Promise<import('../pipeline/types.js').FileChunk[]>}
 */
export function readFilesAsText(files) {
  return Promise.all(
    Array.from(files, (file) => {
      const name = file.name;
      const i = name.lastIndexOf(".");
      const ext = i >= 0 ? name.slice(i + 1).toLowerCase() : "";
      return Promise.resolve({
        name,
        ext,
        size: file.size,
        type: file.type || "",
        text: "",
        file,
      });
    }),
  );
}
