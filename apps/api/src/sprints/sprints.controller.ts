import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { SprintsService } from './sprints.service';
import { CreateSprintDto } from './dto/create-sprint.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ProjectMemberGuard } from '../common/guards/project-member.guard';
import { ProjectRoleGuard } from '../common/guards/project-role.guard';
import { RequireProjectRole } from '../common/decorators/project-role.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('projects/:projectId/sprints')
@UseGuards(JwtAuthGuard, ProjectMemberGuard)
export class SprintsController {
  constructor(private sprintsService: SprintsService) {}

  @Post()
  @UseGuards(ProjectRoleGuard)
  @RequireProjectRole('SCRUM_MASTER')
  create(
    @Param('projectId') projectId: string,
    @CurrentUser() user,
    @Body() dto: CreateSprintDto,
  ) {
    return this.sprintsService.create(projectId, user.id, dto);
  }

  @Get()
  findAll(@Param('projectId') projectId: string) {
    return this.sprintsService.findAll(projectId);
  }

  @Get(':sprintId')
  findOne(
    @Param('projectId') projectId: string,
    @Param('sprintId') sprintId: string,
  ) {
    return this.sprintsService.findOne(projectId, sprintId);
  }

  @Patch(':sprintId/start')
  @UseGuards(ProjectRoleGuard)
  @RequireProjectRole('SCRUM_MASTER')
  startSprint(
    @Param('projectId') projectId: string,
    @Param('sprintId') sprintId: string,
    @CurrentUser() user,
  ) {
    return this.sprintsService.startSprint(projectId, sprintId, user.id);
  }

  @Patch(':sprintId/complete')
  @UseGuards(ProjectRoleGuard)
  @RequireProjectRole('SCRUM_MASTER')
  completeSprint(
    @Param('projectId') projectId: string,
    @Param('sprintId') sprintId: string,
    @CurrentUser() user,
  ) {
    return this.sprintsService.completeSprint(projectId, sprintId, user.id);
  }

  @Get(':sprintId/burndown')
  getBurndown(
    @Param('projectId') projectId: string,
    @Param('sprintId') sprintId: string,
  ) {
    return this.sprintsService.getBurndownData(projectId, sprintId);
  }
}
