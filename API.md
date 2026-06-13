# Prime Links API Documentation

This document describes the REST API endpoints exposed by the Prime Links URL shortener backend service.

## Base URL
* Local development: `http://localhost:5000`
* All endpoints (except shortcode redirection) are prefixed with `/api`.

---

## Authentication Module

### 1. Register User
* **Endpoint**: `POST /api/auth/register`
* **Rate Limit**: 100 requests / minute
* **Request Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword123"
  }
  ```
* **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "token": "eyJhbGciOi...",
    "user": {
      "id": "603d526e...",
      "name": "John Doe",
      "email": "john@example.com",
      "createdAt": "2026-06-13T23:26:36Z"
    }
  }
  ```

### 2. Login User
* **Endpoint**: `POST /api/auth/login`
* **Rate Limit**: 100 requests / minute
* **Request Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "securepassword123"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "token": "eyJhbGciOi...",
    "user": {
      "id": "603d526e...",
      "name": "John Doe",
      "email": "john@example.com",
      "createdAt": "2026-06-13T23:26:36Z"
    }
  }
  ```

### 3. Logout User
* **Endpoint**: `POST /api/auth/logout`
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "User logged out successfully."
  }
  ```

### 4. Fetch User Profile
* **Endpoint**: `GET /api/auth/profile`
* **Headers**: `Authorization: Bearer <JWT_TOKEN>`
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "user": {
      "id": "603d526e...",
      "name": "John Doe",
      "email": "john@example.com",
      "createdAt": "2026-06-13T23:26:36Z"
    }
  }
  ```

### 5. Update Profile
* **Endpoint**: `PUT /api/auth/profile`
* **Headers**: `Authorization: Bearer <JWT_TOKEN>`
* **Request Body** (Both fields are optional, name or password update):
  ```json
  {
    "name": "John Updated",
    "currentPassword": "securepassword123",
    "newPassword": "newsecurepassword123"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Profile updated successfully.",
    "user": {
      "id": "603d526e...",
      "name": "John Updated",
      "email": "john@example.com",
      "createdAt": "2026-06-13T23:26:36Z"
    }
  }
  ```

---

## Link Management Module
All routes below require authentication headers: `Authorization: Bearer <JWT_TOKEN>`.

### 1. Shorten Link
* **Endpoint**: `POST /api/links`
* **Request Body**:
  ```json
  {
    "originalUrl": "https://wikipedia.org/wiki/Main_Page",
    "customAlias": "wiki" 
  }
  ```
* **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "link": {
      "_id": "603d527f...",
      "userId": "603d526e...",
      "originalUrl": "https://wikipedia.org/wiki/Main_Page",
      "shortCode": "wiki",
      "customAlias": "wiki",
      "qrCode": "data:image/png;base64,iVBORw0KG...",
      "clicks": 0,
      "createdAt": "2026-06-13T23:30:00Z",
      "updatedAt": "2026-06-13T23:30:00Z"
    }
  }
  ```

### 2. Fetch User Links
* **Endpoint**: `GET /api/links`
* **Query Parameters**: `search` (Optional, query by original URL, custom alias, or shortcode)
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "links": [
      {
        "_id": "603d527f...",
        "userId": "603d526e...",
        "originalUrl": "https://wikipedia.org/wiki/Main_Page",
        "shortCode": "wiki",
        "qrCode": "data:image/png;base64,iVB...",
        "clicks": 5,
        "createdAt": "2026-06-13T23:30:00Z"
      }
    ]
  }
  ```

### 3. Fetch Single Link Details
* **Endpoint**: `GET /api/links/:id`
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "link": {
      "_id": "603d527f...",
      "originalUrl": "https://wikipedia.org/wiki/Main_Page",
      "shortCode": "wiki",
      "clicks": 5,
      "qrCode": "data:image/png;base64,iVB..."
    }
  }
  ```

### 4. Edit Destination Link URL
* **Endpoint**: `PUT /api/links/:id`
* **Request Body**:
  ```json
  {
    "originalUrl": "https://en.wikipedia.org/wiki/Portal:Current_events"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "link": {
      "_id": "603d527f...",
      "originalUrl": "https://en.wikipedia.org/wiki/Portal:Current_events",
      "shortCode": "wiki",
      "clicks": 5,
      "qrCode": "data:image/png;base64,iVB..."
    }
  }
  ```

### 5. Delete Link
* **Endpoint**: `DELETE /api/links/:id`
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Link successfully deleted."
  }
  ```

---

## Analytics Module
All routes below require authentication headers: `Authorization: Bearer <JWT_TOKEN>`.

### 1. General Account Overview Stats
* **Endpoint**: `GET /api/analytics/overview`
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "summary": {
      "totalLinks": 12,
      "totalClicks": 1450
    },
    "devices": [
      { "name": "Desktop", "value": 980 },
      { "name": "Mobile", "value": 450 },
      { "name": "Tablet", "value": 20 }
    ],
    "browsers": [
      { "name": "Chrome", "value": 850 },
      { "name": "Safari", "value": 400 },
      { "name": "Firefox", "value": 150 },
      { "name": "Edge", "value": 50 }
    ],
    "os": [
      { "name": "Windows", "value": 750 },
      { "name": "macOS", "value": 380 },
      { "name": "iOS", "value": 220 },
      { "name": "Android", "value": 100 }
    ],
    "referrers": [
      { "name": "Direct", "value": 600 },
      { "name": "github.com", "value": 400 },
      { "name": "t.co", "value": 300 },
      { "name": "linkedin.com", "value": 150 }
    ],
    "timeline": [
      { "date": "2026-06-07", "clicks": 180 },
      { "date": "2026-06-08", "clicks": 210 },
      { "date": "2026-06-09", "clicks": 190 },
      { "date": "2026-06-10", "clicks": 250 },
      { "date": "2026-06-11", "clicks": 300 },
      { "date": "2026-06-12", "clicks": 150 },
      { "date": "2026-06-13", "clicks": 170 }
    ]
  }
  ```

### 2. Single Link Click Stats
* **Endpoint**: `GET /api/analytics/link/:linkId`
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "summary": {
      "shortCode": "wiki",
      "originalUrl": "https://wikipedia.org",
      "totalClicks": 105,
      "createdAt": "2026-06-13T23:30:00Z"
    },
    "devices": [
      { "name": "Desktop", "value": 85 },
      { "name": "Mobile", "value": 20 }
    ],
    "browsers": [
      { "name": "Chrome", "value": 70 },
      { "name": "Safari", "value": 35 }
    ],
    "os": [
      { "name": "Windows", "value": 60 },
      { "name": "macOS", "value": 25 }
    ],
    "referrers": [
      { "name": "Direct", "value": 50 },
      { "name": "google.com", "value": 55 }
    ],
    "timeline": [
      { "date": "2026-06-13", "clicks": 105 }
    ]
  }
  ```

---

## Redirection (Shortcode Endpoint)

### 1. Perform Redirect lookup
* **Endpoint**: `GET /:shortCode`
* **Details**: Intercepts path, increments clicks, asynchronously logs click context details, and performs redirection.
* **Success Response (302 Found)**: Redirects client to destination target.
* **Failure Response (302 Found)**: Redirects client to `http://localhost:3000/404` for invalid links.
