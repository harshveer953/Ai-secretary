# AI Secretary — Brain / Project Intelligence Document

> This document is the central project context for the AI Secretary application.
> It explains what the application does, how the backend is structured, how AI tool calling works, what has been completed, and what is planned next.

---

# 1. Project Overview

AI Secretary is an AI-powered personal assistant designed to help users manage their professional and personal communication and scheduling from one place.

The assistant can understand natural-language commands and perform actions on behalf of the authenticated user.

The main application modules are:

* Authentication
* Contacts
* Appointments
* Calls
* Reminders
* AI Assistant
* Dashboard
* Future communication automation

The core idea is:

> User speaks naturally → AI understands intent → AI selects the correct tool → Backend validates ownership → Service performs database operation → AI returns a human-friendly response.

---

# 2. Core Technology Stack

## Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication
* Zod validation
* Groq SDK
* Llama 3.3 70B Versatile
* ES Modules

## AI

* Groq API
* Function / Tool Calling
* AI system prompts
* Structured tool parameters
* Authenticated user context

## Database

MongoDB with Mongoose schemas.

Main collections:

* Users
* Contacts
* Appointments
* Calls
* Reminders

---

# 3. Backend Architecture

The backend follows a modular architecture.

Each major feature has its own module.

```text
server/
│
├── modules/
│   │
│   ├── auth/
│   │   ├── auth.controller.js
│   │   ├── auth.service.js
│   │   ├── auth.schema.js
│   │   ├── auth.routes.js
│   │   └── auth.validation.js
│   │
│   ├── contacts/
│   │   ├── contact.controller.js
│   │   ├── contact.service.js
│   │   ├── contact.schema.js
│   │   ├── contact.routes.js
│   │   └── contact.validation.js
│   │
│   ├── appointments/
│   │   ├── appointment.controller.js
│   │   ├── appointment.service.js
│   │   ├── appointment.schema.js
│   │   ├── appointment.routes.js
│   │   └── appointment.validation.js
│   │
│   ├── calls/
│   │   ├── call.controller.js
│   │   ├── call.service.js
│   │   ├── call.schema.js
│   │   ├── call.routes.js
│   │   └── call.validation.js
│   │
│   ├── reminders/
│   │   ├── reminder.controller.js
│   │   ├── reminder.service.js
│   │   ├── reminder.schema.js
│   │   ├── reminder.routes.js
│   │   └── reminder.validation.js
│   │
│   ├── dashboard/
│   │   ├── dashboard.controller.js
│   │   ├── dashboard.service.js
│   │   └── dashboard.routes.js
│   │
│   └── ai/
│       ├── ai.controller.js
│       ├── ai.service.js
│       ├── ai.prompts.js
│       └── ai.routes.js
│
├── shared/
├── constants/
├── middlewares/
├── config/
└── app.js
```

---

# 4. Authentication

Authentication is responsible for identifying the currently authenticated user.

The AI assistant receives the authenticated user's ID as:

```text
ownerId
```

Every AI database operation must use this `ownerId`.

The AI must never access another user's data.

The most important security rule is:

```text
Every database query must be scoped by ownerId.
```

Example:

```js
{
  owner: ownerId
}
```

This applies to:

* Contacts
* Appointments
* Calls
* Reminders
* Dashboard data

---

# 5. Contact Module

The Contact module stores people related to the authenticated user.

Main fields:

```text
fullName
phone
email
company
designation
owner
```

The AI currently supports:

### Create Contact

User examples:

```text
Add Rahul as a contact.
Create a new contact for John.
Save this contact.
```

AI tool:

```text
create_contact
```

### Update Contact

User examples:

```text
Update Rahul's phone number.
Change John's company.
Edit this contact.
```

AI tool:

```text
update_contact
```

### Delete Contact

User examples:

```text
Delete Rahul from my contacts.
Remove John.
```

AI tool:

```text
delete_contact
```

### Contact Security

Before modifying a contact:

```text
ownerId + contact name
```

is used to find the correct contact.

The AI must never modify a contact belonging to another user.

---

# 6. Appointment Module

Appointments represent scheduled meetings or events.

The appointment is connected to a contact.

Relationship:

