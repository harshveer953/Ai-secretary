import Appointment from "./appointment.schema.js";
import Contact from "../contacts/contact.schema.js";
import Reminder from "../reminders/reminder.schema.js";

import ApiError from "../../shared/ApiError.js";
import HTTP_STATUS from "../../constants/httpStatus.js";


// ========================================
// HELPER
// CREATE / UPDATE REMINDER
// ========================================

const syncAppointmentReminder = async (
  appointment,
  ownerId
) => {

  // ========================================
  // ONLY SCHEDULED APPOINTMENTS NEED REMINDER
  // ========================================

  if (appointment.status !== "scheduled") {

    await Reminder.deleteOne({
      appointment: appointment._id,
      owner: ownerId,
    });

    return;

  }


  // ========================================
  // CALCULATE REMINDER TIME
  // 30 MINUTES BEFORE APPOINTMENT
  // ========================================

  const reminderTime =
    new Date(
      appointment.appointmentDate
    );


  const [
    hours,
    minutes,
  ] =
    appointment
      .appointmentTime
      .split(":")
      .map(Number);


  reminderTime.setHours(
    hours
  );

  reminderTime.setMinutes(
    minutes - 30
  );

  reminderTime.setSeconds(
    0
  );

  reminderTime.setMilliseconds(
    0
  );


  // ========================================
  // FIND EXISTING REMINDER
  // ========================================

  const existingReminder =
    await Reminder.findOne({
      appointment: appointment._id,
      owner: ownerId,
    });


  // ========================================
  // UPDATE EXISTING REMINDER
  // ========================================

  if (existingReminder) {

    existingReminder.reminderTime =
      reminderTime;

    existingReminder.sent =
      false;

    existingReminder.sentAt =
      null;

    await existingReminder.save();

    return existingReminder;

  }


  // ========================================
  // CREATE NEW REMINDER
  // ========================================

  return await Reminder.create({

    owner: ownerId,

    appointment:
      appointment._id,

    reminderType:
      "email",

    reminderTime,

  });

};



// ========================================
// CREATE APPOINTMENT
// ========================================

export const createAppointment = async (
  ownerId,
  appointmentData
) => {

  // ========================================
  // CHECK CONTACT
  // ========================================

  const contact =
    await Contact.findOne({

      _id:
        appointmentData.contact,

      owner:
        ownerId,

    });


  if (!contact) {

    throw new ApiError(
      HTTP_STATUS.NOT_FOUND,
      "Contact not found."
    );

  }


  // ========================================
  // CHECK TIME SLOT CONFLICT
  // ========================================

  const existingAppointment =
    await Appointment.findOne({

      owner:
        ownerId,

      appointmentDate:
        new Date(
          appointmentData.appointmentDate
        ),

      appointmentTime:
        appointmentData.appointmentTime,

      status:
        "scheduled",

    });


  if (existingAppointment) {

    throw new ApiError(
      HTTP_STATUS.CONFLICT,
      "Time slot already booked."
    );

  }


  // ========================================
  // CREATE APPOINTMENT
  // ========================================

  const appointment =
    await Appointment.create({

      owner:
        ownerId,

      ...appointmentData,

    });


  // ========================================
  // CREATE REMINDER
  // ========================================

  await syncAppointmentReminder(
    appointment,
    ownerId
  );


  // ========================================
  // RETURN APPOINTMENT
  // ========================================

  return await appointment.populate(
    "contact",
    "fullName phone email company designation"
  );

};



// ========================================
// GET MY APPOINTMENTS
// ========================================

export const getMyAppointment = async (
  ownerId,
  query = {}
) => {

  // ========================================
  // QUERY PARAMETERS
  // ========================================

  const {

    page = 1,

    limit = 10,

    search = "",

    sortBy = "createdAt",

    sortOrder = "desc",

    status,

  } = query;


  const pageNumber =
    Number(page);

  const limitNumber =
    Number(limit);


  // ========================================
  // PAGINATION
  // ========================================

  const skip =
    (pageNumber - 1) *
    limitNumber;


  // ========================================
  // FILTER
  // ========================================

  const filter = {

    owner:
      ownerId,

  };


  // ========================================
  // SEARCH
  // ========================================

  if (search) {

    filter.title = {

      $regex:
        search,

      $options:
        "i",

    };

  }


  // ========================================
  // STATUS FILTER
  // ========================================

  if (status) {

    filter.status =
      status;

  }


  // ========================================
  // SORT
  // ========================================

  const sort = {

    [sortBy]:
      sortOrder === "asc"
        ? 1
        : -1,

  };


  // ========================================
  // FETCH APPOINTMENTS
  // ========================================

  const appointments =
    await Appointment.find(
      filter
    )

      .populate(
        "contact",
        "fullName phone email company designation"
      )

      .sort(sort)

      .skip(skip)

      .limit(limitNumber);


  // ========================================
  // COUNT
  // ========================================

  const total =
    await Appointment.countDocuments(
      filter
    );


  // ========================================
  // RETURN
  // ========================================

  return {

    appointments,

    pagination: {

      page:
        pageNumber,

      limit:
        limitNumber,

      total,

      totalPages:
        Math.ceil(
          total /
          limitNumber
        ),

      hasNextPage:
        pageNumber *
          limitNumber <
        total,

      hasPrevPage:
        pageNumber > 1,

    },

  };

};



