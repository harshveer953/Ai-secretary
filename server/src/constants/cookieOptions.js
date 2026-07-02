import config from "../config/env.js";

const cookieOptions = {
  httpOnly: true,
  secure: config.nodeEnv === "production",
  sameSite: "strict",
};

export default cookieOptions;