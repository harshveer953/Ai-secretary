# AI SECRETARY — BRAIN.md

> **IMPORTANT:** This file is the source of truth for the AI Secretary project.
>
> Before writing or modifying frontend code, understand the existing backend architecture, routes, validation, authentication flow, request payloads, and response structures.
>
> **Never guess an API, payload, response shape, authentication mechanism, or backend behavior.**
>
> If something is unclear, inspect the backend source code first.

---

# 1. PROJECT OVERVIEW

AI Secretary is a production-oriented MERN Stack AI assistant application.

The application allows authenticated users to manage:

* Contacts
* Appointments
* Calls
* Reminders
* Dashboard statistics
* AI assistant interactions

The frontend must communicate with the existing backend through REST APIs.

The backend is the source of truth for:

* Authentication
* Authorization
* Validation
* Business logic
* Database operations
* AI functionality
* API response structures

The frontend must never recreate backend business logic unnecessarily.

---

# 2. TECHNOLOGY STACK

## Frontend

* React 19
* Vite
* Tailwind CSS
* Redux Toolkit
* React Router DOM
* Axios
* React Hook Form

## Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* Groq AI
* REST API

## Database

* MongoDB Atlas

## Deployment

* Frontend: Vercel
* Backend: Render

---

# 3. FRONTEND ARCHITECTURE

Current frontend architecture:

```text
client/
└── src/
    ├── app/
    ├── components/
    ├── features/
    ├── hooks/
    ├── layouts/
    ├── pages/
    ├── routes/
    ├── services/
    ├── store/
    ├── utils/
    ├── App.jsx
    └── main.jsx
```

Use the existing architecture.

Do NOT create a completely different folder architecture.

Recommended responsibility:

```text
components/
    Reusable UI components

pages/
    Page-level screens

features/
    Feature-specific Redux state and logic

services/
    API communication

hooks/
    Reusable React hooks

layouts/
    Application layouts

routes/
    Route configuration

store/
    Redux store configuration

utils/
    Utility/helper functions
```

---

# 4. BACKEND ARCHITECTURE

Backend follows a modular architecture.

```text
server/
└── src/
    ├── modules/
    │   ├── auth/
    │   ├── users/
    │   ├── contacts/
    │   ├── appointments/
    │   ├── calls/
    │   ├── reminders/
    │   ├── dashboard/
    │   └── ai/
    │
    ├── middlewares/
    ├── config/
    ├── constants/
    ├── shared/
    └── utils/
```

Modules generally contain:

```text
controller
service
schema
routes
validation
middleware
```

Never break the existing backend architecture.

---

# 5. API BASE URL

Development backend:

```text
http://localhost:8080
```

API prefix:

```text
/api/v1
```

Frontend Axios instance should use:

```text
/api/v1
```

Do not hardcode `/api/v1` repeatedly inside components.

---

# 6. AXIOS RULES

All API requests must go through the centralized Axios instance.

Example:

```text
src/services/api.js
```

Never directly use:

```js
axios.get(...)
axios.post(...)
```

inside React components.

Use:

```text
services/
    api.js
    authApi.js
    contactApi.js
    appointmentApi.js
    callApi.js
    reminderApi.js
    dashboardApi.js
    aiApi.js
```

The centralized Axios instance handles:

* Base URL
* Authentication headers where applicable
* Credentials/cookies
* Response errors
* Unauthorized responses

---

# 7. AUTHENTICATION

Authentication uses:

```text
JWT
```

The backend authentication flow uses HTTP cookies.

Backend login:

```text
POST /api/v1/auth/login
```

sets:

```text
accessToken
refreshToken
```

as cookies.

The backend also supports Authorization headers through the authentication middleware.

Backend middleware checks:

```js
req.cookies?.accessToken
```

or:

```text
Authorization: Bearer <token>
```

---

# 8. IMPORTANT AUTHENTICATION RULE

Do NOT assume that registration automatically authenticates the user.

Current backend registration:

```text
POST /auth/register
```

creates the user and returns the created user.

It does NOT currently issue authentication cookies.

Therefore the intended frontend flow is:

```text
Register
    ↓
Successful registration
    ↓
Login automatically using same credentials
    ↓
Backend sets authentication cookies
    ↓
Fetch current user if required
    ↓
Navigate to Dashboard
```

