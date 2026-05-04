import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';
import { SystemRole } from '@apms/database/generated/client';

export class RegisterDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  // Role is always STUDENT on self-registration; admin/supervisor roles are assigned by admins
  readonly role: SystemRole = SystemRole.STUDENT;
}
