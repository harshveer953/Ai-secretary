import Groq from "groq-sdk";

import Contact from "../contacts/contact.schema.js";
import Appointment from "../appointments/appointment.schema.js";
import Call from "../calls/call.schema.js";

import {
  createContact,
  updateContact,
  deleteContact,
} from "../contacts/contact.service.js";

import {
  createAppointment,
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

import Reminder from "../reminders/reminder.schema.js";

import {
  createReminder,
  getMyReminders,
  updateReminder,
  deleteReminder,
} from "../reminders/reminder.service.js";

import {
  AI_SECRETARY_SYSTEM_PROMPT,
} from "./ai.prompts.js";


const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});


// ========================================
// AI TOOL DEFINITIONS
// ========================================

const tools = [

  // ========================================
  // CREATE APPOINTMENT
  // ========================================

  {
    type: "function",

    function: {
      name: "create_appointment",

      description:
        "Create a new appointment for the authenticated user. Use this when the user explicitly asks to schedule, book, or create an appointment.",

      parameters: {
        type: "object",

        properties: {

          contactName: {
            type: "string",
            description:
              "Full name of the contact for the appointment.",
          },

          title: {
            type: "string",
            description:
              "Title of the appointment.",
          },

          description: {
            type: "string",
            description:
              "Optional description of the appointment.",
          },

          appointmentDate: {
            type: "string",
            description:
              "Appointment date in YYYY-MM-DD format.",
          },

          appointmentTime: {
            type: "string",
            description:
              "Appointment time in 24-hour HH:mm format.",
          },

          duration: {
            type: "number",
            description:
              "Appointment duration in minutes.",
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


  // ========================================
  // UPDATE APPOINTMENT
  // ========================================

  {
    type: "function",

    function: {
      name: "update_appointment",

      description:
        "Update an existing appointment for the authenticated user. Use this when the user explicitly asks to change, update, reschedule, or edit an appointment.",

      parameters: {
        type: "object",

        properties: {

          contactName: {
            type: "string",
            description:
              "Full name of the contact associated with the appointment.",
          },

          appointmentTitle: {
            type: "string",
            description:
              "Current title of the appointment that should be updated.",
          },

          title: {
            type: "string",
            description:
              "New title of the appointment, if provided.",
          },

          description: {
            type: "string",
            description:
              "New description of the appointment, if provided.",
          },

          appointmentDate: {
            type: "string",
            description:
              "New appointment date in YYYY-MM-DD format, if provided.",
          },

          appointmentTime: {
            type: "string",
            description:
              "New appointment time in 24-hour HH:mm format, if provided.",
          },

          duration: {
            type: "number",
            description:
              "New appointment duration in minutes, if provided.",
          },

          status: {
            type: "string",
            enum: [
              "scheduled",
              "completed",
              "cancelled",
              "missed",
            ],
            description:
              "New appointment status, if provided.",
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
  // CANCEL APPOINTMENT
  // ========================================

  {
    type: "function",

    function: {
      name: "cancel_appointment",

      description:
        "Cancel an existing appointment for the authenticated user. Use this when the user explicitly asks to cancel an appointment.",

      parameters: {
        type: "object",

        properties: {

          contactName: {
            type: "string",
            description:
              "Full name of the contact associated with the appointment.",
          },

          appointmentTitle: {
            type: "string",
            description:
              "Title of the appointment that should be cancelled.",
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
  // CREATE CONTACT
  // ========================================

  {
    type: "function",

    function: {
      name: "create_contact",

      description:
        "Create a new contact for the authenticated user. Use this when the user explicitly asks to add, create, or save a new contact.",

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
              "Company where the contact works.",
          },

          designation: {
            type: "string",
            description:
              "Job designation of the contact.",
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


  // ========================================
  // UPDATE CONTACT
  // ========================================

  {
    type: "function",

    function: {
      name: "update_contact",

      description:
        "Update an existing contact for the authenticated user. Use this when the user explicitly asks to change, update, or edit contact information.",

      parameters: {
        type: "object",

        properties: {

          contactName: {
            type: "string",
            description:
              "Full name of the existing contact that should be updated.",
          },

          fullName: {
            type: "string",
            description:
              "New full name of the contact, if the user wants to change it.",
          },

          phone: {
            type: "string",
            description:
              "New phone number of the contact, if provided.",
          },

          email: {
            type: "string",
            description:
              "New email address of the contact, if provided.",
          },

          company: {
            type: "string",
            description:
              "New company name, if provided.",
          },

          designation: {
            type: "string",
            description:
              "New job designation, if provided.",
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
  // DELETE CONTACT
  // ========================================

  {
    type: "function",

    function: {
      name: "delete_contact",

      description:
        "Delete an existing contact for the authenticated user. Use this only when the user explicitly asks to delete or remove a contact.",

      parameters: {
        type: "object",

        properties: {

          contactName: {
            type: "string",
            description:
              "Full name of the contact that should be deleted.",
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
  // CREATE CALL
  // ========================================

  {
    type: "function",

    function: {
      name: "create_call",

      description:
        "Create a new call record for the authenticated user. Use this only when the user explicitly asks to log, record, or create a call.",

      parameters: {
        type: "object",

        properties: {

          contactName: {
            type: "string",
            description:
              "Full name of the contact associated with the call.",
          },

          callType: {
            type: "string",
            enum: [
              "incoming",
              "outgoing",
            ],
            description:
              "Whether the call was incoming or outgoing.",
          },

          status: {
            type: "string",
            enum: [
              "answered",
              "missed",
              "rejected",
            ],
            description:
              "Status of the call.",
          },

          duration: {
            type: "number",
            description:
              "Call duration in seconds.",
          },

          notes: {
            type: "string",
            description:
              "Optional notes about the call.",
          },

          startedAt: {
            type: "string",
            description:
              "Call start date and time in ISO 8601 format.",
          },

          endedAt: {
            type: "string",
            description:
              "Optional call end date and time in ISO 8601 format.",
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


  // ========================================
  // GET RECENT CALLS
  // ========================================

  {
    type: "function",

    function: {
      name: "get_recent_calls",

      description:
        "Get recent call records of the authenticated user. Use this when the user explicitly asks about recent calls, latest calls, call history, or recent call records.",

      parameters: {
        type: "object",

        properties: {

          limit: {
            type: "integer",
            minimum: 1,
            maximum: 50,
            description:
              "Maximum number of recent calls to return. Must be a number between 1 and 50. If not provided, use 10.",
          },

        },

        required: [],

        additionalProperties: false,
      },
    },
  },


  // ========================================
  // GET CALL STATS
  // ========================================

  {
    type: "function",

    function: {
      name: "get_call_stats",

      description:
        "Get call statistics for the authenticated user. Use this when the user asks about total calls, incoming calls, outgoing calls, answered calls, missed calls, rejected calls, today's calls, or total call duration.",

      parameters: {
        type: "object",

        properties: {},

        required: [],

        additionalProperties: false,
      },
    },
  },


  // ========================================
  // UPDATE CALL
  // ========================================

  {
    type: "function",

    function: {
      name: "update_call",

      description:
        "Update an existing call record for the authenticated user. Use this only when the user explicitly asks to update, edit, or change an existing call record.",

      parameters: {
        type: "object",

        properties: {

          contactName: {
            type: "string",
            description:
              "Full name of the contact associated with the call.",
          },

          callId: {
            type: "string",
            description:
              "MongoDB ObjectId of the call record, if available.",
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
            description:
              "Updated call duration in seconds.",
          },

          notes: {
            type: "string",
            description:
              "Updated notes for the call.",
          },

          startedAt: {
            type: "string",
            description:
              "Updated call start date and time in ISO 8601 format.",
          },

          endedAt: {
            type: "string",
            description:
              "Updated call end date and time in ISO 8601 format.",
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
  // DELETE CALL
  // ========================================

  {
    type: "function",

    function: {
      name: "delete_call",

      description:
        "Delete an existing call record for the authenticated user. Use this only when the user explicitly asks to delete or remove a call record.",

      parameters: {
        type: "object",

        properties: {

          contactName: {
            type: "string",
            description:
              "Full name of the contact associated with the call.",
          },

          callId: {
            type: "string",
            description:
              "MongoDB ObjectId of the call record, if available.",
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
  // CREATE REMINDER
  // ========================================

  {
    type: "function",

    function: {
      name: "create_reminder",

      description:
        "Create a reminder for an existing appointment. Use this when the user explicitly asks to create, add, or set a reminder for an appointment.",

      parameters: {
        type: "object",

        properties: {

          contactName: {
            type: "string",
            description:
              "Full name of the contact associated with the appointment.",
          },

          appointmentTitle: {
            type: "string",
            description:
              "Title of the appointment for which the reminder should be created.",
          },

          reminderType: {
            type: "string",
            enum: [
              "email",
              "whatsapp",
            ],
            description:
              "Reminder delivery type.",
          },

          reminderTime: {
            type: "string",
            description:
              "Reminder date and time in ISO 8601 format.",
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


  // ========================================
  // GET REMINDERS
  // ========================================

  {
    type: "function",

    function: {
      name: "get_reminders",

      description:
        "Get reminders belonging to the authenticated user. Use this when the user explicitly asks about reminders, upcoming reminders, scheduled reminders, or reminder history.",

      parameters: {
        type: "object",

        properties: {},

        required: [],

        additionalProperties: false,
      },
    },
  },


  // ========================================
  // UPDATE REMINDER
  // ========================================

  {
    type: "function",

    function: {
      name: "update_reminder",

      description:
        "Update an existing reminder belonging to the authenticated user. Use this when the user explicitly asks to update, edit, or change a reminder.",

      parameters: {
        type: "object",

        properties: {

          reminderId: {
            type: "string",
            description:
              "MongoDB ObjectId of the reminder, if available.",
          },

          contactName: {
            type: "string",
            description:
              "Full name of the contact associated with the reminder.",
          },

          appointmentTitle: {
            type: "string",
            description:
              "Title of the appointment associated with the reminder.",
          },

          reminderType: {
            type: "string",
            enum: [
              "email",
              "whatsapp",
            ],
            description:
              "Updated reminder delivery type.",
          },

          reminderTime: {
            type: "string",
            description:
              "Updated reminder date and time in ISO 8601 format.",
          },

          sent: {
            type: "boolean",
            description:
              "Whether the reminder has been sent.",
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
  // DELETE REMINDER
  // ========================================

  {
    type: "function",

    function: {
      name: "delete_reminder",

      description:
        "Delete an existing reminder belonging to the authenticated user. Use this when the user explicitly asks to delete, remove, or cancel a reminder.",

      parameters: {
        type: "object",

        properties: {

          reminderId: {
            type: "string",
            description:
              "MongoDB ObjectId of the reminder, if available.",
          },

          contactName: {
            type: "string",
            description:
              "Full name of the contact associated with the reminder.",
          },

          appointmentTitle: {
            type: "string",
            description:
              "Title of the appointment associated with the reminder.",
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

];


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

  const [
    contacts,
    appointments,
    calls,
  ] = await Promise.all([

    Contact.find({
      owner: ownerId,
    })
      .select(
        "fullName phone email company designation"
      )
      .limit(20)
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
      .limit(20)
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
      .limit(20)
      .lean(),

  ]);


  // ========================================
  // CREATE USER CONTEXT
  // ========================================

  const userContext = `
USER CONTACTS:
${JSON.stringify(
  contacts,
  null,
  2
)}

USER APPOINTMENTS:
${JSON.stringify(
  appointments,
  null,
  2
)}

USER CALLS:
${JSON.stringify(
  calls,
  null,
  2
)}
`;


  // ========================================
  // FIRST AI REQUEST
  // ========================================

  const completion =
    await groq.chat.completions.create({

      messages: [

        {
          role: "system",

          content: `
${AI_SECRETARY_SYSTEM_PROMPT}

CURRENT DATE:
${new Date().toISOString()}

IMPORTANT:
- The authenticated user's ID is ${ownerId}.
- You can answer questions using the user's data.

APPOINTMENT RULES:
- If the user explicitly asks you to create an appointment, use create_appointment.
- If the user explicitly asks you to update, edit, reschedule, or change an appointment, use update_appointment.
- If the user explicitly asks you to cancel an appointment, use cancel_appointment.
- Never create an appointment unless the user explicitly asks.
- Never update an appointment unless the user explicitly asks.
- Never cancel an appointment unless the user explicitly asks.

CONTACT RULES:
- If the user explicitly asks you to create or add a contact, use create_contact.
- If the user explicitly asks you to update or edit a contact, use update_contact.
- If the user explicitly asks you to delete or remove a contact, use delete_contact.
- Never create a contact unless the user explicitly asks.
- Never update a contact unless the user explicitly asks.
- Never delete a contact unless the user explicitly asks.

CALL RULES:
- If the user explicitly asks to create, log, record, or save a call, use create_call.
- If the user explicitly asks about recent calls, latest calls, call history, or recent call records, use get_recent_calls.
- If the user explicitly asks for call statistics or call analytics, use get_call_stats.
- If the user explicitly asks to update, edit, or change an existing call record, use update_call.
- If the user explicitly asks to delete or remove an existing call record, use delete_call.

- Never create a call unless explicitly requested.
- Never update a call unless explicitly requested.
- Never delete a call unless explicitly requested.
- Never invent call information.

- For get_recent_calls, limit must always be a number between 1 and 50.
- If the user does not provide a limit, use 10.

- For update_call and delete_call:
  - Always identify the correct contact first.
  - Only operate on calls belonging to the authenticated user.
  - If callId is provided, use it to identify the exact call.
  - If callId is not provided, use the latest call for the specified contact.
  - Never modify or delete another user's call.

REMINDER RULES:
- If the user explicitly asks to create, add, or set a reminder for an existing appointment, use create_reminder.
- If the user explicitly asks about reminders, upcoming reminders, scheduled reminders, or reminder history, use get_reminders.
- If the user explicitly asks to update, edit, or change a reminder, use update_reminder.
- If the user explicitly asks to delete, remove, or cancel a reminder, use delete_reminder.

- Never create a reminder unless explicitly requested.
- Never update a reminder unless explicitly requested.
- Never delete a reminder unless explicitly requested.

- Reminders must always belong to an existing appointment.
- Before creating a reminder, identify the correct contact and appointment.
- Only operate on reminders belonging to the authenticated user.
- reminderType must be either email or whatsapp.
- reminderTime must be a valid ISO 8601 date-time.

- For update_reminder and delete_reminder:
  - If reminderId is provided, use it to identify the exact reminder.
  - If reminderId is not provided, use contactName and appointmentTitle to identify the reminder.
  - Never modify or delete another user's reminder.

GENERAL RULES:
- Never invent contact information.
- If a required value is missing, ask the user for it.
- Appointment date must be YYYY-MM-DD.
- Appointment time must be HH:mm in 24-hour format.
- Call type must be either incoming or outgoing.
- Call status must be either answered, missed, or rejected.
- startedAt must be a valid ISO 8601 date-time.
`,
        },


        {
          role: "system",

          content: `
Here is the authenticated user's current application data.

${userContext}
`,
        },


        {
          role: "user",

          content:
            message,
        },

      ],

      model:
        "llama-3.3-70b-versatile",

      temperature:
        0.3,

      max_tokens:
        700,

      tools,

      tool_choice:
        "auto",

    });


  const assistantMessage =
    completion.choices[0].message;


  // ========================================
  // NORMAL AI RESPONSE
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
  // HANDLE TOOL CALL
  // ========================================

  const toolCall =
    assistantMessage.tool_calls[0];


  const toolName =
    toolCall.function.name;


  const args =
    JSON.parse(
      toolCall.function.arguments
    );


  // ========================================
  // CREATE APPOINTMENT
  // ========================================

  if (
    toolName ===
    "create_appointment"
  ) {

    const contact =
      await Contact.findOne({

        owner:
          ownerId,

        fullName: {
          $regex:
            args.contactName,

          $options:
            "i",
        },

      });


    if (!contact) {

      return `
I couldn't find a contact named "${args.contactName}".

Please make sure the contact exists before creating the appointment.
`;

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


    return `
Appointment created successfully.

Title: ${appointment.title}
Contact: ${contact.fullName}
Date: ${args.appointmentDate}
Time: ${args.appointmentTime}
Duration: ${appointment.duration} minutes

A reminder has also been automatically created for this appointment.
`;

  }


  // ========================================
  // UPDATE APPOINTMENT
  // ========================================

  if (
    toolName ===
    "update_appointment"
  ) {

    const contact =
      await Contact.findOne({

        owner:
          ownerId,

        fullName: {
          $regex:
            args.contactName,

          $options:
            "i",
        },

      });


    if (!contact) {

      return `
I couldn't find a contact named "${args.contactName}".
`;

    }


    const appointment =
      await Appointment.findOne({

        owner:
          ownerId,

        contact:
          contact._id,

        title: {
          $regex:
            args.appointmentTitle,

          $options:
            "i",
        },

      });


    if (!appointment) {

      return `
I couldn't find an appointment titled "${args.appointmentTitle}" for ${contact.fullName}.
`;

    }


    const updateData = {};


    if (
      args.title !== undefined
    ) {

      updateData.title =
        args.title;

    }


    if (
      args.description !== undefined
    ) {

      updateData.description =
        args.description;

    }


    if (
      args.appointmentDate !== undefined
    ) {

      updateData.appointmentDate =
        new Date(
          args.appointmentDate
        );

    }


    if (
      args.appointmentTime !== undefined
    ) {

      updateData.appointmentTime =
        args.appointmentTime;

    }


    if (
      args.duration !== undefined
    ) {

      updateData.duration =
        args.duration;

    }


    if (
      args.status !== undefined
    ) {

      updateData.status =
        args.status;

    }


    if (
      Object.keys(
        updateData
      ).length === 0
    ) {

      return `
I found the appointment, but I couldn't determine what information you want to update.
`;

    }


    const updatedAppointment =
      await updateAppointment(

        appointment._id,

        ownerId,

        updateData

      );


    return `
Appointment updated successfully.

Title: ${updatedAppointment.title}
Contact: ${updatedAppointment.contact.fullName}
Date: ${new Date(
  updatedAppointment.appointmentDate
)
  .toISOString()
  .split("T")[0]}
Time: ${updatedAppointment.appointmentTime}
Duration: ${updatedAppointment.duration} minutes
Status: ${updatedAppointment.status}

The associated reminder has been automatically synchronized.
`;

  }


  // ========================================
  // CANCEL APPOINTMENT
  // ========================================

  if (
    toolName ===
    "cancel_appointment"
  ) {

    const contact =
      await Contact.findOne({

        owner:
          ownerId,

        fullName: {
          $regex:
            args.contactName,

          $options:
            "i",
        },

      });


    if (!contact) {

      return `
I couldn't find a contact named "${args.contactName}".
`;

    }


    const appointment =
      await Appointment.findOne({

        owner:
          ownerId,

        contact:
          contact._id,

        title: {
          $regex:
            args.appointmentTitle,

          $options:
            "i",
        },

        status:
          "scheduled",

      });


    if (!appointment) {

      return `
I couldn't find a scheduled appointment titled "${args.appointmentTitle}" for ${contact.fullName}.
`;

    }


    const cancelledAppointment =
      await updateAppointmentStatus(

        appointment._id,

        ownerId,

        "cancelled"

      );


    await Reminder.deleteOne({

      appointment:
        appointment._id,

      owner:
        ownerId,

    });


    return `
Appointment cancelled successfully.

Title: ${cancelledAppointment.title}
Contact: ${contact.fullName}
Date: ${new Date(
  cancelledAppointment.appointmentDate
)
  .toISOString()
  .split("T")[0]}
Time: ${cancelledAppointment.appointmentTime}
Status: ${cancelledAppointment.status}

The associated reminder has also been removed.
`;

  }


  // ========================================
  // CREATE CONTACT
  // ========================================

  if (
    toolName ===
    "create_contact"
  ) {

    const existingContact =
      await Contact.findOne({

        owner:
          ownerId,

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

      return `
A contact already exists with this email or phone number.

Name: ${existingContact.fullName}
Email: ${existingContact.email}
Phone: ${existingContact.phone}
`;

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


    return `
Contact created successfully.

Name: ${contact.fullName}
Phone: ${contact.phone}
Email: ${contact.email}
Company: ${contact.company || "Not provided"}
Designation: ${contact.designation || "Not provided"}
`;

  }


  // ========================================
  // UPDATE CONTACT
  // ========================================

  if (
    toolName ===
    "update_contact"
  ) {

    const contact =
      await Contact.findOne({

        owner:
          ownerId,

        fullName: {
          $regex:
            args.contactName,

          $options:
            "i",
        },

      });


    if (!contact) {

      return `
I couldn't find a contact named "${args.contactName}".
`;

    }


    const updateData = {};


    if (
      args.fullName !== undefined
    ) {

      updateData.fullName =
        args.fullName;

    }


    if (
      args.phone !== undefined
    ) {

      updateData.phone =
        args.phone;

    }


    if (
      args.email !== undefined
    ) {

      updateData.email =
        args.email;

    }


    if (
      args.company !== undefined
    ) {

      updateData.company =
        args.company;

    }


    if (
      args.designation !== undefined
    ) {

      updateData.designation =
        args.designation;

    }


    if (
      Object.keys(
        updateData
      ).length === 0
    ) {

      return `
I found the contact, but I couldn't determine what information you want to update.
`;

    }


    const updatedContact =
      await updateContact(

        contact._id,

        ownerId,

        updateData

      );


    return `
Contact updated successfully.

Name: ${updatedContact.fullName}
Phone: ${updatedContact.phone}
Email: ${updatedContact.email}
Company: ${updatedContact.company || "Not provided"}
Designation: ${updatedContact.designation || "Not provided"}
`;

  }


  // ========================================
  // DELETE CONTACT
  // ========================================

  if (
    toolName ===
    "delete_contact"
  ) {

    const contact =
      await Contact.findOne({

        owner:
          ownerId,

        fullName: {
          $regex:
            args.contactName,

          $options:
            "i",
        },

      });


    if (!contact) {

      return `
I couldn't find a contact named "${args.contactName}".
`;

    }


    const deletedContact =
      await deleteContact(

        contact._id,

        ownerId

      );


    return `
Contact deleted successfully.

Name: ${deletedContact.fullName}
Phone: ${deletedContact.phone}
Email: ${deletedContact.email}
Company: ${deletedContact.company || "Not provided"}
Designation: ${deletedContact.designation || "Not provided"}
`;

  }


  // ========================================
  // CREATE CALL
  // ========================================

  if (
    toolName ===
    "create_call"
  ) {

    const contact =
      await Contact.findOne({

        owner:
          ownerId,

        fullName: {
          $regex:
            args.contactName,

          $options:
            "i",
        },

      });


    if (!contact) {

      return `
I couldn't find a contact named "${args.contactName}".

Please make sure the contact exists before creating the call record.
`;

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


    return `
Call record created successfully.

Contact: ${contact.fullName}
Type: ${call.callType}
Status: ${call.status}
Duration: ${call.duration} seconds
Started At: ${call.startedAt.toISOString()}
${
  call.endedAt
    ? `Ended At: ${call.endedAt.toISOString()}`
    : ""
}
${
  call.notes
    ? `Notes: ${call.notes}`
    : ""
}
`;

  }


  // ========================================
  // GET RECENT CALLS
  // ========================================

  if (
    toolName ===
    "get_recent_calls"
  ) {

    const parsedLimit =
      Number(
        args?.limit
      );

    const limit =
      Number.isFinite(
        parsedLimit
      )
        ? Math.min(
            Math.max(
              Math.floor(
                parsedLimit
              ),
              1
            ),
            50
          )
        : 10;


    const result =
      await getMyCalls(

        ownerId,

        {
          page:
            1,

          limit:
            limit,

          sortBy:
            "createdAt",

          sortOrder:
            "desc",

        }

      );


    if (
      !result ||
      !Array.isArray(
        result.calls
      ) ||
      result.calls.length === 0
    ) {

      return `
No call records found.
`;

    }


    const callsText =
      result.calls
        .map(
          (
            call,
            index
          ) => {

            const contactName =
              call.contact?.fullName ||
              "Unknown Contact";

            const startedAt =
              call.startedAt
                ? new Date(
                    call.startedAt
                  ).toLocaleString()
                : "Not available";


            return `
${index + 1}. ${contactName}
Type: ${call.callType}
Status: ${call.status}
Duration: ${call.duration || 0} seconds
Started At: ${startedAt}
${
  call.notes
    ? `Notes: ${call.notes}`
    : ""
}
`;

          }
        )
        .join(
          "\n"
        );


    return `
Here are your recent calls:

${callsText}
`;

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


    return `
Here are your call statistics.

Total Calls: ${stats.total}
Incoming Calls: ${stats.incoming}
Outgoing Calls: ${stats.outgoing}
Answered Calls: ${stats.answered}
Missed Calls: ${stats.missed}
Rejected Calls: ${stats.rejected}
Today's Calls: ${stats.today}
Total Duration: ${stats.totalDuration} seconds
`;

  }


  // ========================================
  // UPDATE CALL
  // ========================================

  if (
    toolName ===
    "update_call"
  ) {

    const contact =
      await Contact.findOne({

        owner:
          ownerId,

        fullName: {
          $regex:
            args.contactName,

          $options:
            "i",
        },

      });


    if (!contact) {

      return `
I couldn't find a contact named "${args.contactName}".
`;

    }


    let call;


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

      return `
I couldn't find a call record for ${contact.fullName}.
`;

    }


    const updateData = {};


    if (
      args.callType !== undefined
    ) {

      updateData.callType =
        args.callType;

    }


    if (
      args.status !== undefined
    ) {

      updateData.status =
        args.status;

    }


    if (
      args.duration !== undefined
    ) {

      updateData.duration =
        args.duration;

    }


    if (
      args.notes !== undefined
    ) {

      updateData.notes =
        args.notes;

    }


    if (
      args.startedAt !== undefined
    ) {

      updateData.startedAt =
        new Date(
          args.startedAt
        );

    }


    if (
      args.endedAt !== undefined
    ) {

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

      return `
I found the call record, but I couldn't determine what information you want to update.
`;

    }


    const updatedCall =
      await updateCall(

        call._id,

        ownerId,

        updateData

      );


    return `
Call record updated successfully.

Contact: ${contact.fullName}
Type: ${updatedCall.callType}
Status: ${updatedCall.status}
Duration: ${updatedCall.duration || 0} seconds
Started At: ${
  updatedCall.startedAt
    ? updatedCall.startedAt.toISOString()
    : "Not available"
}
${
  updatedCall.endedAt
    ? `Ended At: ${updatedCall.endedAt.toISOString()}`
    : ""
}
${
  updatedCall.notes
    ? `Notes: ${updatedCall.notes}`
    : ""
}
`;

  }


  // ========================================
  // DELETE CALL
  // ========================================

  if (
    toolName ===
    "delete_call"
  ) {

    const contact =
      await Contact.findOne({

        owner:
          ownerId,

        fullName: {
          $regex:
            args.contactName,

          $options:
            "i",
        },

      });


    if (!contact) {

      return `
I couldn't find a contact named "${args.contactName}".
`;

    }


    let call;


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

      return `
I couldn't find a call record for ${contact.fullName}.
`;

    }


    const deletedCall = {

      callType:
        call.callType,

      status:
        call.status,

      duration:
        call.duration || 0,

    };


    await deleteCall(

      call._id,

      ownerId

    );


    return `
Call record deleted successfully.

Contact: ${contact.fullName}
Type: ${deletedCall.callType}
Status: ${deletedCall.status}
Duration: ${deletedCall.duration} seconds
`;

  }


  // ========================================
  // CREATE REMINDER
  // ========================================

  if (
    toolName ===
    "create_reminder"
  ) {

    const contact =
      await Contact.findOne({

        owner:
          ownerId,

        fullName: {
          $regex:
            args.contactName,

          $options:
            "i",
        },

      });


    if (!contact) {

      return `
I couldn't find a contact named "${args.contactName}".
`;

    }


    const appointment =
      await Appointment.findOne({

        owner:
          ownerId,

        contact:
          contact._id,

        title: {
          $regex:
            args.appointmentTitle,

          $options:
            "i",
        },

      });


    if (!appointment) {

      return `
I couldn't find an appointment titled "${args.appointmentTitle}" for ${contact.fullName}.
`;

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


    return `
Reminder created successfully.

Contact: ${contact.fullName}
Appointment: ${appointment.title}
Reminder Type: ${reminder.reminderType}
Reminder Time: ${new Date(
  reminder.reminderTime
).toLocaleString()}
`;

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
        ownerId
      );

      const reminders = 
          result.reminders


    if (
      !reminders ||
      reminders.length === 0
    ) {

      return `
No reminders found.
`;

    }


    const remindersText =
      reminders
        .map(
          (
            reminder,
            index
          ) => {

            const contactName =
              reminder.appointment
                ?.contact
                ?.fullName ||
              "Unknown Contact";

            const appointmentTitle =
              reminder.appointment
                ?.title ||
              "Unknown Appointment";

            const reminderTime =
              reminder.reminderTime
                ? new Date(
                    reminder.reminderTime
                  ).toLocaleString()
                : "Not available";


            return `
${index + 1}. ${appointmentTitle}
Contact: ${contactName}
Type: ${reminder.reminderType}
Reminder Time: ${reminderTime}
Sent: ${reminder.sent ? "Yes" : "No"}
${
  reminder.sentAt
    ? `Sent At: ${new Date(
        reminder.sentAt
      ).toLocaleString()}`
    : ""
}
`;

          }
        )
        .join(
          "\n"
        );


    return `
Here are your reminders:

${remindersText}
`;

  }


  // ========================================
  // UPDATE REMINDER
  // ========================================

  if (
    toolName ===
    "update_reminder"
  ) {

    const contact =
      await Contact.findOne({

        owner:
          ownerId,

        fullName: {
          $regex:
            args.contactName,

          $options:
            "i",
        },

      });


    if (!contact) {

      return `
I couldn't find a contact named "${args.contactName}".
`;

    }


    const appointment =
      await Appointment.findOne({

        owner:
          ownerId,

        contact:
          contact._id,

        title: {
          $regex:
            args.appointmentTitle,

          $options:
            "i",
        },

      });


    if (!appointment) {

      return `
I couldn't find an appointment titled "${args.appointmentTitle}" for ${contact.fullName}.
`;

    }


    let reminder;


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

      return `
I couldn't find a reminder for the appointment "${appointment.title}".
`;

    }


    const updateData = {};


    if (
      args.reminderType !== undefined
    ) {

      updateData.reminderType =
        args.reminderType;

    }


    if (
      args.reminderTime !== undefined
    ) {

      updateData.reminderTime =
        new Date(
          args.reminderTime
        );

      updateData.sent =
        false;

      updateData.sentAt =
        null;

    }


    if (
      args.sent !== undefined
    ) {

      updateData.sent =
        args.sent;

    }


    if (
      Object.keys(
        updateData
      ).length === 0
    ) {

      return `
I found the reminder, but I couldn't determine what information you want to update.
`;

    }


    const updatedReminder =
      await updateReminder(

        reminder._id,

        ownerId,

        updateData

      );


    return `
Reminder updated successfully.

Contact: ${contact.fullName}
Appointment: ${appointment.title}
Type: ${updatedReminder.reminderType}
Reminder Time: ${new Date(
  updatedReminder.reminderTime
).toLocaleString()}
Sent: ${
  updatedReminder.sent
    ? "Yes"
    : "No"
}
`;

  }


  // ========================================
  // DELETE REMINDER
  // ========================================

  if (
    toolName ===
    "delete_reminder"
  ) {

    const contact =
      await Contact.findOne({

        owner:
          ownerId,

        fullName: {
          $regex:
            args.contactName,

          $options:
            "i",
        },

      });


    if (!contact) {

      return `
I couldn't find a contact named "${args.contactName}".
`;

    }


    const appointment =
      await Appointment.findOne({

        owner:
          ownerId,

        contact:
          contact._id,

        title: {
          $regex:
            args.appointmentTitle,

          $options:
            "i",
        },

      });


    if (!appointment) {

      return `
I couldn't find an appointment titled "${args.appointmentTitle}" for ${contact.fullName}.
`;

    }


    let reminder;


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

      return `
I couldn't find a reminder for the appointment "${appointment.title}".
`;

    }


    const deletedReminder = {

      reminderType:
        reminder.reminderType,

      reminderTime:
        reminder.reminderTime,

    };


    await deleteReminder(

      reminder._id,

      ownerId

    );


    return `
Reminder deleted successfully.

Contact: ${contact.fullName}
Appointment: ${appointment.title}
Type: ${deletedReminder.reminderType}
Reminder Time: ${new Date(
  deletedReminder.reminderTime
).toLocaleString()}
`;

  }


  // ========================================
  // FALLBACK
  // ========================================

  return (
    assistantMessage.content ||
    "I couldn't process your request."
  )

}