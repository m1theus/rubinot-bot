import axios from "axios";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";

const jar = new CookieJar();
const axiosClient = wrapper(axios.create({ jar }));

axiosClient.interceptors.response.use(
  function (response) {
    const { data } = response;

    // handle wrong login
    if (data?.includes("Account name or password is not correct.")) {
      return {
        message: "Account name or password is not correct.",
        error: true,
        errData: data,
      };
    }

    // handle verification code is incorrect
    if (data?.includes("Verification code is incorrect.")) {
      return {
        message: "Verification code is incorrect.",
        error: true,
        errData: data,
      };
    }

    // handle account created
    if (data?.includes("Account Created")) {
      return {
        message: "Account Created!",
        error: false,
        errData: data,
      };
    }

    // handle character created
    if (data?.includes("Character Created")) {
      return {
        message: "Character Created!",
        error: false,
        errData: data,
      };
    }

    // handle login success
    if (data?.includes("Generate recovery key")) {
      return {
        message: "success login!",
        error: false,
        errData: data,
      };
    }

    // handle generic error
    if (data?.includes("The Following Errors Have Occurred")) {
      return {
        message: "Generic Error [The Following Errors Have Occurred]",
        error: true,
        errData: data,
      };
    }

    return response;
  },
  function (error) {
    return Promise.reject(error);
  }
);

export default axiosClient;
export { axiosClient };
