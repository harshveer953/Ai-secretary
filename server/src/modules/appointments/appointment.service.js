import Appointment from "./appointment.schema.js";
import Contact from "../contacts/contact.schema.js";
import Reminder from "../reminders/reminder.schema.js";

import ApiError from "../../shared/ApiError.js";
import HTTP_STATUS from "../../constants/httpStatus.js";


// ========================================
// REMINDER HELPERS
// ========================================

const calculateReminderTime = (
  appointmentDate,
  appointmentTime
) => {

  const reminderTime =
    new Date(appointmentDate);

  const [
    hours,
    minutes,
  ] =
    appointmentTime
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


  return reminderTime;
};


// ========================================
// CREATE OR UPDATE REMINDER
// ========================================

const syncAppointmentReminder = async (
  ownerId,
  appointment
) => {

  const reminderTime =
    calculateReminderTime(
      appointment.appointmentDate,
      appointment.appointmentTime
    );


  const reminder =
    await Reminder.findOne({
      owner: ownerId,
      appointment: appointment._id,
    });


  // ========================================
  // UPDATE EXISTING REMINDER
  // ========================================

  if (reminder) {

    reminder.reminderTime =
      reminderTime;

    reminder.sent =
      false;

    reminder.sentAt =
      null;

    await reminder.save();

    return reminder;
  }


  // ========================================
  // CREATE NEW REMINDER
  // ========================================

  return await Reminder.create({

    owner:
      ownerId,

    appointment:
      appointment._id,

    reminderType:
      "email",

    reminderTime,

  });

};


// ========================================
// DELETE APPOINTMENT REMINDER
// ========================================

