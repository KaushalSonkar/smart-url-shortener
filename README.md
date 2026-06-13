# Prime Links - Premium URL Shortener Platform

Prime Links is a modern, production-ready URL shortening SaaS platform similar to Bitly, built using **Next.js 15**, **Express.js**, **MongoDB**, and **Redis** cache.

Featuring sleek glassmorphic interfaces, premium typography, fully responsive layouts, auto QR code rendering, and real-time click tracking timelines with visual graphs.

---

## Technical Stack

* **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, Axios, React Query v5, Zustand.
* **Backend**: Node.js, Express.js (MVC Pattern), TypeScript.
* **Database**: MongoDB (Mongoose schemas for users, links, and click logs).
* **Caching**: Redis (TTL caching of redirection aliases).
* **Security**: JWT stateless authentication, bcrypt password hashing, Helmet headers, CORS filters, API Rate Limiting (100 requests/min).
* **QR Codes**: Native backend QR code generation using `qrcode` rendered as high-res Base64.
* **Deployment**: Containerized using Docker and Docker Compose.

---

## Directory Structure

```text
prime-links/
├── backend/               # Node/Express API service
│   ├── src/
│   │   ├── config/        # Mongoose & Redis configurations
│   │   ├── controllers/   # Route controller handlers
│   │   ├── middlewares/   # JWT, rate limiters, validations, error handlers
│   │   ├── models/        # Mongoose database models
│   │   ├── routes/        # Router endpoint mapping
│   │   └── index.ts       # Express app startup & wildcard redirection
│   ├── tsconfig.json
│   ├── package.json
│   └── Dockerfile
│
├── frontend/              # Next.js web application
│   ├── src/
│   │   ├── app/           # App router layouts, styling, pages, and providers
│   │   ├── store/         # Zustand global auth state
│   │   ├── lib/           # Axios interceptors
│   │   └── hooks/         # React Query query & mutation custom hooks
│   ├── tsconfig.json
│   ├── package.json
│   └── Dockerfile
│
└── docker-compose.yml     # Local orchestration of Mongo, Redis, backend, frontend
```

---

## Quickstart Guide (With Docker Compose)

The easiest way to boot the entire platform including a local database and cache instance is using **Docker Compose**:

1. Open a terminal in the root `prime-links/` directory.
2. Spin up the containers:
   ```bash
   docker compose up --build
   ```
3. Open the browser and visit the applications:
   * **Frontend Application**: [http://localhost:3000](http://localhost:3000)
   * **Backend API Gateway**: [http://localhost:5000](http://localhost:5000)

---

## Manual Installation (Without Docker)

To run the services separately, ensure you have **Node.js** (v20+), **MongoDB**, and **Redis** running locally.

### 1. Set Up Backend
1. Go to `backend/` directory:
   ```bash
   cd backend
   ```
2. Copy the environment variables template and configure credentials:
   ```bash
   copy .env.example .env
   ```
3. Install dependencies and start development server:
   ```bash
   npm install
   npm run dev
   ```
   * The backend will bind to `http://localhost:5000`.

### 2. Set Up Frontend
1. Go to `frontend/` directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   * The frontend will start at [http://localhost:3000](http://localhost:3000).

---

## API Documentation

For the complete breakdown of endpoints, request bodies, query options, and sample payloads, please refer to:
* **[API.md](file:///c:/Users/DELL/OneDrive/Documents/prime%20links/API.md)**
