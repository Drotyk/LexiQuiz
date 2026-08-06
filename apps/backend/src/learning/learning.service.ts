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
import { SpacedRepetitionService } from './spaced-repetition.service';
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
    private readonly spacedRepetitionService: SpacedRepetitionService,
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

    // 1. Get words that are due for review (nextReviewAt <= NOW())
    const dueProgress = await this.progressRepository.find({
      where: {
        userId,
        nextReviewAt: LessThanOrEqual(now),
      },
      relations: ['word'],
      take: limit,
    });

    const dueCards: StudyCardDto[] = dueProgress
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

    // 2. If due words are less than limit, include new words without progress
    if (dueCards.length < limit) {
      const remainingLimit = limit - dueCards.length;

      const existingProgressWordIds = (
        await this.progressRepository.find({
          where: { userId },
          select: ['wordId'],
        })
      ).map((p) => p.wordId);

      const userWordSets = await this.wordSetRepository.find({
        where: { userId },
        select: ['id'],
      });

      if (userWordSets.length > 0) {
        const userSetIds = userWordSets.map((s) => s.id);
        const queryBuilder = this.wordRepository
          .createQueryBuilder('word')
          .where('word.setId IN (:...userSetIds)', { userSetIds });

        if (existingProgressWordIds.length > 0) {
          queryBuilder.andWhere('word.id NOT IN (:...existingProgressWordIds)', {
            existingProgressWordIds,
          });
        }

        const newWords = await queryBuilder.take(remainingLimit).getMany();

        newWords.forEach((word) => {
          dueCards.push({
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
            progress: null,
          });
        });
      }
    }

    return dueCards;
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

    if (rating === LearningRating.AGAIN) {
      progress.incorrectAnswers += 1;
    } else {
      progress.correctAnswers += 1;
    }

    // Perform SM-2 calculation using SpacedRepetitionService
    const calculation = this.spacedRepetitionService.calculateNextReview(
      {
        status: progress.status,
        consecutiveCorrect: progress.consecutiveCorrect,
        easeFactor: Number(progress.easeFactor),
        repetitionInterval: progress.repetitionInterval,
      },
      rating,
      now,
    );

    progress.status = calculation.status;
    progress.consecutiveCorrect = calculation.consecutiveCorrect;
    progress.easeFactor = calculation.easeFactor;
    progress.repetitionInterval = calculation.repetitionInterval;
    progress.nextReviewAt = calculation.nextReviewAt;

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
