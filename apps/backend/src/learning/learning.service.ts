import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { LearningProgress } from './entities/learning-progress.entity';
import { Word } from '../words/entities/word.entity';
import { WordSet } from '../word-sets/entities/word-set.entity';
import {
  LearningRating,
  LearningStatus,
  StudyCardDto,
  LearningProgressDto,
} from '@wordforge/shared-types';

@Injectable()
export class LearningService {
  constructor(
    @InjectRepository(LearningProgress)
    private readonly progressRepository: Repository<LearningProgress>,
    @InjectRepository(Word)
    private readonly wordRepository: Repository<Word>,
    @InjectRepository(WordSet)
    private readonly wordSetRepository: Repository<WordSet>,
  ) {}

  async getCardsForSet(userId: string, setId: string): Promise<StudyCardDto[]> {
    const wordSet = await this.wordSetRepository.findOne({
      where: { id: setId },
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
      where: { setId },
      order: { createdAt: 'ASC' },
    });

    if (words.length === 0) {
      return [];
    }

    const wordIds = words.map((w) => w.id);

    const progressMap = new Map<string, LearningProgress>();
    // Fetch all progress for user for these words
    const userProgress = await this.progressRepository
      .createQueryBuilder('lp')
      .where('lp.userId = :userId AND lp.wordId IN (:...wordIds)', {
        userId,
        wordIds,
      })
      .getMany();

    userProgress.forEach((lp) => progressMap.set(lp.wordId, lp));

    return words.map((word) => ({
      word: {
        id: word.id,
        setId: word.setId,
        term: word.term,
        translation: word.translation,
        transcription: word.transcription,
        example: word.example,
        note: word.note,
        partOfSpeech: word.partOfSpeech,
        difficulty: word.difficulty,
        createdAt: word.createdAt,
        updatedAt: word.updatedAt,
      },
      progress: progressMap.has(word.id)
        ? this.toProgressDto(progressMap.get(word.id)!)
        : null,
    }));
  }

  async getDueWords(userId: string, limit = 20): Promise<StudyCardDto[]> {
    const now = new Date();

    const dueProgress = await this.progressRepository.find({
      where: {
        userId,
        nextReviewAt: LessThanOrEqual(now),
      },
      relations: ['word'],
      take: limit,
    });

    return dueProgress
      .filter((lp) => lp.word)
      .map((lp) => ({
        word: {
          id: lp.word.id,
          setId: lp.word.setId,
          term: lp.word.term,
          translation: lp.word.translation,
          transcription: lp.word.transcription,
          example: lp.word.example,
          note: lp.word.note,
          partOfSpeech: lp.word.partOfSpeech,
          difficulty: lp.word.difficulty,
          createdAt: lp.word.createdAt,
          updatedAt: lp.word.updatedAt,
        },
        progress: this.toProgressDto(lp),
      }));
  }

  async reviewWord(
    userId: string,
    wordId: string,
    rating: LearningRating,
  ): Promise<LearningProgressDto> {
    const word = await this.wordRepository.findOne({ where: { id: wordId } });
    if (!word) {
      throw new NotFoundException('Word not found');
    }

    let progress = await this.progressRepository.findOne({
      where: { userId, wordId },
    });

    if (!progress) {
      progress = this.progressRepository.create({
        userId,
        wordId,
        status: LearningStatus.NEW,
        correctAnswers: 0,
        incorrectAnswers: 0,
        consecutiveCorrect: 0,
        easeFactor: 2.5,
        repetitionInterval: 0,
        lastReviewedAt: null,
        nextReviewAt: null,
      });
    }

    const now = new Date();
    progress.lastReviewedAt = now;

    let ease = Number(progress.easeFactor) || 2.5;
    let interval = progress.repetitionInterval || 0;
    let consecutive = progress.consecutiveCorrect || 0;

    switch (rating) {
      case LearningRating.AGAIN:
        consecutive = 0;
        progress.incorrectAnswers += 1;
        progress.status = LearningStatus.LEARNING;
        interval = 10; // 10 minutes
        ease = Math.max(1.3, ease - 0.2);
        break;

      case LearningRating.HARD:
        progress.correctAnswers += 1;
        consecutive += 1;
        progress.status = LearningStatus.LEARNING;
        interval = Math.max(1, Math.round(interval * 1.2)) || 1440; // 1 day in minutes
        ease = Math.max(1.3, ease - 0.15);
        break;

      case LearningRating.GOOD:
        progress.correctAnswers += 1;
        consecutive += 1;
        progress.status =
          consecutive >= 3 ? LearningStatus.REVIEWING : LearningStatus.LEARNING;
        if (consecutive === 1) interval = 1440; // 1 day
        else if (consecutive === 2) interval = 4320; // 3 days
        else interval = Math.round(interval * ease);
        break;

      case LearningRating.EASY:
        progress.correctAnswers += 1;
        consecutive += 1;
        progress.status =
          consecutive >= 2 ? LearningStatus.MASTERED : LearningStatus.REVIEWING;
        ease += 0.15;
        if (consecutive === 1) interval = 5760; // 4 days
        else interval = Math.round(interval * ease * 1.3);
        break;
    }

    progress.easeFactor = Number(ease.toFixed(2));
    progress.repetitionInterval = interval;
    progress.consecutiveCorrect = consecutive;

    // Calculate nextReviewAt
    const nextReview = new Date(now.getTime() + interval * 60 * 1000);
    progress.nextReviewAt = nextReview;

    const savedProgress = await this.progressRepository.save(progress);
    return this.toProgressDto(savedProgress);
  }

  toProgressDto(lp: LearningProgress): LearningProgressDto {
    return {
      id: lp.id,
      userId: lp.userId,
      wordId: lp.wordId,
      status: lp.status,
      correctAnswers: lp.correctAnswers,
      incorrectAnswers: lp.incorrectAnswers,
      consecutiveCorrect: lp.consecutiveCorrect,
      easeFactor: Number(lp.easeFactor),
      repetitionInterval: lp.repetitionInterval,
      lastReviewedAt: lp.lastReviewedAt,
      nextReviewAt: lp.nextReviewAt,
    };
  }
}
