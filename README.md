# Realtime Task Collaboration System (Mini Trello)

A highly responsive, real-time task management board designed for small teams. This system allows users to create workspaces, invite members, and collaborate on tasks simultaneously with instant updates across all connected clients.

## 🚀 Tech Stack

- **Backend:** NestJS, REST API, WebSocket (Socket.IO)
- **Database:** PostgreSQL, Prisma ORM
- **Frontend:** React, TypeScript, Zustand (State Management), Socket.IO Client, Ant Design

## ✨ Features

- **Authentication & Authorization:** Secure user registration and login using JWT. Only authenticated users can access and manipulate data.
- **Workspace Management:** Users can create workspaces and invite other registered users to collaborate.
- **Task Management:** Create new tasks, update their status (TODO, IN_PROGRESS, DONE), and delete tasks within a workspace.
- **Real-Time Collaboration:** Any task mutations (create, update, delete) are instantly broadcasted to all members of the workspace without requiring a page reload.
- **Strict Data Isolation:** Users can only access data and receive real-time events for workspaces they are explicitly a part of. All requests and WebSocket events are rigorously validated.
- **Advanced Event Handling (Bonus Goals):**
  - Synchronization across multiple browser tabs.
  - Handling simultaneous edits on the same task.
  - Managing WebSocket connections when the JWT token expires.
  - Robust handling of network disconnects and reconnects.
  - Prevention of duplicate events and ensuring events do not leak across different workspaces.

## 🏗 High-Level Architecture

The frontend is cleanly separated into API interaction, WebSocket event handling, and state management layers. The backend provides a RESTful API for standard CRUD operations and initialization, while relying on WebSockets (Socket.IO) to push real-time updates.

- **Frontend Architecture:** Utilizes React for UI, Axios for standard API calls, Socket.IO client for real-time events, and Zustand for centralized state management.
- **Backend Architecture:** Built with NestJS. REST Controllers handle HTTP requests, while a dedicated WebSocket Gateway manages real-time connections, ensuring users only join "rooms" corresponding to workspaces they belong to.
- **Database:** PostgreSQL accessed via Prisma ORM ensures fast, reliable, and type-safe database operations.

## 📊 Database Schema

*(Please refer to the ERD image or schema setup in the backend)*
![alt text](manage_task_db.png)

## 🔄 Realtime Flow Diagram

[Insert realtime flow diagram here]

## 🛠 Running the Project

### Prerequisites
- Node.js (>= 16.x)
- npm (>= 7.x)
- Docker & Docker Compose (for PostgreSQL database)

### Backend Setup
1. Navigate to the `BE` directory: `cd BE`
2. Install dependencies: `npm install`
3. Start the PostgreSQL database: `docker-compose up -d`
4. Apply database migrations: `npm run db:push` or `npx prisma migrate dev`
5. Start the backend server: `npm run start:dev`

### Frontend Setup
1. Navigate to the `FE` directory: `cd FE`
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`

### Access the Application
Open your browser and navigate to `http://localhost:5173` (or the port specified by Vite).