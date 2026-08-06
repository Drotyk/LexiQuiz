import { IsUUID, IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateQuizSessionDto {
  @ApiProperty({ example: 'word-set-uuid' })
  @IsUUID()
  setId: string;

  @ApiPropertyOptional({ example: 'standard', default: 'standard' })
  @IsOptional()
  @IsString()
  mode?: string;

  @ApiPropertyOptional({ example: 10, default: 10, minimum: 1, maximum: 100 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  questionCount?: number;
}
