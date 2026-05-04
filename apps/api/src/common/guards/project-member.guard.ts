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

    const membership = await this.prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: user.id } },
    });

    if (membership) {
      request.projectMembership = membership;
      return true;
    }

    // Supervisors assigned to a project get read-only access without a membership record
    if (user.role === 'SUPERVISOR') {
      const project = await this.prisma.project.findFirst({
        where: { id: projectId, supervisorId: user.id, deletedAt: null },
      });
      if (project) return true;
    }

    throw new ForbiddenException('You are not a member of this project');
  }
}
