# Realtime Task Collaboration System — Frontend

Built with **React** and **TypeScript**, with a clean separation between API interactions (Axios), real-time event handling (Socket.IO client), and state management (Zustand).

---

## System Requirements

- Node.js >= 16.x
- npm >= 7.x

---

## Setup Instructions

### 1. Navigate to the frontend directory

```bash
cd FE
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

Create a `.env` file in the `FE/` directory:

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
```

> Make sure the backend server is running before starting the frontend.

### 4. Start the development server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start Vite development server with HMR |
| `npm run build` | Compile and bundle for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Lint source files with ESLint |

---

## Project Structure

```
FE/
├── src/
│   ├── api/              # Axios instance and API call wrappers
│   │   ├── auth.ts
│   │   ├── workspace.ts
│   │   └── task.ts
│   ├── socket/           # Socket.IO client setup and event bindings
│   │   └── socket.ts
│   ├── store/            # Zustand state stores
│   │   ├── authStore.ts
│   │   ├── workspaceStore.ts
│   │   └── taskStore.ts
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── WorkspacePage.tsx
│   │   └── BoardPage.tsx
│   ├── components/
│   │   ├── TaskCard.tsx
│   │   ├── TaskColumn.tsx
│   │   └── InviteMemberModal.tsx
│   ├── App.tsx
│   └── main.tsx
├── .env                  # Environment variables (not committed)
├── index.html
├── vite.config.ts
└── package.json
```

---

## Architecture

The frontend enforces strict layer separation:

- **`src/api/`** — Axios wrappers for all HTTP calls. These functions are the only place that imports Axios. UI components never call Axios directly.
- **`src/socket/`** — Initializes the Socket.IO client with the JWT token and binds all incoming server events. On receiving an event (e.g. `task:created`), it calls the appropriate Zustand store action to update state.
- **`src/store/`** — Zustand stores hold all application state. React components subscribe to store slices and re-render only when their relevant state changes.
- **`src/pages/` and `src/components/`** — Pure UI layer. They read from Zustand stores and dispatch actions or API calls on user interaction.

```
User Action
    │
    ▼
React Component
    │
    ├── API call → src/api/ (Axios) → Backend REST
    │
    └── Zustand store.action()
              ▲
              │
    Socket.IO event (src/socket/) ← Backend WebSocket
```

---

## Real-Time Behavior

- On login, the Socket.IO client connects to the server with the JWT in the `auth` field.
- The client emits `workspace:join` for each workspace the user belongs to.
- Incoming events (`task:created`, `task:updated`, `task:deleted`) automatically update the Zustand task store, causing the board UI to re-render without a page reload.

### Edge Cases Handled

| Scenario | Handling |
|---|---|
| Multiple browser tabs | Each tab maintains its own socket; Zustand state is independent per tab; all tabs receive the same server events |
| Network disconnect | Socket.IO client auto-reconnects; on `connect` event, the client re-emits `workspace:join` |
| JWT expiry | Axios interceptor catches 401 responses; prompts re-login and reconnects the socket with a new token |
| Duplicate events | Task store uses upsert-by-id logic; duplicate events do not create duplicate UI entries |

---

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `VITE_API_BASE_URL` | Base URL for all REST API calls | `http://localhost:3000` |
| `VITE_SOCKET_URL` | URL for the Socket.IO server | `http://localhost:3000` |