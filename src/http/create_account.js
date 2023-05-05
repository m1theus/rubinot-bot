import axios from "./client.js";

const createAccount = async ({
  reg_code,
  account,
  email,
  password,
  name,
  recaptcha,
}) =>
  axios.post(
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
      "g-recaptcha-response": recaptcha,
    })
  );

export { createAccount };
