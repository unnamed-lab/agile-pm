import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';
import { SystemRole } from '@apms/database/generated/client';

export class RegisterDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsEnum(SystemRole)
  role: SystemRole = SystemRole.STUDENT;
}
