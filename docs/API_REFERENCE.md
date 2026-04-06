# API Reference

All backend endpoints are served from the Express application on port `5001`. The AI engine runs as a separate service on port `3002`.

Every request that requires authentication must include a valid JWT in the `Authorization` header:

```
Authorization: Bearer <token>
```

Responses follow a consistent JSON envelope. Errors include a `message` field and an appropriate HTTP status code.

---

## Base URL

```
http://localhost:5001       (development)
https://api.unilodge.app   (production — placeholder)
```

---

## Authentication

### POST /auth/register

Register a new user account.

**Request body**

```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "role": "student | warden | admin"
}
```

**Response `201`**

```json
{
  "token": "eyJhbGci...",
  "user": {
    "id": "string",
    "name": "string",
    "email": "string",
    "role": "student"
  }
}
```

---

### POST /auth/login

Authenticate an existing user and retrieve a JWT.

**Request body**

```json
{
  "email": "string",
  "password": "string"
}
```

**Response `200`**

```json
{
  "token": "eyJhbGci...",
  "user": {
    "id": "string",
    "name": "string",
    "role": "string"
  }
}
```

**Response `401`**

```json
{ "message": "Invalid credentials" }
```

---

## Properties

### GET /properties

Returns all listed properties. Public — no authentication required.

**Query parameters**

| Parameter  | Type   | Description                          |
|------------|--------|--------------------------------------|
| `location` | string | Filter by location substring         |
| `minPrice` | number | Minimum nightly/monthly price        |
| `maxPrice` | number | Maximum nightly/monthly price        |
| `page`     | number | Page number for pagination (default 1) |
| `limit`    | number | Results per page (default 20)        |

**Response `200`**

```json
[
  {
    "id": 1,
    "name": "Skyline Residency",
    "price": 1200,
    "location": "Near Campus"
  },
  {
    "id": 2,
    "name": "Green Valley",
    "price": 950,
    "location": "Downtown"
  }
]
```

---

### GET /properties/:id

Returns a single property by ID.

**Response `200`**

```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "price": 1200,
  "location": "string",
  "amenities": ["WiFi", "Laundry"],
  "images": ["url1", "url2"],
  "wardenId": "string",
  "status": "pending | approved | rejected"
}
```

**Response `404`**

```json
{ "message": "Property not found" }
```

---

### POST /properties

Create a new property listing. Requires **warden** or **admin** role.

**Request body**

```json
{
  "name": "string",
  "description": "string",
  "price": 1200,
  "location": "string",
  "amenities": ["string"],
  "images": ["url"]
}
```

**Response `201`**

```json
{
  "id": "string",
  "status": "pending"
}
```

---

### PATCH /properties/:id/approve

Approve a pending property listing. Requires **admin** role.

**Response `200`**

```json
{ "id": "string", "status": "approved" }
```

---

## Bookings

### GET /bookings

Returns all bookings for the authenticated user. Students see their own bookings; admins and wardens see all bookings within their scope.

**Response `200`**

```json
[
  {
    "id": "string",
    "propertyId": "string",
    "studentId": "string",
    "status": "pending | confirmed | checked_in | cancelled",
    "createdAt": "ISO 8601 timestamp"
  }
]
```

---

### POST /bookings

Submit a new booking request. Requires **student** role.

**Request body**

```json
{
  "propertyId": "string",
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD"
}
```

**Response `201`**

```json
{
  "id": "string",
  "status": "pending"
}
```

---

### PATCH /bookings/:id/checkin

Record a warden check-in event against a confirmed booking. Requires **warden** role.

**Response `200`**

```json
{ "id": "string", "status": "checked_in" }
```

---

### PATCH /bookings/:id/cancel

Cancel an existing booking. Students can cancel their own pending bookings; admins can cancel any.

**Response `200`**

```json
{ "id": "string", "status": "cancelled" }
```

---

## Health Check

### GET /health

Returns the running status of the API. No authentication required.

**Response `200`**

```json
{
  "status": "ok",
  "message": "UniLodge API is running"
}
```

---

## AI Engine

All AI Engine endpoints are served on port `3002`. They are called server-to-server from the backend and are not directly exposed to the client in production.

### POST /recommend

Returns AI-generated room recommendations based on student preferences.

**Request body**

```json
{
  "budget": 1000,
  "location": "string",
  "preferences": ["quiet", "en-suite"]
}
```

**Response `200`**

```json
{
  "recommendations": [
    {
      "propertyId": "string",
      "reason": "string",
      "matchScore": 0.92
    }
  ]
}
```

---

### POST /chat

Send a message to the AI support assistant.

**Request body**

```json
{
  "message": "string",
  "conversationHistory": []
}
```

**Response `200`**

```json
{
  "reply": "string"
}
```

---

## HTTP Status Codes

| Code | Meaning                                      |
|------|----------------------------------------------|
| 200  | Success                                       |
| 201  | Resource created                              |
| 400  | Bad request — validation error               |
| 401  | Unauthorised — missing or invalid JWT        |
| 403  | Forbidden — insufficient role permissions    |
| 404  | Resource not found                            |
| 409  | Conflict — duplicate resource                |
| 500  | Internal server error                         |
