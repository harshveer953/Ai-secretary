import Groq from "groq-sdk";

import Contact from "../contacts/contact.schema.js";
import Appointment from "../appointments/appointment.schema.js";
import Call from "../calls/call.schema.js";
import Reminder from "../reminders/reminder.schema.js";

import {
  createContact,
  getMyContacts,
  updateContact,
  deleteContact,
} from "../contacts/contact.service.js";

import {
  createAppointment,
  getUpcomingAppointments,
  getAppointmentStats,
  updateAppointment,
  updateAppointmentStatus,
} from "../appointments/appointment.service.js";

import {
  createCall,
  getMyCalls,
  getCallStats,
  updateCall,
  deleteCall,
} from "../calls/call.service.js";

import {
  createReminder,
  getMyReminders,
  updateReminder,
  deleteReminder,
} from "../reminders/reminder.service.js";

import {
  getDashboardStats,
} from "../dashboard/dashboard.service.js";

import {
  AI_SECRETARY_SYSTEM_PROMPT,
} from "./ai.prompts.js";
import { model } from "mongoose";


const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});


// ========================================
// CONSTANTS
// ========================================

const MODEL =
  "llama-3.3-70b-versatile";

const MAX_CONTEXT_ITEMS = 20;


// ========================================
// HELPER FUNCTIONS
// ========================================

const escapeRegex = (value = "") => {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
};


const getContactByName = async (
  ownerId,
  contactName
) => {

  if (!contactName) {
    return null;
  }

  return await Contact.findOne({
    owner: ownerId,

    fullName: {
      $regex: escapeRegex(
        contactName
      ),
      $options: "i",
    },
  });
};


const formatDate = (
  date
) => {

  if (!date) {
    return "Not available";
  }

  const parsedDate =
    new Date(date);

  if (
    Number.isNaN(
      parsedDate.getTime()
    )
  ) {
    return "Invalid date";
  }

  return parsedDate
    .toISOString()
    .split("T")[0];
};


const formatDateTime = (
  date
) => {

  if (!date) {
    return "Not available";
  }

  const parsedDate =
    new Date(date);

  if (
    Number.isNaN(
      parsedDate.getTime()
    )
  ) {
    return "Invalid date";
  }

  return parsedDate.toLocaleString();
};


const isValidDate = (
  value
) => {

  if (!value) {
    return false;
  }

  const date =
    new Date(value);

  return !Number.isNaN(
    date.getTime()
  );
};


// ========================================
// AI TOOL DEFINITIONS
// ========================================

