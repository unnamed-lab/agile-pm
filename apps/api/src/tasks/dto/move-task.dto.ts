import { IsEnum, IsNumber, IsOptional, IsString, ValidateIf } from 'class-validator';
import { TaskStatus } from '@apms/database/generated/client';

export class MoveTaskDto {
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ValidateIf(o => o.sprintId !== null)
  @IsOptional()
  @IsString()
  sprintId?: string | null;

  @IsOptional()
  @IsNumber()
  position?: number;
}
