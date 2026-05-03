import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = app.get(PrismaService);
    // Clean up before tests
    await prisma.activityLog.deleteMany({});
    await prisma.notification.deleteMany({});
    await prisma.task.deleteMany({});
    await prisma.sprint.deleteMany({});
    await prisma.projectMember.deleteMany({});
    await prisma.project.deleteMany({});
    await prisma.user.deleteMany({});
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('should register new user', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Test User',
          email: `test${Date.now()}@example.com`,
          password: 'password123',
        })
        .expect(201);

      expect(res.body.user).toBeDefined();
      expect(res.body.access_token).toBeDefined();
    });

    it('should reject duplicate email', async () => {
      const email = `duplicate${Date.now()}@example.com`;

      // First registration
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ name: 'User1', email, password: 'pass1' })
        .expect(201);

      // Duplicate registration
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ name: 'User2', email, password: 'pass2' })
        .expect(409);
    });
  });

  describe('POST /auth/login', () => {
    it('should login with valid credentials', async () => {
      const email = `login${Date.now()}@example.com`;

      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ name: 'Login Test', email, password: 'password123' });

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password: 'password123' })
        .expect(200);

      expect(res.body.access_token).toBeDefined();
    });

    it('should reject invalid password', async () => {
      const email = `login2${Date.now()}@example.com`;

      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ name: 'Login Test', email, password: 'password123' });

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password: 'wrong' })
        .expect(401);
    });
  });
});
