import asyncHandler from "../../shared/asyncHandler.js"
import ApiResponse from "../../shared/ApiResponse.js"
import HTTP_STATUS from "../../constants/httpStatus.js"

import { createReminder } from "./reminder.service.js"

export const create = asyncHandler(async (req,res) => {
    const reminder = await createReminder(
        req.user._id,
        req.body
    )

    return res.status(HTTP_STATUS.CREATED).json(
        new ApiResponse(
            HTTP_STATUS.CREATED,
            "Reminder created successfully.",
            reminder

        )
    )
})

