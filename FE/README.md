# Realtime Task Collaboration System - Frontend (FE)

## Overview

The frontend of the Realtime Task Collaboration System is built dynamically using **React** and **TypeScript**. 
It guarantees a responsive and seamless real-time user experience. The application architecture cleanly separates the concerns between:
- API Interactions (Axios)
- State Management (Zustand)
- Real-Time Events Handling (Socket.IO client)

## System Requirements

- Node.js (>= 16.x)
- npm (>= 7.x)

## Setup Instructions

1. **Navigate to the FE directory:**
   ```bash
   cd "Realtime Task Collaboration System/FE"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment:**
   Create a `.env` file referencing the backend endpoints, for example:
   ```env
   VITE_API_BASE_URL=http://localhost:3001
   ```

4. **Run the application:**
   - Start the Vite development server:
     ```bash
     npm run dev
     ```
   - The application will run at `http://localhost:5173` (or depending on exactly where Vite binds).

## Features

- **Authentication:**
  - Registration and Login interfaces handling JWT securely across API boundaries.
- **Real-Time Updates:**
  - Automatic updates natively to the UI without page reloads leveraging Socket.IO.
  - Efficiently handles background updates, multiple browser tabs concurrently, network disconnects and WebSocket reconnections.
- **Task Management:**
  - Instantly create, update (ex. statuses to TODO, IN_PROGRESS, DONE), and delete tasks.
- **Workspace Management:**
  - UI constructs to create distinct workspaces and securely invite members.

## Architecture Guidelines

- Separate layers strictly: Axios wrappers shouldn't mingle with UI components, and the Socket.IO event bindings should hydrate Zustand stores, allowing React to independently react to purely state changes.