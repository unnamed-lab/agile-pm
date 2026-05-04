import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from '../src/tasks/tasks.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { ActivityService } from '../src/activity/activity.service';
import { NotificationsService } from '../src/notifications/notifications.service';
import { NotFoundException } from '@nestjs/common';
import { TaskStatus } from '@apms/database/generated/client';

describe('TasksService', () => {
  let service: TasksService;
  let prisma: jest.Mocked<PrismaService>;

  const PROJECT_ID = 'project-1';

  const mockTask = {
    id: 'task-1',
    title: 'Test Task',
    status: TaskStatus.TODO,
    projectId: PROJECT_ID,
    description: 'Test',
    storyPoints: 0,
    priority: 'MEDIUM',
    assigneeId: null,
    creatorId: 'user-1',
    sprintId: null,
    position: 1000,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  } as any;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: PrismaService,
          useValue: {
            task: {
              create: jest.fn(),
              findMany: jest.fn(),
              findFirst: jest.fn(),
              update: jest.fn(),
              updateMany: jest.fn(),
            },
            sprint: { findFirst: jest.fn() },
            project: { findUnique: jest.fn() },
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

    service = module.get(TasksService);
    prisma = module.get(PrismaService);
  });

  it('should create task', async () => {
    jest.spyOn(prisma.task, 'findFirst').mockResolvedValue(null);
    jest.spyOn(prisma.task, 'create').mockResolvedValue(mockTask);

    const result = await service.create(PROJECT_ID, 'user-1', { title: 'Test' });

    expect(result).toEqual(mockTask);
  });

  it('should move task status', async () => {
    const task = { ...mockTask, status: TaskStatus.TODO };
    jest.spyOn(prisma.task, 'findFirst').mockResolvedValue(task);
    jest.spyOn(prisma.task, 'update').mockResolvedValue({
      ...task,
      status: TaskStatus.IN_PROGRESS,
    });

    const result = await service.moveTask(PROJECT_ID, 'task-1', 'user-1', {
      status: TaskStatus.IN_PROGRESS,
    });

    expect(result.status).toBe(TaskStatus.IN_PROGRESS);
  });

  it('should update task', async () => {
    const task = { ...mockTask, title: 'Old' };
    jest.spyOn(prisma.task, 'findFirst').mockResolvedValue(task);
    jest.spyOn(prisma.task, 'update').mockResolvedValue({ ...task, title: 'New' });

    const result = await service.update(PROJECT_ID, 'task-1', 'user-1', { title: 'New' });

    expect(result.title).toBe('New');
  });

  it('should remove task with soft delete', async () => {
    jest.spyOn(prisma.task, 'findFirst').mockResolvedValue(mockTask);
    jest.spyOn(prisma.task, 'update').mockResolvedValue({} as any);

    await service.remove(PROJECT_ID, 'task-1', 'user-1');

    expect(prisma.task.update).toHaveBeenCalledWith({
      where: { id: 'task-1' },
      data: { deletedAt: expect.any(Date) },
    });
  });

  it('should throw on task not found', async () => {
    jest.spyOn(prisma.task, 'findFirst').mockResolvedValue(null);

    await expect(service.findOne(PROJECT_ID, 'task-999')).rejects.toThrow(NotFoundException);
  });
});
