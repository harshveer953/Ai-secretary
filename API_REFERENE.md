# AI SECRETARY — API.REF.md

> **Purpose:** This document is the frontend API reference for the AI Secretary project.
>
> It defines known API endpoints, authentication behavior, request/response rules, and frontend integration requirements.
>
> **IMPORTANT:** This document must NOT be treated as more authoritative than the actual backend source code.
>
> If the backend implementation differs from this document, the backend code is the source of truth.
>
> Never invent an endpoint, payload, parameter, field, or response structure.

---

# 1. API BASE

Backend development server:

```text
http://localhost:8080
```

API prefix:

```text
/api/v1
```

Frontend Axios base URL:

```text
/api/v1
```

Therefore:

```text
/api/v1/auth/login
```

is represented inside API services as:

```js
api.post("/auth/login")
```

---

# 2. HTTP METHODS

Use the existing backend methods exactly.

```text
GET
    Fetch data

POST
    Create resource / perform action

PUT
    Update existing resource

DELETE
    Delete resource
```

Never change the HTTP method based on frontend preference.

---

# 3. AUTHENTICATION

Backend supports JWT authentication.

Authentication can be supplied through:

```text
Cookie:
accessToken
```

or:

```http
Authorization: Bearer <accessToken>
```

The backend authentication middleware checks both mechanisms.

---

# 4. COOKIE AUTHENTICATION

Login sets authentication cookies.

Backend login controller:

```js
.cookie("accessToken", accessToken, cookieOptions)
.cookie("refreshToken", refreshToken, cookieOptions)
```

Therefore the frontend Axios instance must support credentials when required.

Recommended Axios configuration:

```js
const api = axios.create({
  baseURL: "/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});
```

Do not expose the refresh token to the UI.

Do not manually display JWT tokens.

Do not log authentication tokens.

---

# 5. AUTH API

## REGISTER

```http
POST /api/v1/auth/register
```

Frontend service:

```js
api.post("/auth/register", userData)
```

### Request

Known backend validation:

```json
{
  "fullName": "Priyanshu Singh",
  "email": "priyanshu@gmail.com",
  "password": "password123",
  "phone": "9876543210"
}
```

### Validation

```text
fullName
    required
    minimum 3 characters
    trimmed

email
    required
    valid email
    trimmed
    lowercase

password
    required
    minimum 8 characters

phone
    optional
```

### Success

Backend returns an ApiResponse containing the created user.

Current backend message:

```text
User created successfully
```

Do not assume the exact user object fields without checking the user schema.

### Authentication

Registration currently does NOT set login cookies.

Therefore:

```text
REGISTER
    ↓
successful registration
    ↓
LOGIN
    ↓
authenticated session
```

---

# 6. LOGIN

```http
POST /api/v1/auth/login
```

Frontend service:

```js
api.post("/auth/login", credentials)
```

### Request

```json
{
  "email": "priyanshu@gmail.com",
  "password": "password123"
}
```

### Validation

```text
email
    required
    valid email

password
    required
    minimum 8 characters
```

### Success response

Known response:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Login successful.",
  "data": {
    "user": {}
  }
}
```

Authentication tokens are set through cookies.

Frontend must not expect:

```json
{
  "data": {
    "accessToken": "..."
  }
}
```

unless the backend implementation changes.

---

# 7. CURRENT USER

```http
GET /api/v1/auth/me
```

Authentication required.

Frontend service:

```js
api.get("/auth/me")
```

Used to retrieve the currently authenticated user.

Known backend response structure:

```text
ApiResponse
    ↓
data
    ↓
current user
```

Always inspect the actual response before destructuring.

---

# 8. LOGOUT

```http
POST /api/v1/auth/logout
```

Authentication required.

Frontend service:

```js
api.post("/auth/logout")
```

Backend clears the stored refresh token and clears authentication cookies.

After successful logout:

```text
Redux user → null
Redux authenticated → false
Local UI auth state → reset
```

Then redirect:

```text
/login
```

---

# 9. REFRESH TOKEN

```http
POST /api/v1/auth/refresh-token
```

The refresh token is read from the backend cookie.

Frontend should NOT manually send the refresh token in the request body.

Backend returns:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Access token refreshed successfully.",
  "data": {
    "accessToken": "..."
  }
}
```

Do not display this token to the user.

