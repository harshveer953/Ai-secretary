import asyncHandler from "../../shared/asyncHandler.js";
import ApiResponse from "../../shared/ApiResponse.js";
import HTTP_STATUS from "../../constants/httpStatus.js";

import { registerUser } from "./auth.service.js";

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

export const register = asyncHandler(async (req, res) => {
 
  console.log(req.body);

  const user = await registerUser(req.body);

  

  return res.status(201).json(
    new ApiResponse(201, "User created successfully", user)
  );
});