const tools = [

  // ========================================
  // CONTACTS
  // ========================================

  {
    type: "function",

    function: {
      name: "create_contact",

      description:
        "Create a new contact for the authenticated user. Use only when the user explicitly asks to add, create, or save a contact.",

      parameters: {
        type: "object",

        properties: {

          fullName: {
            type: "string",
            description:
              "Full name of the contact.",
          },

          phone: {
            type: "string",
            description:
              "Phone number of the contact.",
          },

          email: {
            type: "string",
            description:
              "Email address of the contact.",
          },

          company: {
            type: "string",
            description:
              "Company name.",
          },

          designation: {
            type: "string",
            description:
              "Job designation.",
          },

        },

        required: [
          "fullName",
          "phone",
          "email",
        ],

        additionalProperties: false,
      },
    },
  },


  {
    type: "function",

    function: {
      name: "get_contacts",

      description:
        "Get contacts belonging to the authenticated user. Use when the user asks to see, list, find, or search contacts.",

      parameters: {
        type: "object",

        properties: {

          search: {
            type: "string",
            description:
              "Optional name, email, phone, company, or designation search text.",
          },

          limit: {
            type: "integer",
            minimum: 1,
            maximum: 50,
            description:
              "Maximum contacts to return. Default is 20.",
          },

        },

        required: [],

        additionalProperties: false,
      },
    },
  },


  {
    type: "function",

    function: {
      name: "update_contact",

      description:
        "Update an existing contact. Use only when the user explicitly asks to update or edit contact information.",

      parameters: {
        type: "object",

        properties: {

          contactName: {
            type: "string",
            description:
              "Current full name of the contact.",
          },

          fullName: {
            type: "string",
          },

          phone: {
            type: "string",
          },

          email: {
            type: "string",
          },

          company: {
            type: "string",
          },

          designation: {
            type: "string",
          },

        },

        required: [
          "contactName",
        ],

        additionalProperties: false,
      },
    },
  },


  {
    type: "function",

    function: {
      name: "delete_contact",

      description:
        "Delete an existing contact. Use only when the user explicitly asks to delete or remove a contact.",

      parameters: {
        type: "object",

        properties: {

          contactName: {
            type: "string",
          },

        },

        required: [
          "contactName",
        ],

        additionalProperties: false,
      },
    },
  },


  // ========================================
  // APPOINTMENTS
  // ========================================

  {
    type: "function",

    function: {
      name: "create_appointment",

      description:
        "Create a new appointment. Use only when the user explicitly asks to schedule, book, or create an appointment.",

      parameters: {
        type: "object",

        properties: {

          contactName: {
            type: "string",
          },

          title: {
            type: "string",
          },

          description: {
            type: "string",
          },

          appointmentDate: {
            type: "string",
            description:
              "Appointment date in YYYY-MM-DD format.",
          },

          appointmentTime: {
            type: "string",
            description:
              "Appointment time in HH:mm 24-hour format.",
          },

          duration: {
            type: "number",
            description:
              "Duration in minutes.",
          },

        },

        required: [
          "contactName",
          "title",
          "appointmentDate",
          "appointmentTime",
        ],

        additionalProperties: false,
      },
    },
  },


  {
    type: "function",

    function: {
      name: "get_upcoming_appointments",

      description:
        "Get upcoming appointments for the authenticated user. Use when the user asks about upcoming, scheduled, or future appointments.",

      parameters: {
        type: "object",

        properties: {

          limit: {
            type: "integer",
            minimum: 1,
            maximum: 50,
          },

        },

        required: [],

        additionalProperties: false,
      },
    },
  },


  {
    type: "function",

    function: {
      name: "get_appointment_stats",

      description:
        "Get appointment statistics for the authenticated user.",

      parameters: {
        type: "object",

        properties: {},

        required: [],

        additionalProperties: false,
      },
    },
  },


  {
    type: "function",

    function: {
      name: "update_appointment",

      description:
        "Update or reschedule an existing appointment. Use only when explicitly requested.",

      parameters: {
        type: "object",

        properties: {

          contactName: {
            type: "string",
          },

          appointmentTitle: {
            type: "string",
          },

          title: {
            type: "string",
          },

          description: {
            type: "string",
          },

          appointmentDate: {
            type: "string",
          },

          appointmentTime: {
            type: "string",
          },

          duration: {
            type: "number",
          },

          status: {
            type: "string",
            enum: [
              "scheduled",
              "completed",
              "cancelled",
              "missed",
            ],
          },

        },

        required: [
          "contactName",
          "appointmentTitle",
        ],

        additionalProperties: false,
      },
    },
  },


  {
    type: "function",

    function: {
      name: "cancel_appointment",

      description:
        "Cancel an existing scheduled appointment. Use only when explicitly requested.",

      parameters: {
        type: "object",

        properties: {

          contactName: {
            type: "string",
          },

          appointmentTitle: {
            type: "string",
          },

        },

        required: [
          "contactName",
          "appointmentTitle",
        ],

        additionalProperties: false,
      },
    },
  },


  // ========================================
  // CALLS
  // ========================================

  {
    type: "function",

    function: {
      name: "create_call",

      description:
        "Create a call record. Use only when the user explicitly asks to log or record a call.",

      parameters: {
        type: "object",

        properties: {

          contactName: {
            type: "string",
          },

          callType: {
            type: "string",
            enum: [
              "incoming",
              "outgoing",
            ],
          },

          status: {
            type: "string",
            enum: [
              "answered",
              "missed",
              "rejected",
            ],
          },

          duration: {
            type: "number",
          },

          notes: {
            type: "string",
          },

          startedAt: {
            type: "string",
          },

          endedAt: {
            type: "string",
          },

        },

        required: [
          "contactName",
          "callType",
          "status",
          "startedAt",
        ],

        additionalProperties: false,
      },
    },
  },


  {
    type: "function",

    function: {
      name: "get_recent_calls",

      description:
        "Get recent call records. Use when the user asks about recent calls, latest calls, or call history.",

      parameters: {
        type: "object",

        properties: {

          limit: {
            type: "integer",
            minimum: 1,
            maximum: 50,
          },

        },

        required: [],

        additionalProperties: false,
      },
    },
  },


  {
    type: "function",

    function: {
      name: "get_call_stats",

      description:
        "Get call statistics including total, incoming, outgoing, answered, missed, rejected, today's calls, and total duration.",

      parameters: {
        type: "object",

        properties: {},

        required: [],

        additionalProperties: false,
      },
    },
  },


  {
    type: "function",

    function: {
      name: "update_call",

      description:
        "Update an existing call record. Use only when explicitly requested.",

      parameters: {
        type: "object",

        properties: {

          contactName: {
            type: "string",
          },

          callId: {
            type: "string",
          },

          callType: {
            type: "string",
            enum: [
              "incoming",
              "outgoing",
            ],
          },

          status: {
            type: "string",
            enum: [
              "answered",
              "missed",
              "rejected",
            ],
          },

          duration: {
            type: "number",
          },

          notes: {
            type: "string",
          },

          startedAt: {
            type: "string",
          },

          endedAt: {
            type: "string",
          },

        },

        required: [
          "contactName",
        ],

        additionalProperties: false,
      },
    },
  },


  {
    type: "function",

    function: {
      name: "delete_call",

      description:
        "Delete an existing call record. Use only when explicitly requested.",

      parameters: {
        type: "object",

        properties: {

          contactName: {
            type: "string",
          },

          callId: {
            type: "string",
          },

        },

        required: [
          "contactName",
        ],

        additionalProperties: false,
      },
    },
  },


  // ========================================
  // REMINDERS
  // ========================================

  {
    type: "function",

    function: {
      name: "create_reminder",

      description:
        "Create a reminder for an existing appointment.",

      parameters: {
        type: "object",

        properties: {

          contactName: {
            type: "string",
          },

          appointmentTitle: {
            type: "string",
          },

          reminderType: {
            type: "string",
            enum: [
              "email",
              "whatsapp",
            ],
          },

          reminderTime: {
            type: "string",
            description:
              "Reminder time in ISO 8601 format.",
          },

        },

        required: [
          "contactName",
          "appointmentTitle",
          "reminderType",
          "reminderTime",
        ],

        additionalProperties: false,
      },
    },
  },


  {
    type: "function",

    function: {
      name: "get_reminders",

      description:
        "Get reminders for the authenticated user.",

      parameters: {
        type: "object",

        properties: {},

        required: [],

        additionalProperties: false,
      },
    },
  },


  {
    type: "function",

    function: {
      name: "update_reminder",

      description:
        "Update an existing reminder.",

      parameters: {
        type: "object",

        properties: {

          reminderId: {
            type: "string",
          },

          contactName: {
            type: "string",
          },

          appointmentTitle: {
            type: "string",
          },

          reminderType: {
            type: "string",
            enum: [
              "email",
              "whatsapp",
            ],
          },

          reminderTime: {
            type: "string",
          },

          sent: {
            type: "boolean",
          },

        },

        required: [
          "contactName",
          "appointmentTitle",
        ],

        additionalProperties: false,
      },
    },
  },


  {
    type: "function",

    function: {
      name: "delete_reminder",

      description:
        "Delete an existing reminder.",

      parameters: {
        type: "object",

        properties: {

          reminderId: {
            type: "string",
          },

          contactName: {
            type: "string",
          },

          appointmentTitle: {
            type: "string",
          },

        },

        required: [
          "contactName",
          "appointmentTitle",
        ],

        additionalProperties: false,
      },
    },
  },


  // ========================================
  // DASHBOARD
  // ========================================

  {
    type: "function",

    function: {
      name: "get_dashboard_stats",

      description:
        "Get overall dashboard statistics for the authenticated user. Use when the user asks for an overview, dashboard summary, or overall business/activity statistics.",

      parameters: {
        type: "object",

        properties: {},

        required: [],

        additionalProperties: false,
      },
    },
  },

];


