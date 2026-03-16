# Realtime Task Collaboration System — Backend

Built with **NestJS**, providing a REST API for CRUD operations and a Socket.IO WebSocket gateway for real-time event broadcasting.

---

## System Requirements

- Node.js >= 16.x
- npm >= 7.x
- Docker & Docker Compose (for PostgreSQL)

---

## Setup Instructions

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create a `.env` file in the `BE/` directory:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/taskdb"
JWT_SECRET="your_jwt_secret_here"
JWT_EXPIRES_IN="7d"
PORT=3000
```

### 3. Start the database

```bash
docker-compose up -d
```

This starts a PostgreSQL instance as defined in `docker-compose.yml`.

### 4. Apply the database schema

```bash
npm run db:push
# or, for migrations:
npx prisma migrate dev
```

### 5. (Optional) Seed the database

```bash
npm run db:seed
```

### 6. Start the development server

```bash
npm run start:dev
```

The server will be available at `http://localhost:3000`.

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run start:dev` | Start in watch mode (development) |
| `npm run start:prod` | Start compiled production build |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run db:push` | Push Prisma schema to the database |
| `npm run db:seed` | Seed the database with initial data |
| `npm run test:e2e` | Run end-to-end tests |
| `npm run lint` | Lint source files |

---

## Project Structure

```
BE/
├── src/
│   ├── auth/                # JWT auth module (register, login, guards)
│   ├── workspace/           # Workspace CRUD + member invite
│   ├── task/                # Task CRUD
│   ├── gateway/             # Socket.IO WebSocket gateway
│   ├── prisma/              # PrismaService
│   └── main.ts              # App bootstrap
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── seed.ts              # Seed script
├── test/                    # e2e tests
├── docker-compose.yml       # PostgreSQL container
├── .env                     # Environment variables (not committed)
└── package.json
```

---

## API Overview

### Auth

```
POST /auth/register    — Register a new user
POST /auth/login       — Login, returns JWT access token
```

### Workspaces *(requires Bearer token)*

```
GET  /workspaces              — List workspaces the user belongs to
POST /workspaces              — Create a new workspace
POST /workspaces/:id/invite   — Invite a user by email
```

### Tasks *(requires Bearer token + workspace membership)*

```
GET    /workspaces/:id/tasks              — List all tasks in a workspace
POST   /workspaces/:id/tasks              — Create a new task
PATCH  /workspaces/:id/tasks/:taskId      — Update task title or status
DELETE /workspaces/:id/tasks/:taskId      — Delete a task
```

---

## WebSocket Gateway

The Socket.IO gateway runs on the same port as the HTTP server.

**Connection:** pass the JWT in the handshake `auth` field:

```js
const socket = io('http://localhost:3000', {
  auth: { token: '<jwt>' }
});
```

**Events emitted to workspace rooms:**

| Event | Trigger |
|---|---|
| `task:created` | A task is created in the workspace |
| `task:updated` | A task is updated |
| `task:deleted` | A task is deleted |

Rooms are keyed by `workspaceId`. The server validates membership before joining a socket to any room.

---

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/db` |
| `JWT_SECRET` | Secret key for signing JWTs | `supersecretkey` |
| `JWT_EXPIRES_IN` | Token expiry duration | `7d` |
| `PORT` | HTTP server port | `3000` |