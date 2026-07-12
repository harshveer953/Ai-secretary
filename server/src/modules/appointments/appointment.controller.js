import asyncHandler from "../../shared/asyncHandler.js"
import ApiResponse from "../../shared/ApiResponse.js"
import HTTP_STATUS from "../../constants/httpStatus.js"

import { createAppointment, getAppointmentById, getMyAppointment, updateAppointment, deleteAppointment, updateAppointmentStatus, getUpcomingAppointments } from "./appointment.service.js"


export const create = asyncHandler(async (req,res) => {

    const appointment = await createAppointment(
        req.user._id,
        req.body
    )

    return res.status(HTTP_STATUS.CREATED).json(
        new ApiResponse(
            HTTP_STATUS.CREATED,
            "Appointment created successfully.",
            appointment
        )
    )
   
})

export const getAll = asyncHandler(async (req,res) =>{
    const data = await getMyAppointment(
        req.user._id,
        req.query
    )

    return res.status(HTTP_STATUS.OK).json(
        new ApiResponse(
            HTTP_STATUS.OK,
            "Appointments fetched successfully.",
            data
        )
    )
})
 
 export const getById = asyncHandler(async (req, res) => {
    const appointment = await getAppointmentById(
        req.params.id,
        req.user._id
    )

    return res.status(HTTP_STATUS.OK).json(
        new ApiResponse(
            HTTP_STATUS.OK,
            "Appointment fetched successfully.",
            appointment
        )
    )
 })

  export const update = asyncHandler(async (req,res) => {
    const appointment = await updateAppointment(
        req.params.id,
        req.user._id,
        req.body
    )

    return res.status(HTTP_STATUS.OK).json(
        new ApiResponse(
            HTTP_STATUS.OK,
            "Appointment updated successfully.",
            appointment
        )
    )
  })


   export const remove = asyncHandler(async (req,res) => {
     await deleteAppointment(
        req.params.id,
        req.user._id,
     )

     return res.status(HTTP_STATUS.OK).json(
        new ApiResponse(
            HTTP_STATUS.OK,
            "Appointment deleted successfully.",
            null
        )
     )
   })

   
   export const status = asyncHandler(async (req,res) => {
    const appointment = await updateAppointmentStatus(
        req.params.id,
        req.user._id,
        req.body.status
    )

    return res.status(HTTP_STATUS.OK).json(
        new ApiResponse(
            HTTP_STATUS.OK,
            "Appointment status updated successfully.",
            appointment
        )
    )
   })


   export const getUpcoming = asyncHandler(async (req,res) => {
    const appointments = await getUpcomingAppointments(
        req.user._id
    )

    return res.status(HTTP_STATUS.OK).json(
        new ApiResponse(
            HTTP_STATUS.OK,
            "Upcoming appointment fetched successfully.",
            appointments
        )
    )
   })