// ========================================
// FETCH USER CONTEXT
// ========================================

const getUserContext = async (
  ownerId
) => {

  const [
    contacts,
    appointments,
    calls,
    reminders,
  ] = await Promise.all([

    Contact.find({
      owner: ownerId,
    })
      .select(
        "fullName phone email company designation"
      )
      .sort({
        createdAt: -1,
      })
      .limit(
        MAX_CONTEXT_ITEMS
      )
      .lean(),


    Appointment.find({
      owner: ownerId,
    })
      .populate(
        "contact",
        "fullName phone email company designation"
      )
      .sort({
        appointmentDate: 1,
      })
      .limit(
        MAX_CONTEXT_ITEMS
      )
      .lean(),


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
      .limit(
        MAX_CONTEXT_ITEMS
      )
      .lean(),


    Reminder.find({
      owner: ownerId,
    })
      .populate({
        path: "appointment",
        populate: {
          path: "contact",
          select:
            "fullName phone email company designation",
        },
      })
      .sort({
        reminderTime: 1,
      })
      .limit(
        MAX_CONTEXT_ITEMS
      )
      .lean(),

  ]);


  return {

    contacts,

    appointments,

    calls,

    reminders,

  };

};


// ========================================
// BUILD USER CONTEXT
// ========================================

const buildUserContext = (
  data
) => {

  return `
USER CONTACTS:
${JSON.stringify(
  data.contacts,
  null,
  2
)}

USER APPOINTMENTS:
${JSON.stringify(
  data.appointments,
  null,
  2
)}

USER CALLS:
${JSON.stringify(
  data.calls,
  null,
  2
)}

USER REMINDERS:
${JSON.stringify(
  data.reminders,
  null,
  2
)}
`;

};


// ========================================
// EXECUTE TOOL
// ========================================