---

# 10. AUTH TEST ROUTE

Backend currently contains:

```http
GET /api/v1/auth/test
```

Response:

```json
{
  "success": true,
  "message": "Auth routes working"
}
```

This is a development/testing endpoint.

Do not build production UI around this endpoint.

---

# 11. CONTACTS

Base:

```text
/api/v1/contacts
```

## GET CONTACTS

```http
GET /api/v1/contacts
```

Frontend:

```js
api.get("/contacts")
```

Purpose:

```text
Fetch authenticated user's contacts.
```

---

## CREATE CONTACT

```http
POST /api/v1/contacts
```

Frontend:

```js
api.post("/contacts", payload)
```

The exact payload must be obtained from:

```text
contacts validation
contacts schema
contacts controller/service
```

Do NOT guess contact fields.

---

## GET CONTACT

```http
GET /api/v1/contacts/:id
```

Frontend:

```js
api.get(`/contacts/${id}`)
```

---

## UPDATE CONTACT

```http
PUT /api/v1/contacts/:id
```

Frontend:

```js
api.put(`/contacts/${id}`, payload)
```

Payload must match backend validation.

---

## DELETE CONTACT

```http
DELETE /api/v1/contacts/:id
```

Frontend:

```js
api.delete(`/contacts/${id}`)
```

Always show a confirmation before deletion.

---

# 12. APPOINTMENTS

Base:

```text
/api/v1/appointments
```

## GET APPOINTMENTS

```http
GET /api/v1/appointments
```

---

## CREATE APPOINTMENT

```http
POST /api/v1/appointments
```

---

## UPDATE APPOINTMENT

```http
PUT /api/v1/appointments/:id
```

---

## DELETE APPOINTMENT

```http
DELETE /api/v1/appointments/:id
```

---

## IMPORTANT APPOINTMENT BEHAVIOR

The backend contains reminder-related business logic.

When an appointment is created, the backend can automatically create an associated reminder.

Therefore the frontend must NOT manually duplicate this behavior.

Correct flow:

```text
Frontend
    ↓
POST /appointments
    ↓
Backend appointment service
    ↓
Appointment created
    ↓
Reminder business logic
    ↓
Reminder created
```

Frontend only displays the resulting data.

---

# 13. CALLS

Base:

```text
/api/v1/calls
```

## GET CALLS

```http
GET /api/v1/calls
```

---

## CREATE CALL

```http
POST /api/v1/calls
```

---

## UPDATE CALL

```http
PUT /api/v1/calls/:id
```

---

## DELETE CALL

```http
DELETE /api/v1/calls/:id
```

---

# 14. REMINDERS

Base:

```text
/api/v1/reminders
```

## GET REMINDERS

```http
GET /api/v1/reminders
```

---

## CREATE REMINDER

```http
POST /api/v1/reminders
```

---

## UPDATE REMINDER

```http
PUT /api/v1/reminders/:id
```

---

## DELETE REMINDER

```http
DELETE /api/v1/reminders/:id
```

---

# 15. DASHBOARD

```http
GET /api/v1/dashboard/stats
```

Purpose:

```text
Fetch dashboard statistics and relevant overview data.
```

Frontend:

```js
api.get("/dashboard/stats")
```

Do not calculate server-owned statistics manually.

Do not hardcode:

```text
Contacts count
Appointments count
Calls count
Upcoming appointments
Recent calls
```

Use the actual backend response.

---

# 16. AI CHAT

```http
POST /api/v1/ai/chat
```

Frontend:

```js
api.post("/ai/chat", {
  message,
})
```

### Request

```json
{
  "message": "Show me all my contacts"
}
```

### Response

```json
{
  "success": true,
  "statusCode": 200,
  "message": "AI response generated successfully.",
  "data": {
    "response": "..."
  }
}
```

### Frontend parsing

The actual AI text is:

```js
response.data.data.response
```

Example:

```js
const response = await api.post("/ai/chat", {
  message,
});

const message = response.data.data.response;
```

Do not use:

```js
response.data.response
```

unless the API service explicitly transforms the response.

---

# 17. AI TOOL EXECUTION

The AI backend internally uses tools such as:

```text
Contacts
Appointments
Reminders
Dashboard
```

The frontend does NOT directly call these tools.

Frontend only communicates with:

```text
POST /api/v1/ai/chat
```

