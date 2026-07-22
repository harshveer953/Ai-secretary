import Contact from "../contacts/contact.schema.js";
import Appointment from "../appointments/appointment.schema.js";
import Call from "../calls/call.schema.js";

export const getDashboardStats = async (ownerId) => {

  // =========================
  // DATE RANGE
  // =========================

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);


  // =========================
  // FETCH STATS
  // =========================

  const [
    totalContacts,

    totalAppointments,
    scheduledAppointments,
    completedAppointments,
    cancelledAppointments,
    missedAppointments,

    todayAppointments,

    upcomingAppointments,

    totalCalls,
    incomingCalls,
    outgoingCalls,
    answeredCalls,
    missedCalls,
    rejectedCalls,

    todayCalls,

    totalCallDuration,

    recentAppointments,

    recentCalls,
  ] = await Promise.all([

    // =========================
    // CONTACTS
    // =========================

    Contact.countDocuments({
      owner: ownerId,
    }),


    // =========================
    // APPOINTMENTS
    // =========================

    Appointment.countDocuments({
      owner: ownerId,
    }),

    Appointment.countDocuments({
      owner: ownerId,
      status: "scheduled",
    }),

    Appointment.countDocuments({
      owner: ownerId,
      status: "completed",
    }),

    Appointment.countDocuments({
      owner: ownerId,
      status: "cancelled",
    }),

    Appointment.countDocuments({
      owner: ownerId,
      status: "missed",
    }),


    // Today's Appointments

    Appointment.countDocuments({
      owner: ownerId,
      appointmentDate: {
        $gte: today,
        $lt: tomorrow,
      },
    }),


    // Upcoming Appointments

    Appointment.countDocuments({
      owner: ownerId,
      status: "scheduled",
      appointmentDate: {
        $gte: today,
      },
    }),


    // =========================
    // CALLS
    // =========================

    Call.countDocuments({
      owner: ownerId,
    }),

    Call.countDocuments({
      owner: ownerId,
      callType: "incoming",
    }),

    Call.countDocuments({
      owner: ownerId,
      callType: "outgoing",
    }),

    Call.countDocuments({
      owner: ownerId,
      status: "answered",
    }),

    Call.countDocuments({
      owner: ownerId,
      status: "missed",
    }),

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


    // =========================
    // RECENT APPOINTMENTS
    // =========================

    Appointment.find({
      owner: ownerId,
    })
      .populate(
        "contact",
        "fullName phone email company designation"
      )
      .sort({
        createdAt: -1,
      })
      .limit(5),


    // =========================
    // RECENT CALLS
    // =========================

    Call.find({
      owner: ownerId,
    })
      .populate(
        "contact",
        "fullName phone email company designation"
      )
      .sort({
        createdAt: -1,
      })
      .limit(5),

  ]);


  // =========================
  // RETURN DASHBOARD DATA
  // =========================

  return {

    contacts: {
      total: totalContacts,
    },


    appointments: {
      total: totalAppointments,
      scheduled: scheduledAppointments,
      completed: completedAppointments,
      cancelled: cancelledAppointments,
      missed: missedAppointments,
      today: todayAppointments,
      upcoming: upcomingAppointments,
    },


    calls: {
      total: totalCalls,
      incoming: incomingCalls,
      outgoing: outgoingCalls,
      answered: answeredCalls,
      missed: missedCalls,
      rejected: rejectedCalls,
      today: todayCalls,

      totalDuration:
        totalCallDuration.length > 0
          ? totalCallDuration[0].totalDuration
          : 0,
    },


    recentAppointments,

    recentCalls,

  }
}