/**
 * 从本地 File 解码为可绘制位图（动图仅取首帧，与 createImageBitmap 行为一致）。
 */

/**
 * @param {File} file
 * @returns {Promise<ImageBitmap|HTMLImageElement>}
 */
export async function loadImageFromFile(file) {
  try {
    const bmp = await createImageBitmap(file);
    return bmp;
  } catch {
    const url = URL.createObjectURL(file);
    try {
      const img = new Image();
      img.decoding = "async";
      const done = new Promise((resolve, reject) => {
        img.onload = () => resolve(undefined);
        img.onerror = () => reject(new Error("图片无法解码"));
      });
      img.src = url;
      await done;
      return img;
    } finally {
      URL.revokeObjectURL(url);
    }
  }
}
