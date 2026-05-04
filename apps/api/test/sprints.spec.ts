import { Test, TestingModule } from '@nestjs/testing';
import { SprintsService } from '../src/sprints/sprints.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { ActivityService } from '../src/activity/activity.service';
import { NotificationsService } from '../src/notifications/notifications.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { SprintStatus } from '@apms/database/generated/client';

describe('SprintsService', () => {
  let service: SprintsService;
  let prisma: any;

  const mockSprint = {
    id: 'sprint-1',
    name: 'Test Sprint',
    projectId: 'project-1',
    status: SprintStatus.PLANNED,
    goal: 'Test goal',
    startDate: new Date(),
    endDate: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  } as any;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SprintsService,
        {
          provide: PrismaService,
          useValue: {
            sprint: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              update: jest.fn(),
              updateMany: jest.fn(),
            },
            project: { update: jest.fn() },
            task: { updateMany: jest.fn(), findMany: jest.fn() },
            projectMember: { findMany: jest.fn() },
          },
        },
        {
          provide: ActivityService,
          useValue: { log: jest.fn() },
        },
        {
          provide: NotificationsService,
          useValue: { create: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(SprintsService);
    prisma = module.get(PrismaService);
  });

  it('should create sprint', async () => {
    jest.spyOn(prisma.sprint, 'create').mockResolvedValue(mockSprint);

    const result = await service.create('project-1', 'user-1', {
      name: 'Test',
      startDate: '2026-01-01',
      endDate: '2026-01-14',
    });

    expect(result).toEqual(mockSprint);
  });

  it('should throw on invalid date range', async () => {
    await expect(
      service.create('project-1', 'user-1', {
        name: 'Test',
        startDate: '2026-01-14',
        endDate: '2026-01-01',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should start sprint', async () => {
    jest.spyOn(prisma.sprint, 'findFirst').mockResolvedValue(null);
    jest.spyOn(prisma.sprint, 'update').mockResolvedValue({ ...mockSprint, status: SprintStatus.ACTIVE } as any);
    jest.spyOn(prisma.project, 'update').mockResolvedValue({} as any);
    jest.spyOn(prisma.projectMember, 'findMany').mockResolvedValue([]);

    const result = await service.startSprint('project-1', 'sprint-1', 'user-1');

    expect(result.status).toBe(SprintStatus.ACTIVE);
  });

  it('should throw when starting while another sprint is active', async () => {
    jest.spyOn(prisma.sprint, 'findFirst').mockResolvedValue({ name: 'Active Sprint' } as any);

    await expect(
      service.startSprint('project-1', 'sprint-1', 'user-1'),
    ).rejects.toThrow(BadRequestException);
  });

  it('should complete sprint and move incomplete tasks to backlog', async () => {
    const sprintWithTasks = {
      ...mockSprint,
      tasks: [{ id: 'task-1', status: 'IN_PROGRESS' }],
    };
    jest.spyOn(prisma.sprint, 'findFirst').mockResolvedValue(sprintWithTasks as any);
    (prisma.task.findMany as jest.Mock).mockResolvedValue([{ id: 'task-1', status: 'IN_PROGRESS' }] as any);
    jest.spyOn(prisma.task, 'updateMany').mockResolvedValue({ count: 1 } as any);
    jest.spyOn(prisma.sprint, 'update').mockResolvedValue({ ...mockSprint, status: SprintStatus.COMPLETED } as any);
    jest.spyOn(prisma.project, 'update').mockResolvedValue({} as any);
    (prisma.projectMember.findMany as jest.Mock).mockResolvedValue([]);

    const result = await service.completeSprint('project-1', 'sprint-1', 'user-1');

    expect(prisma.task.updateMany).toHaveBeenCalled();
    expect(result.status).toBe(SprintStatus.COMPLETED);
  });

  it('should get burndown data', async () => {
    const sprintWithTasks = {
      id: 'sprint-1',
      projectId: 'project-1',
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-01-03'),
      tasks: [
        { status: 'DONE', storyPoints: 3, updatedAt: new Date('2026-01-02') },
        { status: 'IN_PROGRESS', storyPoints: 5, updatedAt: new Date() },
      ],
    };
    jest.spyOn(prisma.sprint, 'findFirst').mockResolvedValue(sprintWithTasks as any);

    const result = await service.getBurndownData('project-1', 'sprint-1');

    expect(result).toBeInstanceOf(Array);
    expect(result.length).toBe(3);
  });
});