const deleteAppointmentReminder = async (
  ownerId,
  appointmentId
) => {

  await Reminder.deleteOne({

    owner:
      ownerId,

    appointment:
      appointmentId,

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
  // Only scheduled appointments block a slot
  // ========================================

  const existingAppointment =
    await Appointment.findOne({

      owner:
        ownerId,

      appointmentDate:
        appointmentData.appointmentDate,

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

      status:
        appointmentData.status ||
        "scheduled",

    });


  // ========================================
  // CREATE REMINDER
  // Only scheduled appointments need reminders
  // ========================================

  if (
    appointment.status ===
    "scheduled"
  ) {

    await syncAppointmentReminder(

      ownerId,

      appointment

    );

  }


  return appointment;

};


// ========================================
// GET MY APPOINTMENTS
// ========================================

export const getMyAppointment = async (
  ownerId,
  query = {}
) => {

  const {

    page = 1,

    limit = 10,

    search = "",

    sortBy = "createdAt",

    sortOrder = "desc",

    status,

  } = query;


  // ========================================
  // PAGINATION
  // ========================================

  const pageNumber =
    Number(page);

  const limitNumber =
    Number(limit);

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
    await Appointment.find(filter)

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
        pageNumber >
        1,

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

    }).populate(

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

      _id:
        appointmentId,

      owner:
        ownerId,

    });


  if (!existingAppointment) {

    throw new ApiError(

      HTTP_STATUS.NOT_FOUND,

      "Appointment not found."

    );

  }


  // ========================================
  // CURRENT STATUS
  // ========================================

  const currentStatus =
    existingAppointment.status;


  // ========================================
  // REQUESTED STATUS
  // ========================================

  const requestedStatus =
    updateData.status;


  // ========================================
  // TERMINAL STATUSES
  // ========================================

  const terminalStatuses = [

    "cancelled",

    "completed",

    "missed",

  ];


  // ========================================
  // CHECK DATE / TIME CHANGES
  // ========================================

  const hasDateChange =
    updateData.appointmentDate !==
    undefined;


  const hasTimeChange =
    updateData.appointmentTime !==
    undefined;


  const hasScheduleChange =
    hasDateChange ||
    hasTimeChange;


  // ========================================
  // DETERMINE FINAL STATUS
  // ========================================

  const finalStatus =
    requestedStatus !==
    undefined

      ? requestedStatus

      : currentStatus;


  // ========================================
  // TERMINAL APPOINTMENT RULE
  //
  // cancelled/completed/missed appointments
  // can ONLY be edited when rescheduling
  // them back to scheduled.
  // ========================================

  if (
    terminalStatuses.includes(
      currentStatus
    )
  ) {

    const isRescheduling =
      finalStatus ===
      "scheduled";


    if (
      !isRescheduling ||
      !hasScheduleChange
    ) {

      throw new ApiError(

        HTTP_STATUS.BAD_REQUEST,

        `Cannot update an appointment with status "${currentStatus}". To reschedule it, provide a new appointment date and time and change the status to "scheduled".`

      );

    }

  }


  // ========================================
  // CHECK NEW DATE
  // ========================================

  const appointmentDate =

    hasDateChange

      ? new Date(
          updateData.appointmentDate
        )

      : existingAppointment.appointmentDate;


  // ========================================
  // CHECK NEW TIME
  // ========================================

  const appointmentTime =

    hasTimeChange

      ? updateData.appointmentTime

      : existingAppointment.appointmentTime;


  // ========================================
  // CHECK TIME SLOT CONFLICT
  //
  // Only scheduled appointments block slots.
  // ========================================

  if (
    finalStatus ===
    "scheduled"
  ) {

    const conflictAppointment =
      await Appointment.findOne({

        _id: {

          $ne:
            existingAppointment._id,

        },

        owner:
          ownerId,

        appointmentDate:
          appointmentDate,

        appointmentTime:
          appointmentTime,

        status:
          "scheduled",

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
  // STATUS CHANGED TO TERMINAL
  //
  // scheduled
  //    ↓
  // cancelled/completed/missed
  //
  // Delete reminder.
  // ========================================

  if (

    currentStatus ===
      "scheduled" &&

    terminalStatuses.includes(
      finalStatus
    )

  ) {

    await deleteAppointmentReminder(

      ownerId,

      existingAppointment._id

    );

  }


  // ========================================
  // RESCHEDULE TERMINAL APPOINTMENT
  //
  // cancelled/completed/missed
  //    ↓
  // scheduled
  //
  // Create or update reminder.
  // ========================================

  else if (

    currentStatus !==
      "scheduled" &&

    finalStatus ===
      "scheduled"

  ) {

    await syncAppointmentReminder(

      ownerId,

      existingAppointment

    );

  }


  // ========================================
  // UPDATE SCHEDULED APPOINTMENT
  //
  // Date/time changed
  //    ↓
  // Sync reminder.
  // ========================================

  else if (

    currentStatus ===
      "scheduled" &&

    finalStatus ===
      "scheduled" &&

    hasScheduleChange

  ) {

    await syncAppointmentReminder(

      ownerId,

      existingAppointment

    );

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

  await deleteAppointmentReminder(

    ownerId,

    appointmentId

  );


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
  // FIND APPOINTMENT
  // ========================================

  const appointment =
    await Appointment.findOne({

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
  // UPDATE STATUS
  // ========================================

  appointment.status =
    status;


  await appointment.save();


  // ========================================
  // REMOVE REMINDER
  //
  // Terminal statuses don't need reminders.
  // ========================================

  if (

    [
      "completed",
      "cancelled",
      "missed",
    ].includes(status)

  ) {

    await deleteAppointmentReminder(

      ownerId,

      appointment._id

    );

  }


  // ========================================
  // RECREATE / SYNC REMINDER
  //
  // scheduled appointments always need
  // a synchronized reminder.
  // ========================================

  if (
    status ===
    "scheduled"
  ) {

    await syncAppointmentReminder(

      ownerId,

      appointment

    );

  }


  // ========================================
  // RETURN UPDATED APPOINTMENT
  // ========================================

  return await appointment.populate(

    "contact",

    "fullName phone email company designation"

  );

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

    tomorrow.getDate() +
    1

  );


  const currentTime =
    now.toTimeString()
      .slice(
        0,
        5
      );


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

            $gte:
              tomorrow,

          },

        },


        // Today + future time

        {

          appointmentDate: {

            $gte:
              today,

            $lt:
              tomorrow,

          },

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

    tomorrow.getDate() +
    1

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


    // TOTAL

    Appointment.countDocuments({

      owner:
        ownerId,

    }),


    // SCHEDULED

    Appointment.countDocuments({

      owner:
        ownerId,

      status:
        "scheduled",

    }),


    // COMPLETED

    Appointment.countDocuments({

      owner:
        ownerId,

      status:
        "completed",

    }),


    // CANCELLED

    Appointment.countDocuments({

      owner:
        ownerId,

      status:
        "cancelled",

    }),


    // MISSED

    Appointment.countDocuments({

      owner:
        ownerId,

      status:
        "missed",

    }),


    // TODAY

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


    // UPCOMING

    Appointment.countDocuments({

      owner:
        ownerId,

      status:
        "scheduled",

      appointmentDate: {

        $gte:
          today,

      },

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

  }

}