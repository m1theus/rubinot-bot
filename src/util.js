import fs from "node:fs";

import axios from "axios";

import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";
import { createWorker } from "tesseract.js";

const worker = await createWorker({
  // logger: m => console.log(m)
});

const jar = new CookieJar();
const client = wrapper(axios.create({ jar }));

async function generateSession() {
  return client.get("https://rubinot.com/?account/create");
}

async function downloadImage(path) {
  const writer = fs.createWriteStream(path);

  const response = await client.get(
    "https://rubinot.com/?subtopic=imagebuilder&image_refresher=%27.rand(1,99999).%27",
    {
      responseType: "stream",
    }
  );

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

const createAccount = async ({ reg_code, account, email, password, name }) =>
  client.post(
    "https://rubinot.com/?account/create",
    new URLSearchParams({
      account,
      reg_code,
      email,
      password,
      password2: password,
      name: name,
      country: "pl",
      sex: "1",
      world: "0",
      accept_rules: "true",
      save: "1",
    })
  );

const recoveryKey = async (password) =>
  axios.post(
    "https://rubinot.com/?account/register",
    new URLSearchParams({
      registeraccountsave: "1",
      reg_password: password,
    })
  );

const login = async ({ account_login, password_login }) =>
  axios.post(
    "https://rubinot.com/?account/manage",
    new URLSearchParams({
      account_login,
      password_login,
      authenticator: "",
      page: "overview",
    })
  );

const handleCreateAccountBody = (body) => {
  if (body?.includes("The Following Errors Have Occurred")) {
    console.log("Error creating account...");
    return {
      error: true,
      message: "Error creating account...",
      errData: body,
    };
  } else if (body?.includes("Account Created")) {
    console.log("account created!");
    return {
      error: false,
      message: "account created!",
      errData: body,
    };
  }
};

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
    } = await worker.recognize(path, {
      rectangle: { top: 0, left: 0, width: 80, height: 30 },
    });

    const reg_code = text.trim().replace("\n", "");

    return reg_code;
  } catch (error) {
    return "";
  }
};

const CREATE_ACCOUNT_QUEUE = "create_account";

export {
  generateSession,
  retrieveRegCode,
  downloadImage,
  createAccount,
  recoveryKey,
  handleCreateAccountBody,
  CREATE_ACCOUNT_QUEUE,
};
