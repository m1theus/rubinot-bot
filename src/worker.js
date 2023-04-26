import { rmSync, writeFileSync } from "node:fs";

import {
  generateSession,
  retrieveRegCode,
  downloadImage,
  createAccount,
  handleCreateAccountBody,
} from "./util.js";

async function performCreateAccountTask({
  id,
  data: { account, email, password, character },
}) {
  console.log("processing account:", account);
  const imgPath = `${account}.png`;
  await generateSession();
  await downloadImage(imgPath);
  const reg_code = await retrieveRegCode(imgPath);
  rmSync(imgPath);
  console.log(`[${account}] - reg_code: ${reg_code}`);
  const { data } = await createAccount({
    reg_code,
    account,
    email,
    password,
    password2: password,
    name: character,
  });
  const { error, errData } = handleCreateAccountBody(data);

  if (!error) {
    return {
      id,
      account,
      email,
      password,
      character,
      status: "COMPLETED",
    };
  } else {
    throw new Error();
  }
}

export { performCreateAccountTask };
