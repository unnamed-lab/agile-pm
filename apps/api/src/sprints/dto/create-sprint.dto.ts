import { IsDateString, IsOptional, IsString, MaxLength, IsOptional } from 'class-validator';

export class CreateSprintDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  goal?: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsString()
  @MaxLength(7)
  color?: string;
}
