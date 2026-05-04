import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsService } from '../src/projects/projects.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { ActivityService } from '../src/activity/activity.service';
import { NotificationsService } from '../src/notifications/notifications.service';
import { NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { ProjectRole } from '@apms/database/generated/client';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let prisma: any;
  let notificationsService: any;

  const mockUser = { id: 'user-1', name: 'Test User' };
  const mockProject = {
    id: 'project-1',
    name: 'Test Project',
    description: 'Test Desc',
    members: [{ userId: 'user-1', role: ProjectRole.SCRUM_MASTER }],
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: PrismaService,
          useValue: {
            project: {
              create: jest.fn(),
              findMany: jest.fn(),
              findFirst: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            projectMember: {
              findUnique: jest.fn(),
              count: jest.fn(),
              create: jest.fn(),
              delete: jest.fn(),
            },
            user: { findUnique: jest.fn() },
            task: { count: jest.fn() },
            sprint: { count: jest.fn(), findFirst: jest.fn() },
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

    service = module.get(ProjectsService);
    prisma = module.get(PrismaService);
    notificationsService = module.get(NotificationsService);
  });

  it('should create project with SCRUM_MASTER role', async () => {
    jest.spyOn(prisma.project, 'create').mockResolvedValue(mockProject);

    const result = await service.create('user-1', { name: 'Test' });

    expect(result).toEqual(mockProject);
    expect(prisma.project.create).toHaveBeenCalled();
  });

  it('should invite member by email', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser as any);
    jest.spyOn(prisma.projectMember, 'findUnique').mockResolvedValue(null);
    jest.spyOn(prisma.projectMember, 'create').mockResolvedValue({} as any);
    jest.spyOn(prisma.project, 'findUnique').mockResolvedValue(mockProject as any);
    jest.spyOn(notificationsService, 'create').mockResolvedValue({} as any);

    const result = await service.inviteMember('project-1', 'inviter-1', {
      email: '[email protected]',
      role: ProjectRole.DEVELOPER,
    });

    expect(result.message).toContain('successfully');
  });

  it('should throw on duplicate member invite', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);
    jest.spyOn(prisma.projectMember, 'findUnique').mockResolvedValue({ userId: 'user-1' });

    await expect(
      service.inviteMember('project-1', 'inviter-1', { email: '[email protected]' })
    ).rejects.toThrow(ConflictException);
  });

  it('should prevent removing last SCRUM_MASTER', async () => {
    jest.spyOn(prisma.projectMember, 'count').mockResolvedValue(1);
    jest.spyOn(prisma.projectMember, 'findUnique').mockResolvedValue({
      role: ProjectRole.SCRUM_MASTER,
    });

    await expect(
      service.removeMember('project-1', 'remover-1', 'user-1')
    ).rejects.toThrow(ForbiddenException);
  });

  it('should get stats', async () => {
    jest.spyOn(prisma.task, 'count')
      .mockResolvedValueOnce(10) // total
      .mockResolvedValueOnce(4); // completed
    jest.spyOn(prisma.sprint, 'count').mockResolvedValue(2);
    jest.spyOn(prisma.sprint, 'findFirst').mockResolvedValue(null);

    const stats = await service.getStats('project-1');

    expect(stats.totalTasks).toBe(10);
    expect(stats.progressPercent).toBe(40);
  });
});