```text
User
  │
  └── Appointment
        │
        └── Contact
```

The AI currently supports:

### Create Appointment

Tool:

```text
create_appointment
```

Required information:

```text
contactName
title
appointmentDate
appointmentTime
```

Optional:

```text
description
duration
```

Default duration:

```text
30 minutes
```

Date format:

```text
YYYY-MM-DD
```

Time format:

```text
HH:mm
```

Example:

```text
Schedule a meeting with Rahul tomorrow at 3 PM.
```

The AI identifies:

```text
Contact
Date
Time
Title
```

Then creates the appointment.

---

### Update Appointment

Tool:

```text
update_appointment
```

Can update:

```text
title
description
appointmentDate
appointmentTime
duration
status
```

Supported status:

```text
scheduled
completed
cancelled
missed
```

---

### Cancel Appointment

Tool:

```text
cancel_appointment
```

The AI:

1. Finds the contact.
2. Finds the scheduled appointment.
3. Changes status to `cancelled`.
4. Removes the associated reminder.

---

# 7. Call Module

The Call module stores call history.

Main fields include:

```text
owner
contact
callType
status
duration
notes
startedAt
endedAt
```

Supported call types:

```text
incoming
outgoing
```

Supported call statuses:

```text
answered
missed
rejected
```

Duration is stored in:

```text
seconds
```

---

# 8. Call AI Tools

## Create Call

Tool:

```text
create_call
```

Used when the user explicitly asks to:

* Log a call
* Record a call
* Save a call
* Create a call record

Required:

```text
contactName
callType
status
startedAt
```

Optional:

```text
duration
notes
endedAt
```

---

## Get Recent Calls

Tool:

```text
get_recent_calls
```

Used for:

```text
Show my recent calls.
What are my latest calls?
Show my call history.
```

Default:

```text
limit = 10
```

Maximum:

```text
50
```

---

## Get Call Stats

Tool:

```text
get_call_stats
```

Returns:

```text
Total Calls
Incoming Calls
Outgoing Calls
Answered Calls
Missed Calls
Rejected Calls
Today's Calls
Total Duration
```

---

## Update Call

Tool:

```text
update_call
```

The AI can update:

```text
callType
status
duration
notes
startedAt
endedAt
```

The call can be identified by:

```text
callId
```

If no `callId` is available:

```text
latest call for the specified contact
```

is used.

---

## Delete Call

Tool:

```text
delete_call
```

The AI can delete a call using:

```text
callId
```

or:

```text
latest call for a specified contact
```

Only calls belonging to the authenticated user can be deleted.

---

# 9. Reminder Module

Reminders are connected to appointments.

Relationship:

```text
User
  │
  └── Reminder
        │
        └── Appointment
              │
              └── Contact
```

Supported reminder types:

```text
email
whatsapp
```

Main reminder fields:

```text
owner
appointment
reminderType
reminderTime
sent
sentAt
```

---

# 10. Reminder AI Tools

## Create Reminder

Tool:

```text
create_reminder
```

Required:

```text
contactName
appointmentTitle
reminderType
reminderTime
```

The AI first finds:

```text
Contact
```

Then:

```text
Appointment
```

Then creates:

```text
Reminder
```

The reminder must always belong to an existing appointment.

---

## Get Reminders

Tool:

```text
get_reminders
```

Used when the user asks:

```text
Show my reminders.
What reminders do I have?
Show upcoming reminders.
Show scheduled reminders.
```

---

## Update Reminder

Tool:

```text
update_reminder
```

Can update:

```text
reminderType
reminderTime
sent
```

If the reminder time changes:

```text
sent = false
sentAt = null
```

This resets the reminder to pending state.

---

## Delete Reminder

Tool:

```text
delete_reminder
```

Used when the user asks to:

```text
Delete reminder.
Remove reminder.
Cancel reminder.
```

The reminder is located using:

```text
reminderId
```

or:

```text
contactName + appointmentTitle
```

---

# 11. AI Service

Main file:

```text
modules/ai/ai.service.js
```

The AI service is currently responsible for:

1. Loading Groq SDK.
2. Defining AI tools.
3. Fetching user context.
4. Sending messages to Groq.
5. Receiving AI tool calls.
6. Executing requested backend services.
7. Returning human-readable responses.

