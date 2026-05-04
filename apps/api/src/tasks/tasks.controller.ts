import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { MoveTaskDto } from './dto/move-task.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ProjectMemberGuard } from '../common/guards/project-member.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { TaskStatus } from '@apms/database/generated/client';

interface AuthUser { id: string; email: string; name: string; role: string }

@Controller('projects/:projectId/tasks')
@UseGuards(JwtAuthGuard, ProjectMemberGuard)
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Post()
  create(
    @Param('projectId') projectId: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateTaskDto,
  ) {
    return this.tasksService.create(projectId, user.id, dto);
  }

  @Get()
  findAll(
    @Param('projectId') projectId: string,
    @Query('status') status?: string,
    @Query('sprintId') sprintId?: string,
  ) {
    const filters: { status?: TaskStatus; sprintId?: string } = {};
    if (status && Object.values(TaskStatus).includes(status as TaskStatus)) {
      filters.status = status as TaskStatus;
    }
    if (sprintId !== undefined) {
      filters.sprintId = sprintId;
    }
    return this.tasksService.findAll(projectId, filters);
  }

  @Get('sprint/:sprintId')
  findBySprint(@Param('sprintId') sprintId: string) {
    return this.tasksService.findBySprint(sprintId);
  }

  @Get(':taskId')
  findOne(
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
  ) {
    return this.tasksService.findOne(projectId, taskId);
  }

  @Patch(':taskId')
  update(
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasksService.update(projectId, taskId, user.id, dto);
  }

  @Patch(':taskId/move')
  moveTask(
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: MoveTaskDto,
  ) {
    return this.tasksService.moveTask(projectId, taskId, user.id, dto);
  }

  @Delete(':taskId')
  remove(
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.tasksService.remove(projectId, taskId, user.id);
  }
}
