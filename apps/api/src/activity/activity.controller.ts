import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('activity')
@UseGuards(JwtAuthGuard)
export class ActivityController {
  constructor(private activityService: ActivityService) {}

  @Get('user')
  getUserActivity(@CurrentUser() user, @Query('limit') limit?: string) {
    return this.activityService.getUserLogs(user.id, limit ? parseInt(limit) : 50);
  }

  @Get('project/:projectId')
  getProjectActivity(
    @Param('projectId') projectId: string,
    @Query('limit') limit?: string,
  ) {
    return this.activityService.getProjectLogs(projectId, limit ? parseInt(limit) : 50);
  }
}