// ========================================
// GET APPOINTMENT BY ID
// ========================================

export const getAppointmentById = async (
  appointmentId,
  ownerId
) => {

  const appointment =
    await Appointment.findOne({

      _id:
        appointmentId,

      owner:
        ownerId,

    })

      .populate(
        "contact",
        "fullName phone email company designation"
      );


  if (!appointment) {

    throw new ApiError(
      HTTP_STATUS.NOT_FOUND,
      "Appointment not found."
    );

  }


  return appointment;

};



// ========================================
// UPDATE APPOINTMENT
// ========================================

export const updateAppointment = async (
  appointmentId,
  ownerId,
  updateData
) => {

  // ========================================
  // FIND EXISTING APPOINTMENT
  // ========================================

  const existingAppointment =
    await Appointment.findOne({
      _id: appointmentId,
      owner: ownerId,
    });


  if (!existingAppointment) {

    throw new ApiError(
      HTTP_STATUS.NOT_FOUND,
      "Appointment not found."
    );

  }


  // ========================================
  // DETERMINE FINAL DATE & TIME
  // ========================================

  const appointmentDate =
    updateData.appointmentDate ||
    existingAppointment.appointmentDate;

  const appointmentTime =
    updateData.appointmentTime ||
    existingAppointment.appointmentTime;


  // ========================================
  // DETERMINE FINAL STATUS
  // ========================================

  const finalStatus =
    updateData.status ||
    existingAppointment.status;


  // ========================================
  // CHECK TIME SLOT CONFLICT
  // ========================================

  // Only scheduled appointments should
  // participate in time-slot conflicts.

  if (finalStatus === "scheduled") {

    const conflictAppointment =
      await Appointment.findOne({

        _id: {
          $ne: existingAppointment._id,
        },

        owner: ownerId,

        appointmentDate:
          new Date(appointmentDate),

        appointmentTime,

        status: "scheduled",

      });


    if (conflictAppointment) {

      throw new ApiError(
        HTTP_STATUS.CONFLICT,
        "Time slot already booked."
      );

    }

  }


  // ========================================
  // UPDATE APPOINTMENT
  // ========================================

  Object.assign(
    existingAppointment,
    updateData
  );


  await existingAppointment.save();


  // ========================================
  // HANDLE REMINDER
  // ========================================

  // ----------------------------------------
  // CASE 1:
  // Appointment is NOT scheduled
  // ----------------------------------------

  if (
    existingAppointment.status !==
    "scheduled"
  ) {

    // Cancelled / Completed / Missed
    // appointments should not have reminders.

    await Reminder.deleteOne({

      appointment:
        existingAppointment._id,

      owner:
        ownerId,

    });

  }


  // ----------------------------------------
  // CASE 2:
  // Appointment is scheduled
  // ----------------------------------------

  else {

    // Check whether date/time was changed

    const dateOrTimeChanged =
      updateData.appointmentDate ||
      updateData.appointmentTime;


    // --------------------------------------
    // Calculate reminder time
    // --------------------------------------

    const reminderTime =
      new Date(
        existingAppointment.appointmentDate
      );


    const [
      hours,
      minutes,
    ] =
      existingAppointment
        .appointmentTime
        .split(":")
        .map(Number);


    reminderTime.setHours(
      hours
    );

    reminderTime.setMinutes(
      minutes - 30
    );

    reminderTime.setSeconds(
      0
    );

    reminderTime.setMilliseconds(
      0
    );


    // --------------------------------------
    // Find existing reminder
    // --------------------------------------

    const reminder =
      await Reminder.findOne({

        appointment:
          existingAppointment._id,

        owner:
          ownerId,

      });


    // --------------------------------------
    // If reminder exists
    // --------------------------------------

    if (reminder) {

      // Only reset reminder when
      // appointment date/time changed.

      if (dateOrTimeChanged) {

        reminder.reminderTime =
          reminderTime;

        reminder.sent =
          false;

        reminder.sentAt =
          null;

        await reminder.save();

      }

    }


    // --------------------------------------
    // If reminder doesn't exist
    // --------------------------------------

    else {

      await Reminder.create({

        owner:
          ownerId,

        appointment:
          existingAppointment._id,

        reminderType:
          "email",

        reminderTime,

        sent:
          false,

        sentAt:
          null,

      });

    }

  }


  // ========================================
  // RETURN UPDATED APPOINTMENT
  // ========================================

  return await existingAppointment.populate(
    "contact",
    "fullName phone email company designation"
  );

};



