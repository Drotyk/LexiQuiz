import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LearningProgress } from './entities/learning-progress.entity';
import { Word } from '../words/entities/word.entity';
import { WordSet } from '../word-sets/entities/word-set.entity';
import { LearningService } from './learning.service';
import { LearningController } from './learning.controller';

@Module({
  imports: [TypeOrmModule.forFeature([LearningProgress, Word, WordSet])],
  controllers: [LearningController],
  providers: [LearningService],
  exports: [LearningService],
})
export class LearningModule {}
