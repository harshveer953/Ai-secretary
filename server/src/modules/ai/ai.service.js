import Groq from "groq-sdk";

import Contact from "../contacts/contact.schema.js";
import Appointment from "../appointments/appointment.schema.js";
import Call from "../calls/call.schema.js";

import {
  createContact,
} from "../contacts/contact.service.js";

import {
  createAppointment,
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
  // CREATE APPOINTMENT TOOL
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
      },
    },
  },


  // ========================================
  // CREATE CONTACT TOOL
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
${JSON.stringify(contacts, null, 2)}

USER APPOINTMENTS:
${JSON.stringify(appointments, null, 2)}

USER CALLS:
${JSON.stringify(calls, null, 2)}
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
- If the user explicitly asks you to create an appointment, use the create_appointment tool.
- If the user explicitly asks you to create or add a contact, use the create_contact tool.
- Never create an appointment or contact unless the user explicitly asks.
- Never invent contact information.
- If a required value is missing, ask the user for it.
- Appointment date must be YYYY-MM-DD.
- Appointment time must be HH:mm in 24-hour format.
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

          content: message,
        },

      ],

      model:
        "llama-3.3-70b-versatile",

      temperature: 0.3,

      max_tokens: 700,

      tools,

      tool_choice: "auto",

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

    return assistantMessage.content;

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

    // ========================================
    // FIND CONTACT
    // ========================================

    const contact =
      await Contact.findOne({

        owner: ownerId,

        fullName: {
          $regex: args.contactName,
          $options: "i",
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
            args.description || "",

          appointmentDate:
            new Date(
              args.appointmentDate
            ),

          appointmentTime:
            args.appointmentTime,

          duration:
            args.duration || 30,

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
            args.company || "",

          designation:
            args.designation || "",

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
  // FALLBACK
  // ========================================

  return assistantMessage.content;

};