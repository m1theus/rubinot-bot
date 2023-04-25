import fs from "node:fs";
import numberToWords from "number-to-words";
import {
  generateSession,
  login,
  retrieveRegCode,
  downloadImage,
  createAccount,
  recoveryKey,
  handleCreateAccountBody,
} from "./util.js";

const CreateAccountService = {
  createAccountAsync: async ({
    account_pattern,
    email_pattern,
    password,
    character_pattern,
    quantity,
  }) => {
    const result = [];
    const data = new Array(parseInt(quantity) || 1)
      .fill(account_pattern)
      .map((accountName, index) => {
        const account = `${accountName}${index + 1}`;
        const character = `${character_pattern}${numberToWords.toWords(
          index + 1
        )}`
          .split("-")
          .join(" ")
          .replace(" ", "")
          .trim();

        const [em1, em2] = email_pattern.split("@");
        const email = `${em1}+${account}@${em2}`.trim();

        return {
          account,
          email,
          password,
          character,
        };
      });

    for (let index = 0; index < data.length; index++) {
      const { account, email, password, character } = data[index];

      try {
        await generateSession();
        await downloadImage(`${account}.png`);
        const reg_code = await retrieveRegCode(`${account}.png`);
        fs.rmSync(`${account}.png`);
        console.log(`[${account}] - reg_code: ${reg_code}`);

        const { data } = await createAccount(reg_code, {
          account,
          email,
          password,
          password2: password,
          name: character,
        });
        const { error, errData } = handleCreateAccountBody(data);

        if (!error) {
          result.push({
            account,
            email,
            password,
            character,
          });
        }
      } catch (error) {
        console.log(`Error creating account...${account}`, error);
      }
    }

    return {
      data: result,
    };
  },
};

export { CreateAccountService };
