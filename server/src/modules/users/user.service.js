import User from "./user.schema.js"
import HTTP_STATUS from "../../constants/httpStatus.js"
import ApiError from "../../shared/ApiError.js"



export const getUserById = async (userId) => {

    const user = await User.findById(userId)
    .select("-password -refreshToken")

    if (!user) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            "User not found."
        )
    }

    return user
}


export const updateUserRole = async(userId , role) => {

    const user = await User.findByIdAndUpdate(
        userId,
        {
            role,
        },
        {
            new: true,
            runValidators: true,
        }
    ).select("-password -refreshToken")

    if (!user) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            "User not Found."
        )
    }

    return user
}


export const deleteUser = async (userId , loggedInUserId) => {

    if (userId === loggedInUserId.toString()) {
        throw new ApiError(
            HTTP_STATUS.BAD_REQUEST,
            "You can't delete your own account."
        )
    }


    const user = await User.findByIdAndDelete(userId)

    if (!user) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            "User not found."
        )
    }

    return user
}