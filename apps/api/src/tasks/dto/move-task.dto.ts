import { IsEnum, IsNumber, IsOptional, IsUUID } from 'class-validator';
import { TaskStatus } from '@apms/database/generated/client';

export class MoveTaskDto {
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsUUID()
  sprintId?: string | null;

  @IsOptional()
  @IsNumber()
  position?: number;
}
