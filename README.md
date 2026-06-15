# NSR Backend API

Production-ready **Node.js + Express + MongoDB** API for the NSR website and admin dashboard.

## Architecture

```
src/
├── app.js              # Express app & middleware
├── server.js           # Bootstrap + graceful shutdown
├── config/             # Environment & database
├── constants/          # Shared constants
├── controllers/        # HTTP layer (thin)
├── errors/             # ApiError class
├── middleware/         # Auth, validation, rate limit, errors
├── models/             # Mongoose schemas
├── routes/             # Route definitions
├── services/           # Business logic
├── utils/              # Logger, JWT, responses
└── seed/               # Database seeder
```

## Features

- Layered architecture (routes → controllers → services → models)
- JWT authentication for admin writes
- Rate limiting (API + login)
- Helmet security headers
- Response compression
- Centralized error handling
- Request logging (dev)
- MongoDB connection pooling & graceful shutdown
- Aggregation-based stats (optimized)

## Setup

```bash
cd backend
npm install
cp .env.example .env
npm run seed
npm run dev
```

## API response format

**Success (health):**
```json
{ "success": true, "data": { "status": "ok", ... } }
```

**Legacy endpoints (admin/website compatible):**
- `GET /api/courses` → returns array directly
- `PUT /api/courses` → `{ "message": "...", "count": 5 }`
- `POST /api/auth/login` → `{ "token": "...", "user": { ... } }`

**Errors:**
```json
{ "success": false, "error": "Message", "statusCode": 400 }
```

## Endpoints

| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/api/health` | No |
| POST | `/api/auth/login` | No |
| GET | `/api/auth/me` | Yes |
| GET | `/api/meta/stats` | No |
| GET | `/api/:resource` | No |
| POST | `/api/:resource` | Yes (create single item) |
| POST | `/api/:resource/items` | Yes (alias) |
| PUT | `/api/:resource/items/:itemId` | Yes |
| DELETE | `/api/:resource/items/:itemId` | Yes |
| PUT | `/api/:resource` | Yes (replace full array) |
| POST | `/api/upload` | Yes |

**Resources:** `courses`, `placements`, `partners`, `staff`, `testimonials_recruiter`, `testimonials_video`