const executeTool = async (
  toolName,
  args,
  ownerId
) => {

  // ========================================
  // CREATE CONTACT
  // ========================================

  if (
    toolName ===
    "create_contact"
  ) {

    const existingContact =
      await Contact.findOne({

        owner: ownerId,

        $or: [

          {
            email:
              args.email,
          },

          {
            phone:
              args.phone,
          },

        ],

      });


    if (existingContact) {

      return {
        success: false,

        message:
          "A contact already exists with this email or phone number.",

        contact: {
          fullName:
            existingContact.fullName,

          email:
            existingContact.email,

          phone:
            existingContact.phone,
        },
      };

    }


    const contact =
      await createContact(

        {
          fullName:
            args.fullName,

          phone:
            args.phone,

          email:
            args.email,

          company:
            args.company ||
            "",

          designation:
            args.designation ||
            "",
        },

        ownerId

      );


    return {

      success: true,

      message:
        "Contact created successfully.",

      contact,

    };

  }


  // ========================================
  // GET CONTACTS
  // ========================================

  if (
    toolName ===
    "get_contacts"
  ) {

    const search =
      args =
    JSON.parse(
    toolCall.function.arguments || "{}"
  ) || {};

    const limit =
      Math.min(
        Math.max(
          Number(
            args.limit
          ) || 20,
          1
        ),
        50
      );


    const result =
      await getMyContacts(

        ownerId,

        search,

        1,

        limit

      );


    return {

      success: true,

      data: result,

    };

  }


  // ========================================
  // UPDATE CONTACT
  // ========================================

  if (
    toolName ===
    "update_contact"
  ) {

    const contact =
      await getContactByName(

        ownerId,

        args.contactName

      );


    if (!contact) {

      return {

        success: false,

        message:
          `Contact "${args.contactName}" not found.`,

      };

    }


    const updateData = {};


    const fields = [
      "fullName",
      "phone",
      "email",
      "company",
      "designation",
    ];


    for (
      const field of fields
    ) {

      if (
        args[field] !==
        undefined
      ) {

        updateData[field] =
          args[field];

      }

    }


    if (
      Object.keys(
        updateData
      ).length === 0
    ) {

      return {

        success: false,

        message:
          "No contact fields were provided for update.",

      };

    }


    const updatedContact =
      await updateContact(

        contact._id,

        ownerId,

        updateData

      );


    return {

      success: true,

      message:
        "Contact updated successfully.",

      contact:
        updatedContact,

    };

  }


  // ========================================
  // DELETE CONTACT
  // ========================================

  if (
    toolName ===
    "delete_contact"
  ) {

    const contact =
      await getContactByName(

        ownerId,

        args.contactName

      );


    if (!contact) {

      return {

        success: false,

        message:
          `Contact "${args.contactName}" not found.`,

      };

    }


    const deletedContact =
      await deleteContact(

        contact._id,

        ownerId

      );


    return {

      success: true,

      message:
        "Contact deleted successfully.",

      contact:
        deletedContact,

    };

  }


  // ========================================
  // CREATE APPOINTMENT
  // ========================================

  if (
    toolName ===
    "create_appointment"
  ) {

    const contact =
      await getContactByName(

        ownerId,

        args.contactName

      );


    if (!contact) {

      return {

        success: false,

        message:
          `Contact "${args.contactName}" not found.`,

      };

    }


    if (
      !isValidDate(
        args.appointmentDate
      )
    ) {

      return {

        success: false,

        message:
          "Invalid appointment date.",

      };

    }


    const appointment =
      await createAppointment(

        ownerId,

        {

          contact:
            contact._id,

          title:
            args.title,

          description:
            args.description ||
            "",

          appointmentDate:
            new Date(
              args.appointmentDate
            ),

          appointmentTime:
            args.appointmentTime,

          duration:
            args.duration ||
            30,

        }

      );


    return {

      success: true,

      message:
        "Appointment created successfully.",

      appointment,

    };

  }


  // ========================================
  // GET UPCOMING APPOINTMENTS
  // ========================================

  if (
    toolName ===
    "get_upcoming_appointments"
  ) {

    const limit =
      Math.min(
        Math.max(
          Number(
            args.limit
          ) || 10,
          1
        ),
        50
      );


    const appointments =
      await getUpcomingAppointments(

        ownerId,

        limit

      );


    return {

      success: true,

      appointments,

    };

  }


  // ========================================
  // GET APPOINTMENT STATS
  // ========================================

  if (
    toolName ===
    "get_appointment_stats"
  ) {

    const stats =
      await getAppointmentStats(
        ownerId
      );


    return {

      success: true,

      stats,

    };

  }


  // ========================================
  // UPDATE APPOINTMENT
  // ========================================

  if (
    toolName ===
    "update_appointment"
  ) {

    const contact =
      await getContactByName(

        ownerId,

        args.contactName

      );


    if (!contact) {

      return {

        success: false,

        message:
          `Contact "${args.contactName}" not found.`,

      };

    }


    const appointment =
      await Appointment.findOne({

        owner: ownerId,

        contact:
          contact._id,

        title: {
          $regex:
            escapeRegex(
              args.appointmentTitle
            ),

          $options:
            "i",
        },

      });


    if (!appointment) {

      return {

        success: false,

        message:
          `Appointment "${args.appointmentTitle}" not found for ${contact.fullName}.`,

      };

    }


    const updateData = {};


    if (
      args.title !==
      undefined
    ) {

      updateData.title =
        args.title;

    }


    if (
      args.description !==
      undefined
    ) {

      updateData.description =
        args.description;

    }


    if (
      args.appointmentDate !==
      undefined
    ) {

      if (
        !isValidDate(
          args.appointmentDate
        )
      ) {

        return {

          success: false,

          message:
            "Invalid appointment date.",

        };

      }


      updateData.appointmentDate =
        new Date(
          args.appointmentDate
        );

    }


    if (
      args.appointmentTime !==
      undefined
    ) {

      updateData.appointmentTime =
        args.appointmentTime;

    }


    if (
      args.duration !==
      undefined
    ) {

      updateData.duration =
        args.duration;

    }


    if (
      args.status !==
      undefined
    ) {

      updateData.status =
        args.status;

    }


    if (
      Object.keys(
        updateData
      ).length === 0
    ) {

      return {

        success: false,

        message:
          "No appointment fields were provided for update.",

      };

    }


    const updatedAppointment =
      await updateAppointment(

        appointment._id,

        ownerId,

        updateData

      );


    return {

      success: true,

      message:
        "Appointment updated successfully.",

      appointment:
        updatedAppointment,

    };

  }


  // ========================================
  // CANCEL APPOINTMENT
  // ========================================

  if (
    toolName ===
    "cancel_appointment"
  ) {

    const contact =
      await getContactByName(

        ownerId,

        args.contactName

      );


    if (!contact) {

      return {

        success: false,

        message:
          `Contact "${args.contactName}" not found.`,

      };

    }


    const appointment =
      await Appointment.findOne({

        owner: ownerId,

        contact:
          contact._id,

        title: {
          $regex:
            escapeRegex(
              args.appointmentTitle
            ),

          $options:
            "i",
        },

        status:
          "scheduled",

      });


    if (!appointment) {

      return {

        success: false,

        message:
          `Scheduled appointment "${args.appointmentTitle}" not found for ${contact.fullName}.`,

      };

    }


    const cancelledAppointment =
      await updateAppointmentStatus(

        appointment._id,

        ownerId,

        "cancelled"

      );


    await Reminder.deleteMany({

      owner:
        ownerId,

      appointment:
        appointment._id,

    });


    return {

      success: true,

      message:
        "Appointment cancelled successfully.",

      appointment:
        cancelledAppointment,

    };

  }


  // ========================================
  // CREATE CALL
  // ========================================

  if (
    toolName ===
    "create_call"
  ) {

    const contact =
      await getContactByName(

        ownerId,

        args.contactName

      );


    if (!contact) {

      return {

        success: false,

        message:
          `Contact "${args.contactName}" not found.`,

      };

    }


    if (
      !isValidDate(
        args.startedAt
      )
    ) {

      return {

        success: false,

        message:
          "Invalid startedAt date.",

      };

    }


    const call =
      await createCall(

        ownerId,

        {

          contact:
            contact._id,

          callType:
            args.callType,

          status:
            args.status,

          duration:
            args.duration ||
            0,

          notes:
            args.notes ||
            "",

          startedAt:
            new Date(
              args.startedAt
            ),

          endedAt:
            args.endedAt
              ? new Date(
                  args.endedAt
                )
              : undefined,

        }

      );


    return {

      success: true,

      message:
        "Call record created successfully.",

      call,

    };

  }


  // ========================================
  // GET RECENT CALLS
  // ========================================

  if (
    toolName ===
    "get_recent_calls"
  ) {

    const limit =
      Math.min(
        Math.max(
          Number(
            args.limit
          ) || 10,
          1
        ),
        50
      );


    const result =
      await getMyCalls(

        ownerId,

        {

          page:
            1,

          limit,

          sortBy:
            "createdAt",

          sortOrder:
            "desc",

        }

      );


    return {

      success: true,

      data:
        result,

    };

  }


  // ========================================
  // GET CALL STATS
  // ========================================

  if (
    toolName ===
    "get_call_stats"
  ) {

    const stats =
      await getCallStats(
        ownerId
      );


    return {

      success: true,

      stats,

    };

  }


  // ========================================
  // UPDATE CALL
  // ========================================

  if (
    toolName ===
    "update_call"
  ) {

    const contact =
      await getContactByName(

        ownerId,

        args.contactName

      );


    if (!contact) {

      return {

        success: false,

        message:
          `Contact "${args.contactName}" not found.`,

      };

    }


    let call = null;


    if (
      args.callId
    ) {

      call =
        await Call.findOne({

          _id:
            args.callId,

          owner:
            ownerId,

          contact:
            contact._id,

        });

    }


    if (!call) {

      call =
        await Call.findOne({

          owner:
            ownerId,

          contact:
            contact._id,

        })
          .sort({
            createdAt:
              -1,
          });

    }


    if (!call) {

      return {

        success: false,

        message:
          `No call record found for ${contact.fullName}.`,

      };

    }


    const updateData = {};


    if (
      args.callType !==
      undefined
    ) {

      updateData.callType =
        args.callType;

    }


    if (
      args.status !==
      undefined
    ) {

      updateData.status =
        args.status;

    }


    if (
      args.duration !==
      undefined
    ) {

      updateData.duration =
        args.duration;

    }


    if (
      args.notes !==
      undefined
    ) {

      updateData.notes =
        args.notes;

    }


    if (
      args.startedAt !==
      undefined
    ) {

      if (
        !isValidDate(
          args.startedAt
        )
      ) {

        return {

          success: false,

          message:
            "Invalid startedAt date.",

        };

      }


      updateData.startedAt =
        new Date(
          args.startedAt
        );

    }


    if (
      args.endedAt !==
      undefined
    ) {

      if (
        !isValidDate(
          args.endedAt
        )
      ) {

        return {

          success: false,

          message:
            "Invalid endedAt date.",

        };

      }


      updateData.endedAt =
        new Date(
          args.endedAt
        );

    }


    if (
      Object.keys(
        updateData
      ).length === 0
    ) {

      return {

        success: false,

        message:
          "No call fields were provided for update.",

      };

    }


    const updatedCall =
      await updateCall(

        call._id,

        ownerId,

        updateData

      );


    return {

      success: true,

      message:
        "Call updated successfully.",

      call:
        updatedCall,

    };

  }


  // ========================================
  // DELETE CALL
  // ========================================

  if (
    toolName ===
    "delete_call"
  ) {

    const contact =
      await getContactByName(

        ownerId,

        args.contactName

      );


    if (!contact) {

      return {

        success: false,

        message:
          `Contact "${args.contactName}" not found.`,

      };

    }


    let call = null;


    if (
      args.callId
    ) {

      call =
        await Call.findOne({

          _id:
            args.callId,

          owner:
            ownerId,

          contact:
            contact._id,

        });

    }


    if (!call) {

      call =
        await Call.findOne({

          owner:
            ownerId,

          contact:
            contact._id,

        })
          .sort({
            createdAt:
              -1,
          });

    }


    if (!call) {

      return {

        success: false,

        message:
          `No call record found for ${contact.fullName}.`,

      };

    }


    await deleteCall(

      call._id,

      ownerId

    );


    return {

      success: true,

      message:
        "Call deleted successfully.",

      deletedCall: {

        contact:
          contact.fullName,

        callType:
          call.callType,

        status:
          call.status,

        duration:
          call.duration,

      },

    };

  }


  // ========================================
  // CREATE REMINDER
  // ========================================

  if (
    toolName ===
    "create_reminder"
  ) {

    const contact =
      await getContactByName(

        ownerId,

        args.contactName

      );


    if (!contact) {

      return {

        success: false,

        message:
          `Contact "${args.contactName}" not found.`,

      };

    }


    const appointment =
      await Appointment.findOne({

        owner:
          ownerId,

        contact:
          contact._id,

        title: {
          $regex:
            escapeRegex(
              args.appointmentTitle
            ),

          $options:
            "i",
        },

      });


    if (!appointment) {

      return {

        success: false,

        message:
          `Appointment "${args.appointmentTitle}" not found for ${contact.fullName}.`,

      };

    }


    if (
      !isValidDate(
        args.reminderTime
      )
    ) {

      return {

        success: false,

        message:
          "Invalid reminder time.",

      };

    }


    const reminder =
      await createReminder(

        ownerId,

        {

          appointment:
            appointment._id,

          reminderType:
            args.reminderType,

          reminderTime:
            new Date(
              args.reminderTime
            ),

        }

      );


    return {

      success: true,

      message:
        "Reminder created successfully.",

      reminder,

    };

  }


  // ========================================
  // GET REMINDERS
  // ========================================

  if (
    toolName ===
    "get_reminders"
  ) {

    const result =
      await getMyReminders(

        ownerId,

        {

          page:
            1,

          limit:
            50,

          sortBy:
            "reminderTime",

          sortOrder:
            "asc",

        }

      );


    return {

      success: true,

      data:
        result,

    };

  }


  // ========================================
  // UPDATE REMINDER
  // ========================================

  if (
    toolName ===
    "update_reminder"
  ) {

    const contact =
      await getContactByName(

        ownerId,

        args.contactName

      );


    if (!contact) {

      return {

        success: false,

        message:
          `Contact "${args.contactName}" not found.`,

      };

    }


    const appointment =
      await Appointment.findOne({

        owner:
          ownerId,

        contact:
          contact._id,

        title: {
          $regex:
            escapeRegex(
              args.appointmentTitle
            ),

          $options:
            "i",
        },

      });


    if (!appointment) {

      return {

        success: false,

        message:
          `Appointment "${args.appointmentTitle}" not found.`,

      };

    }


    let reminder = null;


    if (
      args.reminderId
    ) {

      reminder =
        await Reminder.findOne({

          _id:
            args.reminderId,

          owner:
            ownerId,

          appointment:
            appointment._id,

        });

    }


    if (!reminder) {

      reminder =
        await Reminder.findOne({

          owner:
            ownerId,

          appointment:
            appointment._id,

        })
          .sort({
            reminderTime:
              1,
          });

    }


    if (!reminder) {

      return {

        success: false,

        message:
          `No reminder found for "${appointment.title}".`,

      };

    }


    const updateData = {};


    if (
      args.reminderType !==
      undefined
    ) {

      updateData.reminderType =
        args.reminderType;

    }


    if (
      args.reminderTime !==
      undefined
    ) {

      if (
        !isValidDate(
          args.reminderTime
        )
      ) {

        return {

          success: false,

          message:
            "Invalid reminder time.",

        };

      }


      updateData.reminderTime =
        new Date(
          args.reminderTime
        );

    }


    if (
      args.sent !==
      undefined
    ) {

      updateData.sent =
        args.sent;

    }


    if (
      Object.keys(
        updateData
      ).length === 0
    ) {

      return {

        success: false,

        message:
          "No reminder fields were provided for update.",

      };

    }


    const updatedReminder =
      await updateReminder(

        reminder._id,

        ownerId,

        updateData

      );


    return {

      success: true,

      message:
        "Reminder updated successfully.",

      reminder:
        updatedReminder,

    };

  }


  // ========================================
  // DELETE REMINDER
  // ========================================

  if (
    toolName ===
    "delete_reminder"
  ) {

    const contact =
      await getContactByName(

        ownerId,

        args.contactName

      );


    if (!contact) {

      return {

        success: false,

        message:
          `Contact "${args.contactName}" not found.`,

      };

    }


    const appointment =
      await Appointment.findOne({

        owner:
          ownerId,

        contact:
          contact._id,

        title: {
          $regex:
            escapeRegex(
              args.appointmentTitle
            ),

          $options:
            "i",
        },

      });


    if (!appointment) {

      return {

        success: false,

        message:
          `Appointment "${args.appointmentTitle}" not found.`,

      };

    }


    let reminder = null;


    if (
      args.reminderId
    ) {

      reminder =
        await Reminder.findOne({

          _id:
            args.reminderId,

          owner:
            ownerId,

          appointment:
            appointment._id,

        });

    }


    if (!reminder) {

      reminder =
        await Reminder.findOne({

          owner:
            ownerId,

          appointment:
            appointment._id,

        })
          .sort({
            reminderTime:
              1,
          });

    }


    if (!reminder) {

      return {

        success: false,

        message:
          `No reminder found for "${appointment.title}".`,

      };

    }


    await deleteReminder(

      reminder._id,

      ownerId

    );


    return {

      success: true,

      message:
        "Reminder deleted successfully.",

      deletedReminder: {

        contact:
          contact.fullName,

        appointment:
          appointment.title,

        reminderType:
          reminder.reminderType,

        reminderTime:
          reminder.reminderTime,

      },

    };

  }


  // ========================================
  // DASHBOARD STATS
  // ========================================

  if (
    toolName ===
    "get_dashboard_stats"
  ) {

    const stats =
      await getDashboardStats(
        ownerId
      );


    return {

      success: true,

      stats,

    };

  }


  // ========================================
  // UNKNOWN TOOL
  // ========================================

  return {

    success: false,

    message:
      `Unknown tool: ${toolName}`,

  };

};


