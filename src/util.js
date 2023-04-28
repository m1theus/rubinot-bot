import fs from "node:fs";

import axios from "axios";

import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";
import { createWorker } from "tesseract.js";

const worker = await createWorker({
  langPath: "https://tessdata.projectnaptha.com/4.0.0",
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
  client.post(
    "https://rubinot.com/?account/manage",
    new URLSearchParams({
      account_login,
      password_login,
      authenticator: "",
      page: "overview",
    }),
    {
      headers: {
        authority: "rubinot.com",
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "accept-language": "en-US,en;q=0.9",
        "cache-control": "max-age=0",
        origin: "https://rubinot.com",
        referer: "https://rubinot.com/?account/manage",
        "sec-ch-ua":
          '"Chromium";v="112", "Google Chrome";v="112", "Not:A-Brand";v="99"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "same-origin",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1",
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36",
      },
    }
  );

const createCharacter = async ({ name }) =>
  client.post(
    "https://rubinot.com/?account/character/create",
    new URLSearchParams({
      name,
      save: "1",
      sex: "1",
      world: "0",
    }),
    {
      headers: {
        authority: "rubinot.com",
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "accept-language": "en-US,en;q=0.9",
        "cache-control": "max-age=0",
        origin: "https://rubinot.com",
        referer: "https://rubinot.com/?account/manage",
        "sec-ch-ua":
          '"Chromium";v="112", "Google Chrome";v="112", "Not:A-Brand";v="99"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "same-origin",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1",
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36",
      },
    }
  );

const verifyAccount = async (account) =>
  client
    .get(`https://rubinot.com/tools/validate.php?account=${account}`)
    .then((response) => {
      if (response?.data.hasOwnProperty("error")) {
        return {
          error: true,
          msg: response?.data?.error,
        };
      }

      return {
        error: false,
      };
    })
    .catch((err) => ({ error: true, err }));

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

const handleRecoveryKeyBody = (body) => {
  if (body?.includes("Generate recovery key")) {
    return {
      error: true,
      message: "Error creating account...",
      errData: body,
    };
  }

  if (body?.includes("The Following Errors Have Occurred")) {
    return {
      error: true,
      message: "Error creating account...",
      errData: body,
    };
  }

  if (body?.includes("Character Created")) {
    return {
      error: true,
      message: "Error creating account...",
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
    } = await worker.recognize(path);

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
  createCharacter,
  login,
  verifyAccount,
};
