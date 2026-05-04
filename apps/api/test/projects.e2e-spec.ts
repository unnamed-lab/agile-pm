import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/prisma/prisma.service";

describe("Projects (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let userId: string;

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
    const email = `project-test${Date.now()}@example.com`;

    await request(app.getHttpServer())
      .post("/register")
      .send({ name: "Project Test", email, password: "password123" })
      .expect(201);

    const loginRes = await request(app.getHttpServer())
      .post("/login")
      .send({ email, password: "password123" })
      .expect(200);

    authToken = loginRes.body.access_token;
    userId = loginRes.body.user.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe("POST /projects", () => {
    it("should create project with SCRUM_MASTER", async () => {
      const res = await request(app.getHttpServer())
        .post("/projects")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ name: "E2E Test Project" })
        .expect(201);

      expect(res.body.name).toBe("E2E Test Project");
      expect(res.body.members).toBeDefined();
      expect(res.body.members[0].role).toBe("SCRUM_MASTER");
    });
  });

  describe("GET /projects/:id", () => {
    it("should get project by id", async () => {
      // Create project first
      const createRes = await request(app.getHttpServer())
        .post("/projects")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ name: "Get Test" })
        .expect(201);

      const projectId = createRes.body.id;

      const res = await request(app.getHttpServer())
        .get(`/projects/${projectId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.id).toBe(projectId);
      expect(res.body.name).toBe("Get Test");
    });
  });

  describe("POST /projects/:id/members", () => {
    it("should invite member by email", async () => {
      // Create project
      const projectRes = await request(app.getHttpServer())
        .post("/projects")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ name: "Member Test" })
        .expect(201);

      const projectId = projectRes.body.id;

      // Create user to invite
      const inviteEmail = `invite${Date.now()}@example.com`;
      await request(app.getHttpServer())
        .post("/register")
        .send({ name: "Invitee", email: inviteEmail, password: "pass123" });

      // Invite
      await request(app.getHttpServer())
        .post(`/projects/${projectId}/members`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ email: inviteEmail })
        .expect(201);
    });
  });

  describe("DELETE /projects/:id/members/:userId", () => {
    it("should remove member", async () => {
      // Create project
      const projectRes = await request(app.getHttpServer())
        .post("/projects")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ name: "Remove Test" })
        .expect(201);

      const projectId = projectRes.body.id;

      // Create and invite user
      const inviteEmail = `remove${Date.now()}@example.com`;
      const inviteRes = await request(app.getHttpServer())
        .post("/register")
        .send({ name: "Removee", email: inviteEmail, password: "pass123" });

      const inviteeId = inviteRes.body.user.id;

      await request(app.getHttpServer())
        .post(`/projects/${projectId}/members`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ email: inviteEmail })
        .expect(201);

      // Remove member
      await request(app.getHttpServer())
        .delete(`/projects/${projectId}/members/${inviteeId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);
    });
  });

  describe("DELETE /projects/:id", () => {
    it("should soft delete project", async () => {
      const projectRes = await request(app.getHttpServer())
        .post("/projects")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ name: "Delete Test" })
        .expect(201);

      const projectId = projectRes.body.id;

      await request(app.getHttpServer())
        .delete(`/projects/${projectId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      // Should not be found after delete
      await request(app.getHttpServer())
        .get(`/projects/${projectId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(404);
    });
  });
});
