import { IsUUID, IsString, IsOptional, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SubmitAnswerDto {
  @ApiProperty({ example: 'word-uuid' })
  @IsUUID()
  wordId: string;

  @ApiProperty({ example: 'місце призначення' })
  @IsString()
  userAnswer: string;

  @ApiPropertyOptional({ example: 1200, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  responseTimeMs?: number;
}