Main function:

```js
chatWithAI(message, ownerId)
```

Flow:

```text
User Message
      │
      ▼
chatWithAI()
      │
      ▼
Fetch User Data
      │
      ▼
Build AI Context
      │
      ▼
Groq Llama 3.3 70B
      │
      ├───────────────┐
      │               │
      ▼               ▼
Normal Response    Tool Call
                      │
                      ▼
              Execute Backend Service
                      │
                      ▼
                Database Operation
                      │
                      ▼
                Human Response
```

---

# 12. Current AI Tools

The current AI service contains these tools:

```text
create_appointment
update_appointment
cancel_appointment

create_contact
update_contact
delete_contact

create_call
get_recent_calls
get_call_stats
update_call
delete_call

create_reminder
get_reminders
update_reminder
delete_reminder
```

Total:

```text
14 AI tools
```

---

# 13. AI Tool Calling Rules

The AI must never perform write operations without explicit user intent.

For example:

```text
Show me Rahul's information.
```

Must NOT create or update anything.

But:

```text
Add Rahul to my contacts.
```

Can call:

```text
create_contact
```

Similarly:

```text
Change my meeting with Rahul to 5 PM.
```

Can call:

```text
update_appointment
```

The AI must not automatically change data just because it thinks that would be helpful.

---

# 14. User Ownership Security

Every operation must be scoped to:

```text
ownerId
```

The AI service must never trust user-provided owner IDs.

The authenticated backend must provide:

```text
ownerId
```

The AI only uses the authenticated owner.

All queries must follow this pattern:

```js
{
  owner: ownerId
}
```

Never:

```js
{
  owner: userProvidedOwnerId
}
```

---

# 15. Current AI Context

The AI currently loads:

```text
Contacts
Appointments
Calls
```

The data is limited to the authenticated user.

The current context limit is approximately:

```text
20 contacts
20 appointments
20 calls
```

This context is provided to the model before processing the user's message.

Current architecture:

```text
MongoDB
   │
   ├── Contacts
   ├── Appointments
   └── Calls
          │
          ▼
      User Context
          │
          ▼
      Groq AI Model
```

---

# 16. Important Optimization Planned

The current system sends user context to the AI on every request.

This can increase:

* Token usage
* Response size
* Rate-limit consumption
* Latency

Future optimization:

```text
Do not send full user data on every request.
```

Instead:

```text
User asks question
      │
      ▼
AI determines required tool
      │
      ▼
Tool fetches only required data
      │
      ▼
Return result
```

Example:

```text
User:
Show my recent calls.
```

Instead of loading:

```text
20 contacts
20 appointments
20 calls
```

The AI can directly call:

```text
get_recent_calls
```

This will make the AI service more efficient.

---

# 17. Current Testing Status

The following functionality has been tested successfully:

```text
AI Tool Calling
Contact Operations
Appointment Operations
Call Operations
Reminder Operations
Database Persistence
```

Successful database verification has been performed.

The backend correctly creates, updates, and deletes records.

Current status:

```text
Core AI Tool Calling: COMPLETE
Database Integration: COMPLETE
Service Integration: COMPLETE
Ownership Validation: COMPLETE
Basic Testing: COMPLETE
```

---

# 18. Current Limitation

The current AI model is:

```text
llama-3.3-70b-versatile
```

Provider:

```text
Groq
```

During testing, the model/API rate or token limit was reached.

This does not indicate that the AI service architecture is broken.

The limit is expected to reset according to the provider's rate/quota window.

The system should eventually implement:

* Better token optimization
* Smaller context
* Retry handling
* Rate-limit handling
* Fallback model
* Better error messages

---

# 19. Planned AI Improvements

## Phase 1 — AI Service Optimization

Priority:

HIGH

Tasks:

* Reduce unnecessary context sent to model.
* Move data retrieval to tools.
* Add tool result follow-up messages.
* Support multiple sequential tool calls.
* Handle tool-call errors gracefully.
* Validate tool arguments.
* Handle invalid JSON arguments.
* Add rate-limit handling.

---

# 20. Multi-Step Tool Calling

