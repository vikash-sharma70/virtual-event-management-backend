# Virtual Event Management Platform API

A production-grade backend system for a Virtual Event Management Platform built with Node.js and Express.js. This API provides secure authentication, event management, participant registration, and email notifications using JWT, bcrypt, and Nodemailer.

---

# Features

- User Registration & Login
- JWT-based Authentication
- Role-based Authorization
- Event CRUD Operations
- Participant Registration
- Organizer & Attendee Roles
- Email Notifications
- Input Validation & Sanitization
- Global Error Handling
- Rate Limiting & Security Middleware
- RESTful API Architecture
- Modular Scalable Folder Structure
- Production-grade Codebase

---

# Tech Stack

- Node.js
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs
- Nodemailer
- Helmet
- Express Rate Limit
- CORS
- dotenv

---

# Project Structure

```bash
src
│
├── config/
│   ├── db.js
│   └── mail.js
│
├── controllers/
│   ├── authController.js
│   ├── eventController.js
│   └── registrationController.js
│
├── middleware/
│   ├── authMiddleware.js
│   ├── errorHandler.js
│   ├── logger.js
│   ├── rateLimiter.js
│   └── validator.js
│
├── models/
│   ├── userModel.js
│   └── eventModel.js
│
├── routes/
│   ├── authRoutes.js
│   └── eventRoutes.js
│
├── services/
│   ├── authService.js
│   ├── eventService.js
│   ├── emailService.js
│   └── registrationService.js
│
├── utils/
│   ├── AppError.js
│   ├── asyncHandler.js
│   ├── jwtHelper.js
│   └── responseHandler.js
│
├── app.js
└── server.js
```

---

# Installation

## Clone Repository

```bash
git clone https://github.com/your-username/virtual-event-management-platform.git
```

## Move into Project

```bash
cd virtual-event-management-platform
```

## Install Dependencies

```bash
npm install
```

---

# Environment Variables

Create a `.env` file in the root directory.

```env
NODE_ENV=development
PORT=3000

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d

BCRYPT_SALT_ROUNDS=12

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
EMAIL_FROM=Virtual Events <your_email@gmail.com>
```

---

# Running the Project

## Development

```bash
npm run dev
```

## Production

```bash
npm start
```

---

# API Base URL

```bash
http://localhost:3000/api
```

---

# Authentication APIs

## Register User

### POST `/api/auth/register`

Request:

```json
{
  "name": "Vikash Sharma",
  "email": "vikash@gmail.com",
  "password": "StrongPassword123"
}
```

Response:

```json
{
  "status": "success",
  "message": "Registration successful"
}
```

---

## Login User

### POST `/api/auth/login`

Request:

```json
{
  "email": "vikash@gmail.com",
  "password": "StrongPassword123"
}
```

---

# Event APIs

## Create Event

### POST `/api/events`

Protected Route

```json
{
  "title": "Blockchain Summit",
  "description": "Web3 event for developers",
  "date": "2026-05-20",
  "time": "06:00 PM",
  "location": "Online"
}
```

---

## Get All Events

### GET `/api/events`

---

## Update Event

### PUT `/api/events/:id`

Protected Route

---

## Delete Event

### DELETE `/api/events/:id`

Protected Route

---

# Participant Registration

## Register for Event

### POST `/api/events/:id/register`

Protected Route

---

# Security Features

- Password Hashing with bcrypt
- JWT Authentication
- Protected Routes
- Request Rate Limiting
- Helmet Security Headers
- Input Validation
- Centralized Error Handling

---

# Testing

Run tests using:

```bash
npm run test
```

---

# Health Check Endpoint

```bash
GET /health
```

---

# Future Improvements

- Redis Caching
- Docker Support
- CI/CD Pipeline
- Swagger Documentation
- Refresh Tokens
- Queue-based Email Service
- Microservices Architecture

---

# Author

Vikash Sharma

---

# License

This project is licensed under the ISC License.