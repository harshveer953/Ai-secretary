import asyncHandler from "../../shared/asyncHandler.js";
import ApiResponse from "../../shared/ApiResponse.js";
import HTTP_STATUS from "../../constants/httpStatus.js";
import cookieOptions from "../../constants/cookieOptions.js";

import { registerUser, loginUser, logoutUser ,refreshUserToken } from "./auth.service.js";

// export const register = asyncHandler(async (req, res) => {
//   const user = await registerUser(req.body);

//   return res.status(201).json(
//     new ApiResponse(
//       HTTP_STATUS.CREATED,
//       "User registered successfully.",
//        user,
//     )
//   );
// });

  // REGISTER

export const register = asyncHandler(async (req, res) => {
 
  const user = await registerUser(req.body);

  return res.status(201).json(
    new ApiResponse(201, "User created successfully", user)
  );
});



  // LOGIN

export const login = asyncHandler(async (req, res) => {
  const {user, accessToken, refreshToken} = await loginUser(req.body)

  return res
  .status(HTTP_STATUS.OK)
  .cookie("accessToken", accessToken, cookieOptions)
  .cookie("refreshToken", refreshToken, cookieOptions)
  .json(
    new ApiResponse(
      HTTP_STATUS.OK,
      "Login successful.",
      {
        user,
      }
    )
    
  )
  
})

// Get CurrentUser

export const getCurrentUser = asyncHandler(async (req,res) => {
  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(
      HTTP_STATUS.OK,
      "Current user fetched successfully.",
      req.user
    )
  )
})

 // LOGOUT

 export const logout = asyncHandler(async (req, res) => {

   
      await logoutUser(req.user._id)

      return res
      .clearCookie("accessToken", cookieOptions)
      .clearCookie("refreshToken", cookieOptions)
      .status(HTTP_STATUS.OK)
      .json(
        new ApiResponse(
          HTTP_STATUS.OK,
          "Logout successfully."
        )
      )
 })


    // Refresh Access Token

    export const refreshAccessToken = asyncHandler(async (req, res) => {
        const refreshToken = req.cookies?.refreshToken

        const tokens = await refreshUserToken(refreshToken)

        return res
        .cookie("accessToken" , tokens.accessToken, cookieOptions)
        .cookie("refreshToken", tokens.refreshToken, cookieOptions)
        .status(HTTP_STATUS.OK)
        .json(
          new ApiResponse(
            HTTP_STATUS.OK,
            "Access token refreshed successfully.",
            {
              accessToken: tokens.accessToken,
            }
          )
        )
    })