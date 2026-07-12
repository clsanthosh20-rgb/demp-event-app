# DEMP — Department Event Management Portal

## Stage 1: Project Plan

---

## 1. Project Vision

A production-grade web application for university/college departments to create, manage, and promote events. Students browse events, register, receive notifications, and interact with department rules/FAQs. Admins manage the full event lifecycle, users, and communications.

**Key design goals:** modularity, type safety, long-term maintainability, annual reuse.

---

## 2. Target Users & Roles

| Role | Capabilities |
|------|-------------|
| **Student** | Browse events, register/deregister, view department rules, ask FAQ bot, manage profile, receive notifications |
| **Admin** | All student capabilities + create/edit/delete events, manage registrations, send notifications, manage users, view dashboard analytics |

---

## 3. Technology Stack

### Runtime & Language

| Choice | Why |
|--------|-----|
| **Node.js 24** | Already installed; LTS; vast ecosystem; async I/O suitable for I/O-heavy portal |
| **TypeScript (strict)** | Type safety prevents entire classes of bugs; self-documenting; refactoring confidence; long-term maintenance |

### Monorepo Management

| Choice | Why |
|--------|-----|
| **pnpm workspaces** | Disk-efficient (hard links); strict dependency isolation; native workspace protocol; faster than npm/yarn |

### Frontend

| Choice | Why |
|--------|-----|
| **React 19** | Mature, vetted ecosystem; large talent pool; Server Components in 19 improve SEO/initial load |
| **Vite** | Blazing-fast HMR; native ESM; first-class TypeScript/React support |
| **Tailwind CSS 4** | Utility-first; no runtime; tiny production bundles; consistent design tokens |
| **shadcn/ui** | Copy-paste component library built on Radix; full control over every component; no external dependency bloat |

### Backend

| Choice | Why |
|--------|-----|
| **Express.js** | De facto standard; middleware ecosystem; simple, well-understood; easy to maintain for years |
| **Hono** (alternative considered) | Lighter, faster, but smaller ecosystem — Express chosen for proven long-term stability |

### Database

| Choice | Why |
|--------|-----|
| **PostgreSQL** | ACID compliance; JSON support for flexible fields; excellent with Prisma; battle-tested for relational data |
| **Prisma** | Type-safe auto-generated client; declarative schema; migrations; great DX for schema evolution |

### Authentication & Security

| Choice | Why |
|--------|-----|
| **JWT (access + refresh tokens)** | Stateless auth; mobile-friendly; refresh tokens mitigate theft risk |
| **bcrypt** | Industry-standard password hashing; slow-hash resistant to brute-force |
| **Zod** | Runtime validation + TypeScript type inference; validate API inputs at the boundary |

### Testing

| Choice | Why |
|--------|-----|
| **Vitest** | Vite-native; fast; Jest-compatible API; built-in coverage |
| **Playwright** | Cross-browser E2E; reliable auto-wait; great debugging tools |

### DevOps & Tooling

| Choice | Why |
|--------|-----|
| **Docker + Compose** | Reproducible dev environment; PostgreSQL container; CI/CD consistency |
| **ESLint + Prettier** | Code quality and formatting enforcement |

---

## 4. Architecture Decisions

### ADR-1: Monorepo with Strict Package Boundaries
**Decision:** Use pnpm workspace monorepo with `apps/` (deployable applications) and `packages/` (shared libraries).
**Rationale:** Shared types and validators between frontend and backend prevent drift. UI components in a dedicated package enable the design system (Stage 3) to be independently versioned and reused in future projects.
**Trade-off:** Slightly more complex tooling setup, but worth it for consistency.

### ADR-2: RESTful API with Layered Architecture
**Decision:** Express REST API with Controller → Service → Repository layers.
**Rationale:** Separation of concerns. Controllers handle HTTP, services contain business logic, repositories handle data access via Prisma. Each layer independently testable. Future gRPC or GraphQL additions won't require rewriting business logic.
**Trade-off:** More boilerplate than a simple router, but scales with complexity.

### ADR-3: Database-First with Prisma Schema
**Decision:** Define the data model in Prisma schema first; generate client and types from it.
**Rationale:** Single source of truth for the data model. Both frontend `packages/shared` and backend consume generated types. Migrations are declarative and version-controlled.

### ADR-4: JWT over Session-Based Auth
**Decision:** Stateless JWT (15min access + 7d refresh token stored in httpOnly cookie).
**Rationale:** No server-side session store needed; works well with containerized deployments; easy to scale horizontally.
**Trade-off:** Revocation requires a deny-list; mitigated by short-lived access tokens.

### ADR-5: Modular Feature Slices per Stage
**Decision:** Each stage adds a self-contained feature module (e.g., `modules/events/`, `modules/notifications/`).
**Rationale:** Rule: "Keep code modular and reusable." Isolated modules can be tested, removed, or replaced without affecting others.

---

## 5. Proposed Directory Structure

