# Home Farm

## Project Description

Home Farm is a monorepo for managing a family vegetable farm. The system tracks crops, farm activities, processed products, customer orders, expenses, users, and production statistics.

The application supports three main user groups:

- **Visitors** can browse the welcome page, view available products for sale, and register.
- **Users** can log in, manage their profile and delivery address, create orders, update order lines, view order status, and cancel orders when allowed.
- **Administrators** can manage crops, processed products, crop activities, expenses, orders, and production statistics.

Main farm workflows:

- Manage crops such as tomatoes, cucumbers, peppers, potatoes, and other seasonal produce.
- Record crop activities: planting, harvesting, spraying, and waste.
- Create processed products from crops, such as lutenitsa, pickles, canned tomatoes, and vegetable mixes.
- Accept customer orders and manage their status.
- Track expenses and calculate operational/statistical summaries.
- Seed the database with a realistic Bulgarian dataset for performance checks.

## Architecture

The repository contains a web application and a mobile application that share the same backend API and PostgreSQL database.

```text
Visitor/User/Admin
        |
        | Web UI: browser
        v
home-farm-web
Next.js App Router
Server Components + Server Actions + API Routes
        |
        | Drizzle ORM
        v
PostgreSQL / Neon

Mobile user
        |
        | Expo / React Native app
        v
home-farm-mobile
REST calls with Bearer JWT
        |
        v
home-farm-web /api/*
        |
        v
PostgreSQL / Neon
```

### Web App

Folder: `home-farm-web`

Technologies:

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Drizzle ORM
- Neon serverless PostgreSQL
- JWT sessions with `jose`
- Password hashing with `bcryptjs`

Responsibilities:

- Public home page for unauthenticated visitors.
- Web authentication with cookie-based JWT sessions.
- Admin screens for crops, products, orders, expenses, and statistics.
- User screens for dashboard, profile, and orders.
- API routes used by the mobile app.
- Database migrations and seed scripts.

### Mobile App

Folder: `home-farm-mobile`

Technologies:

- Expo SDK 55
- Expo Router
- React Native
- TypeScript

Responsibilities:

- Mobile login and registration.
- Mobile profile page.
- Mobile order list and order details.
- Order creation, order line editing, and order cancellation.
- Communication with the web backend through REST API calls.

The mobile app uses `EXPO_PUBLIC_API_BASE_URL` when configured. If not set, it defaults to `http://localhost:3000/api`.

### Backend and APIs

The backend is implemented inside the Next.js web app:

- Server Actions in `home-farm-web/src/actions`
- REST API routes in `home-farm-web/src/app/api`
- Database schema in `home-farm-web/src/db/schema.ts`
- Database client in `home-farm-web/src/db/index.ts`

Important API groups:

- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/profile`
- `PATCH /api/profile`
- `GET /api/crops`
- `GET /api/orders`
- `POST /api/orders`
- `GET /api/orders/:id`
- `DELETE /api/orders/:id`
- `POST /api/orders/:id/edit`
- `POST /api/orders/:id/create_order_line`
- `PATCH /api/orders/:id/lines/:lineId`
- `DELETE /api/orders/:id/lines/:lineId`

API documentation is available locally at:

```text
http://localhost:3000/api/docs
```

## Database Schema Design

The database is PostgreSQL, managed through Drizzle ORM migrations.

```mermaid
erDiagram
  USERS ||--o{ ORDERS : creates
  ORDERS ||--o{ ORDER_LINES : contains
  CROPS ||--o{ ORDER_LINES : ordered_as

  CROPS ||--o{ PLANTINGS : has
  CROPS ||--o{ HARVESTINGS : has
  CROPS ||--o{ SPRAYINGS : has
  CROPS ||--o{ WASTES : has

  CROPS ||--o{ CROP_PRODUCTS : used_in
  PRODUCTS ||--o{ CROP_PRODUCTS : contains

  EXPENCES_TYPE ||--o{ EXPENCES : categorizes

  USERS {
    int id PK
    text name
    varchar email UK
    text password_hash
    enum role
    text shipping_city
    text shipping_street
    text shipping_postal_code
    text shipping_country
  }

  CROPS {
    int id PK
    text name
    text variety
    boolean for_sale
    numeric price
    text description
  }

  PLANTINGS {
    int id PK
    date date
    numeric quantity
    enum type
    int crop_id FK
    text description
  }

  HARVESTINGS {
    int id PK
    date date
    numeric quantity
    int crop_id FK
    text description
  }

  SPRAYINGS {
    int id PK
    date date
    numeric quantity
    int crop_id FK
    text description
  }

  WASTES {
    int id PK
    date date
    numeric quantity
    enum type
    int crop_id FK
    text description
  }

  PRODUCTS {
    int id PK
    text name
    date date
    numeric quantity
    numeric price
  }

  CROP_PRODUCTS {
    int crop_id PK,FK
    int product_id PK,FK
    numeric quantity
  }

  ORDERS {
    int id PK
    int user_id FK
    text status
    timestamp created_at
    text shipping_city
    text shipping_street
    text shipping_postal_code
    text shipping_country
  }

  ORDER_LINES {
    int id PK
    int order_id FK
    int crop_id FK
    numeric quantity
    numeric price
  }

  EXPENCES_TYPE {
    int id PK
    text name
  }

  EXPENCES {
    int id PK
    text name
    int expences_type_id FK
    text description
    date date
    numeric value
  }
```

Performance indexes are defined in `home-farm-web/src/db/schema.ts` and migration files under `home-farm-web/drizzle`.

## Repo Structure

```text
home-farm/
|-- package.json
|-- package-lock.json
|-- Readme.md
|-- README_EN.md
|-- README_BG.md
|-- home-farm-web/
|   |-- src/app/
|   |   |-- api/                 # REST endpoints for mobile and docs
|   |   |-- admin/               # Admin pages
|   |   `-- ...                  # Public and user-facing web routes
|   |-- src/actions/             # Server actions and database workflows
|   |-- src/components/          # React UI components
|   |-- src/db/
|   |   |-- schema.ts            # Drizzle schema
|   |   |-- index.ts             # Database client
|   |   `-- seed.ts              # Bulgarian load-test seed data
|   |-- src/lib/                 # Session, auth, formatting, helpers
|   |-- drizzle/                 # SQL migrations and migration metadata
|   |-- drizzle.config.ts
|   `-- package.json
`-- home-farm-mobile/
    |-- src/app/                 # Expo Router screens
    |-- src/components/          # Mobile UI components
    |-- src/contexts/            # Auth/session state
    |-- src/lib/api.ts           # REST API client
    |-- scripts/expo-cli.cjs     # Expo workspace launcher
    `-- package.json
```

## Local Development Setup

### Requirements

- Node.js 22 or newer
- npm
- PostgreSQL database, Neon database, or another Postgres-compatible database
- Expo Go or an emulator/device for the mobile app

### 1. Clone and Install

```bash
git clone <repo-url>
cd home-farm
npm install
```

### 2. Configure Environment

Create a root `.env` file:

```bash
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require
JWT_SECRET=replace-with-a-long-random-secret
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8081
```

For mobile development against a non-local backend, add:

```bash
EXPO_PUBLIC_API_BASE_URL=http://YOUR_MACHINE_IP:3000/api
```

Notes:

- `DATABASE_URL` is used by the web app, migrations, and seed script.
- `JWT_SECRET` signs web cookies and mobile bearer tokens.
- `CORS_ALLOWED_ORIGINS` should be explicit in production.
- On a physical mobile device, `localhost` points to the phone, not your computer.

### 3. Run Migrations

```bash
npm run db:migrate -w home-farm-web
```

### 4. Optional: Seed Performance Data

This truncates primary tables and inserts more than 20,000 meaningful Bulgarian records.

```bash
npm run db:seed -w home-farm-web
```

Seeded test login:

```text
klient.0001@example.bg / password123
```

### 5. Start Development Servers

Run web and mobile together:

```bash
npm run dev
```

Or run them separately:

```bash
npm run dev -w home-farm-web
npm run start -w home-farm-mobile
```

Open the web app:

```text
http://localhost:3000
```

For mobile, use the Expo terminal output to open Expo Go, Android emulator, iOS simulator, or web preview.

### 6. Useful Commands

```bash
npm run build
npm run lint -w home-farm-web
npm run lint -w home-farm-mobile
npm run db:generate -w home-farm-web
npm run db:migrate -w home-farm-web
npm run db:seed -w home-farm-web
```

## Deployment Notes

The web app can be deployed as a Next.js app. The mobile app can be exported or built with Expo/EAS. Because the projects are separate workspaces, deploy each project from its own folder:

- Web base directory: `home-farm-web`
- Mobile base directory: `home-farm-mobile`

For production, configure:

- `DATABASE_URL`
- `JWT_SECRET`
- `CORS_ALLOWED_ORIGINS`
- `EXPO_PUBLIC_API_BASE_URL` for mobile builds
