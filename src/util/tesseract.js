import { createWorker } from "tesseract.js";

const worker = await createWorker({
  langPath: "https://tessdata.projectnaptha.com/4.0.0",
});

const retrieveChallengeCode = async (imgBuffer) => {
  await worker.loadLanguage("eng");
  await worker.initialize("eng");
  await worker.setParameters({
    tessedit_char_whitelist: "123456789HPXTWQM",
  });

  try {
    const {
      jobId,
      data: { text },
    } = await worker.recognize(imgBuffer);

    const reg_code = text.trim().replace("\n", "");

    return reg_code;
  } catch (error) {
    return "";
  }
};

export { retrieveChallengeCode, worker };