Example:

```text
User:
"Show me all contacts"

Frontend:
POST /ai/chat

Backend:
Groq AI
    ↓
Tool selection
    ↓
Tool execution
    ↓
Database
    ↓
AI response

Frontend:
Render data.response
```

Never reproduce backend AI tool logic in React.

---

# 18. API SERVICE FILES

Recommended:

```text
src/services/
├── api.js
├── authApi.js
├── contactApi.js
├── appointmentApi.js
├── callApi.js
├── reminderApi.js
├── dashboardApi.js
└── aiApi.js
```

---

# 19. API SERVICE PATTERN

Correct:

```js
import api from "./api";

export const getContacts = async () => {
  const response = await api.get("/contacts");

  return response.data;
};
```

Component:

```js
const data = await getContacts();
```

Incorrect:

```js
import axios from "axios";

axios.get("/api/v1/contacts");
```

inside a component.

---

# 20. ERROR RESPONSE

Backend generally uses an ApiResponse / ApiError structure.

Frontend should handle:

```text
400
401
403
404
409
422
500
```

as applicable.

UI should show friendly messages.

Never display:

```text
Error stack
MongoDB error
Node.js error
Internal file paths
```

to users.

---

# 21. 401 HANDLING

When the backend returns:

```http
401 Unauthorized
```

frontend should:

1. Determine whether the session can be refreshed.
2. Attempt refresh where appropriate.
3. If authentication cannot be restored:

   * clear frontend auth state
   * redirect to `/login`

Do not immediately destroy valid application state without considering token refresh.

---

# 22. REQUEST FLOW

Every API request follows:

```text
React Component
      ↓
Feature Hook / Handler
      ↓
API Service
      ↓
Axios Instance
      ↓
Backend Route
      ↓
Controller
      ↓
Service
      ↓
Database / AI
      ↓
Controller Response
      ↓
API Service
      ↓
React
```

---

# 23. API IMPLEMENTATION CHECKLIST

Before implementing any endpoint:

```text
[ ] Endpoint exists
[ ] HTTP method verified
[ ] Authentication requirement verified
[ ] Request body verified
[ ] Validation verified
[ ] Schema/model verified
[ ] Controller response verified
[ ] Actual response tested
[ ] API service created
[ ] Loading state handled
[ ] Error state handled
[ ] Success state handled
```

---

# 24. DO NOT INVENT

Never invent:

```text
Endpoint
HTTP method
Payload field
Response field
Query parameter
Pagination parameter
Search parameter
Filter parameter
Authentication method
```

If information is missing:

```text
STOP
↓
INSPECT BACKEND
↓
VERIFY
↓
IMPLEMENT
```

---

# 25. CURRENT VERIFIED AUTH FLOW

Current working flow:

```text
Frontend Login
      ↓
POST /api/v1/auth/login
      ↓
Backend
      ↓
HTTP 200
      ↓
Authentication cookies
      ↓
User authenticated
```

Current backend testing confirmed:

```text
POST /api/v1/auth/login 200
```

Registration:

```text
Frontend Register
      ↓
POST /api/v1/auth/register
      ↓
Backend
      ↓
User created
      ↓
Automatic login required
      ↓
Dashboard
```

---

# 26. FUTURE INTEGRATIONS

The application is planned to integrate external automation/services including:

```text
n8n
Twilio
WhatsApp
Email
```

These integrations must remain backend/automation responsibilities where appropriate.

The frontend should not contain:

```text
Twilio secrets
WhatsApp credentials
n8n credentials
Groq API keys
SMTP passwords
```

---

# 27. SECURITY

Never expose:

```text
GROQ_API_KEY
TWILIO_AUTH_TOKEN
TWILIO_ACCOUNT_SID
SMTP credentials
MongoDB URI
JWT secrets
n8n credentials
```

Frontend environment variables must never contain private backend secrets.

---

# 28. FINAL API RULE

The API reference is a guide.

The actual backend is the final authority.

Priority:

```text
1. Actual backend route
2. Actual backend validation
3. Actual backend controller
4. Actual backend service
5. Actual backend schema
6. Tested API response
7. This API.REF.md
```

If anything conflicts:

```text
BACKEND WINS.
```

Never guess.

Never mock.

Never invent.

**Inspect → Verify → Implement → Test.**
