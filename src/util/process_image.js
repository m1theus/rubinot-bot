import sharp from "sharp";

async function processImage(imgBuffer) {
  return sharp(imgBuffer)
    .resize({
      width: 960,
      height: 360,
    })
    .flatten({ background: { r: 0, g: 0, b: 0 } })
    .threshold(252)
    .toBuffer();
}

export { processImage };
