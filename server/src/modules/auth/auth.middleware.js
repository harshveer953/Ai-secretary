import jwt from "jsonwebtoken"

import asyncHandler from "../../shared/asyncHandler.js"
import ApiError from "../../shared/ApiError.js"
import HTTP_STATUS from "../../constants/httpStatus.js"
import config from "../../config/env.js"
import User from "../users/user.schema.js"



const authMiddleware = asyncHandler(async (req, res, next) => {

  const accessToken =
    req.cookies?.accessToken ||
    req.headers.authorization?.split(" ")[1];

  if (!accessToken) {
    throw new ApiError(
      HTTP_STATUS.UNAUTHORIZED,
      "Access token is missing."
    );
  }

  let decoded;

  try {
    decoded = jwt.verify(accessToken, config.jwtAccessSecret);
  } catch (error) {
    throw new ApiError(
      HTTP_STATUS.UNAUTHORIZED,
      "Invalid or expired access token."
    );
  }

  const user = await User.findById(decoded.id).select(
    "-password -refreshToken"
  );

  if (!user) {
    throw new ApiError(
      HTTP_STATUS.UNAUTHORIZED,
      "User not found."
    );
  }

  req.user = user;

  next();
});

export default authMiddleware;