The current service primarily processes the first tool call.

Future architecture should support:

```text
User:
Schedule a meeting with Rahul tomorrow at 5 PM
and remind me one hour before.

AI
  │
  ├── create_appointment
  │
  ▼
Appointment Created
  │
  ├── create_reminder
  │
  ▼
Reminder Created
  │
  ▼
Final AI Response
```

This requires a tool execution loop.

Target flow:

```text
AI Request
   │
   ▼
Tool Call
   │
   ▼
Execute Tool
   │
   ▼
Send Tool Result Back to AI
   │
   ├── Another Tool Call
   │       │
   │       ▼
   │   Execute Tool
   │
   └── Final Response
```

This should be implemented before advanced automation.

---

# 21. Dashboard Module

The Dashboard provides a high-level overview of user activity.

The existing dashboard service is integrated into the backend.

Future AI tool:

```text
get_dashboard_stats
```

The AI should be able to answer questions like:

```text
How productive am I today?
Give me my dashboard summary.
How many meetings do I have?
How many calls did I make?
Give me today's activity.
```

Potential response:

```text
Today's Summary

Appointments: 4
Calls: 12
Missed Calls: 2
Upcoming Meetings: 3
Pending Reminders: 5
```

---

# 22. Future AI Tools

Planned tools:

```text
get_contacts
get_contact_by_name

get_appointments
get_upcoming_appointments
get_appointment_stats

get_dashboard_stats

search_contacts
search_appointments
search_calls
search_reminders
```

This will allow the AI to retrieve data dynamically rather than receiving large context blocks.

---

# 23. Natural Language Understanding

The AI should support natural user language.

Examples:

```text
Remind me to call Rahul tomorrow.
```

```text
Schedule a meeting with Amit next Monday at 4.
```

```text
What meetings do I have this week?
```

```text
Who did I talk to yesterday?
```

```text
Show me my missed calls.
```

```text
Delete the reminder for my meeting with Rahul.
```

```text
Move tomorrow's meeting to Friday.
```

The AI should translate natural language into structured tool arguments.

---

# 24. Date and Time Handling

The AI should understand relative dates:

```text
today
tomorrow
yesterday
this evening
next Monday
next week
in 2 hours
in 30 minutes
```

The system should use the user's timezone.

Future improvement:

```text
User Timezone
      │
      ▼
Date/Time Parser
      │
      ▼
UTC Storage
      │
      ▼
Localized Response
```

All dates should ideally be stored in UTC.

The frontend should display dates in the user's local timezone.

---

# 25. Reminder Automation

The reminder system should eventually become a real background automation system.

Current:

```text
Reminder Record
```

Future:

```text
Reminder Created
      │
      ▼
Background Worker
      │
      ▼
Check reminderTime
      │
      ▼
Send Notification
      │
      ├── Email
      │
      └── WhatsApp
      │
      ▼
Update:
sent = true
sentAt = Date
```

Possible technologies:

```text
Node.js Cron
BullMQ
Redis
Agenda
```

Recommended future architecture:

```text
Redis
+
BullMQ
+
Worker Process
```

---

# 26. Email Reminders

Future email reminder flow:

```text
Appointment
      │
      ▼
Reminder
      │
      ▼
BullMQ Job
      │
      ▼
Email Worker
      │
      ▼
Nodemailer
      │
      ▼
User / Contact
```

Potential email service:

```text
Nodemailer
```

Production alternatives:

```text
Resend
SendGrid
Amazon SES
```

---

# 27. WhatsApp Reminders

Future WhatsApp automation can use:

```text
Meta WhatsApp Cloud API
```

or other providers.

Potential flow:

```text
Reminder
   │
   ▼
Worker
   │
   ▼
WhatsApp API
   │
   ▼
Message Sent
   │
   ▼
sent = true
```

---

# 28. AI Voice Assistant

Long-term goal:

The AI Secretary should support phone calls.

Potential stack:

```text
Twilio Voice
```

or:

```text
Telnyx
Plivo
Exotel
```

AI options:

```text
OpenAI Realtime API
Gemini Live
ElevenLabs Conversational AI
```

Possible architecture:

