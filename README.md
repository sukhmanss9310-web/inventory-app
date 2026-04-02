# Ops Inventory Console

Internal stock operations system for a seller managing inventory across Amazon and Flipkart.

This repo contains:

- `apps/api`: Node.js + Express + MongoDB API with JWT auth and role-based access
- `apps/web`: React + Vite + Tailwind web dashboard for admins and staff
- `apps/mobile`: Expo React Native mobile app for dispatch, returns, and inventory visibility

## What It Does

- Admins can add, edit, and delete products
- Admins can review full activity logs with filters and pagination
- Staff can record dispatches, returns, and exchanges
- Dispatches reduce stock safely
- Returns and exchanges increase stock
- Dashboard shows total stock, low stock items, daily and weekly dispatch totals, and return totals
- Activity logs track who changed what and when

## Roles

- `admin`
  Full access, dashboard access, logs access, product management, team user creation
- `staff`
  Inventory view, dispatch, returns, exchanges

## Folder Structure

```text
.
├── apps
│   ├── api
│   │   ├── .env.example
│   │   ├── package.json
│   │   └── src
│   │       ├── app.js
│   │       ├── config
│   │       ├── controllers
│   │       ├── middleware
│   │       ├── models
│   │       ├── routes
│   │       ├── schemas
│   │       ├── services
│   │       ├── utils
│   │       ├── seed.js
│   │       └── server.js
│   ├── mobile
│   │   ├── .env.example
│   │   ├── App.js
│   │   ├── app.json
│   │   ├── package.json
│   │   └── src
│   └── web
│       ├── .env.local.example
│       ├── index.html
│       ├── package.json
│       ├── vite.config.js
│       └── src
├── package.json
└── README.md
```

## Backend API

Auth:

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`

Products:

- `GET /api/products`
- `GET /api/products/:productId`
- `POST /api/products`
- `PUT /api/products/:productId`
- `DELETE /api/products/:productId`

Inventory:

- `POST /api/inventory/dispatches`
- `POST /api/inventory/returns`

Admin:

- `GET /api/dashboard`
- `GET /api/logs`

## Setup

### 1. Install dependencies

From the repo root:

```bash
npm install
```

### 2. Configure environment variables

API:

```bash
cp apps/api/.env.example apps/api/.env
```

Web:

```bash
cp apps/web/.env.local.example apps/web/.env.local
```

Mobile:

```bash
cp apps/mobile/.env.example apps/mobile/.env
```

Recommended local values:

`apps/api/.env`

```env
PORT=5001
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/ops-inventory
JWT_SECRET=replace-this-with-a-long-secret
JWT_EXPIRES_IN=7d
CLIENT_URLS=http://localhost:5173,http://localhost:8081,http://localhost:19006
SEED_ADMIN_EMAIL=owner@ops.local
SEED_ADMIN_PASSWORD=Admin@123456
SEED_STAFF_EMAIL=staff@ops.local
SEED_STAFF_PASSWORD=Staff@123456
```

`apps/web/.env.local`

```env
VITE_API_URL=http://localhost:5001/api
```

`apps/mobile/.env`

```env
EXPO_PUBLIC_API_URL=http://localhost:5001/api
```

If you are testing the mobile app on a physical device, replace `localhost` with your machine's LAN IP.

### 3. Seed demo data

```bash
npm run seed
```

Seeded accounts:

- Admin: `owner@ops.local / Admin@123456`
- Staff: `staff@ops.local / Staff@123456`

## Running Locally

API + web:

```bash
npm run dev
```

Mobile:

```bash
npm run dev:mobile
```

All three together:

```bash
npm run dev:all
```

Default local URLs:

- Web dashboard: `http://localhost:5173`
- API: `http://localhost:5001`
- Mobile: Expo dev server output in the terminal

## Tests

Run the API service tests:

```bash
npm test
```

## Notes

- The first `signup` call creates an admin if the database has no users yet
- After initialization, only admins can create additional users
- Dispatch operations prevent negative stock
- Product changes, dispatches, and returns are all written to activity logs
- Web includes the full admin reporting and audit workflow
- Mobile supports dispatch, returns, inventory visibility, and admin product management
