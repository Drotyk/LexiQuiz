import { IsString, IsOptional, MinLength, MaxLength, IsInt, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWordDto {
  @ApiProperty({ example: 'destination' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  term: string;

  @ApiProperty({ example: 'місце призначення' })
  @IsString()
  @MinLength(1)
  @MaxLength(300)
  translation: string;

  @ApiPropertyOptional({ example: '[ˌdestɪˈneɪʃn]' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  transcription?: string;

  @ApiPropertyOptional({ example: 'We arrived at our destination.' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  example?: string;

  @ApiPropertyOptional({ example: 'Noun, formal' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  note?: string;

  @ApiPropertyOptional({ example: 'noun' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  partOfSpeech?: string;

  @ApiPropertyOptional({ example: 1, minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  difficulty?: number;
}
