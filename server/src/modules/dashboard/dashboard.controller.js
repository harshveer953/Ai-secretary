import asyncHandler from "../../shared/asyncHandler.js";
import ApiResponse from "../../shared/ApiResponse.js";
import HTTP_STATUS from "../../constants/httpStatus.js";

import {
  getDashboardStats,
} from "./dashboard.service.js";

export const getStats = asyncHandler(async (req, res) => {

  const data = await getDashboardStats(
    req.user._id
  );

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(
      HTTP_STATUS.OK,
      "Dashboard stats fetched successfully.",
      data
    )
  );
});