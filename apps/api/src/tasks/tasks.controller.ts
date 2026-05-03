import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { MoveTaskDto } from './dto/move-task.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ProjectMemberGuard } from '../common/guards/project-member.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('projects/:projectId/tasks')
@UseGuards(JwtAuthGuard, ProjectMemberGuard)
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Post()
  create(
    @Param('projectId') projectId: string,
    @CurrentUser() user,
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
    return this.tasksService.findAll(projectId, { status, sprintId });
  }

  @Get('sprint/:sprintId')
  findBySprint(@Param('sprintId') sprintId: string) {
    return this.tasksService.findBySprint(sprintId);
  }

  @Get(':taskId')
  findOne(@Param('taskId') taskId: string) {
    return this.tasksService.findOne(taskId);
  }

  @Patch(':taskId')
  update(
    @Param('taskId') taskId: string,
    @CurrentUser() user,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasksService.update(taskId, user.id, dto);
  }

  @Patch(':taskId/move')
  moveTask(
    @Param('taskId') taskId: string,
    @CurrentUser() user,
    @Body() dto: MoveTaskDto,
  ) {
    return this.tasksService.moveTask(taskId, user.id, dto);
  }

  @Delete(':taskId')
  remove(@Param('taskId') taskId: string, @CurrentUser() user) {
    return this.tasksService.remove(taskId, user.id);
  }
}
