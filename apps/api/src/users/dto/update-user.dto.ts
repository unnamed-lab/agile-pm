import { IsOptional, IsString, IsUrl, MinLength, MaxLength } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsUrl({ protocols: ['https'], require_protocol: true })
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;
}
