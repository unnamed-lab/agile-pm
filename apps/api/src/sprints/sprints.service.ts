import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityService } from '../activity/activity.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateSprintDto } from './dto/create-sprint.dto';

@Injectable()
export class SprintsService {
  constructor(
    private prisma: PrismaService,
    private activity: ActivityService,
    private notifications: NotificationsService,
  ) {}


  async create(projectId: string, userId: string, dto: CreateSprintDto) {
    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);
    if (end <= start) throw new BadRequestException('End date must be after start date');

    const sprint = await this.prisma.sprint.create({
      data: {
        projectId,
        name: dto.name,
        goal: dto.goal,
        startDate: start,
        endDate: end,
        color: dto.color || '#10B981',
      },
    });

    await this.activity.log(projectId, userId, 'SPRINT_CREATED', { sprintName: sprint.name });
    return sprint;
  }

  async findAll(projectId: string) {
    return this.prisma.sprint.findMany({
      where: { projectId },
      include: {
        _count: { select: { tasks: true } },
        tasks: {
          select: { id: true, status: true },
          where: { deletedAt: null },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(projectId: string, sprintId: string) {
    const sprint = await this.prisma.sprint.findFirst({
      where: { id: sprintId, projectId },
      include: {
        tasks: {
          where: { deletedAt: null },
          include: {
            assignee: { select: { id: true, name: true, avatarUrl: true } },
            creator: { select: { id: true, name: true } },
          },
          orderBy: { position: 'asc' },
        },
      },
    });
    if (!sprint) throw new NotFoundException('Sprint not found');
    return sprint;
  }

  async startSprint(projectId: string, sprintId: string, userId: string) {
    const activeSprint = await this.prisma.sprint.findFirst({
      where: { projectId, status: 'ACTIVE' },
    });
    if (activeSprint) {
      throw new BadRequestException(`Sprint "${activeSprint.name}" is already active. Complete it first.`);
    }

    const sprint = await this.prisma.sprint.update({
      where: { id: sprintId },
      data: { status: 'ACTIVE' },
    });

    await this.prisma.project.update({
      where: { id: projectId },
      data: { activeSprintId: sprintId },
    });

    await this.notifyProjectMembers(projectId, userId, {
      title: 'Sprint Started',
      message: `Sprint "${sprint.name}" has started!`,
      link: `/projects/${projectId}`,
    });

    await this.activity.log(projectId, userId, 'SPRINT_STARTED', { sprintName: sprint.name });
    return sprint;
  }

  async completeSprint(projectId: string, sprintId: string, userId: string) {
    const sprint = await this.prisma.sprint.findFirst({
      where: { id: sprintId, projectId },
    });
    if (!sprint) throw new NotFoundException('Sprint not found');

    const incompleteTasks = await this.prisma.task.findMany({
      where: { sprintId, status: { not: 'DONE' }, deletedAt: null },
    });

    if (incompleteTasks.length > 0) {
      await this.prisma.task.updateMany({
        where: { sprintId, status: { not: 'DONE' }, deletedAt: null },
        data: { sprintId: null },
      });
    }

    const updatedSprint = await this.prisma.sprint.update({
      where: { id: sprintId },
      data: { status: 'COMPLETED' },
    });

    await this.prisma.project.update({
      where: { id: projectId },
      data: { activeSprintId: null },
    });

    await this.notifyProjectMembers(projectId, userId, {
      title: 'Sprint Completed',
      message: `Sprint "${sprint.name}" has been completed. ${incompleteTasks.length} task(s) moved to backlog.`,
      link: `/projects/${projectId}/backlog`,
    });

    await this.activity.log(projectId, userId, 'SPRINT_COMPLETED', {
      sprintName: sprint.name,
      movedToBacklog: incompleteTasks.length,
    });

    return updatedSprint;
  }

  async getBurndownData(projectId: string, sprintId: string) {
    const sprint = await this.prisma.sprint.findFirst({
      where: { id: sprintId, projectId },
      include: {
        tasks: {
          where: { deletedAt: null },
          select: { status: true, updatedAt: true, storyPoints: true },
        },
      },
    });
    if (!sprint) throw new NotFoundException('Sprint not found');

    const totalPoints = sprint.tasks.reduce((sum, t) => sum + (t.storyPoints || 1), 0);
    const days = this.getDayRange(sprint.startDate, sprint.endDate);
    const idealBurnPerDay = totalPoints / (days.length - 1);

    return days.map((date, i) => {
      const completedPoints = sprint.tasks
        .filter(t => t.status === 'DONE' && new Date(t.updatedAt) <= date)
        .reduce((sum, t) => sum + (t.storyPoints || 1), 0);

      return {
        date: date.toISOString().split('T')[0],
        ideal: Math.max(0, Math.round(totalPoints - idealBurnPerDay * i)),
        actual: Math.max(0, totalPoints - completedPoints),
      };
    });
  }

  private getDayRange(start: Date, end: Date): Date[] {
    const days: Date[] = [];
    const current = new Date(start);
    while (current <= end) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return days;
  }

  private async notifyProjectMembers(
    projectId: string,
    excludeUserId: string,
    notification: { title: string; message: string; link: string },
  ) {
    const members = await this.prisma.projectMember.findMany({
      where: { projectId, userId: { not: excludeUserId } },
      select: { userId: true },
    });

    await Promise.all(
      members.map(m => this.notifications.create(m.userId, notification))
    );
  }
}
