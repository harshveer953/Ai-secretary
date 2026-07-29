import Reminder from "./reminder.schema.js";
import Appointment from "../appointments/appointment.schema.js";

import ApiError from "../../shared/ApiError.js";
import HTTP_STATUS from "../../constants/httpStatus.js";


// ========================================
// POPULATE CONFIG
// ========================================

const reminderPopulate = {
  path: "appointment",
  populate: {
    path: "contact",
    select: "fullName phone email company designation",
  },
};


// ========================================
// CREATE REMINDER
// ========================================

export const createReminder = async (
  ownerId,
  reminderData
) => {

  // ========================================
  // CHECK APPOINTMENT
  // ========================================

  const appointment =
    await Appointment.findOne({
      _id: reminderData.appointment,
      owner: ownerId,
    });

  if (!appointment) {

    throw new ApiError(
      HTTP_STATUS.NOT_FOUND,
      "Appointment not found."
    );

  }


  // ========================================
  // CHECK DUPLICATE REMINDER
  // ========================================

  const existingReminder =
    await Reminder.findOne({
      owner: ownerId,
      appointment: reminderData.appointment,
      reminderType: reminderData.reminderType,
      reminderTime: new Date(
        reminderData.reminderTime
      ),
      sent: false,
    });

  if (existingReminder) {

    throw new ApiError(
      HTTP_STATUS.CONFLICT,
      "A reminder with the same type and time already exists for this appointment."
    );

  }


  // ========================================
  // CREATE REMINDER
  // ========================================

  const reminder =
    await Reminder.create({
      owner: ownerId,
      ...reminderData,
    });


  // ========================================
  // RETURN POPULATED REMINDER
  // ========================================

  return await reminder.populate(
    reminderPopulate
  );

};


// ========================================
// GET MY REMINDERS
// ========================================

export const getMyReminders = async (
  ownerId,
  query = {}
) => {

  // ========================================
  // QUERY PARAMETERS
  // ========================================

  const {
    page = 1,
    limit = 10,
    sortBy = "reminderTime",
    sortOrder = "asc",
    reminderType,
    sent,
  } = query;


  // ========================================
  // SAFE PAGINATION
  // ========================================

  const currentPage =
    Math.max(
      Number(page) || 1,
      1
    );

  const currentLimit =
    Math.min(
      Math.max(
        Number(limit) || 10,
        1
      ),
      50
    );


  const skip =
    (currentPage - 1) *
    currentLimit;


  // ========================================
  // FILTER
  // ========================================

  const filter = {
    owner: ownerId,
  };


  // ========================================
  // REMINDER TYPE FILTER
  // ========================================

  if (reminderType) {

    filter.reminderType =
      reminderType;

  }


  // ========================================
  // SENT FILTER
  // ========================================

  if (
    sent !== undefined &&
    sent !== ""
  ) {

    filter.sent =
      sent === true ||
      sent === "true";

  }


  // ========================================
  // SORT
  // ========================================

  const allowedSortFields = [
    "createdAt",
    "updatedAt",
    "reminderTime",
    "sentAt",
  ];

  const safeSortBy =
    allowedSortFields.includes(
      sortBy
    )
      ? sortBy
      : "reminderTime";


  const sort = {
    [safeSortBy]:
      sortOrder === "desc"
        ? -1
        : 1,
  };


  // ========================================
  // FETCH REMINDERS
  // ========================================

  const [
    reminders,
    total,
  ] = await Promise.all([

    Reminder.find(filter)
      .populate(
        reminderPopulate
      )
      .sort(sort)
      .skip(skip)
      .limit(currentLimit),

    Reminder.countDocuments(
      filter
    ),

  ]);


  // ========================================
  // RETURN
  // ========================================

  return {

    reminders,

    pagination: {

      page:
        currentPage,

      limit:
        currentLimit,

      total,

      totalPages:
        Math.ceil(
          total /
          currentLimit
        ),

      hasNextPage:
        currentPage *
          currentLimit <
        total,

      hasPrevPage:
        currentPage >
        1,

    },

  };

};


// ========================================
// GET REMINDER BY ID
// ========================================

export const getReminderById = async (
  reminderId,
  ownerId
) => {

  const reminder =
    await Reminder.findOne({

      _id:
        reminderId,

      owner:
        ownerId,

    }).populate(
      reminderPopulate
    );


  if (!reminder) {

    throw new ApiError(
      HTTP_STATUS.NOT_FOUND,
      "Reminder not found."
    );

  }


  return reminder;

};


// ========================================
// UPDATE REMINDER
// ========================================

export const updateReminder = async (
  reminderId,
  ownerId,
  updateData
) => {

  // ========================================
  // FIND REMINDER
  // ========================================

  const existingReminder =
    await Reminder.findOne({

      _id:
        reminderId,

      owner:
        ownerId,

    });


  if (!existingReminder) {

    throw new ApiError(
      HTTP_STATUS.NOT_FOUND,
      "Reminder not found."
    );

  }


  // ========================================
  // APPOINTMENT VALIDATION
  // ========================================

  if (
    updateData.appointment
  ) {

    const appointment =
      await Appointment.findOne({

        _id:
          updateData.appointment,

        owner:
          ownerId,

      });


    if (!appointment) {

      throw new ApiError(
        HTTP_STATUS.NOT_FOUND,
        "Appointment not found."
      );

    }

  }


  // ========================================
  // RESET SENT STATE
  // ========================================

  // If reminder time or type changes,
  // it becomes a new pending reminder.

  if (
    updateData.reminderTime ||
    updateData.reminderType
  ) {

    updateData.sent =
      false;

    updateData.sentAt =
      null;

  }


  // ========================================
  // UPDATE REMINDER
  // ========================================

  Object.assign(
    existingReminder,
    updateData
  );


  await existingReminder.save();


  // ========================================
  // RETURN POPULATED REMINDER
  // ========================================

  return await existingReminder.populate(
    reminderPopulate
  );

};


// ========================================
// DELETE REMINDER
// ========================================

export const deleteReminder = async (
  reminderId,
  ownerId
) => {

  const reminder =
    await Reminder.findOneAndDelete({

      _id:
        reminderId,

      owner:
        ownerId,

    });


  if (!reminder) {

    throw new ApiError(
      HTTP_STATUS.NOT_FOUND,
      "Reminder not found."
    );

  }


  return reminder;

};