import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LearningService } from './learning.service';
import { SpacedRepetitionService } from './spaced-repetition.service';
import { DailyActivityService } from '../daily-activity/daily-activity.service';
import { LearningProgress } from './entities/learning-progress.entity';
import { Word } from '../words/entities/word.entity';
import { WordSet } from '../word-sets/entities/word-set.entity';
import { LearningRating, LearningStatus, WordSetVisibility } from '@wordforge/shared-types';

describe('LearningService', () => {
  let service: LearningService;

  const mockWordSet: WordSet = {
    id: 'set-1',
    userId: 'user-1',
    user: null as any,
    title: 'Travel',
    description: null,
    sourceLanguage: 'en',
    targetLanguage: 'uk',
    visibility: WordSetVisibility.PRIVATE,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockWord: Word = {
    id: 'word-1',
    setId: 'set-1',
    wordSet: mockWordSet,
    term: 'destination',
    translation: 'місце призначення',
    transcription: null,
    example: null,
    note: null,
    partOfSpeech: null,
    difficulty: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockProgress: LearningProgress = {
    id: 'lp-1',
    userId: 'user-1',
    user: null as any,
    wordId: 'word-1',
    word: mockWord,
    status: LearningStatus.NEW,
    correctAnswers: 0,
    incorrectAnswers: 0,
    consecutiveCorrect: 0,
    easeFactor: 2.5,
    repetitionInterval: 0,
    lastReviewedAt: null,
    nextReviewAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockProgressRepo = {
    find: jest.fn().mockResolvedValue([mockProgress]),
    findOne: jest.fn().mockResolvedValue(mockProgress),
    create: jest.fn().mockReturnValue(mockProgress),
    save: jest.fn().mockImplementation((entity) => Promise.resolve(entity)),
    createQueryBuilder: jest.fn().mockReturnValue({
      where: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([mockProgress]),
    }),
  };

  const mockWordRepo = {
    find: jest.fn().mockResolvedValue([mockWord]),
    findOne: jest.fn().mockResolvedValue(mockWord),
  };

  const mockWordSetRepo = {
    findOne: jest.fn().mockResolvedValue(mockWordSet),
  };

  const mockDailyActivityService = {
    recordActivity: jest.fn().mockResolvedValue({}),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LearningService,
        SpacedRepetitionService,
        { provide: DailyActivityService, useValue: mockDailyActivityService },
        { provide: getRepositoryToken(LearningProgress), useValue: mockProgressRepo },
        { provide: getRepositoryToken(Word), useValue: mockWordRepo },
        { provide: getRepositoryToken(WordSet), useValue: mockWordSetRepo },
      ],
    }).compile();

    service = module.get<LearningService>(LearningService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getCardsForSet', () => {
    it('should return study cards for a set', async () => {
      mockWordSetRepo.findOne.mockResolvedValue(mockWordSet);
      mockWordRepo.find.mockResolvedValue([mockWord]);

      const cards = await service.getCardsForSet('user-1', 'set-1');
      expect(cards.length).toBe(1);
      expect(cards[0].word.term).toBe('destination');
    });
  });

  describe('reviewWord', () => {
    it('should handle rating AGAIN (resets consecutive correct)', async () => {
      mockWordRepo.findOne.mockResolvedValue(mockWord);
      mockProgressRepo.findOne.mockResolvedValue({
        ...mockProgress,
        consecutiveCorrect: 3,
      });

      const result = await service.reviewWord('user-1', 'word-1', LearningRating.AGAIN);

      expect(result.consecutiveCorrect).toBe(0);
      expect(result.status).toBe(LearningStatus.LEARNING);
    });

    it('should handle rating EASY (increases ease factor)', async () => {
      mockWordRepo.findOne.mockResolvedValue(mockWord);
      mockProgressRepo.findOne.mockResolvedValue({
        ...mockProgress,
        easeFactor: 2.5,
      });

      const result = await service.reviewWord('user-1', 'word-1', LearningRating.EASY);

      expect(result.easeFactor).toBeGreaterThan(2.5);
    });
  });
});
