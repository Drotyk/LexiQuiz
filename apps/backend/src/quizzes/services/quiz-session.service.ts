import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuizSession } from '../entities/quiz-session.entity';
import { QuizAnswer } from '../entities/quiz-answer.entity';
import { Word } from '../../words/entities/word.entity';
import { WordSet } from '../../word-sets/entities/word-set.entity';
import { QuizGenerationService, InternalQuizQuestion } from './quiz-generation.service';
import { QuizAnswerValidatorService } from './quiz-answer-validator.service';
import { QuizScoringService } from './quiz-scoring.service';
import { LearningService } from '../../learning/learning.service';
import { CreateQuizSessionDto } from '../dto/create-quiz-session.dto';
import { SubmitAnswerDto } from '../dto/submit-answer.dto';
import {
  QuizQuestionDto,
  QuizAnswerResultDto,
  QuizSessionResultDto,
  QuizSessionStatus,
  LearningRating,
} from '@wordforge/shared-types';

@Injectable()
export class QuizSessionService {
  constructor(
    @InjectRepository(QuizSession)
    private readonly sessionRepository: Repository<QuizSession>,
    @InjectRepository(QuizAnswer)
    private readonly answerRepository: Repository<QuizAnswer>,
    @InjectRepository(Word)
    private readonly wordRepository: Repository<Word>,
    @InjectRepository(WordSet)
    private readonly wordSetRepository: Repository<WordSet>,
    private readonly quizGenerationService: QuizGenerationService,
    private readonly quizAnswerValidatorService: QuizAnswerValidatorService,
    private readonly quizScoringService: QuizScoringService,
    private readonly learningService: LearningService,
  ) {}

  async createSession(
    userId: string,
    createDto: CreateQuizSessionDto,
  ): Promise<QuizSession> {
    const wordSet = await this.wordSetRepository.findOne({
      where: { id: createDto.setId },
    });

    if (!wordSet) {
      throw new NotFoundException('Word set not found');
    }

    if (
      wordSet.visibility === 'private' &&
      wordSet.userId !== userId
    ) {
      throw new ForbiddenException('You do not have access to this word set');
    }

    const words = await this.wordRepository.find({
      where: { setId: createDto.setId },
    });

    if (words.length === 0) {
      throw new BadRequestException('Cannot start a quiz on an empty set');
    }

    const questionCount = createDto.questionCount || 10;
    const questions = this.quizGenerationService.generateQuestions(
      words,
      questionCount,
    );

    const session = this.sessionRepository.create({
      userId,
      setId: createDto.setId,
      mode: createDto.mode || 'standard',
      status: QuizSessionStatus.ACTIVE,
      totalQuestions: questions.length,
      correctAnswers: 0,
      questionsData: questions,
    });

    return await this.sessionRepository.save(session);
  }

  async getCurrentQuestion(
    sessionId: string,
    userId: string,
  ): Promise<QuizQuestionDto> {
    const session = await this.findUserSession(sessionId, userId);

    if (session.status !== QuizSessionStatus.ACTIVE) {
      throw new BadRequestException('This quiz session is no longer active');
    }

    const answers = await this.answerRepository.find({
      where: { sessionId },
    });

    const currentIndex = answers.length;
    const questions: InternalQuizQuestion[] = session.questionsData;

    if (currentIndex >= questions.length) {
      throw new BadRequestException('All questions in this session have been answered');
    }

    const question = questions[currentIndex];
    return this.quizGenerationService.toPublicQuestionDto(
      question,
      session.totalQuestions,
    );
  }

  async submitAnswer(
    sessionId: string,
    userId: string,
    dto: SubmitAnswerDto,
  ): Promise<QuizAnswerResultDto> {
    const session = await this.findUserSession(sessionId, userId);

    if (session.status !== QuizSessionStatus.ACTIVE) {
      throw new BadRequestException('This quiz session is no longer active');
    }

    const answers = await this.answerRepository.find({
      where: { sessionId },
    });

    const currentIndex = answers.length;
    const questions: InternalQuizQuestion[] = session.questionsData;

    if (currentIndex >= questions.length) {
      throw new BadRequestException('All questions have been answered');
    }

    const question = questions[currentIndex];

    if (question.wordId !== dto.wordId) {
      throw new BadRequestException('Word ID does not match current question');
    }

    const isCorrect = this.quizAnswerValidatorService.validateAnswer(
      dto.userAnswer,
      question.correctAnswer,
    );

    if (isCorrect) {
      session.correctAnswers += 1;
    }

    const answerRecord = this.answerRepository.create({
      sessionId,
      wordId: dto.wordId,
      questionType: question.questionType,
      userAnswer: dto.userAnswer.trim(),
      correctAnswer: question.correctAnswer,
      isCorrect,
      responseTimeMs: dto.responseTimeMs || 0,
    });

    await this.answerRepository.save(answerRecord);

    // Update learning progress for word based on quiz outcome
    try {
      await this.learningService.reviewWord(
        userId,
        dto.wordId,
        isCorrect ? LearningRating.GOOD : LearningRating.AGAIN,
      );
    } catch {
      // Ignore background review logging error
    }

    // Auto-complete if last question answered
    if (currentIndex + 1 >= questions.length) {
      session.status = QuizSessionStatus.COMPLETED;
      session.completedAt = new Date();
    }

    await this.sessionRepository.save(session);

    return {
      isCorrect,
      correctAnswer: question.correctAnswer,
      userAnswer: dto.userAnswer.trim(),
    };
  }

  async completeSession(
    sessionId: string,
    userId: string,
  ): Promise<QuizSessionResultDto> {
    const session = await this.findUserSession(sessionId, userId);

    if (session.status === QuizSessionStatus.ACTIVE) {
      session.status = QuizSessionStatus.COMPLETED;
      session.completedAt = new Date();
      await this.sessionRepository.save(session);
    }

    return this.getSessionResult(sessionId, userId);
  }

  async getSessionResult(
    sessionId: string,
    userId: string,
  ): Promise<QuizSessionResultDto> {
    const session = await this.findUserSession(sessionId, userId);

    const answers = await this.answerRepository.find({
      where: { sessionId },
      relations: ['word'],
      order: { createdAt: 'ASC' },
    });

    return this.quizScoringService.computeSessionResult(session, answers);
  }

  private async findUserSession(
    sessionId: string,
    userId: string,
  ): Promise<QuizSession> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Quiz session not found');
    }

    if (session.userId !== userId) {
      throw new ForbiddenException('You do not have access to this quiz session');
    }

    return session;
  }
}
