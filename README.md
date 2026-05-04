# Agile PM

A modern, professional Agile project management platform built for engineering teams. Agile PM combines Kanban boards, sprint management, and deep analytics into a single, streamlined workspace.

[![NestJS](https://img.shields.io/badge/NestJS-10.0-red?style=flat&logo=nestjs)](https://nestjs.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat&logo=next.js)](https://nextjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7.1.0-white?style=flat&logo=prisma)](https://prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue?style=flat&logo=postgresql)](https://www.postgresql.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38bdf8?style=flat&logo=tailwindcss)](https://tailwindcss.com/)

---

## Features

- **Kanban Boards** - Drag-and-drop task boards with columns (To Do, In Progress, In Review, Done)
- **Sprint Management** - Plan, start, and close sprints with lifecycle control and velocity tracking
- **Advanced Analytics** - Burndown charts, Gantt timelines, Pareto, PERT, and control charts
- **Team Collaboration** - Invite members, assign roles (Scrum Master, Developer, Supervisor)
- **Role-Based Access** - Fine-grained permissions (Student, Supervisor, Admin)
- **Backlog Management** - Manage product backlog, assign story points, prioritize tasks
- **Activity Logs** - Track all project activities with detailed metadata
- **Notifications** - Real-time notifications for task assignments, sprint events, and project updates

---

## Tech Stack

| Layer | Technology |
|-------|-------------|
| **Frontend** | Next.js 14+ (App Router), TypeScript, Tailwind CSS, shadcn/ui, Lucide React |
| **Backend** | NestJS 10+, TypeScript, Passport.js, bcrypt |
| **Database** | PostgreSQL 15+, Prisma ORM 7+ (Rust-free client) |
| **Auth** | NextAuth.js (JWT strategy), NestJS JWT |
| **Monorepo** | Turborepo, pnpm workspaces |
| **Testing** | Jest, Supertest (e2e) |

---

## Monorepo Structure

```
agile-pm/
├── apps/
│   ├── api/              # NestJS API (port 4000)
│   │   ├── src/
│   │   │   ├── auth/          # JWT auth, login/register
│   │   │   ├── users/         # User management
│   │   │   ├── projects/     # Project CRUD, member management
│   │   │   ├── sprints/      # Sprint lifecycle management
│   │   │   ├── tasks/        # Task CRUD, Kanban board
│   │   │   ├── activity/     # Activity logging
│   │   │   └── notifications/ # Real-time notifications
│   │   └── test/            # e2e and unit tests
│   └── web/             # Next.js frontend (port 3000)
│       └── src/
│           ├── app/           # Next.js App Router
│           │   ├── (app)/      # Protected app routes
│           │   ├── (auth)/     # Login/register pages
│           │   └── api/        # API routes (NextAuth, notifications)
│           ├── components/     # React components
│           ├── lib/           # Utilities (API client, auth config)
│           └── providers/     # React context providers
├── packages/
│   ├── database/         # Prisma schema, migrations, seed
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   ├── seed.ts
│   │   │   └── migrations/
│   │   └── generated/       # Prisma Client (auto-generated, gitignored)
│   └── types/            # Shared TypeScript types
├── .gitignore
├── package.json          # Root workspace config
├── turbo.json           # Turborepo config
└── README.md
```

---

## Prerequisites

- Node.js >= 22.0.0
- pnpm >= 9.0.0
- PostgreSQL >= 15.0.0 (running on port 5433 or update `.env`)

---

## Environment Variables

### API (`apps/api/.env`)

```env
DATABASE_URL="postgresql://user:password@localhost:5433/agilepm_db"
JWT_SECRET="your-super-secret-jwt-key-at-least-32-characters"
JWT_EXPIRY="7d"
PORT=4000
FRONTEND_URL="http://localhost:3000"
NODE_ENV="development"
```

### Web (`apps/web/.env.local`)

```env
NEXT_PUBLIC_API_URL="http://localhost:4000/api/v1"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-at-least-32-chars"
```

---

## Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/unnamed-lab/agile-pm.git
cd agile-pm
pnpm install
```

### 2. Database Setup

```bash
# Create PostgreSQL database
createdb agilepm_db  # or use psql: CREATE DATABASE agilepm_db;

# Generate Prisma client (auto-runs via postinstall)
pnpm db:generate

# Run migrations
pnpm db:migrate

# Seed database with test accounts
cd packages/database && npx tsx prisma/seed.ts
```

### 3. Development

```bash
# Start both API and web in development mode
pnpm dev

# Or start individually:
pnpm --filter api dev    # API on :4000
pnpm --filter web dev   # Web on :3000
```

### 4. Test Accounts (from seed)

| Email | Password | Role |
|-------|----------|------|
| `admin@agilepm.dev` | `Admin@1234` | ADMIN |
| `dr.ada@agilepm.dev` | `Supervisor@1234` | SUPERVISOR |
| `prof.james@agilepm.dev` | `Supervisor@1234` | SUPERVISOR |
| `tunde@agilepm.dev` | `Student@1234` | STUDENT (Scrum Master) |
| `ngozi@agilepm.dev` | `Student@1234` | STUDENT (Developer) |
| `emeka@agilepm.dev` | `Student@1234` | STUDENT (Developer) |
| `amara@agilepm.dev` | `Student@1234` | STUDENT (Developer) |
| `chisom@agilepm.dev` | `Student@1234` | STUDENT (Developer) |

---

## Available Scripts

### Root

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start all apps in development mode (via Turborepo) |
| `pnpm build` | Build all apps for production |
| `pnpm lint` | Lint all apps |
| `pnpm test` | Run all tests |
| `pnpm db:generate` | Generate Prisma client |
| `pnpm db:migrate` | Run database migrations |
| `pnpm db:studio` | Open Prisma Studio |

### API (`apps/api`)

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start NestJS in watch mode |
| `pnpm build` | Build for production |
| `pnpm start` | Start production build |
| `pnpm test` | Run Jest tests |
| `pnpm test:e2e` | Run end-to-end tests |

### Web (`apps/web`)

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start Next.js development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |

---

## Data Model

### Core Entities

- **User** - System users with roles (STUDENT, SUPERVISOR, ADMIN)
- **Project** - Agile projects with supervisor and active sprint tracking
- **ProjectMember** - Many-to-many relationship with roles (SCRUM_MASTER, DEVELOPER)
- **Sprint** - Time-boxed iterations with status (PLANNED, ACTIVE, COMPLETED)
- **Task** - Work items with Kanban status, priority, story points
- **Notification** - User notifications for project events
- **ActivityLog** - Audit trail for all project activities

### Enums

```prisma
enum SystemRole { STUDENT, SUPERVISOR, ADMIN }
enum ProjectRole { SCRUM_MASTER, DEVELOPER }
enum SprintStatus { PLANNED, ACTIVE, COMPLETED }
enum TaskStatus { TODO, IN_PROGRESS, IN_REVIEW, DONE }
enum Priority { LOW, MEDIUM, HIGH, CRITICAL }
```

---

## API Endpoints

### Auth

- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login and receive JWT
- `GET /api/v1/auth/me` - Get current user (protected)

### Projects

- `GET /api/v1/projects` - List user's projects
- `POST /api/v1/projects` - Create new project
- `GET /api/v1/projects/:id` - Get project details
- `PATCH /api/v1/projects/:id` - Update project
- `POST /api/v1/projects/:id/members` - Invite member
- `DELETE /api/v1/projects/:id/members/:userId` - Remove member

### Sprints

- `GET /api/v1/projects/:projectId/sprints` - List sprints
- `POST /api/v1/projects/:projectId/sprints` - Create sprint
- `PATCH /api/v1/projects/:projectId/sprints/:sprintId` - Update sprint
- `POST /api/v1/projects/:projectId/sprints/:sprintId/start` - Start sprint
- `POST /api/v1/projects/:projectId/sprints/:sprintId/complete` - Complete sprint
- `GET /api/v1/projects/:projectId/sprints/:sprintId/burndown` - Get burndown data

### Tasks

- `GET /api/v1/projects/:projectId/tasks` - List tasks
- `POST /api/v1/projects/:projectId/tasks` - Create task
- `GET /api/v1/projects/:projectId/tasks/:taskId` - Get task details
- `PATCH /api/v1/projects/:projectId/tasks/:taskId` - Update task
- `PATCH /api/v1/projects/:projectId/tasks/:taskId/move` - Move task (Kanban)

---

## Testing

```bash
# Run all tests
pnpm test

# API unit tests
cd apps/api && pnpm test

# API e2e tests
cd apps/api && pnpm test:e2e
```

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Build process or auxiliary tool changes

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Support

For support, email support@agilepm.dev or open an issue on GitHub.

---

*Built with ❤️ for Agile teams*
