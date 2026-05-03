import { IsEmail, IsEnum, IsOptional } from 'class-validator';
import { ProjectRole } from '@apms/database/generated/client';

export class InviteMemberDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsEnum(ProjectRole)
  role?: ProjectRole = ProjectRole.DEVELOPER;
}
