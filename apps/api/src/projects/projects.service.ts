import { Injectable, NotFoundException, ConflictException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityService } from '../activity/activity.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { InviteMemberDto } from './dto/invite-member.dto';

@Injectable()
export class ProjectsService {
  constructor(
    private prisma: PrismaService,
    private activity: ActivityService,
    private notifications: NotificationsService,
  ) {}


  async create(userId: string, dto: CreateProjectDto) {
    if (dto.supervisorId) {
      await this.validateSupervisorId(dto.supervisorId);
    }

    const project = await this.prisma.project.create({
      data: {
        name: dto.name,
        description: dto.description,
        supervisorId: dto.supervisorId,
        members: {
          create: { userId, role: 'SCRUM_MASTER' },
        },
      },
      include: this.projectIncludes(),
    });

    await this.activity.log(project.id, userId, 'PROJECT_CREATED', { projectName: project.name });
    return project;
  }

  async findAllForUser(userId: string) {
    return this.prisma.project.findMany({
      where: {
        deletedAt: null,
        members: { some: { userId } },
      },
      include: this.projectIncludes(),
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(projectId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, deletedAt: null },
      include: {
        ...this.projectIncludes(),
        sprints: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async update(projectId: string, userId: string, data: Partial<CreateProjectDto>) {
    if (data.supervisorId) {
      await this.validateSupervisorId(data.supervisorId);
    }

    const project = await this.prisma.project.update({
      where: { id: projectId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.supervisorId !== undefined && { supervisorId: data.supervisorId }),
      },
      include: this.projectIncludes(),
    });
    await this.activity.log(projectId, userId, 'PROJECT_UPDATED', { changes: data });
    return project;
  }

  private async validateSupervisorId(supervisorId: string) {
    const supervisor = await this.prisma.user.findUnique({
      where: { id: supervisorId },
      select: { id: true, role: true },
    });
    if (!supervisor) throw new NotFoundException('Supervisor user not found');
    if (supervisor.role !== 'SUPERVISOR') {
      throw new BadRequestException('The specified user does not have the SUPERVISOR role');
    }
  }

  async softDelete(projectId: string, userId: string) {
    await this.prisma.project.update({
      where: { id: projectId },
      data: { deletedAt: new Date() },
    });
    await this.activity.log(projectId, userId, 'PROJECT_DELETED', {});
    return { message: 'Project deleted' };
  }

  async inviteMember(projectId: string, inviterId: string, dto: InviteMemberDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new NotFoundException('No user found with that email');

    const existing = await this.prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: user.id } },
    });
    if (existing) throw new ConflictException('User is already a member');

    await this.prisma.projectMember.create({
      data: { projectId, userId: user.id, role: dto.role },
    });

    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    await this.notifications.create(user.id, {
      title: 'Project Invitation',
      message: `You have been added to project: ${project?.name}`,
      link: `/projects/${projectId}`,
    });

    await this.activity.log(projectId, inviterId, 'MEMBER_ADDED', {
      addedUserId: user.id,
      addedUserName: user.name,
    });

    return { message: 'Member invited successfully' };
  }

  async removeMember(projectId: string, removerId: string, targetUserId: string) {
    const scrumMasters = await this.prisma.projectMember.count({
      where: { projectId, role: 'SCRUM_MASTER' },
    });

    const targetMember = await this.prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: targetUserId } },
    });

    if (!targetMember) throw new NotFoundException('Member not found in this project');

    if (targetMember.role === 'SCRUM_MASTER' && scrumMasters <= 1) {
      throw new ForbiddenException('Cannot remove the only Scrum Master');
    }

    await this.prisma.projectMember.delete({
      where: { projectId_userId: { projectId, userId: targetUserId } },
    });

    await this.activity.log(projectId, removerId, 'MEMBER_REMOVED', { removedUserId: targetUserId });
    return { message: 'Member removed' };
  }

  async getStats(projectId: string) {
    const [totalTasks, completedTasks, totalSprints, activeSprint] = await Promise.all([
      this.prisma.task.count({ where: { projectId, deletedAt: null } }),
      this.prisma.task.count({ where: { projectId, status: 'DONE', deletedAt: null } }),
      this.prisma.sprint.count({ where: { projectId } }),
      this.prisma.sprint.findFirst({ where: { projectId, status: 'ACTIVE' } }),
    ]);

    return {
      totalTasks,
      completedTasks,
      progressPercent: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      totalSprints,
      activeSprint,
    };
  }

  private projectIncludes() {
    return {
      members: {
        include: {
          user: { select: { id: true, name: true, email: true, avatarUrl: true } },
        },
      },
      _count: { select: { tasks: true, sprints: true } },
    };
  }
}
