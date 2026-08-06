import { IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BulkPreviewDto {
  @ApiProperty({
    example: 'destination — місце призначення\nluggage — багаж\ndeparture — відправлення',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(50000)
  text: string;
}
