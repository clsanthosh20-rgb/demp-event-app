# DEMP — Setup & Run Guide

Complete step-by-step instructions to run DEMP on **any PC** (Windows, macOS, Linux) for both local development and web hosting.

---

## Prerequisites

- **Node.js** >= 18 ([download](https://nodejs.org/))
- **pnpm** >= 9 — Install with: `npm i -g pnpm`
- **Git** (optional, for version control)

Verify installation:

```bash
node --version   # v18+ recommended
pnpm --version   # v9+
```

---

# LOCAL DEVELOPMENT

Run both the API server (port 4000) and web dev server (port 3000) on your machine.

## Step 1 — Install dependencies

```bash
cd path/to/demp
pnpm install
```

## Step 2 — Generate Prisma client & create database

```bash
pnpm --filter @demp/api exec prisma generate --schema=prisma/schema.prisma
pnpm --filter @demp/api exec prisma db push --schema=prisma/schema.prisma
```

This creates an SQLite database at `apps/api/prisma/dev.db`.

## Step 3 — Seed the database

```bash
pnpm --filter @demp/api exec tsx prisma/seed.ts
```

### Default Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@demp.local` | `leodas` |
| Student | `student@demp.local` | `leodas` |

## Step 4 — Start servers

### Option A: One command (both servers)

```bash
pnpm -r dev
```

### Option B: Two terminals (separate output)

**Terminal 1 — API server:**
```bash
pnpm --filter @demp/api dev
```

**Terminal 2 — Web server:**
```bash
pnpm --filter @demp/web dev
```

### Option C: Quick start (Windows — opens two PowerShell windows)

```powershell
cd path/to/demp
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'path/to/demp'; pnpm --filter @demp/api dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'path/to/demp'; pnpm --filter @demp/web dev"
```

## Step 5 — Open in browser

- **Web app:** http://localhost:3000
- **API health check:** http://localhost:4000/health

The web dev server proxies `/api/*` requests to `localhost:4000`.

---

# HOSTING ON LOCAL NETWORK (LAN)

Make DEMP accessible from other devices on the same network (phones, tablets, laptops).

## Step 1 — Build the frontend

```bash
cd path/to/demp
pnpm --filter @demp/web build
```

This creates static files in `apps/web/dist/`.

## Step 2 — Configure API to serve frontend

Edit `apps/api/src/index.ts`. Add this line **before** `app.listen`:

```typescript
app.use(express.static('../web/dist'));
```

## Step 3 — Find your local IP

**Windows:**
```powershell
ipconfig
```
Look for `IPv4 Address` (e.g. `192.168.1.100`).

**macOS / Linux:**
```bash
ip addr show | grep inet
```
or
```bash
hostname -I
```

## Step 4 — Start the API server

```bash
cd path/to/demp
pnpm --filter @demp/api dev
```

## Step 5 — Access from any device

Open a browser on any device connected to the same network:

**http://YOUR_IP:4000**

Example: `http://192.168.1.100:4000`

---

# HOSTING ON A PRODUCTION SERVER (VPS / Cloud)

Deploy DEMP on a Linux server for public access.

## Step 1 — Prepare the project

Upload the entire `demp` folder to your server (**excluding `node_modules/`**).

## Step 2 — Install dependencies

```bash
cd /path/to/demp
pnpm install
```

## Step 3 — Build the frontend

```bash
pnpm --filter @demp/web build
```

## Step 4 — Configure API to serve frontend

Edit `apps/api/src/index.ts`. Add **before** `app.listen`:

```typescript
app.use(express.static('../web/dist'));
```

## Step 5 — Set environment variables

Edit `apps/api/.env`:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="replace-with-a-strong-random-string"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
```

For PostgreSQL, update `DATABASE_URL` to: `postgresql://user:password@localhost:5432/demp`

## Step 6 — Generate Prisma & seed

```bash
pnpm --filter @demp/api exec prisma generate --schema=prisma/schema.prisma
pnpm --filter @demp/api exec prisma db push --schema=prisma/schema.prisma
pnpm --filter @demp/api exec tsx prisma/seed.ts
```

## Step 7 — Start with PM2 (recommended)

```bash
npm i -g pm2
pm2 start pnpm --name "demp-api" --filter @demp/api dev
pm2 save
pm2 startup
```

## Step 8 — (Optional) Reverse proxy with Nginx

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Step 9 — Access

**http://yourdomain.com** or **http://SERVER_IP:4000**

---

# HOSTING WITH DOCKER

## Build and run

```bash
cd path/to/demp
docker compose up --build
```

## Access

**http://localhost:4000**

## Run migrations & seed

```bash
docker compose exec api npx prisma migrate deploy
docker compose exec api npx tsx prisma/seed.ts
```

---

# FULL RESET (delete database and re-seed)

```bash
cd path/to/demp

# Delete the SQLite database
rm apps/api/prisma/dev.db
# Windows: Remove-Item -LiteralPath "apps/api/prisma/dev.db" -Force

# Recreate and seed
pnpm --filter @demp/api exec prisma db push --schema=prisma/schema.prisma
pnpm --filter @demp/api exec tsx prisma/seed.ts
```

---

# TROUBLESHOOTING

| Problem | Fix |
|---------|-----|
| `Cannot GET /` | Open **http://localhost:3000** (not :4000) for local dev |
| `500 on login` | Database not seeded — run Step 3 |
| `Cannot read properties of null` | Re-run `pnpm install` then regenerate Prisma |
| Port conflict | Change port in `apps/web/vite.config.ts` or `apps/api/src/index.ts` |
| `PrismaClient` not found | Run `pnpm --filter @demp/api exec prisma generate` |
| Phone validation error | Phone must be exactly 10 digits, no letters or spaces |
| Blank page on mobile | Ensure you're using a modern browser (Chrome/Firefox/Safari latest) |
