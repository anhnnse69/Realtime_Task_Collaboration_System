<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

# Realtime Task Collaboration System - Backend (BE)

## Overview

The backend of the "Realtime Task Collaboration System" is built using **NestJS**. It provides a robust REST API for CRUD operations and utilizes **Socket.IO** for real-time communication. The backend ensures secure user authentication and workspace-level data isolation.

## System Requirements

- Node.js (>= 16.x)
- npm (>= 7.x)
- Docker (for database setup)

## Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd Realtime Task Collaboration System/BE
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up the database:**
   - Start the database using Docker:
     ```bash
     docker-compose up -d
     ```
   - Push the Prisma schema to the database:
     ```bash
     npm run db:push
     ```
   - Seed the database:
     ```bash
     npm run db:seed
     ```

4. **Run the backend server:**
   - Start the development server:
     ```bash
     npm run start:dev
     ```
   - The backend server will run at `http://localhost:3000`.

5. **Run tests:**
   - Execute end-to-end tests:
     ```bash
     npm run test:e2e
     ```

## Features

- **Authentication and Authorization:**
  - User registration and login using JWT.
  - Workspace-level access control.
- **Workspace Management:**
  - Create, update, and delete workspaces.
  - Invite members to workspaces.
- **Task Management:**
  - Create, update, and delete tasks.
  - Real-time updates for task changes using WebSocket.
- **Real-Time Communication:**
  - Broadcast task updates to all workspace members.
  - Handle multiple browser tabs and reconnections.

## Future Enhancements

- Implement advanced conflict resolution for simultaneous task edits.
- Enhance WebSocket reconnection strategies.
- Optimize database queries for scalability.

## Architecture Diagram

[Insert backend architecture diagram here]
