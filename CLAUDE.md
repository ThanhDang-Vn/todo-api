# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run start:dev      # Dev server with hot reload (port 4000 by default)
npm run build          # Compile TypeScript to dist/
npm run lint           # ESLint with auto-fix
npm run format         # Prettier format all src/ and test/
npm test               # Jest unit tests (all *.spec.ts under src/)
npm run test:e2e       # E2E tests (test/jest-e2e.json config)
npm run test:cov       # Jest with coverage report (output: ../coverage/)
npm run seed           # Run Prisma seed script (src/seeding/seed.ts)
```

Run a single test file:
```bash
npx jest src/path/to/file.spec.ts
```

After adding or changing Prisma models:
```bash
npx prisma migrate dev --name <migration-name>   # Create & apply migration
npx prisma generate                               # Regenerate Prisma client
npx prisma migrate deploy                         # Apply migrations in prod/Docker
```

## Architecture

### Module Structure

Each feature lives in its own NestJS module under `src/`:

| Module | Path | Responsibility |
|---|---|---|
| `AppModule` | `src/app.module.ts` | Root module; wires all feature modules, `ConfigModule`, `ScheduleModule`, `EventEmitterModule` |
| `AuthModule` | `src/auth/` | JWT / Local / Google OAuth, token issuance, password reset via OTP |
| `UserModule` | `src/user/` | User CRUD, avatar upload, pagination |
| `CardModule` | `src/card/` | Card CRUD + `CardScheduleService` (cron) |
| `ColumnModule` | `src/column/` | Kanban column CRUD |
| `ReminderModule` | `src/reminder/` | Reminder records attached to cards |
| `SearchModule` | `src/search/` | Full-text card search |
| `NotificationsModule` | `src/notification/` | Email via Nodemailer (`EmailNotificationService`) |
| `CloudinaryModule` | `src/cloudinary/` | File/image upload to Cloudinary |
| `PrismaModule` | `src/prisma/` | Global `PrismaService` (injected directly, not re-exported as a module) |
| `MailModule` | `src/mail/` | Thin Nodemailer wrapper used by `AuthService` for OTP emails |

### Request Lifecycle

```
HTTP Request
  → ValidationPipe (whitelist + transform; global)
  → Controller (AuthGuard → Strategy → req.user populated)
  → Service (business logic via PrismaService)
  → Prisma ORM → PostgreSQL (Neon)
```

Global middleware: `cookieParser()`. CORS is locked to `http://localhost:3000`.

### Authentication

Three Passport strategies registered in `AuthModule`:
- **`local`** — validates email + password via `argon2.verify`; used on `POST /auth/login`
- **`jwt`** — reads Bearer token from `Authorization` header; guards most endpoints
- **`refresh-jwt`** — reads refresh token from request; used on `POST /auth/refresh`
- **`google`** — OAuth 2.0 via `passport-google-oauth20`; callback at `GET /auth/google/callback` redirects to `http://localhost:3000/api/auth/google/callback` with tokens in query params

Token storage: hashed refresh token (`argon2.hash`) is stored in `users.hashed_refresh_token`. On logout the field is set to `null`.

Password reset flow: `POST /auth/forgot-password` → 6-digit OTP stored in `password_reset_tokens` (5-min TTL) → `POST /auth/verify-otp` returns a short-lived JWT → `POST /auth/reset-password` verifies that JWT and updates the password.

### Scheduled Notifications (`CardScheduleService`)

`src/card/services/card-schedule.service.ts` runs `@Cron(EVERY_MINUTE)`:
1. Queries `cards` where `dueTo <= now` AND `isNotified = false`
2. Sets `isNotified = true` on each match
3. Emits `card.overdue` via `EventEmitter2` with `{ card, user }`
4. `EmailNotificationService` (`@OnEvent('card.overdue')`) sends email via Gmail SMTP using `EmailTemplateFactory`

### Card Views

`CardService` exposes four filtered views — all exclude cards where `completeAt IS NOT NULL` (except `getCompleteCards`):

| Method | Endpoint | Logic |
|---|---|---|
| `getInboxCards` | `GET /cards/inbox` | All columns for user, with nested non-complete cards |
| `getTodayCards` | `GET /cards/today` | Returns two groups: `Overdue` (dueTo < today) and `Today` |
| `getUpcommingCards` | `GET /cards/upcoming` | Cards from today through end of current week, grouped by day |
| `getCompleteCards` | `GET /cards/complete` | Completed cards grouped by ISO week (Monday as start) |

Card ordering uses sparse integer ordering (step 10000). New cards without an explicit `order` append at `lastCard.order + 10000`.

### Database Schema

```
User         — id (uuid), firstName, lastName, email (unique), password (argon2), hashedRefreshToken, avatarUrl, role (ADMIN|USER|EDITOR)
Column       — id, title, order, userId → User (cascade)
Card         — id, title, description, priority, order, dueTo, completeAt, isNotified, userId → User (cascade), columnId → Column (cascade)
Reminder     — id, cardId → Card (cascade), remindAt, isSent
PasswordResetToken — id, email (unique), token, expiresAt
```

### Known Issues

- **`GET /columns`** returns hardcoded Vietnamese vocabulary data — it is a leftover stub unrelated to the Todo domain.
- **Column endpoints** (`POST`, `PUT`, `DELETE`) have no `@UseGuards` — they are effectively public. `POST /columns` attempts to read `req.user.id` which will crash without an auth guard.
- `CardService.update` spreads the full `UpdateCardDto` directly into Prisma `data`, including `dateDue` which is not a valid Prisma field name (schema uses `dueTo`); check for drift when modifying update logic.

## Environment Variables

Create a `.env` file in this directory:

```
DATABASE_URL=postgresql://...          # Neon or local Postgres connection string
PORT=4000

JWT_SECRET=...
JWT_EXPIRE_IN=15m

REFRESH_JWT_SECRET=...
REFRESH_JWT_EXPIRE_IN=7d

GOOGLE_CLIENT_ID=...
GOOGLE_SECRET=...
GOOGLE_CALLBACK_URL=http://localhost:4000/auth/google/callback

MAIL_USER=...                          # Gmail address
MAIL_PASS=...                          # Gmail app password

CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```