// ========================================
// AI CHAT SERVICE
// ========================================

export const chatWithAI = async (
  message,
  ownerId
) => {

  // ========================================
  // FETCH USER DATA
  // ========================================

  const userData =
    await getUserContext(
      ownerId
    );


  const userContext =
    buildUserContext(
      userData
    );


  // ========================================
  // SYSTEM PROMPT
  // ========================================

  const systemPrompt = `
${AI_SECRETARY_SYSTEM_PROMPT}

CURRENT DATE:
${new Date().toISOString()}

AUTHENTICATED USER ID:
${ownerId}

IMPORTANT TOOL RULES:

1. Never access or modify another user's data.

2. Every database operation must be restricted to the authenticated user.

3. Never invent contacts, appointments, calls, reminders, or dashboard statistics.

4. If the user asks for information that exists in the provided context, answer using that information.

5. If the user explicitly requests a database action, use the appropriate tool.

6. Never create, update, or delete data unless the user explicitly requests it.

7. Before creating an appointment, verify that the contact exists.

8. Before creating a reminder, verify that the appointment exists.

9. Appointment dates must use YYYY-MM-DD.

10. Appointment times must use HH:mm 24-hour format.

11. Call type must be incoming or outgoing.

12. Call status must be answered, missed, or rejected.

13. Reminder type must be email or whatsapp.

14. For ambiguous contact names, do not guess. Ask the user for clarification.

15. For update/delete operations, if multiple matching records exist and the exact record cannot be safely identified, ask the user for clarification.

16. Never claim that an action succeeded unless the corresponding tool execution succeeded.

17. When a tool returns an error, explain the error honestly.

18. For date-related requests, use the current date above as the reference date.

19. If the user asks for dashboard or overall application statistics, use get_dashboard_stats.

20. If the user asks about upcoming appointments, use get_upcoming_appointments.

21. If the user asks for appointment statistics, use get_appointment_stats.

22. If the user asks to list or search contacts, use get_contacts.

23. If the user asks about recent calls or call history, use get_recent_calls.

24. If the user asks about call analytics or statistics, use get_call_stats.

25. If the user asks about reminders, use get_reminders.

26. Never expose internal tool names, database IDs, owner IDs, or implementation details unless explicitly requested.
`;


  // ========================================
  // INITIAL MESSAGES
  // ========================================

  let messages = [

    {
      role:
        "system",

      content:
        systemPrompt,
    },


    {
      role:
        "system",

      content: `
Here is the authenticated user's current application data.

${userContext}
`,
    },


    {
      role:
        "user",

      content:
        message,
    },

  ];


  // ========================================
  // TOOL LOOP
  // ========================================

  for (
    let iteration = 0;
    iteration < 5;
    iteration++
  ) {

    const completion =
      await groq.chat.completions.create({

        model:
          MODEL,

        messages,

        temperature:
          0.3,

        max_tokens:
          1000,

        tools,

        tool_choice:
          "auto",

      });


 const assistantMessage =
  completion.choices?.[0]?.message;

if (!assistantMessage) {

  return (
    "I couldn't process your request."
  );

}


// ========================================
// NORMAL RESPONSE
// ========================================

if (
  !assistantMessage.tool_calls ||
  assistantMessage.tool_calls.length === 0
) {

  return (
    assistantMessage.content ||
    "I couldn't process your request."
  );

}


// ========================================
// ADD ASSISTANT TOOL CALL MESSAGE
// ========================================

messages.push(
  assistantMessage
);


// ========================================
// EXECUTE ALL TOOL CALLS
// ========================================

for (
  const toolCall
  of assistantMessage.tool_calls
) {

  const toolName =
    toolCall.function.name;

  let args = {};

  try {

    args =
      JSON.parse(
        toolCall.function.arguments ||
        "{}"
      );

  } catch (
    error
  ) {

    messages.push({

      role:
        "tool",

      tool_call_id:
        toolCall.id,

      content:
        JSON.stringify({

          success:
            false,

          message:
            "Invalid tool arguments.",

        }),

    });

    continue;

  }


  try {

    const result =
      await executeTool(

        toolName,

        args,

        ownerId

      );


    messages.push({

      role:
        "tool",

      tool_call_id:
        toolCall.id,

      content:
        JSON.stringify(
          result
        ),

    });

  } catch (
    error
  ) {

    console.error(
      `AI tool error [${toolName}]:`,
      error
    );


    messages.push({

      role:
        "tool",

      tool_call_id:
        toolCall.id,

      content:
        JSON.stringify({

          success:
            false,

          message:
            error.message ||
            "An unexpected error occurred while executing the requested action.",

        }),

    });

  }

}


// ========================================
// ASK AI AGAIN AFTER TOOL EXECUTION
// ========================================

const finalCompletion =
  await groq.chat.completions.create({

    model: MODEL,

    messages,

    temperature: 0.3,

    max_tokens: 1000,

    tools,

    tool_choice: "auto",

  });


const finalAssistantMessage =
  finalCompletion.choices?.[0]?.message;


// ========================================
// FINAL RESPONSE
// ========================================

return (
  finalAssistantMessage?.content ||
  "Task completed successfully."
);

} // <-- for loop end

return "I couldn't process your request.";

};