Do not navigate directly to protected dashboard after registration unless authentication has been established.

---

# 9. AUTH ENDPOINTS

## Register

```http
POST /api/v1/auth/register
```

Payload:

```json
{
  "fullName": "Priyanshu Singh",
  "email": "priyanshu@gmail.com",
  "password": "password123",
  "phone": "9876543210"
}
```

Phone is optional.

Backend validation:

```text
fullName
    required
    minimum 3 characters

email
    required
    valid email

password
    required
    minimum 8 characters

phone
    optional
```

---

## Login

```http
POST /api/v1/auth/login
```

Payload:

```json
{
  "email": "priyanshu@gmail.com",
  "password": "password123"
}
```

Successful response contains the user:

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

---

## Current User

```http
GET /api/v1/auth/me
```

Requires authentication.

Returns the authenticated user.

---

## Logout

```http
POST /api/v1/auth/logout
```

Requires authentication.

Clears the authentication state on the backend.

---

## Refresh Token

```http
POST /api/v1/auth/refresh-token
```

Used to refresh authentication tokens.

---

# 10. AUTH FRONTEND STATE

Redux Toolkit is used for authentication state.

Current authentication state:

```js
{
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null
}
```

Authentication Redux slice:

```text
src/features/auth/authSlice.js
```

Store:

```text
src/store/store.js
```

The Redux store should contain:

```js
{
  auth: authReducer
}
```

---

# 11. AUTH STATE RULES

Use Redux for:

* Current authenticated user
* Authentication status
* Authentication loading state
* Authentication errors

Use React local state for temporary UI state:

* Modal open/close
* Password visibility
* Form input state when appropriate
* Dropdown state
* Tabs
* Temporary filters

Do not put every UI state into Redux.

---

# 12. AUTH ROUTING

Public routes:

```text
/login
/register
```

Protected routes:

```text
/dashboard
/contacts
/appointments
/calls
/reminders
/ai
/profile
```

Protected routes must not be accessible to unauthenticated users.

If authentication is missing:

```text
redirect → /login
```

If the user is already authenticated and visits:

```text
/login
/register
```

they should eventually be redirected to:

```text
/dashboard
```

---

# 13. CONTACTS API

Base:

```text
/api/v1/contacts
```

## Get contacts

```http
GET /contacts
```

## Create contact

```http
POST /contacts
```

## Get single contact

```http
GET /contacts/:id
```

## Update contact

```http
PUT /contacts/:id
```

## Delete contact

```http
DELETE /contacts/:id
```

Frontend must inspect the actual backend response before assuming pagination, search, filters, or field names.

Do not invent query parameters.

---

# 14. APPOINTMENTS API

Base:

```text
/api/v1/appointments
```

## Get appointments

```http
GET /appointments
```

## Create appointment

```http
POST /appointments
```

## Update appointment

```http
PUT /appointments/:id
```

## Delete appointment

```http
DELETE /appointments/:id
```

Appointments may automatically create associated reminders through backend business logic.

Frontend must not duplicate that reminder creation logic.

---

# 15. CALLS API

Base:

```text
/api/v1/calls
```

## Get calls

```http
GET /calls
```

## Create call

```http
POST /calls
```

## Update call

```http
PUT /calls/:id
```

## Delete call

```http
DELETE /calls/:id
```

---

# 16. REMINDERS API

Base:

```text
/api/v1/reminders
```

## Get reminders

```http
GET /reminders
```

## Create reminder

```http
POST /reminders
```

## Update reminder

```http
PUT /reminders/:id
```

## Delete reminder

```http
DELETE /reminders/:id
```

Reminder creation and reminder-related business logic belongs to the backend.

---

# 17. DASHBOARD API

```http
GET /api/v1/dashboard/stats
```

Dashboard should use the existing backend statistics endpoint.

Do not calculate backend statistics manually in the frontend if the backend already provides them.

Current backend AI dashboard response example:

```text
5 contacts
9 appointments
2 calls
```

The exact values are dynamic.

Never hardcode these values.

---

# 18. AI API

AI endpoint:

```http
POST /api/v1/ai/chat
```

Request:

```json
{
  "message": "Show me all my contacts"
}
```

Response:

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

The frontend MUST read:

```js
response.data.data.response
```

Do not assume:

