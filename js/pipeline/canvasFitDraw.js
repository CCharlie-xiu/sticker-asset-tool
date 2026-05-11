/**
 * 在固定画布内绘制图片：cover（铺满裁切）或 contain（完整放入）。
 */

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} cw
 * @param {number} ch
 * @param {CanvasImageSource} img
 * @param {'cover'|'contain'} fit
 */
export function drawImageFit(ctx, cw, ch, img, fit) {
  const iw = "width" in img ? img.width : img.naturalWidth;
  const ih = "height" in img ? img.height : img.naturalHeight;
  if (!iw || !ih) return;

  if (fit === "contain") {
    const scale = Math.min(cw / iw, ch / ih);
    const dw = iw * scale;
    const dh = ih * scale;
    const ox = (cw - dw) / 2;
    const oy = (ch - dh) / 2;
    ctx.drawImage(img, ox, oy, dw, dh);
    return;
  }

  const ir = iw / ih;
  const cr = cw / ch;
  let dw;
  let dh;
  let ox;
  let oy;
  if (ir > cr) {
    dh = ch;
    dw = iw * (ch / ih);
    ox = (cw - dw) / 2;
    oy = 0;
  } else {
    dw = cw;
    dh = ih * (cw / iw);
    ox = 0;
    oy = (ch - dh) / 2;
  }
  ctx.drawImage(img, ox, oy, dw, dh);
}
