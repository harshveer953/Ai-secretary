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
              "Appointment duration in minutes. Default is 30.",
          },

        },

        required: [
          "contactName",
          "title",
          "appointmentDate",
          "appointmentTime",
        ],
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
        "Update, edit, reschedule, or change an existing appointment for the authenticated user. Use this only when the user explicitly asks to update or change an appointment.",

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
              "New appointment time in HH:mm 24-hour format, if provided.",
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
        "Cancel an existing scheduled appointment for the authenticated user. Use this only when the user explicitly asks to cancel an appointment.",

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
        "Create a new contact for the authenticated user. Use this only when the user explicitly asks to add, create, or save a contact.",

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
        "Update or edit an existing contact for the authenticated user. Use this only when the user explicitly asks to change or update contact information.",

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
              "New full name of the contact, if provided.",
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

    // ========================================
    // CONTACTS
    // ========================================

    Contact.find({
      owner: ownerId,
    })
      .select(
        "fullName phone email company designation"
      )
      .limit(20)
      .lean(),


    // ========================================
    // APPOINTMENTS
    // ========================================

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


    // ========================================
    // CALLS
    // ========================================

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

        // ========================================
        // SYSTEM PROMPT
        // ========================================

        {
          role: "system",

          content: `
${AI_SECRETARY_SYSTEM_PROMPT}

CURRENT DATE:
${new Date().toISOString()}

IMPORTANT RULES:

- The authenticated user's ID is ${ownerId}.
- You can answer questions using the authenticated user's data.
- Always respect the authenticated user's ownership.
- Never access or modify another user's data.

CONTACT RULES:

- If the user explicitly asks to create, add, or save a contact, use create_contact.
- If the user explicitly asks to update or edit a contact, use update_contact.
- If the user explicitly asks to delete or remove a contact, use delete_contact.
- Never create a contact unless explicitly requested.
- Never update a contact unless explicitly requested.
- Never delete a contact unless explicitly requested.
- Never invent contact information.
- If a required contact field is missing, ask the user for it.

APPOINTMENT RULES:

- If the user explicitly asks to create, schedule, or book an appointment, use create_appointment.
- If the user explicitly asks to update, edit, reschedule, or change an appointment, use update_appointment.
- If the user explicitly asks to cancel an appointment, use cancel_appointment.
- Never create an appointment unless explicitly requested.
- Never update an appointment unless explicitly requested.
- Never cancel an appointment unless explicitly requested.
- Never invent appointment information.
- If a required appointment value is missing, ask the user for it.

DATE AND TIME RULES:

- Appointment date must be YYYY-MM-DD.
- Appointment time must be HH:mm in 24-hour format.
- If the user provides a relative date such as tomorrow or next Monday, convert it using the current date.
- Default appointment duration is 30 minutes if not provided.
`,
        },


        // ========================================
        // USER APPLICATION DATA
        // ========================================

        {
          role: "system",

          content: `
Here is the authenticated user's current application data.

${userContext}
`,
        },


        // ========================================
        // USER MESSAGE
        // ========================================

        {
          role: "user",

          content: message,
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


  // ========================================
  // AI MESSAGE
  // ========================================

  const assistantMessage =
    completion
      .choices[0]
      .message;


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
  // GET TOOL CALL
  // ========================================

  const toolCall =
    assistantMessage
      .tool_calls[0];


  const toolName =
    toolCall
      .function
      .name;


  const args =
    JSON.parse(
      toolCall
        .function
        .arguments
    );



  // ========================================
  // CREATE APPOINTMENT
  // ========================================

  if (
    toolName ===
    "create_appointment"
  ) {

    // ========================================
    // FIND CONTACT
    // ========================================

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


    // ========================================
    // CREATE APPOINTMENT
    // ========================================

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


    // ========================================
    // SUCCESS RESPONSE
    // ========================================

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

    // ========================================
    // FIND CONTACT
    // ========================================

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


    // ========================================
    // FIND APPOINTMENT
    // ========================================

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


    // ========================================
    // PREPARE UPDATE DATA
    // ========================================

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


    // ========================================
    // CHECK UPDATE DATA
    // ========================================

    if (
      Object.keys(updateData)
        .length === 0
    ) {

      return `
I found the appointment, but I couldn't determine what information you want to update.
`;

    }


    // ========================================
    // UPDATE APPOINTMENT
    // ========================================

    const updatedAppointment =
      await updateAppointment(

        appointment._id,

        ownerId,

        updateData

      );


    // ========================================
    // SUCCESS RESPONSE
    // ========================================

    return `
Appointment updated successfully.

Title: ${updatedAppointment.title}
Contact: ${contact.fullName}
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

    // ========================================
    // FIND CONTACT
    // ========================================

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


    // ========================================
    // FIND SCHEDULED APPOINTMENT
    // ========================================

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


    // ========================================
    // CANCEL APPOINTMENT
    //
    // updateAppointmentStatus internally
    // removes the associated reminder
    // ========================================

    const cancelledAppointment =
      await updateAppointmentStatus(

        appointment._id,

        ownerId,

        "cancelled"

      );


    // ========================================
    // SUCCESS RESPONSE
    // ========================================

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

    // ========================================
    // CHECK DUPLICATE CONTACT
    // ========================================

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


    // ========================================
    // CREATE CONTACT
    // ========================================

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


    // ========================================
    // SUCCESS RESPONSE
    // ========================================

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

    // ========================================
    // FIND CONTACT
    // ========================================

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


    // ========================================
    // PREPARE UPDATE DATA
    // ========================================

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


    // ========================================
    // CHECK UPDATE DATA
    // ========================================

    if (
      Object.keys(updateData)
        .length === 0
    ) {

      return `
I found the contact, but I couldn't determine what information you want to update.
`;

    }


    // ========================================
    // UPDATE CONTACT
    // ========================================

    const updatedContact =
      await updateContact(

        contact._id,

        ownerId,

        updateData

      );


    // ========================================
    // SUCCESS RESPONSE
    // ========================================

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

    // ========================================
    // FIND CONTACT
    // ========================================

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


    // ========================================
    // DELETE CONTACT
    // ========================================

    const deletedContact =
      await deleteContact(

        contact._id,

        ownerId

      );


    // ========================================
    // SUCCESS RESPONSE
    // ========================================

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
  // FALLBACK
  // ========================================

  return (
    assistantMessage.content ||
    "I couldn't process your request."
  );

};