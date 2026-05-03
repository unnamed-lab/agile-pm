# APMS - All Phases Todo List

## Phase 1: Foundation (Week 1-2) ✅
- [x] Bootstrap Turborepo monorepo
- [x] Create NestJS `apps/api`
- [x] Create Next.js `apps/web`
- [x] Set up `packages/database` with full Prisma schema
- [x] Run first migration (`pnpm db:migrate`)
- [x] Implement `PrismaModule` (global)
- [x] Implement `AuthModule` (register, login, JWT)
- [x] Implement `UsersModule` (me, update)
- [x] Implement `JwtAuthGuard`, `JwtStrategy`
- [x] Build login page with form validation
- [x] Build register page with role selection
- [x] Set up Axios API client with token injection
- [x] Set up TanStack Query provider
- [x] Test: register → login → /auth/me returns user
- [x] Set up Husky pre-commit hooks
- [x] Push to GitHub: https://github.com/unnamed-lab/agile-pm.git

---

## Phase 2: Core Features (Week 3-5) 🔄
### Backend (NestJS API)
- [ ] Implement `ProjectsModule` (CRUD + member management)
- [ ] Implement `ProjectMemberGuard` and `ProjectRoleGuard`
- [ ] Implement `SprintsModule` (create/start/complete)
- [ ] Implement `TasksModule` (CRUD + status + sprint assignment)
- [ ] Implement `ActivityModule` (log + fetch)
- [ ] Implement `NotificationsModule` (create + fetch + read status)

### Frontend (Next.js)
- [ ] Build `/dashboard` with project cards
- [ ] Build `/projects/new` form
- [ ] Build `/projects/[id]` Kanban board with drag-and-drop
- [ ] Build `/projects/[id]/backlog` with sprint assignment
- [ ] Build `/projects/[id]/sprints` with sprint planner
- [ ] Build `/projects/[id]/members` with invite form
- [ ] Build `/supervisor/[id]` dashboard

### Testing
- [ ] Test: full sprint lifecycle — create → start → move tasks → complete

---

## Phase 3: Progress & Notifications (Week 6-7) 🔄
### Backend
- [ ] Wire notifications into sprint and task events
- [ ] Implement `GET /sprints/:id/burndown` endpoint
- [ ] Add `@Cron` daily snapshot job
- [ ] Build `BurndownChart` component
- [ ] Build `NotificationBell` with unread count
- [ ] Build `ActivityFeed` component

### Frontend
- [ ] Build `/supervisor/[id]` dashboard with stats
- [ ] Add progress bars to project cards
- [ ] Test: supervisor can view progress without edit access

---

## Phase 4: Polish & Evaluation (Week 8) 🔄
### Polish
- [ ] Add loading skeletons to all data-fetching pages
- [ ] Add error boundaries and user-friendly error messages
- [ ] Add empty state UI for projects, backlog, sprints
- [ ] Test on mobile viewports, fix layout issues

### Deployment
- [ ] Dockerize API (write `Dockerfile`)
- [ ] Deploy API to Railway/Render
- [ ] Deploy frontend to Vercel
- [ ] Run UAT with 5–10 student testers
- [ ] Collect usability questionnaire responses
- [ ] Fix top-priority issues from UAT
- [ ] Capture screenshots for Chapter 4 report
- [ ] Write unit tests for key service methods

---

## Current Focus: Phase 2
**In Progress:**
- Implementing ProjectsModule (CRUD + member management)
- Implementing ProjectMemberGuard and ProjectRoleGuard

**Next Steps:**
1. Create ProjectsModule DTOs
2. Create ProjectsService
3. Create ProjectsController
4. Create ProjectMemberGuard
5. Create ProjectRoleGuard
6. Create ProjectRole decorator