```js
response.data.response
```

unless the actual API service transforms the response.

---

# 19. AI CAPABILITIES

The backend AI assistant can interact with application data and tools.

Examples include:

```text
Get contacts
Create contacts
Manage appointments
Manage reminders
Read dashboard information
```

The frontend AI chat must communicate only through:

```text
POST /api/v1/ai/chat
```

Do not directly call internal AI tools from the frontend.

Do not recreate AI business logic in React.

---

# 20. API SERVICE PATTERN

Example:

```js
import api from "./api";

export const getContacts = async () => {
  const response = await api.get("/contacts");

  return response.data;
};
```

Components should use service functions:

```js
const data = await getContacts();
```

Do NOT do this inside components:

```js
await axios.get("/api/v1/contacts");
```

---

# 21. API ERROR HANDLING

Every API-driven screen must support:

```text
Loading
Success
Validation error
Unauthorized
Network error
Server error
Empty state
```

Never expose raw backend stack traces to users.

Bad:

```text
TypeError: Cannot read properties of null...
```

Good:

```text
Unable to load contacts. Please try again.
```

Development console may contain technical errors, but UI must remain user-friendly.

---

# 22. FORMS

Use:

```text
React Hook Form
```

for complex forms.

Validation must match backend validation.

Never create frontend rules that contradict backend rules.

For important validation rules:

```text
Backend = source of truth
Frontend = user experience layer
```

---

# 23. CRUD UI RULES

For CRUD modules, implement where supported:

```text
Create
Read
Update
Delete
Search
Filter
Pagination
Loading
Error
Empty state
Confirmation
```

However:

**Only implement Search, Filter, or Pagination if the backend actually supports them.**

Never invent backend query parameters.

---

# 24. DESIGN SYSTEM

The design direction is inspired by Apple's website and Apple-style product interfaces.

Design principles:

```text
Minimal
Premium
Clean
Professional
Elegant
High whitespace
Strong typography
Subtle borders
Smooth transitions
Responsive
```

Prefer:

```text
Black
White
Zinc
Stone
Neutral tones
```

Avoid:

```text
Purple gradients
Indigo gradients
Neon colors
Cyberpunk styling
Excessive glassmorphism
Excessive shadows
Over-animation
```

The interface should feel like a serious SaaS/productivity application.

Not like a generic AI dashboard template.

---

# 25. DARK / LIGHT MODE

The application supports:

```text
Dark mode
Light mode
```

Use a user-controlled toggle.

Theme state should remain consistent across the application.

Do not create different component designs for each theme.

Use Tailwind dark-mode utilities.

---

# 26. RESPONSIVE DESIGN

Every page must work on:

```text
Mobile
Tablet
Laptop
Desktop
Large screens
```

Do not design only for 1440px desktop.

Important layouts:

```text
Dashboard
Sidebar
Top navigation
Tables
Cards
Forms
AI chat
Calendar/appointment views
```

must adapt to smaller screens.

---

# 27. COMPONENT RULES

Components should be:

```text
Small
Reusable
Readable
Focused
Maintainable
```

Avoid giant components containing:

```text
API calls
business logic
forms
UI
modals
tables
filters
routing
```

all in one file.

Separate responsibilities where necessary.

---

# 28. FILE NAMING

Components:

```text
PascalCase
```

Example:

```text
ContactCard.jsx
DashboardHeader.jsx
AppointmentModal.jsx
```

Services:

```text
camelCase
```

Example:

```text
contactApi.js
appointmentApi.js
dashboardApi.js
```

Hooks:

```text
camelCase
```

Example:

```text
useAuth.js
useContacts.js
```

---

# 29. TAILWIND RULES

Use:

```text
Tailwind CSS
```

for styling.

Do not introduce:

```text
Bootstrap
Material UI
Styled Components
SCSS
CSS modules
```

unless explicitly required.

Avoid unnecessary custom CSS.

Do not create a large global CSS file just to style individual components.

---

# 30. STATE MANAGEMENT

Use:

```text
Redux Toolkit
```

for global/business state.

Good Redux candidates:

```text
Authentication
Current user
Potentially global application data
```

Use React state for:

```text
Modal state
Form state
Dropdowns
Tabs
Temporary UI state
```

Do not put every API response into Redux automatically.

