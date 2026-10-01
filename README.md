# BachBuddy

A full-stack MERN marketplace for PGs, hostels, and rooms across India — with **User**, **Owner**, and **Admin** roles.

## Tech stack

- **Client:** React 18 (Vite), React Router, Axios, plain CSS
- **Server:** Node.js, Express, MongoDB (Mongoose), JWT auth, Multer (image uploads)

## Features by role

**User**
- Search & filter properties (city/area, price, type, gender, room type, amenities)
- View property details, rooms, reviews
- Save/unsave properties
- Contact owners & chat (conversations + messages)
- Leave reviews & ratings
- Report a listing

**Owner**
- Create/edit/delete property listings
- Upload photos
- Add/edit/delete rooms (type, price, capacity, amenities)
- Set availability
- Receive & reply to messages from interested users
- Dashboard with listing counts by status

**Admin**
- View all users and owners, block/unblock accounts
- View all properties regardless of status
- Approve / reject pending listings (moderation workflow)
- Remove fake or reported listings
- View reported properties & reported users

> New listings default to `status: "pending"` and only appear in public search once an admin approves them — this is what powers "Approve/reject listings".

## Project structure

```
bachbuddy/
├── client/     # React (Vite) frontend
└── server/     # Express + MongoDB backend
```

This mirrors the structure you specified: `components/`, `pages/` (including `pages/owner/` and `pages/admin/`), `context/`, `services/` on the client; `controllers/`, `models/`, `routes/`, `middleware/`, `config/` on the server.

## Getting started

### 1. Prerequisites
- Node.js 18+
- A MongoDB instance (local `mongod`, or a free MongoDB Atlas cluster)

### 2. Install dependencies

From the project root:

```bash
npm run install:all
```

(This installs root, `server/`, and `client/` dependencies. Root also needs `concurrently` — run `npm install` at the root first if `install:all` isn't available yet.)

### 3. Configure environment variables

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Edit `server/.env`:
```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/bachbuddy
JWT_SECRET=replace_with_a_long_random_string
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
ADMIN_EMAIL=admin@bachbuddy.com
ADMIN_PASSWORD=Admin@123
```

### 4. Create the first admin account

Public registration only creates `user` or `owner` accounts (by design). Seed an admin with:

```bash
npm run seed:admin
```

This creates an admin using `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `server/.env`.

### 5. Run the app

From the project root (runs both server on :5000 and client on :5173):

```bash
npm run dev
```

Or run them separately:
```bash
npm run server   # http://localhost:5000
npm run client   # http://localhost:5173
```

### 6. Try it out

1. Register as an **Owner**, add a property (it starts `pending`).
2. Log in as the seeded **Admin** (`/admin/dashboard`), approve the listing.
3. Register as a regular **User**, search for it, save it, message the owner, leave a review.

## API overview

| Area | Base route |
|---|---|
| Auth | `/api/auth` |
| Properties (search, CRUD, save, report) | `/api/properties` |
| Rooms | `/api/rooms` |
| Messages / Conversations | `/api/messages` |
| Reviews | `/api/reviews` |
| Admin | `/api/admin` |
| Image uploads | `/api/uploads` |

All protected routes require `Authorization: Bearer <token>`.

## Notes & next steps

- Images are stored locally under `server/uploads/` and served statically; swap in S3/Cloudinary for production.
- Chat is poll/refresh-based (no websockets yet) — an easy upgrade is adding Socket.IO for real time delivery.
- The admin "reports" feature stores reasons directly on `Property`/`User` documents to keep the schema simple; split into a dedicated `Report` model if you need an audit trail of who reported what.
