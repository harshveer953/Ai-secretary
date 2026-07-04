import asyncHandler from "../../shared/asyncHandler.js";
import ApiResponse from "../../shared/ApiResponse.js";
import HTTP_STATUS from "../../constants/httpStatus.js";
import User from "./user.schema.js";
import { getUserById, updateUserRole, deleteUser } from "./user.service.js";

export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password -refreshToken")

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(
      HTTP_STATUS.OK,
      "Users fetched successfully.",
      users
    )
  );
});


export const getUser = asyncHandler(async (req, res) => {
  const user = await getUserById(req.params.id)

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(
      HTTP_STATUS.OK,
      "User fetched successfully.",
      user
    )
  )
})

export const updateRole = asyncHandler(async (req, res) => {
  const user = await updateUserRole(
    req.params.id,
    req.body.role
  );

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(
      HTTP_STATUS.OK,
      "User role updated successfully.",
      user
    )
  );
});


export const removeUser = asyncHandler(async (req,res) => {
        await deleteUser(
          req.params.id,
          req.user._id
        )

        return res.status(HTTP_STATUS.OK).json(
          new ApiResponse(
            HTTP_STATUS.OK,
            "User deleted successfully."
          )
        )
})