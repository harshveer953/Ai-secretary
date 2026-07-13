import Reminder from "./reminder.schema.js"
import Appointment from "../appointments/appointment.schema.js"

import ApiError from "../../shared/ApiError.js"
import HTTP_STATUS from "../../constants/httpStatus.js"


export const createReminder = async (
    ownerId,
    reminderData
) => {

    // Appointment exists? 
    const appointment = await Appointment.findOne({
        _id: reminderData.appointment,
        owner: ownerId,
    })

    if (!appointment) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            "Appointment not found."
        )
    }

    const reminder = await Reminder.create({
        owner: ownerId,
        ...reminderData,
    })

    return reminder.populate({
        path: "appointment",
        populate : {
            path: "contact",
            select :
            "fullName phone email company designation",
        }
    })
}

