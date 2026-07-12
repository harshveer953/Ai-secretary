import mongoose from "mongoose"
import Appointment from "./appointment.schema.js"
import Contact from "../contacts/contact.schema.js"

import ApiError from "../../shared/ApiError.js"
import HTTP_STATUS from "../../constants/httpStatus.js"


export const createAppointment = async (
    ownerId,
    appointmentData
) => {

    // Check if contact exists and belongs to logged in user
    const contact = await Contact.findOne({
        _id: appointmentData.contact,
        owner: ownerId
    })

    if (!contact) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            "Contact not found."
        )
    }

    // Check if same time slot is already booked
  
   const existingAppointment = await Appointment.findOne({
    owner: ownerId,
     appointmentDate: appointmentData.appointmentDate,
     appointmentTime: appointmentData.appointmentTime,
     status: "scheduled",
   })

   if (existingAppointment) {
     throw new ApiError(
        HTTP_STATUS.CONFLICT,
        "Time slot already booked."
     )
   }

    // Create appointment
    const appointment = await Appointment.create({
        owner: ownerId,
        ...appointmentData,
    })

    return appointment
}



 export const getMyAppointment = async (
    ownerId,
    query = {}
 ) => {

    // Query Parameters
    const {
        page = 1,
        limit = 10,
        search = "",
        sortBy = "createdAt",
        sortOrder = "desc",
        status,

    } = query

    // Pagination
    const skip = (page - 1) * limit


    // mongo filter
    const filter = {
        owner: ownerId,
    }

    // Search
    if (search) {
        filter.title = {
            $regex : search,
            $options : "i",
        }
    }

    // Status Filter
    if (status) {
        filter.status = status
    }

    //Sort 
    const sort = {
        [sortBy]: sortOrder === "asc" ? 1 : -1,
    }


    // Fetch Data
    const appointments = await Appointment.find(filter)
    .populate("contact", "fullName phone email")
    .sort(sort)
    .skip(skip)
    .limit(limit)



    // Count

    const total = await Appointment.countDocuments(filter)



    // Return 
   return {
  appointments,
  pagination: {
    page: Number(page),
    limit: Number(limit),
    total,
    totalPages: Math.ceil(total / limit),
    hasNextPage: page * limit < total,
    hasPrevPage: page > 1,
  },
};

 }

  export const getAppointmentById = async (appointmentId, ownerId) => {
    const appointment = await Appointment.findOne({
        _id: appointmentId,
        owner: ownerId,
    }).populate(
        "contact",
        "fullName phone email company designation"
    )

    if (!appointment) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            "Appointment not found."
        )
    }

    return appointment
}



export const updateAppointment = async (
  appointmentId,
  ownerId,
  updateData
) => {


  const existingAppointment = await Appointment.findOne({
    _id: appointmentId,
    owner: ownerId,
  });



  if (!existingAppointment) {
    throw new ApiError(
      HTTP_STATUS.NOT_FOUND,
      "Appointment not found."
    );
  }

  const appointmentDate =
    updateData.appointmentDate || existingAppointment.appointmentDate;

  const appointmentTime =
    updateData.appointmentTime || existingAppointment.appointmentTime;


  const conflictAppointment = await Appointment.findOne({
    _id: {
      $ne: new mongoose.Types.ObjectId(appointmentId),
    },
    owner: ownerId,
    appointmentDate: new Date(appointmentDate),
    appointmentTime,
    status: "scheduled",
  });

 

  if (conflictAppointment) {
    throw new ApiError(
      HTTP_STATUS.CONFLICT,
      "Time slot already booked."
    );
  }

  Object.assign(existingAppointment, updateData);

  await existingAppointment.save();



  return await existingAppointment.populate(
    "contact",
    "fullName phone email company designation"
  );
};

 export const deleteAppointment = async (appointmentId, ownerId) => {
   const appointment = await Appointment.findOneAndDelete({
    _id: appointmentId,
    owner: ownerId,
   })

   if(!appointment) {
    throw new ApiError(
      HTTP_STATUS.NOT_FOUND,
      "Appointment not found."
    )
   }
 }



 export const updateAppointmentStatus = async (appointmentId, ownerId, status) => {
   
    const appointment = await Appointment.findOneAndUpdate(
      {
        _id: appointmentId,
        owner: ownerId
      },
      {
        status
      },
      {
        new : true,
        runValidators: true
      }

    ).populate(
      "contact",
      "fullName phone email company designation"
    )

    if (!appointment) {
      throw new ApiError(
        HTTP_STATUS.NOT_FOUND,
        "Appointment not found."
      )
    }

    return appointment
 }

 export const getUpcomingAppointments = async(ownerId) => {
  const now = new Date()

  const today = now.toISOString().split("T")[0]

  const currentTime = now.toTimeString().slice(0, 5)


  const appointments = await Appointment.find({
    owner: ownerId,
    status: "scheduled",
    $or: [
      {
        appointmentDate: {
          $gt: new Date(today),
        },
      },
      {
        appointmentDate: new Date(today),
        appointmentTime: {
          $gte: currentTime,
        }
      }
    ]
  })
    .populate(
      "contact",
      "fullName phone email company designation"
    )
    .sort({
      appointmentDate: 1,
      appointmentTime: 1,
    })

    return appointments
 }