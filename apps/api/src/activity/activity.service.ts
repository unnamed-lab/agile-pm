import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ActivityService {
  constructor(private prisma: PrismaService) {}


  async log(projectId: string, userId: string, action: string, details: any) {
    return this.prisma.activityLog.create({
      data: {
        projectId,
        userId,
        action,
        metadata: details,
      },
    });
  }

  async getProjectLogs(projectId: string, limit = 50) {
    return this.prisma.activityLog.findMany({
      where: { projectId },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getUserLogs(userId: string, limit = 50) {
    return this.prisma.activityLog.findMany({
      where: { userId },
      include: {
        project: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
