import 'dotenv/config';
import { PrismaClient } from '../generated/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

const isRemote = process.env.DATABASE_URL?.includes('render.com') || process.env.DATABASE_URL?.includes('sslmode');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isRemote ? { rejectUnauthorized: false } : undefined,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function hash(password: string) {
  return bcrypt.hash(password, 12);
}

async function main() {
  console.log('🌱 Seeding rich projects & chart data into database...');

  // Clear existing tasks, activity logs, and notifications to prevent duplicates
  await prisma.activityLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.task.deleteMany({});

  // ── 1. USERS ─────────────────────────────────────────────────────────────
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

  console.log(`✓ Seeded ${8} users`);

  // ── 2. PROJECTS ───────────────────────────────────────────────────────────
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

  const project3 = await prisma.project.upsert({
    where: { id: 'seed-project-003' },
    update: {},
    create: {
      id: 'seed-project-003',
      name: 'AI Course Recommendation Engine',
      description:
        'Machine learning powered system predicting course matches based on student academic history and interests.',
      supervisorId: supervisor1.id,
      members: {
        create: [
          { userId: sm1.id, role: 'SCRUM_MASTER' },
          { userId: dev1.id, role: 'DEVELOPER' },
          { userId: student1.id, role: 'DEVELOPER' },
        ],
      },
    },
  });

  const project4 = await prisma.project.upsert({
    where: { id: 'seed-project-004' },
    update: {},
    create: {
      id: 'seed-project-004',
      name: 'Library Resource & Booking API',
      description:
        'Microservice suite for booking study spaces, reserving books, and checking seat availability in real-time.',
      supervisorId: supervisor2.id,
      members: {
        create: [
          { userId: dev3.id, role: 'SCRUM_MASTER' },
          { userId: dev2.id, role: 'DEVELOPER' },
          { userId: dev1.id, role: 'DEVELOPER' },
        ],
      },
    },
  });

  console.log(`✓ Seeded 4 projects`);

  // ── 3. SPRINTS & DATES ───────────────────────────────────────────────────
  const now = new Date();
  const daysAgo = (d: number) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000);
  const daysAhead = (d: number) => new Date(now.getTime() + d * 24 * 60 * 60 * 1000);

  // Project 1 Sprints
  const p1Sprint1 = await prisma.sprint.upsert({
    where: { id: 'seed-sprint-001' },
    update: {},
    create: {
      id: 'seed-sprint-001',
      projectId: project1.id,
      name: 'Sprint 1 — Discovery & Architecture',
      goal: 'Establish project foundation, setup Turborepo monorepo, and complete research.',
      startDate: daysAgo(21),
      endDate: daysAgo(7),
      status: 'COMPLETED',
      color: '#3B82F6',
    },
  });

  const p1Sprint2 = await prisma.sprint.upsert({
    where: { id: 'seed-sprint-002' },
    update: {},
    create: {
      id: 'seed-sprint-002',
      projectId: project1.id,
      name: 'Sprint 2 — Core Modules & Auth',
      goal: 'Implement authentication, student dashboard overview, and grade tracking.',
      startDate: daysAgo(7),
      endDate: daysAhead(7),
      status: 'ACTIVE',
      color: '#10B981',
    },
  });

  const p1Sprint3 = await prisma.sprint.upsert({
    where: { id: 'seed-sprint-003' },
    update: {},
    create: {
      id: 'seed-sprint-003',
      projectId: project1.id,
      name: 'Sprint 3 — Polish & Deployment',
      goal: 'Final QA, accessibility compliance, push notifications, and production release.',
      startDate: daysAhead(7),
      endDate: daysAhead(21),
      status: 'PLANNED',
      color: '#8B5CF6',
    },
  });

  // Project 2 Sprints
  const p2Sprint1 = await prisma.sprint.upsert({
    where: { id: 'seed-sprint-004' },
    update: {},
    create: {
      id: 'seed-sprint-004',
      projectId: project2.id,
      name: 'Sprint 1 — MVP Event Feed',
      goal: 'Deliver event publishing form, public feed, and RSVP button.',
      startDate: daysAgo(7),
      endDate: daysAhead(7),
      status: 'ACTIVE',
      color: '#EC4899',
    },
  });

  // Project 3 Sprints
  const p3Sprint1 = await prisma.sprint.upsert({
    where: { id: 'seed-sprint-005' },
    update: {},
    create: {
      id: 'seed-sprint-005',
      projectId: project3.id,
      name: 'Sprint 1 — Data Collection & Training',
      goal: 'Scrape anonymized course registration data and train baseline collaborative filter.',
      startDate: daysAgo(7),
      endDate: daysAhead(7),
      status: 'ACTIVE',
      color: '#F59E0B',
    },
  });

  // Project 4 Sprints
  const p4Sprint1 = await prisma.sprint.upsert({
    where: { id: 'seed-sprint-006' },
    update: {},
    create: {
      id: 'seed-sprint-006',
      projectId: project4.id,
      name: 'Sprint 1 — Seat Reservation Engine',
      goal: 'Real-time WebSocket seat status and user reservation endpoints.',
      startDate: daysAgo(28),
      endDate: daysAgo(14),
      status: 'COMPLETED',
      color: '#6366F1',
    },
  });

  // Set active sprint IDs on projects
  await prisma.project.update({ where: { id: project1.id }, data: { activeSprintId: p1Sprint2.id } });
  await prisma.project.update({ where: { id: project2.id }, data: { activeSprintId: p2Sprint1.id } });
  await prisma.project.update({ where: { id: project3.id }, data: { activeSprintId: p3Sprint1.id } });

  console.log(`✓ Seeded 6 sprints`);

  // ── 4. TASKS WITH STAGGERED UPDATED_AT FOR CHART DATA ─────────────────────
  let taskPos = 1000;

  async function createTask(
    projectId: string,
    sprintId: string | null,
    t: {
      title: string;
      description?: string;
      status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
      priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      storyPoints: number;
      assigneeId: string;
      updatedAtOffsetDays?: number;
    },
    creatorId: string,
  ) {
    taskPos += 1000;
    const taskDate = t.updatedAtOffsetDays !== undefined ? daysAgo(t.updatedAtOffsetDays) : now;
    return prisma.task.create({
      data: {
        projectId,
        sprintId,
        title: t.title,
        description: t.description || `Task specifications for ${t.title}`,
        status: t.status,
        priority: t.priority,
        storyPoints: t.storyPoints,
        assigneeId: t.assigneeId,
        creatorId,
        position: taskPos,
        createdAt: daysAgo(14),
        updatedAt: taskDate,
      },
    });
  }

  // --- Project 1: Sprint 1 (Completed Sprint — Staggered Completion Data) ---
  const p1s1Tasks = [
    { title: 'Setup Turborepo & Workspace Packages', status: 'DONE' as const, priority: 'CRITICAL' as const, storyPoints: 5, assigneeId: sm1.id, updatedAtOffsetDays: 20 },
    { title: 'Setup NestJS API with Prisma ORM', status: 'DONE' as const, priority: 'HIGH' as const, storyPoints: 5, assigneeId: dev1.id, updatedAtOffsetDays: 18 },
    { title: 'Initialize Next.js App with Tailwind CSS', status: 'DONE' as const, priority: 'HIGH' as const, storyPoints: 3, assigneeId: dev2.id, updatedAtOffsetDays: 16 },
    { title: 'Design PostgreSQL Database Schema', status: 'DONE' as const, priority: 'HIGH' as const, storyPoints: 8, assigneeId: sm1.id, updatedAtOffsetDays: 14 },
    { title: 'Conduct User Research Interviews', status: 'DONE' as const, priority: 'MEDIUM' as const, storyPoints: 3, assigneeId: dev3.id, updatedAtOffsetDays: 11 },
    { title: 'Create Low-Fidelity UI Wireframes', status: 'DONE' as const, priority: 'MEDIUM' as const, storyPoints: 5, assigneeId: dev2.id, updatedAtOffsetDays: 8 },
  ];

  // --- Project 1: Sprint 2 (Active Sprint — Rich Burndown Progress Data) ---
  const p1s2Tasks = [
    { title: 'Implement JWT Authentication & Refresh Tokens', status: 'DONE' as const, priority: 'CRITICAL' as const, storyPoints: 8, assigneeId: sm1.id, updatedAtOffsetDays: 6 },
    { title: 'Build Student Registration & Login Views', status: 'DONE' as const, priority: 'HIGH' as const, storyPoints: 5, assigneeId: dev1.id, updatedAtOffsetDays: 5 },
    { title: 'Create Student Profile Management Page', status: 'DONE' as const, priority: 'HIGH' as const, storyPoints: 5, assigneeId: dev1.id, updatedAtOffsetDays: 3 },
    { title: 'Develop Main Overview Dashboard Widgets', status: 'IN_PROGRESS' as const, priority: 'HIGH' as const, storyPoints: 8, assigneeId: dev2.id, updatedAtOffsetDays: 1 },
    { title: 'Implement Notifications API & Realtime Socket', status: 'IN_PROGRESS' as const, priority: 'MEDIUM' as const, storyPoints: 5, assigneeId: dev3.id, updatedAtOffsetDays: 1 },
    { title: 'Integrate Course Enrollment API', status: 'IN_REVIEW' as const, priority: 'MEDIUM' as const, storyPoints: 5, assigneeId: dev2.id, updatedAtOffsetDays: 0 },
    { title: 'Design Academic Grade Viewer Component', status: 'TODO' as const, priority: 'MEDIUM' as const, storyPoints: 3, assigneeId: dev3.id },
    { title: 'Mobile Responsiveness & Sidebar Drawer', status: 'TODO' as const, priority: 'HIGH' as const, storyPoints: 5, assigneeId: dev1.id },
    { title: 'Write Unit Tests for Auth & Sprint Services', status: 'TODO' as const, priority: 'MEDIUM' as const, storyPoints: 3, assigneeId: sm1.id },
  ];

  // --- Project 1: Backlog ---
  const p1Backlog = [
    { title: 'Add Dark Mode Theme Toggle', status: 'TODO' as const, priority: 'LOW' as const, storyPoints: 3, assigneeId: dev2.id },
    { title: 'PDF Export for Transcript & Grades', status: 'TODO' as const, priority: 'LOW' as const, storyPoints: 5, assigneeId: dev3.id },
    { title: 'Push Notification Gateway Integration', status: 'TODO' as const, priority: 'MEDIUM' as const, storyPoints: 8, assigneeId: dev1.id },
    { title: 'Multi-language Localization (i18n)', status: 'TODO' as const, priority: 'LOW' as const, storyPoints: 5, assigneeId: dev2.id },
  ];

  // --- Project 2: Sprint 1 (Active) ---
  const p2s1Tasks = [
    { title: 'Event Publishing Form with Image Upload', status: 'DONE' as const, priority: 'HIGH' as const, storyPoints: 5, assigneeId: dev2.id, updatedAtOffsetDays: 4 },
    { title: 'Public Event List with Search & Filtering', status: 'DONE' as const, priority: 'HIGH' as const, storyPoints: 5, assigneeId: student1.id, updatedAtOffsetDays: 2 },
    { title: 'One-Click RSVP & Seat Counter Logic', status: 'IN_PROGRESS' as const, priority: 'CRITICAL' as const, storyPoints: 8, assigneeId: student1.id, updatedAtOffsetDays: 1 },
    { title: 'Admin Event Approval Dashboard', status: 'IN_REVIEW' as const, priority: 'MEDIUM' as const, storyPoints: 5, assigneeId: dev3.id, updatedAtOffsetDays: 0 },
    { title: 'Automated Email Confirmation on RSVP', status: 'TODO' as const, priority: 'LOW' as const, storyPoints: 3, assigneeId: dev2.id },
  ];

  // --- Project 3: Sprint 1 (Active AI Recommendation) ---
  const p3s1Tasks = [
    { title: 'Scrape Anonymized Course History Data', status: 'DONE' as const, priority: 'HIGH' as const, storyPoints: 8, assigneeId: sm1.id, updatedAtOffsetDays: 5 },
    { title: 'Build Cosine Similarity Recommendation Pipeline', status: 'IN_PROGRESS' as const, priority: 'CRITICAL' as const, storyPoints: 13, assigneeId: dev1.id, updatedAtOffsetDays: 1 },
    { title: 'FastAPI Microservice Integration Endpoint', status: 'IN_REVIEW' as const, priority: 'HIGH' as const, storyPoints: 5, assigneeId: student1.id, updatedAtOffsetDays: 0 },
    { title: 'Recommendation Confidence Rating UI', status: 'TODO' as const, priority: 'MEDIUM' as const, storyPoints: 3, assigneeId: sm1.id },
  ];

  // --- Project 4: Sprint 1 (Completed Library System) ---
  const p4s1Tasks = [
    { title: 'Seat Reservation REST Endpoints', status: 'DONE' as const, priority: 'HIGH' as const, storyPoints: 5, assigneeId: dev3.id, updatedAtOffsetDays: 25 },
    { title: 'WebSocket Realtime Occupancy Feed', status: 'DONE' as const, priority: 'CRITICAL' as const, storyPoints: 8, assigneeId: dev2.id, updatedAtOffsetDays: 20 },
    { title: 'QR Code Verification Scanner Page', status: 'DONE' as const, priority: 'MEDIUM' as const, storyPoints: 5, assigneeId: dev1.id, updatedAtOffsetDays: 16 },
  ];

  taskPos = 0;
  for (const t of p1s1Tasks) await createTask(project1.id, p1Sprint1.id, t, sm1.id);
  for (const t of p1s2Tasks) await createTask(project1.id, p1Sprint2.id, t, sm1.id);
  for (const t of p1Backlog) await createTask(project1.id, null, t, sm1.id);
  for (const t of p2s1Tasks) await createTask(project2.id, p2Sprint1.id, t, dev2.id);
  for (const t of p3s1Tasks) await createTask(project3.id, p3Sprint1.id, t, sm1.id);
  for (const t of p4s1Tasks) await createTask(project4.id, p4Sprint1.id, t, dev3.id);

  const totalTasksSeeded =
    p1s1Tasks.length + p1s2Tasks.length + p1Backlog.length + p2s1Tasks.length + p3s1Tasks.length + p4s1Tasks.length;

  console.log(`✓ Seeded ${totalTasksSeeded} tasks with staggered timestamps for burndown charts`);

  // ── 5. ACTIVITY LOGS ──────────────────────────────────────────────────────
  await prisma.activityLog.createMany({
    data: [
      { projectId: project1.id, userId: sm1.id, action: 'PROJECT_CREATED', metadata: { projectName: project1.name }, createdAt: daysAgo(21) },
      { projectId: project1.id, userId: sm1.id, action: 'SPRINT_CREATED', metadata: { sprintName: p1Sprint1.name }, createdAt: daysAgo(21) },
      { projectId: project1.id, userId: sm1.id, action: 'SPRINT_STARTED', metadata: { sprintName: p1Sprint1.name }, createdAt: daysAgo(21) },
      { projectId: project1.id, userId: sm1.id, action: 'SPRINT_COMPLETED', metadata: { sprintName: p1Sprint1.name, movedToBacklog: 0 }, createdAt: daysAgo(7) },
      { projectId: project1.id, userId: sm1.id, action: 'SPRINT_CREATED', metadata: { sprintName: p1Sprint2.name }, createdAt: daysAgo(7) },
      { projectId: project1.id, userId: sm1.id, action: 'SPRINT_STARTED', metadata: { sprintName: p1Sprint2.name }, createdAt: daysAgo(7) },
      { projectId: project2.id, userId: dev2.id, action: 'PROJECT_CREATED', metadata: { projectName: project2.name }, createdAt: daysAgo(7) },
      { projectId: project2.id, userId: dev2.id, action: 'SPRINT_CREATED', metadata: { sprintName: p2Sprint1.name }, createdAt: daysAgo(7) },
      { projectId: project2.id, userId: dev2.id, action: 'SPRINT_STARTED', metadata: { sprintName: p2Sprint1.name }, createdAt: daysAgo(7) },
      { projectId: project3.id, userId: sm1.id, action: 'PROJECT_CREATED', metadata: { projectName: project3.name }, createdAt: daysAgo(7) },
      { projectId: project3.id, userId: sm1.id, action: 'SPRINT_STARTED', metadata: { sprintName: p3Sprint1.name }, createdAt: daysAgo(7) },
    ],
    skipDuplicates: true,
  });

  console.log(`✓ Seeded activity logs timeline`);

  // ── 6. NOTIFICATIONS ──────────────────────────────────────────────────────
  await prisma.notification.createMany({
    data: [
      {
        userId: dev1.id,
        title: 'Task Assigned',
        message: 'You have been assigned to: Implement JWT Authentication & Refresh Tokens',
        link: `/projects/${project1.id}`,
        isRead: true,
        createdAt: daysAgo(6),
      },
      {
        userId: dev2.id,
        title: 'Sprint Started',
        message: `Sprint "${p1Sprint2.name}" has started!`,
        link: `/projects/${project1.id}`,
        isRead: false,
        createdAt: daysAgo(7),
      },
      {
        userId: dev3.id,
        title: 'Sprint Started',
        message: `Sprint "${p1Sprint2.name}" has started!`,
        link: `/projects/${project1.id}`,
        isRead: false,
        createdAt: daysAgo(7),
      },
      {
        userId: student1.id,
        title: 'Project Invitation',
        message: `You have been added to project: ${project2.name}`,
        link: `/projects/${project2.id}`,
        isRead: false,
        createdAt: daysAgo(5),
      },
      {
        userId: dev1.id,
        title: 'Project Invitation',
        message: `You have been added to project: ${project3.name}`,
        link: `/projects/${project3.id}`,
        isRead: false,
        createdAt: daysAgo(3),
      },
    ],
    skipDuplicates: true,
  });

  console.log(`✓ Seeded notifications`);

  console.log('\n✅ Seed complete! All projects and chart data are ready.\n');
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
