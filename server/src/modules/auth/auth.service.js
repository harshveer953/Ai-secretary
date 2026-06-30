import User from "../users/user.schema.js"
import ApiError from "../../shared/ApiError.js"
import HTTP_STATUS from "../../constants/httpStatus.js"

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