import User from "../users/user.schema.js"
import ApiError from "../../shared/ApiError.js"
import HTTP_STATUS from "../../constants/httpStatus.js"
import asyncHandler from "../../shared/asyncHandler.js"

export const registerUser = async (userData) => {
    const {fullName, email, password, phone} = userData

    //Check if email already exists
      const existingUser = await User.findOne({email})

    
    if (existingUser) {
        throw new ApiError(
            HTTP_STATUS.CONFLICT,
            "User with this email already exists."
        )
    }

    // Create User 
        const user = await User.create({
        fullName,
        email,
        password,
        phone,
    })

    

    // Remove sensitive fields
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    return createdUser
}

export const loginUser = async (loginData) => {
    const {email , password} = loginData

    // Check if user exists
    const user = await User.findOne({ email })

    if (!user) {
        throw new ApiError(
            HTTP_STATUS.UNAUTHORIZED,
            "Invalid email or password."
        )
    }

    // Check password
    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(
            HTTP_STATUS.UNAUTHORIZED,
            "Invalid email or password."
        )
    }

    // Generate Tokens
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    // Save RefreshToken
    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false })

    // Remove sensitive fields
    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )


    return{
        user: loggedInUser,
        accessToken,
        refreshToken
    }
}

  // LOGOUT

  export const logoutUser = async (userId) => {
    console.log("Received userId:", userId);
    await User.findByIdAndUpdate(
        userId,
        {
            refreshToken: null,
        },
        {
            new: true,
        }
    )
  }