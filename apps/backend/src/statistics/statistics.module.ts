import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Word } from '../words/entities/word.entity';
import { WordSet } from '../word-sets/entities/word-set.entity';
import { LearningProgress } from '../learning/entities/learning-progress.entity';
import { QuizSession } from '../quizzes/entities/quiz-session.entity';
import { QuizAnswer } from '../quizzes/entities/quiz-answer.entity';
import { User } from '../users/entities/user.entity';
import { StatisticsService } from './statistics.service';
import { StatisticsController } from './statistics.controller';
import { DailyActivityModule } from '../daily-activity/daily-activity.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Word,
      WordSet,
      LearningProgress,
      QuizSession,
      QuizAnswer,
      User,
    ]),
    DailyActivityModule,
  ],
  controllers: [StatisticsController],
  providers: [StatisticsService],
  exports: [StatisticsService],
})
export class StatisticsModule {}
