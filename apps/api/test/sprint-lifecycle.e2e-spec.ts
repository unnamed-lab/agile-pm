import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/prisma/prisma.service";
import { SprintStatus, TaskStatus } from "@apms/database/generated/client";

describe("Sprint Lifecycle (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let userId: string;
  let projectId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = app.get(PrismaService);

    // Clean up
    await prisma.activityLog.deleteMany({});
    await prisma.notification.deleteMany({});
    await prisma.task.deleteMany({});
    await prisma.sprint.deleteMany({});
    await prisma.projectMember.deleteMany({});
    await prisma.project.deleteMany({});
    await prisma.user.deleteMany({});

    // Register and login
    const email = `sprint-test${Date.now()}@example.com`;

    const registerRes = await request(app.getHttpServer())
      .post("/register")
      .send({ name: "Sprint Test", email, password: "password123" })
      .expect(201);

    authToken = registerRes.body.access_token;
    userId = registerRes.body.user.id;

    // Create project
    const projectRes = await request(app.getHttpServer())
      .post("/projects")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ name: "Sprint Test Project" })
      .expect(201);

    projectId = projectRes.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it("should complete full sprint lifecycle", async () => {
    // 1. Create sprint
    const sprintRes = await request(app.getHttpServer())
      .post(`/projects/${projectId}/sprints`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        name: "Test Sprint",
        startDate: "2026-01-01",
        endDate: "2026-01-14",
      })
      .expect(201);

    const sprintId = sprintRes.body.id;
    expect(sprintRes.body.status).toBe(SprintStatus.PLANNED);

    // 2. Create 5 tasks in backlog
    const taskIds: string[] = [];
    for (let i = 0; i < 5; i++) {
      const taskRes = await request(app.getHttpServer())
        .post(`/projects/${projectId}/tasks`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ title: `Task ${i + 1}` })
        .expect(201);
      taskIds.push(taskRes.body.id);
    }

    // 3. Move 3 tasks to sprint
    for (let i = 0; i < 3; i++) {
      await request(app.getHttpServer())
        .patch(`/projects/${projectId}/tasks/${taskIds[i]}/move`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ sprintId })
        .expect(200);
    }

    // 4. Start sprint
    await request(app.getHttpServer())
      .patch(`/projects/${projectId}/sprints/${sprintId}/start`)
      .set("Authorization", `Bearer ${authToken}`)
      .expect(200);

    // Verify sprint is ACTIVE
    let sprint = await prisma.sprint.findUnique({ where: { id: sprintId } });
    expect(sprint?.status).toBe(SprintStatus.ACTIVE);

    // Verify project.activeSprintId is set
    let project = await prisma.project.findUnique({ where: { id: projectId } });
    expect(project?.activeSprintId).toBe(sprintId);

    // 5. Move all 3 sprint tasks to DONE
    for (let i = 0; i < 3; i++) {
      await request(app.getHttpServer())
        .patch(`/projects/${projectId}/tasks/${taskIds[i]}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ status: TaskStatus.DONE })
        .expect(200);
    }

    // 6. Complete sprint
    await request(app.getHttpServer())
      .patch(`/projects/${projectId}/sprints/${sprintId}/complete`)
      .set("Authorization", `Bearer ${authToken}`)
      .expect(200);

    // 7. Verify sprint status = COMPLETED
    sprint = await prisma.sprint.findUnique({ where: { id: sprintId } });
    expect(sprint?.status).toBe(SprintStatus.COMPLETED);

    // 8. Verify project.activeSprintId = null
    project = await prisma.project.findUnique({ where: { id: projectId } });
    expect(project?.activeSprintId).toBeNull();

    // 9. Verify 2 tasks moved back to backlog (not in sprint)
    const backlogTasks = await prisma.task.findMany({
      where: { projectId, sprintId: null, deletedAt: null },
    });
    expect(backlogTasks.length).toBe(2);
  });

  it("should not start sprint when another is active", async () => {
    // Create first sprint and start it
    const sprint1Res = await request(app.getHttpServer())
      .post(`/projects/${projectId}/sprints`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        name: "Active Sprint",
        startDate: "2026-02-01",
        endDate: "2026-02-14",
      })
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/projects/${projectId}/sprints/${sprint1Res.body.id}/start`)
      .set("Authorization", `Bearer ${authToken}`)
      .expect(200);

    // Try to start second sprint
    const sprint2Res = await request(app.getHttpServer())
      .post(`/projects/${projectId}/sprints`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        name: "Failed Sprint",
        startDate: "2026-03-01",
        endDate: "2026-03-14",
      })
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/projects/${projectId}/sprints/${sprint2Res.body.id}/start`)
      .set("Authorization", `Bearer ${authToken}`)
      .expect(400);
  });
});
