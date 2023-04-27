import { rmSync } from "node:fs";

import {
  generateSession,
  retrieveRegCode,
  downloadImage,
  createAccount,
  handleCreateAccountBody,
  login,
  createCharacter,
} from "./util.js";

async function performCreateAccountTask({
  id,
  data: { account, email, password, character_pattern },
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
    name: `${character_pattern}um`,
  });
  const { error, errData } = handleCreateAccountBody(data);

  if (!error) {
    const characters = await performCreateCharacterTask({
      account,
      password,
      character_pattern,
    });

    return {
      id,
      account,
      email,
      password,
      characters,
      status: "COMPLETED",
    };
  } else {
    throw new Error();
  }
}

async function performCreateCharacterTask({
  account,
  password,
  character_pattern,
}) {
  const { data: loginBody } = await login({
    account_login: account,
    password_login: password,
  });

  const numerosPorExtenso = new Map([
    [2, "dois"],
    [3, "tres"],
    [4, "quatro"],
    [5, "cinco"],
    [6, "seis"],
    [7, "sete"],
    [8, "oito"],
    [9, "nove"],
    [10, "dez"],
  ]);

  const charResult = [];
  for (let index = 1; index < 10; index++) {
    const name = `${character_pattern}${numerosPorExtenso.get(index + 1)}`;
    const { data } = await createCharacter({ name });
    console.log(`creating char: `, name);
    charResult.push(name);
  }

  return charResult;
}

export { performCreateAccountTask, performCreateCharacterTask };