```text
Incoming Phone Call
        │
        ▼
Telephony Provider
        │
        ▼
Speech-to-Text
        │
        ▼
AI Agent
        │
        ├── Contacts
        ├── Appointments
        ├── Calls
        └── Reminders
        │
        ▼
Text-to-Speech
        │
        ▼
Caller
```

The AI agent should be able to:

* Answer calls
* Identify callers
* Take messages
* Create appointments
* Create reminders
* Save call records
* Send summaries
* Notify the user

---

# 29. Call Automation

Future call automation:

```text
Incoming Call
      │
      ▼
AI Answers
      │
      ▼
Identify Contact
      │
      ▼
Conversation
      │
      ├── Take Message
      ├── Schedule Appointment
      ├── Create Reminder
      └── Save Call
      │
      ▼
Call Summary
      │
      ▼
Database
```

The existing Call module will become the foundation for this feature.

---

# 30. AI Conversation Memory

Future AI memory system.

Short-term memory:

```text
Current Conversation
```

Long-term memory:

```text
Important User Preferences
```

Potential future collection:

```text
UserMemory
```

Example:

```text
User prefers meetings after 10 AM.
User usually schedules meetings for 30 minutes.
User prefers WhatsApp reminders.
```

The AI should only save useful, long-term preferences.

---

# 31. AI Guardrails

The AI must follow these principles:

### Never invent data

If data does not exist:

```text
I couldn't find that information.
```

### Never cross user ownership

Every operation must be scoped to:

```text
ownerId
```

### Never perform destructive actions without clear intent

Examples:

```text
Delete
Cancel
Remove
```

should require explicit user intent.

### Ask for missing required information

Example:

```text
User:
Schedule a meeting with Rahul.

AI:
What date and time should I schedule it for?
```

### Confirm ambiguous records

If multiple contacts match:

```text
I found two contacts named Rahul.
Which one do you mean?
```

---

# 32. Error Handling

Future AI error handling should cover:

```text
Groq API Error
Rate Limit Error
Invalid Tool Arguments
Invalid ObjectId
Database Error
Contact Not Found
Appointment Not Found
Call Not Found
Reminder Not Found
```

The user should receive a friendly message.

Internal logs should contain detailed technical errors.

Example:

```text
User:
I couldn't complete that request right now.
Please try again in a moment.
```

Internal:

```text
[AI TOOL ERROR]
tool=create_reminder
ownerId=...
error=...
```

---

# 33. AI Response Quality

Responses should be:

* Short
* Clear
* Natural
* Human-friendly
* Action-oriented

Avoid:

```text
Raw MongoDB objects
```

Avoid:

```text
Technical stack traces
```

Prefer:

```text
Appointment created successfully.

Meeting:
Client Discussion

Contact:
Rahul Sharma

Date:
August 5, 2026

Time:
3:00 PM
```

---

# 34. Development Roadmap

## Phase 1 — Core Backend

Status:

```text
DONE
```

Completed:

* Authentication
* Contacts
* Appointments
* Calls
* Reminders
* Dashboard
* MongoDB integration
* Service layer
* Ownership validation

---

## Phase 2 — AI Tool Calling

Status:

```text
MOSTLY COMPLETE
```

Completed:

* Groq integration
* System prompt
* AI tools
* Contact tools
* Appointment tools
* Call tools
* Reminder tools
* Tool execution
* Database integration

Remaining:

* Multi-tool loop
* Better tool result handling
* Dynamic data retrieval
* Rate-limit handling

---

## Phase 3 — AI Optimization

Status:

```text
NEXT PRIORITY
```

Tasks:

* Remove unnecessary full context
* Add dynamic retrieval tools
* Reduce token usage
* Improve response speed
* Add rate-limit handling
* Add fallback model

---

## Phase 4 — Background Automation

Status:

```text
PLANNED
```

Tasks:

* BullMQ
* Redis
* Reminder worker
* Email notifications
* WhatsApp notifications
* Scheduled jobs
* Retry mechanism

---

## Phase 5 — AI Voice Assistant

Status:

```text
PLANNED
```

Tasks:

* Telephony integration
* Speech recognition
* AI voice agent
* Call recording
* Call summary
* Automatic contact lookup
* Appointment scheduling
* Reminder creation

