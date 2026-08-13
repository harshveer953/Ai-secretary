import asyncHandler from "../../shared/asyncHandler.js"
import ApiResponse from "../../shared/ApiResponse.js"
import HTTP_STATUS from "../../constants/httpStatus.js"

import {
    createReminder,
    getMyReminders,
    getReminderById,
    updateReminder,
    deleteReminder,
} from "./reminder.service.js"

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

export const getAll = asyncHandler(async (req, res) => {
    const result = await getMyReminders(
        req.user._id,
        req.query
    )

    return res.status(HTTP_STATUS.OK).json(
        new ApiResponse(
            HTTP_STATUS.OK,
            "Reminders fetched successfully.",
            result
        )
    )
})

export const getById = asyncHandler(async (req, res) => {
    const reminder = await getReminderById(
        req.params.id,
        req.user._id
    )

    return res.status(HTTP_STATUS.OK).json(
        new ApiResponse(
            HTTP_STATUS.OK,
            "Reminder fetched successfully.",
            reminder
        )
    )
})

export const update = asyncHandler(async (req, res) => {
    const reminder = await updateReminder(
        req.params.id,
        req.user._id,
        req.body
    )

    return res.status(HTTP_STATUS.OK).json(
        new ApiResponse(
            HTTP_STATUS.OK,
            "Reminder updated successfully.",
            reminder
        )
    )
})

export const remove = asyncHandler(async (req, res) => {
    await deleteReminder(
        req.params.id,
        req.user._id
    )

    return res.status(HTTP_STATUS.OK).json(
        new ApiResponse(
            HTTP_STATUS.OK,
            "Reminder deleted successfully."
        )
    )
})


