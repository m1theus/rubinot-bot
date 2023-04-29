import axios from "./client.js";

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

export { login };
