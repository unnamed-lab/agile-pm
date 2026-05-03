import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ProjectMemberGuard } from '../common/guards/project-member.guard';
import { ProjectRoleGuard } from '../common/guards/project-role.guard';
import { RequireProjectRole } from '../common/decorators/project-role.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @Post()
  create(@CurrentUser() user, @Body() dto: CreateProjectDto) {
    return this.projectsService.create(user.id, dto);
  }

  @Get()
  findAll(@CurrentUser() user) {
    return this.projectsService.findAllForUser(user.id);
  }

  @Get(':id')
  @UseGuards(ProjectMemberGuard)
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @Get(':id/stats')
  @UseGuards(ProjectMemberGuard)
  getStats(@Param('id') id: string) {
    return this.projectsService.getStats(id);
  }

  @Patch(':id')
  @UseGuards(ProjectMemberGuard, ProjectRoleGuard)
  @RequireProjectRole('SCRUM_MASTER')
  update(@Param('id') id: string, @CurrentUser() user, @Body() dto: CreateProjectDto) {
    return this.projectsService.update(id, user.id, dto);
  }

  @Delete(':id')
  @UseGuards(ProjectMemberGuard, ProjectRoleGuard)
  @RequireProjectRole('SCRUM_MASTER')
  remove(@Param('id') id: string, @CurrentUser() user) {
    return this.projectsService.softDelete(id, user.id);
  }

  @Post(':id/members')
  @UseGuards(ProjectMemberGuard, ProjectRoleGuard)
  @RequireProjectRole('SCRUM_MASTER')
  inviteMember(
    @Param('id') id: string,
    @CurrentUser() user,
    @Body() dto: InviteMemberDto,
  ) {
    return this.projectsService.inviteMember(id, user.id, dto);
  }

  @Delete(':id/members/:userId')
  @UseGuards(ProjectMemberGuard, ProjectRoleGuard)
  @RequireProjectRole('SCRUM_MASTER')
  removeMember(
    @Param('id') id: string,
    @CurrentUser() user,
    @Param('userId') userId: string,
  ) {
    return this.projectsService.removeMember(id, user.id, userId);
  }
}