---

## Phase 6 — Production AI Secretary

Status:

```text
LONG-TERM GOAL
```

Final capabilities:

```text
AI Chat
Voice Calls
Contact Management
Appointment Management
Call Management
Reminder Automation
Email Notifications
WhatsApp Notifications
Dashboard Intelligence
AI Memory
Task Automation
```

---

# 35. Final Product Vision

The final AI Secretary should work like a real personal assistant.

Example:

```text
User:

"Hey, schedule a meeting with Rahul tomorrow at 4 PM,
remind me one hour before,
and if he calls me today, let me know."
```

AI should understand the complete intent.

Flow:

```text
Understand Request
        │
        ├── Find Rahul
        │
        ├── Create Appointment
        │
        ├── Create Reminder
        │
        └── Configure Call Monitoring
        │
        ▼
Execute Actions
        │
        ▼
Return Summary
```

Final response:

```text
Done.

I've scheduled your meeting with Rahul for tomorrow at 4 PM
and set a reminder for 3 PM.

I'll also monitor for a call from Rahul today.
```

The goal is to make the AI Secretary feel less like a chatbot and more like an actual digital assistant that can understand intent, access authorized data, execute actions, and automate routine work.

---

# 36. Current Project Status

```text
Backend Architecture          ████████████████████ 100%
Authentication                ████████████████████ 100%
Contacts                      ████████████████████ 100%
Appointments                  ████████████████████ 100%
Calls                         ████████████████████ 100%
Reminders                     ████████████████████ 100%
Dashboard                     ████████████████████ 100%

AI Integration                ██████████████████░░  90%
AI Tool Calling               ██████████████████░░  90%
AI Database Operations        ██████████████████░░  90%
AI Testing                    ████████████████░░░░  80%

AI Optimization               ████████░░░░░░░░░░░░  40%
Multi-tool Execution          ████░░░░░░░░░░░░░░░░  20%
Background Reminders          ██░░░░░░░░░░░░░░░░░░  10%
Email Automation              ██░░░░░░░░░░░░░░░░░░  10%
WhatsApp Automation           ██░░░░░░░░░░░░░░░░░░  10%
Voice AI                      █░░░░░░░░░░░░░░░░░░░  5%

Overall Project               ███████████████░░░░░  ~75%
```

---

# 37. Immediate Next Steps

The recommended development order is:

```text
1. Finish testing all current AI tools
        ↓
2. Implement multi-tool calling loop
        ↓
3. Optimize AI context/token usage
        ↓
4. Add dynamic retrieval tools
        ↓
5. Add dashboard AI tool
        ↓
6. Add rate-limit + retry handling
        ↓
7. Implement BullMQ + Redis
        ↓
8. Implement email reminders
        ↓
9. Implement WhatsApp reminders
        ↓
10. Add frontend AI assistant UI
        ↓
11. Add AI conversation history
        ↓
12. Add voice AI
        ↓
13. Deploy production system
```

---

# 38. Important Developer Rule

When extending the AI Secretary, always maintain this architecture:

```text
Controller
    ↓
Service
    ↓
Database
```

AI should call:

```text
Service Layer
```

whenever possible.

Avoid putting raw database logic everywhere inside:

```text
ai.service.js
```

The AI service should primarily handle:

```text
AI Intent
Tool Definitions
Tool Execution
AI Responses
```

Business logic should remain inside the relevant module service.

This keeps the application maintainable and scalable.

---

# 39. Current AI Secretary Core

The current working core is:

```text
Groq AI
   +
Tool Calling
   +
Contacts
   +
Appointments
   +
Calls
   +
Reminders
   +
Dashboard
   +
MongoDB
   +
Authenticated Owner
```

This is the foundation for the complete AI Secretary product.

The next major engineering milestone is:

> Build a reliable multi-step AI agent loop with dynamic data retrieval and background automation.



// new md

# AI SECRETARY - BRAIN.md

## Project Overview

This is a production-ready MERN Stack AI Secretary application.

The AI assistant must understand the entire project before generating any code.

Never guess.
Always inspect existing code before making changes.

---

# Tech Stack

Frontend

