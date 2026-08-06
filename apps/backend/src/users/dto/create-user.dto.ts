import { IsEmail, IsString, MinLength, IsOptional, IsInt, Min, Max } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  dailyGoal?: number;

  @IsOptional()
  @IsString()
  timezone?: string;
}
