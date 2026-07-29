import Call from "./call.schema.js";
import Contact from "../contacts/contact.schema.js";

import ApiError from "../../shared/ApiError.js";
import HTTP_STATUS from "../../constants/httpStatus.js";


// ========================================
// CREATE CALL
// ========================================

export const createCall = async (
  ownerId,
  callData
) => {

  // ========================================
  // CHECK CONTACT
  // ========================================

  const contact =
    await Contact.findOne({
      _id: callData.contact,
      owner: ownerId,
    });


  if (!contact) {

    throw new ApiError(
      HTTP_STATUS.NOT_FOUND,
      "Contact not found."
    );

  }


  // ========================================
  // CREATE CALL
  // ========================================

  const call =
    await Call.create({
      owner: ownerId,
      ...callData,
    });


  // ========================================
  // RETURN POPULATED CALL
  // ========================================

  return await call.populate(
    "contact",
    "fullName phone email company designation"
  );

};


// ========================================
// GET MY CALLS
// ========================================

export const getMyCalls = async (
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
    callType,
  } = query;


  // ========================================
  // PAGINATION
  // ========================================

  const pageNumber =
    Number(page) || 1;

  const limitNumber =
    Number(limit) || 10;

  const skip =
    (pageNumber - 1) *
    limitNumber;


  // ========================================
  // MONGO FILTER
  // ========================================

  const filter = {
    owner: ownerId,
  };


  // ========================================
  // SEARCH
  // ========================================

  if (search) {

    filter.notes = {
      $regex: search,
      $options: "i",
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
  // CALL TYPE FILTER
  // ========================================

  if (callType) {

    filter.callType =
      callType;

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
  // FETCH CALLS
  // ========================================

  const calls =
    await Call.find(filter)

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
    await Call.countDocuments(
      filter
    );


  // ========================================
  // RETURN
  // ========================================

  return {

    calls,

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
// GET CALL BY ID
// ========================================

export const getCallById = async (
  callId,
  ownerId
) => {

  const call =
    await Call.findOne({

      _id:
        callId,

      owner:
        ownerId,

    }).populate(

      "contact",

      "fullName phone email company designation"

    );


  if (!call) {

    throw new ApiError(
      HTTP_STATUS.NOT_FOUND,
      "Call not found."
    );

  }


  return call;

};


// ========================================
// UPDATE CALL
// ========================================

export const updateCall = async (
  callId,
  ownerId,
  updateData
) => {

  // ========================================
  // FIND EXISTING CALL
  // ========================================

  const existingCall =
    await Call.findOne({

      _id:
        callId,

      owner:
        ownerId,

    });


  if (!existingCall) {

    throw new ApiError(
      HTTP_STATUS.NOT_FOUND,
      "Call not found."
    );

  }


  // ========================================
  // CHECK CONTACT IF UPDATING
  // ========================================

  if (
    updateData.contact
  ) {

    const contact =
      await Contact.findOne({

        _id:
          updateData.contact,

        owner:
          ownerId,

      });


    if (!contact) {

      throw new ApiError(
        HTTP_STATUS.NOT_FOUND,
        "Contact not found."
      );

    }

  }


  // ========================================
  // UPDATE CALL
  // ========================================

  Object.assign(
    existingCall,
    updateData
  );


  await existingCall.save();


  // ========================================
  // RETURN UPDATED CALL
  // ========================================

  return await existingCall.populate(
    "contact",
    "fullName phone email company designation"
  );

};


// ========================================
// DELETE CALL
// ========================================

export const deleteCall = async (
  callId,
  ownerId
) => {

  const call =
    await Call.findOneAndDelete({

      _id:
        callId,

      owner:
        ownerId,

    });


  if (!call) {

    throw new ApiError(
      HTTP_STATUS.NOT_FOUND,
      "Call not found."
    );

  }


  return call;

};


// ========================================
// GET CALL STATS
// ========================================

export const getCallStats = async (
  ownerId
) => {

  // ========================================
  // DATE RANGE
  // ========================================

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


  // ========================================
  // FETCH STATS
  // ========================================

  const [

    total,

    incoming,

    outgoing,

    answered,

    missed,

    rejected,

    todayCalls,

    duration,

  ] =
    await Promise.all([

      // ====================================
      // TOTAL CALLS
      // ====================================

      Call.countDocuments({

        owner:
          ownerId,

      }),


      // ====================================
      // INCOMING CALLS
      // ====================================

      Call.countDocuments({

        owner:
          ownerId,

        callType:
          "incoming",

      }),


      // ====================================
      // OUTGOING CALLS
      // ====================================

      Call.countDocuments({

        owner:
          ownerId,

        callType:
          "outgoing",

      }),


      // ====================================
      // ANSWERED CALLS
      // ====================================

      Call.countDocuments({

        owner:
          ownerId,

        status:
          "answered",

      }),


      // ====================================
      // MISSED CALLS
      // ====================================

      Call.countDocuments({

        owner:
          ownerId,

        status:
          "missed",

      }),


      // ====================================
      // REJECTED CALLS
      // ====================================

      Call.countDocuments({

        owner:
          ownerId,

        status:
          "rejected",

      }),


      // ====================================
      // TODAY'S CALLS
      // ====================================

      Call.countDocuments({

        owner:
          ownerId,

        startedAt: {

          $gte:
            today,

          $lt:
            tomorrow,

        },

      }),


      // ====================================
      // TOTAL CALL DURATION
      // ====================================

      Call.aggregate([

        {

          $match: {

            owner:
              ownerId,

          },

        },

        {

          $group: {

            _id:
              null,

            totalDuration: {

              $sum:
                "$duration",

            },

          },

        },

      ]),

    ])


  // ========================================
  // RETURN STATS
  // ========================================

  return {

    total,

    incoming,

    outgoing,

    answered,

    missed,

    rejected,

    today:
      todayCalls,

    totalDuration:

      duration.length > 0

        ? duration[0]
            .totalDuration

        : 0,

  }

}