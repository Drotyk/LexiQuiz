import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizSession } from './entities/quiz-session.entity';
import { QuizAnswer } from './entities/quiz-answer.entity';
import { Word } from '../words/entities/word.entity';
import { WordSet } from '../word-sets/entities/word-set.entity';
import { QuizGenerationService } from './services/quiz-generation.service';
import { QuizAnswerValidatorService } from './services/quiz-answer-validator.service';
import { QuizScoringService } from './services/quiz-scoring.service';
import { QuizSessionService } from './services/quiz-session.service';
import { QuizzesController } from './quizzes.controller';
import { LearningModule } from '../learning/learning.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([QuizSession, QuizAnswer, Word, WordSet]),
    LearningModule,
  ],
  controllers: [QuizzesController],
  providers: [
    QuizGenerationService,
    QuizAnswerValidatorService,
    QuizScoringService,
    QuizSessionService,
  ],
  exports: [QuizSessionService],
})
export class QuizzesModule {}
