import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePasswordDto {
  @ApiProperty({ example: 'currentSecretPassword123' })
  @IsString()
  currentPassword: string;

  @ApiProperty({ example: 'newSecretPassword123', minLength: 6 })
  @IsString()
  @MinLength(6)
  newPassword: string;
}