Use the simplest state solution that fits the feature.

---

# 31. ROUTING

Use:

```text
React Router DOM
```

Protected routes should use an authentication guard.

Conceptually:

```text
ProtectedRoute
    ↓
authenticated?
    ↓
yes → page
no  → login
```

Do not rely only on frontend localStorage to determine whether the backend session is valid.

The backend remains the authentication authority.

---

# 32. PROFILE

Backend currently exposes:

```text
GET /api/v1/auth/me
```

for the authenticated user.

Backend also contains:

```text
PUT /auth/profile
```

only if confirmed by the current backend routes.

IMPORTANT:

If a route is not actually present in the backend router, do not use it.

Always inspect the current backend before implementing profile functionality.

---

# 33. IMPORTANT BACKEND VERIFICATION RULE

Before implementing any feature, inspect:

```text
route
controller
service
schema/model
validation
middleware
```

Example:

Before building Contacts:

```text
contacts.routes.js
contacts.controller.js
contacts.service.js
contact.schema.js
contact.validation.js
```

Before building Appointments:

```text
appointments.routes.js
appointments.controller.js
appointments.service.js
appointment.schema.js
appointment.validation.js
```

Do not rely solely on this document if the actual backend code differs.

The actual backend code has priority.

---

# 34. NEVER INVENT APIs

Never create:

```text
POST /contacts/search
GET /dashboard
POST /ai/message
```

unless those endpoints actually exist.

If the required functionality does not have an endpoint:

```text
STOP
INSPECT BACKEND
```

Do not fake the API.

---

# 35. NEVER MOCK BACKEND DATA

Do not create fake data such as:

```js
const contacts = [
  {
    name: "John"
  }
];
```

for production screens.

Use the real backend.

Mock data is allowed only when explicitly requested for a design prototype.

---

# 36. API RESPONSE RULE

Never assume response structures.

For every endpoint:

```text
Inspect backend controller
Inspect ApiResponse
Test endpoint
Inspect actual JSON
Then write frontend parser
```

