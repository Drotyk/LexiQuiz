import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { LearningRating } from '@wordforge/shared-types';

export class ReviewWordDto {
  @ApiProperty({ enum: LearningRating, example: LearningRating.GOOD })
  @IsEnum(LearningRating)
  rating: LearningRating;
}
