import fs from "node:fs";
import { randomUUID } from "node:crypto";
import axios from "axios";
import { createWorker } from "tesseract.js";
import sharp from "sharp";

const worker = await createWorker({
  langPath: "https://tessdata.projectnaptha.com/4.0.0",
});

const retrieveRegCode = async (path) => {
  await worker.loadLanguage("eng");
  await worker.initialize("eng");
  await worker.setParameters({
    tessedit_char_whitelist: "123456789HPXTWQM",
  });

  try {
    const {
      jobId,
      data: { text },
    } = await worker.recognize(path);

    const reg_code = text.trim().replace("\n", "");

    return reg_code;
  } catch (error) {
    return "";
  }
};

(async () => {
  const id = randomUUID();
  const { data } = await axios.get(
    "https://rubinot.com/?subtopic=imagebuilder&image_refresher=%27.rand(1,99999).%27",
    {
      responseType: "arraybuffer",
    }
  );

  const finalImageBuffer = await sharp(data)
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .threshold(200)
    .resize(240)
    .png({ palette: true, effort: 1, compressionLevel: 0 })
    .toBuffer();

  fs.writeFileSync(`${id}.png`, finalImageBuffer);

  const text = await retrieveRegCode(finalImageBuffer);
  console.log({ text });

  await worker.terminate();
})();
