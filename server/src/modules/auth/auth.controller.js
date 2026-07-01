import asyncHandler from "../../shared/asyncHandler.js";
import ApiResponse from "../../shared/ApiResponse.js";
import HTTP_STATUS from "../../constants/httpStatus.js";

import { registerUser, loginUser } from "./auth.service.js";

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

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(
      HTTP_STATUS.OK,
      "Login successful.",
      {
        user,
        accessToken,
        refreshToken,
      }
    )
  )
})

