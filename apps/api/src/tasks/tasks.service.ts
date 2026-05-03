import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityService } from '../activity/activity.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { MoveTaskDto } from './dto/move-task.dto';
import { TaskStatus } from '@apms/database/generated/client';

@Injectable()
export class TasksService {
  constructor(
    private prisma: PrismaService,
    private activity: ActivityService,
    private notifications: NotificationsService,
  ) {}

  async create(projectId: string, userId: string, dto: CreateTaskDto) {
    if (dto.sprintId) {
      const sprint = await this.prisma.sprint.findFirst({
        where: { id: dto.sprintId, projectId },
      });
      if (!sprint) throw new BadRequestException('Sprint not found in this project');
    }

    const maxPosition = await this.prisma.task.findFirst({
      where: { projectId, status: dto.status || 'TODO', deletedAt: null },
      orderBy: { position: 'desc' },
      select: { position: true },
    });

    const task = await this.prisma.task.create({
      data: {
        projectId,
        creatorId: userId,
        assigneeId: dto.assigneeId,
        sprintId: dto.sprintId,
        title: dto.title,
        description: dto.description,
        status: dto.status || 'TODO',
        priority: dto.priority || 'MEDIUM',
        storyPoints: dto.storyPoints || 0,
        position: (maxPosition?.position || 0) + 1000,
      },
      include: this.taskIncludes(),
    });

    if (dto.assigneeId) {
      await this.notifications.create(dto.assigneeId, {
        title: 'Task Assigned',
        message: `You have been assigned to task: ${task.title}`,
        link: `/projects/${projectId}`,
      });
    }

    await this.activity.log(projectId, userId, 'TASK_CREATED', {
      taskId: task.id,
      taskTitle: task.title,
    });

    return task;
  }

  async findAll(projectId: string, filters?: { status?: TaskStatus; sprintId?: string }) {
    return this.prisma.task.findMany({
      where: {
        projectId,
        deletedAt: null,
        ...(filters?.status && { status: filters.status }),
        ...(filters?.sprintId !== undefined && {
          sprintId: filters.sprintId === 'null' ? null : filters.sprintId,
        }),
      },
      include: this.taskIncludes(),
      orderBy: { position: 'asc' },
    });
  }

  async findBySprint(sprintId: string) {
    return this.prisma.task.findMany({
      where: { sprintId, deletedAt: null },
      include: this.taskIncludes(),
      orderBy: { position: 'asc' },
    });
  }

  async findOne(taskId: string) {
    const task = await this.prisma.task.findFirst({
      where: { id: taskId, deletedAt: null },
      include: this.taskIncludes(true),
    });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async update(taskId: string, userId: string, dto: UpdateTaskDto) {
    const task = await this.prisma.task.findFirst({
      where: { id: taskId, deletedAt: null },
    });
    if (!task) throw new NotFoundException('Task not found');

    if (dto.sprintId) {
      const sprint = await this.prisma.sprint.findFirst({
        where: { id: dto.sprintId, projectId: task.projectId },
      });
      if (!sprint) throw new BadRequestException('Sprint not found in this project');
    }

    const oldAssignee = task.assigneeId;

    const updated = await this.prisma.task.update({
      where: { id: taskId },
      data: dto,
      include: this.taskIncludes(),
    });

    if (dto.assigneeId && dto.assigneeId !== oldAssignee) {
      await this.notifications.create(dto.assigneeId, {
        title: 'Task Assigned',
        message: `You have been assigned to task: ${updated.title}`,
        link: `/projects/${task.projectId}`,
      });
    }

    await this.activity.log(task.projectId, userId, 'TASK_UPDATED', {
      taskId: task.id,
      taskTitle: task.title,
      changes: dto,
    });

    return updated;
  }

  async moveTask(taskId: string, userId: string, dto: MoveTaskDto) {
    const task = await this.prisma.task.findFirst({
      where: { id: taskId, deletedAt: null },
    });
    if (!task) throw new NotFoundException('Task not found');

    const updates: any = {};
    const changes: string[] = [];

    if (dto.status !== undefined && dto.status !== task.status) {
      updates.status = dto.status;
      changes.push(`status: ${task.status} → ${dto.status}`);
    }

    if (dto.sprintId !== undefined && dto.sprintId !== task.sprintId) {
      updates.sprintId = dto.sprintId;
      changes.push(`sprint: ${task.sprintId || 'backlog'} → ${dto.sprintId || 'backlog'}`);
    }

    if (dto.position !== undefined && dto.position !== task.position) {
      updates.position = dto.position;
      changes.push(`position: ${task.position} → ${dto.position}`);
    }

    if (Object.keys(updates).length === 0) return task;

    const updated = await this.prisma.task.update({
      where: { id: taskId },
      data: updates,
      include: this.taskIncludes(),
    });

    await this.activity.log(task.projectId, userId, 'TASK_MOVED', {
      taskId: task.id,
      taskTitle: task.title,
      changes,
    });

    return updated;
  }

  async remove(taskId: string, userId: string) {
    const task = await this.prisma.task.findFirst({
      where: { id: taskId, deletedAt: null },
    });
    if (!task) throw new NotFoundException('Task not found');

    await this.prisma.task.update({
      where: { id: taskId },
      data: { deletedAt: new Date() },
    });

    await this.activity.log(task.projectId, userId, 'TASK_DELETED', {
      taskId: task.id,
      taskTitle: task.title,
    });

    return { message: 'Task deleted' };
  }

  private taskIncludes(includeComments = false) {
    return {
      assignee: { select: { id: true, name: true, avatarUrl: true } },
      creator: { select: { id: true, name: true } },
      sprint: { select: { id: true, name: true, status: true } },
      ...(includeComments && {
        comments: {
          include: { author: { select: { id: true, name: true, avatarUrl: true } } },
          orderBy: { createdAt: 'asc' },
        },
      }),
    };
  }
}
