import { randomInt } from "node:crypto";
import { workerData, parentPort } from "node:worker_threads";

import pRetry from "p-retry";

import { login } from "./http/login.js";
import { generateSession } from "./http/session.js";
import { downloadImage } from "./http/challenge_code.js";
import { createAccount } from "./http/create_account.js";
import { createCharacter } from "./http/create_character.js";
import {
  createRecaptchaTask,
  retrieveRecaptchaResult,
} from "./http/recaptcha.js";
import { retrieveChallengeCode } from "./util/tesseract.js";

function performTask(workerData) {
  return new Promise(async (resolve) => {
    const { taskId } = workerData;
    await generateSession();

    async function createAccountSync({ account, email, password, name }) {
      const imgBuffer = await downloadImage();
      const reg_code = await retrieveChallengeCode(imgBuffer);
      const recaptchaTask = await createRecaptchaTask();

      let recaptcha = "";
      let isSolveReady = "";
      while (recaptcha === "" && isSolveReady !== "ready") {
        const recaptchaCode = await retrieveRecaptchaResult(
          recaptchaTask?.taskId
        );

        isSolveReady = recaptchaCode?.status;
        recaptcha = recaptchaCode?.solution?.gRecaptchaResponse || "";
      }

      const { error, message } = await createAccount({
        reg_code,
        account,
        email,
        password,
        name,
        recaptcha,
      });

      if (error) {
        throw new Error(`${reg_code}::${message}`);
      }

      return {
        error,
        message: `${reg_code}::${message}`,
      };
    }

    const { error, message } = await pRetry(
      () => createAccountSync(workerData),
      {
        onFailedAttempt: (error) => {
          console.log(
            `[${taskId}] worker:retry => ${error.message} | attempt ${error.attemptNumber} failed. There are ${error.retriesLeft} retries left.`
          );
        },
        retries: 30,
        factor: 0,
        minTimeout: 500,
        maxTimeout: 1000,
      }
    );

    console.log(`[${taskId}] worker:create_account`, { error, message });

    if (!error) {
      let { error, message } = await login({
        account_login: workerData.account,
        password_login: workerData.password,
      });

      console.log(`[${taskId}] worker:login`, { error, message });

      const createCharPromise = Array(9)
        .fill(workerData.name)
        .map((currentCharName) => {
          const pull = "abcdefghijklmnopqrstuvwxyz";

          let postfix = ``;
          postfix += pull.charAt(randomInt(pull.length) - 1);
          postfix += pull.charAt(randomInt(pull.length) - 1);
          postfix += pull.charAt(randomInt(pull.length) - 1);

          const name = `${currentCharName}${postfix}`;
          return createCharacter({ name });
        });

      const promiseResolve = await Promise.all(createCharPromise);

      promiseResolve.forEach((res) => {
        if (!res.hasOwnProperty("data")) {
          const { error, message } = res;
          console.log(`[${taskId}] worker:create_character`, {
            error,
            message,
          });
        }
      });

      resolve(workerData);
    }
  });
}

async function run() {
  const { taskId } = workerData;
  console.log(`[${taskId}] worker:performing_task`);
  const result = await performTask(workerData);
  parentPort.postMessage(result);
  console.log(`[${taskId}] worker:task_finished`);
}

run();
