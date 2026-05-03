# Phase 2 Implementation Doc

## Goal
Build core Agile features: Projects CRUD, Sprints, Tasks with Kanban, Activity logs, and member management.

## Completed (Phase 1)
- [x] Monorepo (Turborepo + pnpm workspaces)
- [x] NestJS API foundation (Auth, Users, Prisma v7)
- [x] Next.js frontend foundation (Auth pages, API client, React Query)
- [x] PostgreSQL via Docker
- [x] Prisma schema with all models

## Phase 2 Checklist

### Backend (NestJS API)
- [ ] ProjectsModule - CRUD + member invite/remove
- [ ] ProjectMemberGuard - verify user is project member
- [ ] ProjectRoleGuard - verify user has required project role
- [ ] SprintsModule - create/start/complete + burndown data
- [ ] TasksModule - CRUD + status updates + sprint assignment
- [ ] ActivityModule - log actions + fetch feed
- [ ] NotificationsModule - create + fetch + read status

### Frontend (Next.js)
- [ ] Dashboard - project cards with stats
- [ ] /projects/new - create project form
- [ ] /projects/[id] - Kanban board with drag-and-drop
- [ ] /projects/[id]/backlog - task list with sprint assignment
- [ ] /projects/[id]/sprints - sprint planner with burndown chart
- [ ] /projects/[id]/members - member list + invite form
- [ ] /supervisor/[id] - supervisor dashboard

### Testing
- [ ] Full sprint lifecycle: create → start → move tasks → complete

## File Structure (Phase 2 additions)

```
apps/api/src/
├── projects/
│   ├── dto/create-project.dto.ts
│   ├── dto/invite-member.dto.ts
│   ├── projects.service.ts
│   ├── projects.controller.ts
│   └── projects.module.ts
├── sprints/
│   ├── dto/create-sprint.dto.ts
│   ├── sprints.service.ts
│   ├── sprints.controller.ts
│   └── sprints.module.ts
├── tasks/
│   ├── dto/create-task.dto.ts
│   ├── dto/update-task.dto.ts
│   ├── dto/update-task-status.dto.ts
│   ├── dto/assign-sprint.dto.ts
│   ├── tasks.service.ts
│   ├── tasks.controller.ts
│   └── tasks.module.ts
├── activity/
│   ├── activity.service.ts
│   ├── activity.controller.ts
│   └── activity.module.ts
├── notifications/
│   ├── notifications.service.ts
│   ├── notifications.controller.ts
│   └── notifications.module.ts
└── common/
    └── guards/
        ├── project-member.guard.ts
        └── project-role.guard.ts

apps/web/src/
├── app/
│   └── (app)/
│       ├── dashboard/page.tsx
│       └── projects/
│           ├── new/page.tsx
│           └── [id]/
│               ├── page.tsx (Kanban)
│               ├── backlog/page.tsx
│               ├── sprints/page.tsx
│               └── members/page.tsx
├── components/
│   ├── board/
│   │   ├── KanbanBoard.tsx
│   │   ├── KanbanColumn.tsx
│   │   └── TaskCard.tsx
│   ├── tasks/
│   │   ├── CreateTaskForm.tsx
│   │   └── TaskDetailModal.tsx
│   ├── sprints/
│   │   ├── SprintPlanner.tsx
│   │   └── BurndownChart.tsx
│   └── shared/
│       ├── Sidebar.tsx
│       ├── NotificationBell.tsx
│       └── ActivityFeed.tsx
└── hooks/
    ├── useProjects.ts
    ├── useSprints.ts
    ├── useTasks.ts
    └── useNotifications.ts
```

## Implementation Order
1. Backend: ProjectsModule + Guards
2. Backend: SprintsModule
3. Backend: TasksModule
4. Backend: ActivityModule + NotificationsModule
5. Frontend: Dashboard + Project creation
6. Frontend: Kanban board
7. Frontend: Backlog + Sprints + Members
8. Testing