// ========================================
// DELETE APPOINTMENT
// ========================================

export const deleteAppointment = async (
  appointmentId,
  ownerId
) => {

  // ========================================
  // FIND & DELETE APPOINTMENT
  // ========================================

  const appointment =
    await Appointment.findOneAndDelete({

      _id:
        appointmentId,

      owner:
        ownerId,

    });


  if (!appointment) {

    throw new ApiError(
      HTTP_STATUS.NOT_FOUND,
      "Appointment not found."
    );

  }


  // ========================================
  // DELETE ASSOCIATED REMINDER
  // ========================================

  await Reminder.deleteOne({

    appointment:
      appointment._id,

    owner:
      ownerId,

  });


  return appointment;

};



// ========================================
// UPDATE APPOINTMENT STATUS
// ========================================

export const updateAppointmentStatus = async (
  appointmentId,
  ownerId,
  status
) => {

  // ========================================
  // UPDATE STATUS
  // ========================================

  const appointment =
    await Appointment.findOneAndUpdate(

      {

        _id:
          appointmentId,

        owner:
          ownerId,

      },

      {

        status,

      },

      {

        new:
          true,

        runValidators:
          true,

      }

    )

      .populate(
        "contact",
        "fullName phone email company designation"
      );


  if (!appointment) {

    throw new ApiError(
      HTTP_STATUS.NOT_FOUND,
      "Appointment not found."
    );

  }


  // ========================================
  // SYNC REMINDER
  // ========================================

  await syncAppointmentReminder(
    appointment,
    ownerId
  );


  return appointment;

};



// ========================================
// GET UPCOMING APPOINTMENTS
// ========================================

export const getUpcomingAppointments = async (
  ownerId
) => {

  const now =
    new Date();


  const today =
    new Date(now);

  today.setHours(
    0,
    0,
    0,
    0
  );


  const tomorrow =
    new Date(today);

  tomorrow.setDate(
    tomorrow.getDate() + 1
  );


  const currentTime =
    now
      .toTimeString()
      .slice(0, 5);


  // ========================================
  // FETCH UPCOMING
  // ========================================

  const appointments =
    await Appointment.find({

      owner:
        ownerId,

      status:
        "scheduled",

      $or: [

        // Future dates
        {

          appointmentDate: {

            $gt:
              today,

          },

        },

        // Today's future appointments
        {

          appointmentDate:
            today,

          appointmentTime: {

            $gte:
              currentTime,

          },

        },

      ],

    })

      .populate(
        "contact",
        "fullName phone email company designation"
      )

      .sort({

        appointmentDate:
          1,

        appointmentTime:
          1,

      });


  return appointments;

};



// ========================================
// GET APPOINTMENT STATS
// ========================================

export const getAppointmentStats = async (
  ownerId
) => {

  const today =
    new Date();

  today.setHours(
    0,
    0,
    0,
    0
  );


  const tomorrow =
    new Date(today);

  tomorrow.setDate(
    tomorrow.getDate() + 1
  );


  const [

    total,

    scheduled,

    completed,

    cancelled,

    missed,

    todayAppointments,

    upcoming,

  ] = await Promise.all([


    // ========================================
    // TOTAL
    // ========================================

    Appointment.countDocuments({

      owner:
        ownerId,

    }),


    // ========================================
    // SCHEDULED
    // ========================================

    Appointment.countDocuments({

      owner:
        ownerId,

      status:
        "scheduled",

    }),


    // ========================================
    // COMPLETED
    // ========================================

    Appointment.countDocuments({

      owner:
        ownerId,

      status:
        "completed",

    }),


    // ========================================
    // CANCELLED
    // ========================================

    Appointment.countDocuments({

      owner:
        ownerId,

      status:
        "cancelled",

    }),


    // ========================================
    // MISSED
    // ========================================

    Appointment.countDocuments({

      owner:
        ownerId,

      status:
        "missed",

    }),


    // ========================================
    // TODAY
    // ========================================

    Appointment.countDocuments({

      owner:
        ownerId,

      appointmentDate: {

        $gte:
          today,

        $lt:
          tomorrow,

      },

    }),


    // ========================================
    // UPCOMING
    // ========================================

    Appointment.countDocuments({

      owner:
        ownerId,

      status:
        "scheduled",

      $or: [

        {

          appointmentDate: {

            $gt:
              today,

          },

        },

        {

          appointmentDate:
            today,

          appointmentTime: {

            $gte:
              new Date()
                .toTimeString()
                .slice(0, 5),

          },

        },

      ],

    }),

  ]);


  return {

    total,

    scheduled,

    completed,

    cancelled,

    missed,

    today:
      todayAppointments,

    upcoming,

  };

};