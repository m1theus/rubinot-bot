import axios from "./client.js";

const generateSession = async () =>
  axios.get("https://rubinot.com/?account/create");

export { generateSession };
