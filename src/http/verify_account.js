import axios from "axios";

const verifyAccount = async (account) =>
  axios
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

export { verifyAccount };
