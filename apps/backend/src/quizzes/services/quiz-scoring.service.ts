import { Injectable } from '@nestjs/common';
import { QuizAnswer } from '../entities/quiz-answer.entity';
import { QuizSession } from '../entities/quiz-session.entity';
import { QuizSessionResultDto, QuizSessionDto } from '@wordforge/shared-types';

@Injectable()
export class QuizScoringService {
  computeSessionResult(
    session: QuizSession,
    answers: QuizAnswer[],
  ): QuizSessionResultDto {
    const total = session.totalQuestions || answers.length || 1;
    const correctCount = answers.filter((a) => a.isCorrect).length;
    const accuracyPercent = Math.round((correctCount / total) * 100);

    const sessionDto: QuizSessionDto = {
      id: session.id,
      userId: session.userId,
      setId: session.setId,
      mode: session.mode,
      status: session.status,
      totalQuestions: total,
      correctAnswers: correctCount,
      startedAt: session.startedAt,
      completedAt: session.completedAt,
    };

    const answerDetails = answers.map((a) => ({
      id: a.id,
      wordId: a.wordId,
      term: a.word ? a.word.term : '',
      questionType: a.questionType,
      userAnswer: a.userAnswer,
      correctAnswer: a.correctAnswer,
      isCorrect: a.isCorrect,
      responseTimeMs: a.responseTimeMs,
    }));

    return {
      session: sessionDto,
      accuracyPercent,
      answers: answerDetails,
    };
  }
}
