import 'dotenv/config';
import { PrismaClient } from '../generated/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function hash(password: string) {
  return bcrypt.hash(password, 12);
}

async function main() {
  console.log('🌱 Seeding database...');

  // ── Users ────────────────────────────────────────────────────────────────
  const [admin, supervisor1, supervisor2, sm1, dev1, dev2, dev3, student1] =
    await Promise.all([
      prisma.user.upsert({
        where: { email: 'admin@agilepm.dev' },
        update: {},
        create: {
          name: 'Admin User',
          email: 'admin@agilepm.dev',
          passwordHash: await hash('Admin@1234'),
          role: 'ADMIN',
        },
      }),
      prisma.user.upsert({
        where: { email: 'dr.ada@agilepm.dev' },
        update: {},
        create: {
          name: 'Dr. Ada Okafor',
          email: 'dr.ada@agilepm.dev',
          passwordHash: await hash('Supervisor@1234'),
          role: 'SUPERVISOR',
        },
      }),
      prisma.user.upsert({
        where: { email: 'prof.james@agilepm.dev' },
        update: {},
        create: {
          name: 'Prof. James Eze',
          email: 'prof.james@agilepm.dev',
          passwordHash: await hash('Supervisor@1234'),
          role: 'SUPERVISOR',
        },
      }),
      prisma.user.upsert({
        where: { email: 'tunde@agilepm.dev' },
        update: {},
        create: {
          name: 'Tunde Adeyemi',
          email: 'tunde@agilepm.dev',
          passwordHash: await hash('Student@1234'),
          role: 'STUDENT',
        },
      }),
      prisma.user.upsert({
        where: { email: 'ngozi@agilepm.dev' },
        update: {},
        create: {
          name: 'Ngozi Obi',
          email: 'ngozi@agilepm.dev',
          passwordHash: await hash('Student@1234'),
          role: 'STUDENT',
        },
      }),
      prisma.user.upsert({
        where: { email: 'emeka@agilepm.dev' },
        update: {},
        create: {
          name: 'Emeka Nwosu',
          email: 'emeka@agilepm.dev',
          passwordHash: await hash('Student@1234'),
          role: 'STUDENT',
        },
      }),
      prisma.user.upsert({
        where: { email: 'amara@agilepm.dev' },
        update: {},
        create: {
          name: 'Amara Diallo',
          email: 'amara@agilepm.dev',
          passwordHash: await hash('Student@1234'),
          role: 'STUDENT',
        },
      }),
      prisma.user.upsert({
        where: { email: 'chisom@agilepm.dev' },
        update: {},
        create: {
          name: 'Chisom Eze',
          email: 'chisom@agilepm.dev',
          passwordHash: await hash('Student@1234'),
          role: 'STUDENT',
        },
      }),
    ]);

  console.log(`✓ Created ${8} users`);

  // ── Projects ─────────────────────────────────────────────────────────────
  const project1 = await prisma.project.upsert({
    where: { id: 'seed-project-001' },
    update: {},
    create: {
      id: 'seed-project-001',
      name: 'Student Portal Redesign',
      description:
        'A complete overhaul of the university student portal — modern UI, mobile-first, improved performance.',
      supervisorId: supervisor1.id,
      members: {
        create: [
          { userId: sm1.id, role: 'SCRUM_MASTER' },
          { userId: dev1.id, role: 'DEVELOPER' },
          { userId: dev2.id, role: 'DEVELOPER' },
          { userId: dev3.id, role: 'DEVELOPER' },
        ],
      },
    },
  });

  const project2 = await prisma.project.upsert({
    where: { id: 'seed-project-002' },
    update: {},
    create: {
      id: 'seed-project-002',
      name: 'Campus Event Management System',
      description:
        'A platform for creating, managing and RSVPing to campus events with notifications and calendar sync.',
      supervisorId: supervisor2.id,
      members: {
        create: [
          { userId: dev2.id, role: 'SCRUM_MASTER' },
          { userId: student1.id, role: 'DEVELOPER' },
          { userId: dev3.id, role: 'DEVELOPER' },
        ],
      },
    },
  });

  console.log(`✓ Created 2 projects`);

  // ── Sprints — Project 1 ───────────────────────────────────────────────────
  const now = new Date();
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const oneWeekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const threeWeeksLater = new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000);

  const sprint1 = await prisma.sprint.upsert({
    where: { id: 'seed-sprint-001' },
    update: {},
    create: {
      id: 'seed-sprint-001',
      projectId: project1.id,
      name: 'Sprint 1 — Discovery & Setup',
      goal: 'Establish project foundation, finalize tech stack, and complete user research.',
      startDate: twoWeeksAgo,
      endDate: oneWeekAgo,
      status: 'COMPLETED',
    },
  });

  const sprint2 = await prisma.sprint.upsert({
    where: { id: 'seed-sprint-002' },
    update: {},
    create: {
      id: 'seed-sprint-002',
      projectId: project1.id,
      name: 'Sprint 2 — Core Features',
      goal: 'Implement authentication, dashboard, and student profile pages.',
      startDate: oneWeekAgo,
      endDate: oneWeekLater,
      status: 'ACTIVE',
    },
  });

  const sprint3 = await prisma.sprint.upsert({
    where: { id: 'seed-sprint-003' },
    update: {},
    create: {
      id: 'seed-sprint-003',
      projectId: project1.id,
      name: 'Sprint 3 — Polish & Launch',
      goal: 'Final testing, accessibility audit, performance optimisation and deployment.',
      startDate: oneWeekLater,
      endDate: threeWeeksLater,
      status: 'PLANNED',
    },
  });

  // Sprint for project 2
  const sprint4 = await prisma.sprint.upsert({
    where: { id: 'seed-sprint-004' },
    update: {},
    create: {
      id: 'seed-sprint-004',
      projectId: project2.id,
      name: 'Sprint 1 — MVP',
      goal: 'Event creation, RSVP flow, and admin dashboard.',
      startDate: oneWeekAgo,
      endDate: oneWeekLater,
      status: 'ACTIVE',
    },
  });

  // Update project1 activeSprintId
  await prisma.project.update({
    where: { id: project1.id },
    data: { activeSprintId: sprint2.id },
  });
  await prisma.project.update({
    where: { id: project2.id },
    data: { activeSprintId: sprint4.id },
  });

  console.log(`✓ Created 4 sprints`);

  // ── Tasks — Project 1, Sprint 1 (COMPLETED) ───────────────────────────────
  const s1Tasks = [
    { title: 'Set up monorepo with Turborepo', status: 'DONE' as const, priority: 'HIGH' as const, storyPoints: 5, assigneeId: sm1.id },
    { title: 'Configure NestJS API boilerplate', status: 'DONE' as const, priority: 'HIGH' as const, storyPoints: 3, assigneeId: dev1.id },
    { title: 'Configure Next.js frontend', status: 'DONE' as const, priority: 'HIGH' as const, storyPoints: 3, assigneeId: dev2.id },
    { title: 'Database schema design', status: 'DONE' as const, priority: 'HIGH' as const, storyPoints: 8, assigneeId: sm1.id },
    { title: 'User research interviews (5 students)', status: 'DONE' as const, priority: 'MEDIUM' as const, storyPoints: 5, assigneeId: dev3.id },
    { title: 'Wireframes for core pages', status: 'DONE' as const, priority: 'MEDIUM' as const, storyPoints: 5, assigneeId: dev2.id },
  ];

  // ── Tasks — Project 1, Sprint 2 (ACTIVE) ─────────────────────────────────
  const s2Tasks = [
    { title: 'Implement JWT authentication', status: 'DONE' as const, priority: 'HIGH' as const, storyPoints: 8, assigneeId: sm1.id },
    { title: 'Build student login/register pages', status: 'DONE' as const, priority: 'HIGH' as const, storyPoints: 5, assigneeId: dev1.id },
    { title: 'Dashboard overview page', status: 'IN_PROGRESS' as const, priority: 'HIGH' as const, storyPoints: 8, assigneeId: dev2.id },
    { title: 'Notifications system (API + UI)', status: 'IN_PROGRESS' as const, priority: 'MEDIUM' as const, storyPoints: 5, assigneeId: dev3.id },
    { title: 'Student profile page', status: 'IN_REVIEW' as const, priority: 'MEDIUM' as const, storyPoints: 5, assigneeId: dev1.id },
    { title: 'Course enrollment UI', status: 'TODO' as const, priority: 'MEDIUM' as const, storyPoints: 8, assigneeId: dev2.id },
    { title: 'Grade view page', status: 'TODO' as const, priority: 'LOW' as const, storyPoints: 3, assigneeId: dev3.id },
    { title: 'Mobile responsive layout', status: 'TODO' as const, priority: 'HIGH' as const, storyPoints: 5, assigneeId: dev1.id },
  ];

  // ── Tasks — Project 1, Backlog (no sprint) ───────────────────────────────
  const backlogTasks = [
    { title: 'Dark mode support', status: 'TODO' as const, priority: 'LOW' as const, storyPoints: 5, assigneeId: dev2.id },
    { title: 'Export grades to PDF', status: 'TODO' as const, priority: 'LOW' as const, storyPoints: 3, assigneeId: dev3.id },
    { title: 'Push notification integration', status: 'TODO' as const, priority: 'MEDIUM' as const, storyPoints: 8, assigneeId: dev1.id },
  ];

  // ── Tasks — Project 2, Sprint 4 ───────────────────────────────────────────
  const s4Tasks = [
    { title: 'Event creation form', status: 'DONE' as const, priority: 'HIGH' as const, storyPoints: 5, assigneeId: dev2.id },
    { title: 'RSVP flow (accept/decline)', status: 'IN_PROGRESS' as const, priority: 'HIGH' as const, storyPoints: 8, assigneeId: student1.id },
    { title: 'Admin event dashboard', status: 'TODO' as const, priority: 'MEDIUM' as const, storyPoints: 5, assigneeId: dev3.id },
    { title: 'Email notifications for events', status: 'TODO' as const, priority: 'MEDIUM' as const, storyPoints: 3, assigneeId: dev2.id },
  ];

  let taskPos = 1000;

  async function createTask(
    projectId: string,
    sprintId: string | null,
    t: { title: string; status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE'; priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'; storyPoints: number; assigneeId: string },
    creatorId: string,
  ) {
    taskPos += 1000;
    return prisma.task.create({
      data: {
        projectId,
        sprintId,
        title: t.title,
        status: t.status,
        priority: t.priority,
        storyPoints: t.storyPoints,
        assigneeId: t.assigneeId,
        creatorId,
        position: taskPos,
      },
    });
  }

  taskPos = 0;
  for (const t of s1Tasks) await createTask(project1.id, sprint1.id, t, sm1.id);
  for (const t of s2Tasks) await createTask(project1.id, sprint2.id, t, sm1.id);
  for (const t of backlogTasks) await createTask(project1.id, null, t, sm1.id);
  for (const t of s4Tasks) await createTask(project2.id, sprint4.id, t, dev2.id);

  console.log(`✓ Created ${s1Tasks.length + s2Tasks.length + backlogTasks.length + s4Tasks.length} tasks`);

  // ── Activity logs ─────────────────────────────────────────────────────────
  await prisma.activityLog.createMany({
    data: [
      { projectId: project1.id, userId: sm1.id, action: 'PROJECT_CREATED', metadata: { projectName: project1.name } },
      { projectId: project1.id, userId: sm1.id, action: 'SPRINT_CREATED', metadata: { sprintName: sprint1.name } },
      { projectId: project1.id, userId: sm1.id, action: 'SPRINT_STARTED', metadata: { sprintName: sprint1.name } },
      { projectId: project1.id, userId: sm1.id, action: 'SPRINT_COMPLETED', metadata: { sprintName: sprint1.name, movedToBacklog: 0 } },
      { projectId: project1.id, userId: sm1.id, action: 'SPRINT_CREATED', metadata: { sprintName: sprint2.name } },
      { projectId: project1.id, userId: sm1.id, action: 'SPRINT_STARTED', metadata: { sprintName: sprint2.name } },
      { projectId: project2.id, userId: dev2.id, action: 'PROJECT_CREATED', metadata: { projectName: project2.name } },
      { projectId: project2.id, userId: dev2.id, action: 'SPRINT_CREATED', metadata: { sprintName: sprint4.name } },
      { projectId: project2.id, userId: dev2.id, action: 'SPRINT_STARTED', metadata: { sprintName: sprint4.name } },
    ],
    skipDuplicates: true,
  });

  console.log(`✓ Created activity logs`);

  // ── Notifications ─────────────────────────────────────────────────────────
  await prisma.notification.createMany({
    data: [
      {
        userId: dev1.id,
        title: 'Task Assigned',
        message: 'You have been assigned to: Implement JWT authentication',
        link: `/projects/${project1.id}`,
        isRead: true,
      },
      {
        userId: dev2.id,
        title: 'Sprint Started',
        message: `Sprint "Sprint 2 — Core Features" has started!`,
        link: `/projects/${project1.id}`,
        isRead: false,
      },
      {
        userId: dev3.id,
        title: 'Sprint Started',
        message: `Sprint "Sprint 2 — Core Features" has started!`,
        link: `/projects/${project1.id}`,
        isRead: false,
      },
      {
        userId: student1.id,
        title: 'Project Invitation',
        message: `You have been added to project: ${project2.name}`,
        link: `/projects/${project2.id}`,
        isRead: false,
      },
    ],
    skipDuplicates: true,
  });

  console.log(`✓ Created notifications`);

  console.log('\n✅ Seed complete!\n');
  console.log('─────────────────────────────────────────');
  console.log('Test accounts (all passwords follow pattern):');
  console.log('  admin@agilepm.dev        Admin@1234      (ADMIN)');
  console.log('  dr.ada@agilepm.dev       Supervisor@1234 (SUPERVISOR)');
  console.log('  prof.james@agilepm.dev   Supervisor@1234 (SUPERVISOR)');
  console.log('  tunde@agilepm.dev        Student@1234    (STUDENT / Scrum Master)');
  console.log('  ngozi@agilepm.dev        Student@1234    (STUDENT / Developer)');
  console.log('  emeka@agilepm.dev        Student@1234    (STUDENT / Developer)');
  console.log('  amara@agilepm.dev        Student@1234    (STUDENT / Developer)');
  console.log('  chisom@agilepm.dev       Student@1234    (STUDENT / Developer)');
  console.log('─────────────────────────────────────────');
}

main()
  .catch(e => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
