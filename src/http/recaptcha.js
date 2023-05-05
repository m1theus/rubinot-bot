import axios from "axios";

const createRecaptchaTask = async () =>
  axios
    .post("https://api.capsolver.com/createTask", {
      clientKey: "CAI-58520A57A7C3759C745ED63A4131147D",
      task: {
        type: "ReCaptchaV2TaskProxyLess",
        websiteURL: "https://rubinot.com/?account/create",
        websiteKey: "6LdmLtglAAAAAPn1KOadEsA_zfu0DGXbPArm-fOf",
      },
    })
    .then((r) => r.data);

const retrieveRecaptchaResult = async (taskId) =>
  axios
    .post("https://api.capsolver.com/getTaskResult", {
      clientKey: "CAI-58520A57A7C3759C745ED63A4131147D",
      taskId,
    })
    .then((r) => r.data);

export { createRecaptchaTask, retrieveRecaptchaResult };
