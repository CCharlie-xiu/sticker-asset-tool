# 表情包投放脚本

与同级目录 **《软著代码整理》** 保持**相同的顶层目录习惯**：`index.html`、`css/app.css`、`js/main.js`、`js/io/`、`js/rules/`、`js/pipeline/`、原生 **ES Modules**、无打包。

## 做什么

在浏览器**本地**批量处理图片（不上传服务器）：

| 类型 | 规格（与运营文档对齐） | 说明 |
|------|------------------------|------|
| **表情** | 240×240，单张 ≤500KB | 画布为浅灰底 + `cover` 裁切。一套建议 8～24 张；**不要**在同一批里混 GIF 与其它格式。动图在浏览器内**仅取 GIF 首帧**，完整循环 GIF 请用本地工具制作。 |
| **详情页横幅** | 750×400，≤500KB | 浅灰底（避免纯白底），`cover` 裁切。版式、无字、与表情相关性等由设计侧保证。 |
| **表情封面** | 240×240，透明底，≤500KB | `contain` 放入透明画布，优先 **PNG**；若仍超体积会降级 **JPEG**（不再透明）并提示。 |
| **聊天页图标** | 50×50，透明底，≤100KB | 同上，优先 PNG 再 JPEG压体积。 |

流程：**多图拖放/多选 → 选类型 →「转换并预览」→ 单张下载或「下载全部 ZIP」**（ZIP 通过 `esm.sh` 加载 JSZip，需联网一次）。

## 运行

```bash
npx --yes serve .
```

使用终端给出的 `http://localhost:…` 打开（勿用 `file://`）。

## 目录与扩展

| 路径 | 职责 |
|------|------|
| `js/rules/assetSpecsByMode.js` | 四种素材的宽高、体积上限、透明/裁切策略；**加新模式主要改这里**。 |
| `js/io/fileReader.js` | 把 `File[]` 转成带 `file` 引用的 `FileChunk[]`。 |
| `js/io/loadImageFromFile.js` | `createImageBitmap` / `Image` 解码。 |
| `js/io/zipDownload.js` | 打包 ZIP 并触发下载。 |
| `js/pipeline/canvasFitDraw.js` | `cover` / `contain` 绘制。 |
| `js/pipeline/encodeImageUnderLimit.js` | PNG 优先，超限则 JPEG 降质量。 |
| `js/pipeline/processSingleAsset.js` | 单张完整流程。 |
| `js/pipeline/runPipeline.js` | 批量 + 表情套数/混排提示。 |
| `js/pipeline/dropEmptyLines.js` | 过滤非图片与空文件。 |
| `js/pipeline/types.js` | JSDoc 类型。 |

## 限制

- 无法在纯前端可靠生成**多帧 GIF**；动态表情请本地导出 GIF 后再上传平台。
- 透明、圆角、锯齿、是否含文字等**质检**需人工或后续脚本。
- 非 UTF-8 路径在个别环境下可能异常，与姊妹项目相同建议用本地服务打开。
