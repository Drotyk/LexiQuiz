import { IsString, IsOptional, IsEnum, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { WordSetVisibility } from '@wordforge/shared-types';

export class CreateWordSetDto {
  @ApiProperty({ example: 'English - Travel Vocabulary' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  title: string;

  @ApiPropertyOptional({ example: 'Useful words for airport, hotels, and asking directions' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ example: 'en', default: 'en' })
  @IsOptional()
  @IsString()
  sourceLanguage?: string;

  @ApiPropertyOptional({ example: 'uk', default: 'uk' })
  @IsOptional()
  @IsString()
  targetLanguage?: string;

  @ApiPropertyOptional({ enum: WordSetVisibility, default: WordSetVisibility.PRIVATE })
  @IsOptional()
  @IsEnum(WordSetVisibility)
  visibility?: WordSetVisibility;
}
