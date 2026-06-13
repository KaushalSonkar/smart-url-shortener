# Prime Links - Technical Requirements Document (TRD)

## Architecture

Frontend → Backend API → Redis → MongoDB Atlas

---

# Tech Stack

## Frontend

* Next.js 15
* TypeScript
* Tailwind CSS
* Axios
* React Query
* Zustand

## Backend

* Node.js
* Express.js

## Database

* MongoDB Atlas

## Cache

* Redis

## Authentication

* JWT
* bcrypt

## QR Generation

* qrcode

## Deployment

* Docker
* Docker Compose

---

# Folder Structure

prime-links/

frontend/
backend/

---

# Backend Modules

## Auth Module

Endpoints:

POST /api/auth/register

POST /api/auth/login

POST /api/auth/logout

GET /api/auth/profile

---

## Link Module

POST /api/links

GET /api/links

GET /api/links/:id

PUT /api/links/:id

DELETE /api/links/:id

---

## Redirect Module

GET /:shortCode

Flow:

1. Check Redis
2. If found redirect
3. Else query MongoDB
4. Save in Redis
5. Redirect

---

## Analytics Module

Store:

* Click Count
* Browser
* Device
* Referrer
* Timestamp

---

# Database Design

## User

name
email
password
createdAt

---

## Link

userId
originalUrl
shortCode
customAlias
qrCode
clicks
createdAt

---

## Analytics

linkId
ip
browser
device
referrer
createdAt

---

# Security

* JWT Middleware
* bcrypt Password Hashing
* Helmet
* CORS
* Rate Limiting

---

# Redis Strategy

Cache Key:

link:{shortCode}

TTL:

24 hours

---

# Environment Variables

PORT

MONGODB_URI

JWT_SECRET

REDIS_URL

CLIENT_URL

---

# Docker Services

Frontend

Backend

MongoDB

Redis

---

# Deployment Strategy

Frontend:
Vercel

Backend:
Railway / VPS

Database:
MongoDB Atlas

Cache:
Redis Cloud
