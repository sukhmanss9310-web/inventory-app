# Ops Inventory Console

Internal stock operations system for a seller managing inventory across Amazon and Flipkart.

This repo contains:

- `apps/api`: Node.js + Express + MongoDB API with JWT auth and role-based access
- `apps/web`: React + Vite + Tailwind web dashboard for admins and staff
- `apps/mobile`: Expo React Native mobile app for dispatch, returns, and inventory visibility
- `apps/web` also ships as a PWA for Add to Home Screen install on mobile browsers

## What It Does

- Admins can add, edit, and delete products
- Admins can review full activity logs with filters and pagination
- Staff can record dispatches, returns, and exchanges
- Dispatches reduce stock safely
- Returns and exchanges increase stock
- Dashboard shows total stock, low stock items, daily and weekly dispatch totals, and return totals
- Activity logs track who changed what and when

## Roles

- `developer`
  Platform owner with control over company creation, company suspension, and user access across all companies
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

Platform owner:

- `GET /api/platform/overview`
- `POST /api/platform/companies`
- `PATCH /api/platform/companies/:companyId/access`
- `PATCH /api/platform/users/:userId/access`

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
- `POST /api/assistant/chat`
- `POST /api/assistant/execute`

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
SEED_PLATFORM_COMPANY_NAME=Platform Control
SEED_PLATFORM_COMPANY_CODE=platform
SEED_DEVELOPER_EMAIL=developer@ops.local
SEED_DEVELOPER_PASSWORD=Developer@123456
SEED_COMPANY_NAME=Atlas Retail
SEED_COMPANY_CODE=atlas-retail
SEED_ADMIN_EMAIL=owner@ops.local
SEED_ADMIN_PASSWORD=Admin@123456
SEED_STAFF_EMAIL=staff@ops.local
SEED_STAFF_PASSWORD=Staff@123456
HUGGINGFACE_API_KEY=
HUGGINGFACE_TIMEOUT_MS=30000
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

- Developer: `platform • developer@ops.local / Developer@123456`
- Company code: `atlas-retail`
- Admin: `owner@ops.local / Admin@123456`
- Staff: `staff@ops.local / Staff@123456`

If you already have company data and do not want to reseed the database, provision the platform owner without wiping data:

```bash
npm run provision:developer --workspace api
```

Admins can also use the inventory management screens to reset a product's stock to an exact value with an audit reason when a stock count needs correction.

Admins also have a company-level reset tool. It keeps the company and user accounts, sets every product stock level to `0`, clears dispatch and return history, clears older logs for that company, and then writes one fresh reset log with the reason you entered.

Admins can also bulk-import products from an Excel or CSV file, or from a public Google Sheet. The supported column headers are `name`, `sku`, `stock`, and `lowStockThreshold`. Imports are company-scoped and update existing products by matching SKU.

Admins can also use the AI inventory assistant to ask questions about live inventory, low stock, sales trends, dispatches, and returns. The assistant can prepare dispatch, return, product creation, and stock reset actions, but the admin must confirm before anything changes.

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

## PWA Install

The web dashboard is configured as a Progressive Web App. On supported mobile browsers you can:

- open the web dashboard
- choose `Add to Home Screen` or use the in-app install prompt
- reopen it in standalone mode like an app

The PWA precaches the app shell and static assets for basic offline access without changing the existing API integration.

## Tests

Run the API service tests:

```bash
npm test
```

## Notes

- Public company signup is disabled
- Only the developer can create company workspaces
- Existing company admins can still create additional users inside their own company
- Suspended companies and disabled users cannot log in
- Dispatch operations prevent negative stock
- Product changes, dispatches, and returns are all written to activity logs
- AI assistant inventory changes still use the same admin-only APIs and audit logs
- Web includes the full admin reporting, audit workflow, and developer control panel
- Mobile supports dispatch, returns, inventory visibility, and admin product management
