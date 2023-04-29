import axios from "./client.js";
import { processImage } from "../util/process_image.js";

const downloadImage = async () => {
  const { data } = await axios.get(
    "https://rubinot.com/?subtopic=imagebuilder&image_refresher=%27.rand(1,99999).%27",
    {
      responseType: "arraybuffer",
    }
  );

  const finalImageBuffer = await processImage(data);

  return finalImageBuffer;
};

export { downloadImage };
