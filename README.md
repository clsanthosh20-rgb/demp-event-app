# DEMP — Department Event Management Portal

A production-grade web application for university/college departments to create, manage, and promote events. Students browse events, register, receive notifications, and interact with department resources. Admins manage the full event lifecycle, users, and communications.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Runtime** | Node.js 24, TypeScript (strict) |
| **Monorepo** | pnpm workspaces |
| **Frontend** | React 19, Vite, Tailwind CSS 4, React Router 7 |
| **Backend** | Express.js 5, Prisma ORM |
| **Database** | SQLite (dev), PostgreSQL 16 (prod) |
| **Validation** | Zod 3 (shared between client & server) |
| **Auth** | JWT (15m access + 7d refresh), bcryptjs |
| **Testing** | Vitest, Testing Library |
| **Deployment** | Docker, Docker Compose, GitHub Actions |

## Features

- **Authentication** — Register, login, JWT-based auth with role-based access (Student / Admin)
- **Events** — Browse, search, filter by category/subcategory; register/deregister with capacity checks
- **Event Cards** — Rich cards with images, date, time, location, registration status, QR code pass
- **Phone Validation** — Exactly 10 digits, numeric-only input, client + server validation
- **Responsive UI** — Fully optimized for mobile, tablet, laptop, desktop, and ultrawide screens
- **Admin Dashboard** — Stats overview, student management with filters & export (CSV/Excel), recent activity
- **Admin Events** — Full CRUD with bulk status updates, clone, delete
- **Notifications** — In-app notification center with mark-read and mark-all-read
- **Profile Management** — Edit name, phone, class, section, year, department; change password
- **QR Code Scanner** — Verify registrations and check-in students
- **Rules & FAQs** — Department rules browsing, FAQ with keyword search

## Recent Hotfixes

- **Phone Number Validation** — Client-side (regex, digit-only input, 10-char limit) + server-side (Zod regex `/^\d{10}$/`)
- **Responsive Layout** — All pages optimized: responsive grids, typography, navigation, tables, forms, dialogs, touch targets

## Project Structure

```
demp/
├── apps/
│   ├── api/          # Express REST API (port 4000)
│   └── web/          # React SPA (port 3000 dev, 80 prod)
├── packages/
│   ├── shared/       # Types, Zod validators, constants
│   └── ui/           # Design system components
├── docker-compose.yml
└── ...
```

## Prerequisites

- **Node.js** >= 18 (recommended: 24+)
- **pnpm** >= 9 (`npm i -g pnpm`)
- **Git** (optional, for version control)
- **Docker Desktop** (optional, for PostgreSQL/production deployment)

## Quick Start (Local Development)

```bash
# 1. Install dependencies
pnpm install

# 2. Generate Prisma client & create SQLite database
pnpm --filter @demp/api exec prisma generate --schema=prisma/schema.prisma
pnpm --filter @demp/api exec prisma db push --schema=prisma/schema.prisma

# 3. Seed the database with sample data
pnpm --filter @demp/api exec tsx prisma/seed.ts

# 4. Start both servers (API + Web)
pnpm -r dev
```

- **Web:** http://localhost:3000
- **API:** http://localhost:4000

### Default Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@demp.local` | `leodas` |
| Student | `student@demp.local` | `leodas` |

## Run Tests

```bash
pnpm --filter @demp/api test
pnpm --filter @demp/web test
```

## Run with Docker (Production-like)

```bash
docker compose up --build
```

Access at **http://localhost:4000**

## Deployment

### Option A: Local Network (LAN)

```bash
# Build frontend
pnpm --filter @demp/web build

# Start API server (serves built frontend)
pnpm --filter @demp/api dev
```

Find your LAN IP with `ipconfig` (Windows) or `ip a` (Linux). Access from any device on the network at **http://YOUR_IP:4000**.

### Option B: Production Server (Linux VPS)

```bash
# Upload project (excluding node_modules), then:
pnpm install
pnpm --filter @demp/web build
pnpm --filter @demp/api exec prisma generate --schema=prisma/schema.prisma
pnpm --filter @demp/api exec prisma db push --schema=prisma/schema.prisma
pnpm --filter @demp/api exec tsx prisma/seed.ts
pnpm --filter @demp/api dev
```

For production, use PM2: `npm i -g pm2` then `pm2 start pnpm --name "demp-api" --filter @demp/api dev`.

### Option C: Docker

```bash
docker compose up --build -d
docker compose exec api npx prisma migrate deploy
docker compose exec api npx tsx prisma/seed.ts
```

## API Overview

All endpoints are prefixed with `/api/v1`.

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | — | Register new user (phone: exactly 10 digits) |
| POST | `/auth/login` | — | Sign in |
| POST | `/auth/refresh` | — | Refresh access token |
| GET | `/auth/me` | JWT | Current user profile |
| PUT | `/auth/profile` | JWT | Update name, phone, department, etc. |
| PUT | `/auth/password` | JWT | Change password |

### Events

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/events` | — | List events (paginated, filterable) |
| GET | `/events/:id` | — | Get event details |
| POST | `/events` | Admin | Create event |
| PUT | `/events/:id` | Admin | Update event |
| DELETE | `/events/:id` | Admin | Delete event |
| POST | `/events/:id/clone` | Admin | Clone event |
| GET | `/events/:id/registrations` | Admin | List event registrations |
| POST | `/events/bulk-status` | Admin | Bulk update event status |

### Registrations

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/events/:id/register` | JWT | Register for event |
| DELETE | `/events/:id/register` | JWT | Cancel registration |
| GET | `/me/registrations` | JWT | My registrations |

### Notifications

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/me/notifications` | JWT | My notifications |
| PUT | `/notifications/:id/read` | JWT | Mark as read |
| POST | `/notifications/read-all` | JWT | Mark all as read |

### Rules

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/rules` | — | List active rules |
| GET | `/rules/all` | Admin | List all rules |
| POST | `/rules` | Admin | Create rule |
| PUT | `/rules/:id` | Admin | Update rule |
| DELETE | `/rules/:id` | Admin | Delete rule |

### FAQ

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/faq` | — | List active FAQs |
| GET | `/faq/search?q=` | — | Search FAQs by keyword |
| GET | `/faq/all` | Admin | List all FAQs |
| POST | `/faq` | Admin | Create FAQ |
| PUT | `/faq/:id` | Admin | Update FAQ |
| DELETE | `/faq/:id` | Admin | Delete FAQ |

### Admin

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/admin/stats` | Admin | Dashboard stats (counts, categories) |
| GET | `/admin/recent-activity` | Admin | Recent activity feed |

## Environment Variables

See `apps/api/.env` for development defaults and `apps/api/.env.production.example` for all configurable variables.

## CI/CD

GitHub Actions workflow (`.github/workflows/ci.yml`) runs on every push/PR:
1. Install dependencies
2. Build all packages
3. Run all tests
