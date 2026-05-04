import { IsEnum, IsNumber, IsOptional, IsUUID, ValidateIf } from 'class-validator';
import { TaskStatus } from '@apms/database/generated/client';

export class MoveTaskDto {
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ValidateIf(o => o.sprintId !== null)
  @IsOptional()
  @IsUUID()
  sprintId?: string | null;

  @IsOptional()
  @IsNumber()
  position?: number;
}
