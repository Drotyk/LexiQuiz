import { IsArray, ValidateNested, ArrayMinSize, ArrayMaxSize } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateWordDto } from './create-word.dto';

export class BulkCreateWordsDto {
  @ApiProperty({ type: [CreateWordDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateWordDto)
  @ArrayMinSize(1)
  @ArrayMaxSize(500)
  words: CreateWordDto[];
}