Example:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "...",
  "data": {}
}
```

The frontend must access the correct nested property.

---

# 37. DEVELOPMENT WORKFLOW

For every new feature:

### Step 1

Inspect backend route.

### Step 2

Inspect controller.

### Step 3

Inspect service.

### Step 4

Inspect validation.

### Step 5

Inspect schema/model.

### Step 6

Test endpoint.

### Step 7

Confirm request payload.

### Step 8

Confirm response.

### Step 9

Create frontend API service.

### Step 10

Create page/components.

### Step 11

Connect Redux only if global state is required.

### Step 12

Add loading/error/empty states.

### Step 13

Test complete user flow.

---

# 38. CURRENT FRONTEND PROGRESS

Frontend development is **100% COMPLETE & PRODUCTION-READY**.

Completed:

```text
Vite + React 19 + Tailwind CSS setup
Apple OLED Dark Theme (#000000)
Redux Toolkit Store & Auth Slice
Centralized Axios API instance (services/api.js)
Auth Service (services/authApi.js)
Contacts Service (services/contactApi.js)
Appointments Service (services/appointmentApi.js)
Reminders Service (services/reminderApi.js)
Calls Service (services/callApi.js)
Dashboard Service (services/dashboardApi.js)
AI Assistant Service (services/aiApi.js)

Login Page (pages/auth/Login.jsx)
Register Page (pages/auth/Register.jsx)
Protected & Public Routing (routes/ProtectedRoute.jsx, routes/PublicRoute.jsx)
Main App Layout (layouts/MainLayout.jsx, components/common/Sidebar.jsx, Navbar.jsx)
Dashboard Page (pages/Dashboard.jsx)
Contacts Page (pages/Contacts.jsx)
Appointments Page (pages/Appointments.jsx)
Reminders Page (pages/Reminders.jsx)
Calls Page (pages/Calls.jsx)
AI Assistant Page (pages/AiAssistant.jsx)
Profile Page (pages/Profile.jsx)
```

Authentication flow implemented & verified:

```text
Register
    ↓
Automatic login
    ↓
Authentication cookie & Bearer token saved
    ↓
Fetch current user (/api/v1/auth/me)
    ↓
Navigate to Dashboard
```

---

# 39. CURRENT DEVELOPMENT STATUS

All frontend development priorities are fully implemented and verified:

```text
1. Authentication [COMPLETED]
2. Protected routing [COMPLETED]
3. Dashboard [COMPLETED]
4. Contacts [COMPLETED]
5. Appointments [COMPLETED]
6. Reminders [COMPLETED]
7. Calls [COMPLETED]
8. AI Assistant [COMPLETED]
9. Profile [COMPLETED]
10. Global Apple UI polish & Dark Theme [COMPLETED]
11. Responsive refinement [COMPLETED]
12. Production build verification (npm run build -> 0 errors) [COMPLETED]
```

---

# 40. DASHBOARD REQUIREMENTS

Dashboard should eventually show real backend information such as:

```text
Contacts count
Appointments count
Calls count
Reminder information
Upcoming appointments
Recent calls
```

Use:

```text
GET /api/v1/dashboard/stats
```

Do not hardcode statistics.

Dashboard should provide a clear overview rather than excessive charts.

---

# 41. CONTACTS UI

Contacts should eventually support:

```text
Contact list
Contact details
Create contact
Edit contact
Delete contact
Search/filter only if backend supports it
```

Recommended UI:

```text
Clean table on desktop
Cards/list on mobile
Create/Edit modal or dedicated page
Delete confirmation
Empty state
Loading skeleton
```

---

# 42. APPOINTMENTS UI

Appointments should provide:

```text
Appointment list
Create appointment
Edit appointment
Delete appointment
Appointment status
Date/time information
Reminder visibility
```

The backend automatically handles reminder business logic where implemented.

Frontend should simply reflect backend state.

---

# 43. REMINDERS UI

Reminders should display:

```text
Reminder title
Date
Time
Related information
Status
```

Provide CRUD where backend supports it.

---

# 44. CALLS UI

Calls should display relevant backend information such as:

```text
Contact
Direction
Duration
Date/time
Status
```

Do not assume field names until backend schema is inspected.

---

# 45. AI ASSISTANT UI

The AI Assistant should feel like a polished productivity assistant.

Basic flow:

```text
User types message
        ↓
POST /api/v1/ai/chat
        ↓
Backend AI processes request
        ↓
data.response
        ↓
Render assistant message
```

The AI UI should support:

```text
Message history
User messages
Assistant messages
Loading indicator
Error state
Auto-scroll
Input box
Send button
Responsive layout
```

Do not expose internal tool-calling implementation to the user.

---

# 46. AI RESPONSE RENDERING

AI responses may contain Markdown-like formatting.

The frontend should render responses cleanly.

Do not blindly render raw HTML from the AI.

Avoid unsafe HTML injection.

---

# 47. UX RULES

Every action should communicate its state.

Examples:

Button:

```text
Create
Creating...
Created
```

Delete:

```text
Delete
Confirm deletion
Deleting...
Deleted
```

API loading:

```text
Skeleton
Spinner
Loading indicator
```

Empty:

```text
No contacts yet
Create your first contact
```

Error:

```text
Something went wrong
Try again
```

---

# 48. SECURITY RULES

Never expose:

```text
JWT secrets
MongoDB URI
Groq API key
Backend environment variables
```

Never put backend secrets in Vite environment variables.

Never hardcode private credentials.

Never log sensitive authentication tokens.

---

# 49. PRODUCTION RULES

Code must be:

```text
Production-ready
Maintainable
Readable
Reusable
Type-safe where possible
Error-aware
Responsive
Accessible
```

Do not generate:

```text
Pseudo-code
Incomplete functions
TODO placeholders
Fake endpoints
Fake backend responses
Unused imports
Dead code
```

---

# 50. FINAL GOLDEN RULE

The frontend exists to consume the existing backend.

Therefore:

```text
BACKEND CODE
    ↓
SOURCE OF TRUTH
    ↓
API SERVICE
    ↓
REDUX / LOCAL STATE
    ↓
COMPONENT
    ↓
UI
```

Never reverse this process.

Never design an API because the frontend needs it.

Never invent a response because the UI expects it.

Never duplicate backend business logic.

**Inspect first. Build second. Test third.**

The goal is a frontend that works against the real AI Secretary backend, with every API request hitting the correct endpoint, every payload matching backend validation, every response being parsed correctly, and every authentication flow behaving like the real production application.
