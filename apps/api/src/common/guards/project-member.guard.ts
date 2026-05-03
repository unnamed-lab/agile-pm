import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ProjectMemberGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const projectId = request.params.id || request.params.projectId;

    if (!user || !projectId) return false;

    // Supervisors can access any project they are assigned to
    if (user.role === 'SUPERVISOR') {
      const project = await this.prisma.project.findFirst({
        where: { id: projectId, supervisorId: user.id, deletedAt: null },
      });
      if (project) return true;
    }

    const membership = await this.prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: user.id } },
    });

    if (!membership) throw new ForbiddenException('You are not a member of this project');

    request.projectMembership = membership;
    return true;
  }
}
