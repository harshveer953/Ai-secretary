import Call from "./call.schema.js"
import Contact from "../contacts/contact.schema.js"

import ApiError from "../../shared/ApiError.js"
import HTTP_STATUS from "../../constants/httpStatus.js"


export const createCall = async (ownerId , callData) => {

    // Check if contact exists
    const contact = await Contact.findOne({
        _id: callData.contact,
        owner: ownerId,
    })

    if (!contact) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            "Contact not found."
        )
    }

    // Create Call
    const call = await Call.create({
        owner: ownerId,
        ...callData,
    })

    return await call.populate(
        "contact",
        "fullName phone email company designation"
    )
}


export const getMyCalls = async (
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
        callType,
    } = query

    // Pagination
    const skip = (page - 1) * limit


    // mongo filter
    const filter = {
        owner: ownerId,
    }

    // Search
    if (search) {
        filter.notes = {
            $regex : search,
            $options : "i",
        }
    }

    // Status Filter
    if (status) {
        filter.status = status
    }

    if (callType) {
        filter.callType = callType
    }

    //Sort 
    const sort = {
        [sortBy]: sortOrder === "asc" ? 1 : -1,
    }


    // Fetch Data
    const calls = await Call.find(filter)
    .populate("contact", "fullName phone email company designation")
    .sort(sort)
    .skip(skip)
    .limit(limit)



    // Count

    const total = await Call.countDocuments(filter)



    // Return 
   return {
  calls,
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


 export const getCallById = async (callId, ownerId) => {
    const call = await Call.findOne({
        _id: callId,
        owner: ownerId,
    }).populate(
        "contact",
        "fullName phone email company designation"
    )

    if (!call) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            "Call not found."
        )
    }

    return call
 }


 export const updateCall = async (callId, ownerId, updateData) => {
    const existingCall = await Call.findOne({
        _id: callId,
        owner: ownerId
    })

    if (!existingCall) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            "call not found."
        )
    }

    // Update verify
    if (updateData.contact) {
        const contact = await Contact.findOne({
            _id: updateData.contact,
            owner: ownerId,
        })

        if (!contact) {
            throw new ApiError(
                HTTP_STATUS.NOT_FOUND,
                "Contact not found."
            )
        }
    }

    Object.assign(existingCall, updateData)

    await existingCall.save()

    return await existingCall.populate(
        "contact",
        "fullName phone email company designation"
    )
 }


 export const deleteCall = async (
  callId,
  ownerId
) => {

  const call = await Call.findOneAndDelete({
    _id: callId,
    owner: ownerId,
  });

  if (!call) {
    throw new ApiError(
      HTTP_STATUS.NOT_FOUND,
      "Call not found."
    );
  }
};


export const getCallStats = async (ownerId) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1)

  const [
    total,
    incoming,
    outgoing,
    answered,
    missed,
    rejected,
    todayCalls,
    duration,
  ] = await Promise.all([
    // Total Calls
    Call.countDocuments({
      owner: ownerId,
    }),

    // Incoming Calls
    Call.countDocuments({
      owner: ownerId,
      callType: "incoming",
    }),

    // Outgoing Calls
    Call.countDocuments({
      owner: ownerId,
      callType: "outgoing",
    }),

    // Answered Calls
    Call.countDocuments({
      owner: ownerId,
      status: "answered",
    }),

    // Missed Calls
    Call.countDocuments({
      owner: ownerId,
      status: "missed",
    }),

    // Rejected Calls
    Call.countDocuments({
      owner: ownerId,
      status: "rejected",
    }),

    // Today's Calls
    Call.countDocuments({
      owner: ownerId,
      startedAt: {
        $gte: today,
        $lt: tomorrow,
      },
    }),

    // Total Call Duration
    Call.aggregate([
      {
        $match: {
          owner: ownerId,
        },
      },
      {
        $group: {
          _id: null,
          totalDuration: {
            $sum: "$duration",
          },
        },
      },
    ]),
  ])

  return {
    total,
    incoming,
    outgoing,
    answered,
    missed,
    rejected,
    today: todayCalls,
    totalDuration:
      duration.length > 0
        ? duration[0].totalDuration
        : 0,
  }
}