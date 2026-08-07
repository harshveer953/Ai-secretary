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