* React 19
* Vite
* Tailwind CSS
* Redux Toolkit
* React Router DOM
* Axios
* React Hook Form

Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication
* Groq AI
* REST API

Deployment

* Render
* MongoDB Atlas

---

# Project Architecture

Frontend

```
src/
    components/
    pages/
    features/
    services/
    hooks/
    layouts/
    routes/
```

Backend

```
src/

modules/

auth/

contacts/

appointments/

calls/

reminders/

dashboard/

ai/

middlewares/

config/

utils/
```

Every module follows

```
controller
service
schema
routes
validation
```

Never break this architecture.

---

# Authentication

Every protected request requires

Authorization

Bearer <token>

Never remove authentication.

Always send JWT.

---

# API Base URL

```
/api/v1
```

---

# Existing Modules

Authentication

```
POST /auth/register

POST /auth/login

GET /auth/profile

PUT /auth/profile
```

Contacts

```
GET /contacts

POST /contacts

GET /contacts/:id

PUT /contacts/:id

DELETE /contacts/:id
```

Appointments

```
GET /appointments

POST /appointments

PUT /appointments/:id

DELETE /appointments/:id
```

Calls

```
GET /calls

POST /calls

PUT /calls/:id

DELETE /calls/:id
```

Reminders

```
GET /reminders

POST /reminders

PUT /reminders/:id

DELETE /reminders/:id
```

Dashboard

```
GET /dashboard/stats
```

AI

```
POST /ai/chat
```

---

# API Rules

Never create new endpoints if an existing endpoint already solves the problem.

Always inspect backend routes first.

Always use existing APIs.

Never duplicate APIs.

---

# API Service Rules

Frontend API calls must be inside

```
src/services
```

Never call axios directly inside components.

Example

```
contactApi.js

appointmentApi.js

callApi.js

reminderApi.js

dashboardApi.js

aiApi.js
```

---

# Redux Rules

Business state

Redux Toolkit

UI state

React State

Never store temporary UI values inside Redux.

---

# Tailwind Rules

Only Tailwind CSS.

Never use

CSS

SCSS

Styled Components

Bootstrap

Material UI

Global CSS

unless already existing.

---

# Component Rules

Components must be

Small

Reusable

Clean

Readable

Never create giant components.

---

# Forms

Use

React Hook Form

Validation

Show backend validation errors.

---

# API Error Handling

Every request must handle

Loading

Success

Validation Error

Network Error

Unauthorized

Server Error

Show user-friendly messages.

Never expose raw server errors.

---

# AI Chat Rules

AI endpoint

```
POST /api/v1/ai/chat
```

Request

```
{
    "message":"..."
}
```

Response

```
{
    success,
    statusCode,
    message,
    data:{
        response
    }
}
```

Always read

```
data.response
```

Never assume another response shape.

---

# CRUD Rules

Whenever creating a page

Always implement

Create

Read

Update

Delete

Search

Pagination (if backend supports)

Loading

Error State

Empty State

Confirmation Dialog

---

# UI Rules

Design

Modern

Minimal

Professional

Dark Mode

Rounded cards

Nice spacing

Responsive

Avoid

Purple gradients

Neon UI

Over-animated pages

---

# File Naming

camelCase

Components

PascalCase

Never mix styles.

---

# Code Rules

Never generate pseudo code.

Generate production-ready code.

Never leave TODO comments.

Never leave incomplete functions.

Never create placeholder APIs.

Never mock backend responses.

---

# Before Writing Code

Always inspect

Routes

Controller

Service

Schema

Validation

API response

Then generate frontend.

Never assume.

---

# Before Calling Any API

Verify

Endpoint exists

Method is correct

Payload matches validation

Response matches backend

Authentication required

If unsure

Read backend first.

---

# Frontend Folder Structure

```
pages/

components/

features/

services/

hooks/

layouts/

utils/
```

Never invent a new architecture.

---

# Goal

Your objective is to build a complete frontend that perfectly matches the existing backend.

Every API request must hit the correct endpoint.

Every request payload must match backend validation.

Every response must be parsed correctly.

Never invent APIs.

Never invent response formats.

Always inspect backend before generating code.

Generate production-quality code only.
