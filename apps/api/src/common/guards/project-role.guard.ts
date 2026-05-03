import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PROJECT_ROLE_KEY } from '../decorators/project-role.decorator';

@Injectable()
export class ProjectRoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRole = this.reflector.getAllAndOverride<string>(PROJECT_ROLE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRole) return true;

    const request = context.switchToHttp().getRequest();
    const membership = request.projectMembership;

    if (!membership || membership.role !== requiredRole) {
      throw new ForbiddenException(`Requires project role: ${requiredRole}`);
    }

    return true;
  }
}