```
demp/
├── apps/
│   ├── api/                    # Express REST API
│   │   ├── src/
│   │   │   ├── modules/        # Feature modules (one per domain)
│   │   │   │   ├── auth/
│   │   │   │   ├── events/
│   │   │   │   ├── registrations/
│   │   │   │   ├── notifications/
│   │   │   │   ├── users/
│   │   │   │   ├── rules/
│   │   │   │   ├── faq/
│   │   │   │   └── email/
│   │   │   ├── middleware/     # Auth, validation, error handling
│   │   │   ├── lib/            # Shared utilities (config, logger)
│   │   │   └── index.ts        # Entry point
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   ├── tsconfig.json
│   │   └── package.json
│   └── web/                    # React SPA
│       ├── src/
│       │   ├── pages/
│       │   ├── components/
│       │   ├── hooks/
│       │   ├── lib/
│       │   └── main.tsx
│       ├── index.html
│       ├── tsconfig.json
│       └── package.json
├── packages/
│   ├── shared/                 # Types, validators, constants shared across apps
│   │   ├── src/
│   │   │   ├── types/
│   │   │   ├── validators/
│   │   │   └── constants/
│   │   ├── tsconfig.json
│   │   └── package.json
│   └── ui/                    # Design system (Stage 3)
│       ├── src/
│       │   ├── components/
│       │   └── styles/
│       ├── tsconfig.json
│       └── package.json
├── docker-compose.yml
├── package.json               # Root workspace
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── .eslintrc.cjs
├── .prettierrc
└── .gitignore
```

---

## 6. Preliminary Database Schema

```
User
  id            UUID        PK
  email         String      unique
  passwordHash  String
  role          Role(Student | Admin)
  name          String
  department    String?
  avatarUrl     String?
  createdAt     DateTime
  updatedAt     DateTime

Event
  id            UUID        PK
  title         String
  description   Text
  date          DateTime
  location      String
  capacity      Int
  category      EventCategory
  status        EventStatus(Draft | Open | Closed | Cancelled)
  imageUrl      String?
  createdById   UUID        FK -> User
  createdAt     DateTime
  updatedAt     DateTime

Registration
  id            UUID        PK
  userId        UUID        FK -> User
  eventId       UUID        FK -> Event
  status        RegStatus(Registered | Attended | Cancelled)
  registeredAt  DateTime
  unique(userId, eventId)

Notification
  id            UUID        PK
  userId        UUID        FK -> User
  type          NotifType
  title         String
  message       Text
  read          Boolean     default false
  link          String?
  createdAt     DateTime

FAQ
  id            UUID        PK
  question      String
  answer        Text
  category      String
  order         Int
  isActive      Boolean     default true

Rule
  id            UUID        PK
  title         String
  content       Text
  category      String
  order         Int
  isActive      Boolean     default true
```

---

## 7. Stage Roadmap (18 Stages) — ✅ Complete

| Stage | Title | Deliverable |
|-------|-------|-------------|
| 1 | **Project planning** | ✅ This document |
| 2 | Project setup & architecture | ✅ PNPM monorepo, Express scaffold, Prisma schema, React scaffold |
| 3 | UI design system | ✅ Theme tokens, shared component library (Button, Card, Input, Modal, etc.) |
| 4 | Authentication | ✅ Login, register, JWT, role middleware, protected routes |
| 5 | Database schema | ✅ Prisma schema, seed scripts |
| 6 | Student dashboard | ✅ Event listing, filtering, calendar view |
| 7 | Events module | ✅ Event CRUD, categories, scheduling |
| 8 | Event registration | ✅ Register/deregister, capacity check |
| 9 | Notifications | ✅ In-app notification center |
| 10 | Rules & regulations | ✅ Rules CRUD, category browsing |
| 11 | Admin dashboard | ✅ Analytics, stats overview |
| 12 | Event management | ✅ Admin event CRUD UI, bulk status, clone |
| 13 | FAQ chatbot | ✅ FAQ management, keyword-based Q&A |
| 14 | Email system | ✅ Email templates, SMTP integration |
| 15 | Profile management | ✅ Edit profile, avatar, password change |
| 16 | Testing & optimization | ✅ Unit tests, lazy loading, bundle perf |
| 17 | Deployment | ✅ Docker compose, CI/CD, production config |
| 18 | Documentation & final polish | ✅ README, API docs, handoff notes |

---

## 8. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Scope creep (adding features mid-stage) | Medium | High | Strict one-stage-at-a-time rule; no stage starts without approval |
| No Git installed — no version control | High | Critical | Install Git before Stage 2; initialize repo immediately |
| PostgreSQL not installed locally | High | Medium | Docker Compose provides PostgreSQL container; no local install needed |
| JWT secret management in non-Git environment | Medium | High | Use `.env` files with strong defaults; `.env` in `.gitignore` |
| Team unfamiliarity with monorepo | Low | Medium | Clear package boundaries documented; pnpm workspace is intuitive |

---

## 9. Suggestions

1. **Use Docker Desktop** for PostgreSQL — avoids polluting the host machine with database servers and ensures identical environments.
2. **Start with `packages/shared`** before any application code — defining types and validators first prevents integration pain later.
3. **Install Git immediately in Stage 2** and make the first commit of the `PLAN.md` before any code is written.
4. **Pin Node.js version** via `.nvmrc` or `engines` field in root `package.json` for reproducibility.
5. **Use commit conventions** (e.g., Conventional Commits) from the first commit to build a clean changelog.

---

## 10. Preview of Stage 2

Stage 2 delivers the **working development environment**:
- Initialize pnpm monorepo with workspace config
- Scaffold `apps/api` with Express + TypeScript + Prisma
- Scaffold `apps/web` with React + Vite + Tailwind
- Create `packages/shared` with initial type definitions
- Configure Docker Compose for PostgreSQL
- Configure ESLint, Prettier, TypeScript base config
- Install Git, initialize repository, first commit
- Verify both apps start in development mode

---

*End of Stage 1 Plan*
