import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { StatisticsService } from './statistics.service';
import { Word } from '../words/entities/word.entity';
import { WordSet } from '../word-sets/entities/word-set.entity';
import { LearningProgress } from '../learning/entities/learning-progress.entity';
import { QuizSession } from '../quizzes/entities/quiz-session.entity';
import { QuizAnswer } from '../quizzes/entities/quiz-answer.entity';
import { User } from '../users/entities/user.entity';
import { WordSetVisibility } from '@wordforge/shared-types';

describe('StatisticsService', () => {
  let service: StatisticsService;

  const mockUser: User = {
    id: 'user-1',
    email: 'test@example.com',
    passwordHash: 'hash',
    name: 'User One',
    dailyGoal: 15,
    timezone: 'UTC',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockWordSet: WordSet = {
    id: 'set-1',
    userId: 'user-1',
    user: mockUser,
    title: 'Travel',
    description: null,
    sourceLanguage: 'en',
    targetLanguage: 'uk',
    visibility: WordSetVisibility.PRIVATE,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUserRepo = {
    findOne: jest.fn().mockResolvedValue(mockUser),
  };

  const mockWordSetRepo = {
    find: jest.fn().mockResolvedValue([mockWordSet]),
    findOne: jest.fn().mockResolvedValue(mockWordSet),
  };

  const mockWordRepo = {
    find: jest.fn().mockResolvedValue([]),
    createQueryBuilder: jest.fn().mockReturnValue({
      where: jest.fn().mockReturnThis(),
      getCount: jest.fn().mockResolvedValue(5),
    }),
  };

  const mockProgressRepo = {
    find: jest.fn().mockResolvedValue([]),
    count: jest.fn().mockResolvedValue(2),
  };

  const mockSessionRepo = {
    count: jest.fn().mockResolvedValue(3),
  };

  const mockAnswerRepo = {
    createQueryBuilder: jest.fn().mockReturnValue({
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatisticsService,
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
        { provide: getRepositoryToken(WordSet), useValue: mockWordSetRepo },
        { provide: getRepositoryToken(Word), useValue: mockWordRepo },
        { provide: getRepositoryToken(LearningProgress), useValue: mockProgressRepo },
        { provide: getRepositoryToken(QuizSession), useValue: mockSessionRepo },
        { provide: getRepositoryToken(QuizAnswer), useValue: mockAnswerRepo },
      ],
    }).compile();

    service = module.get<StatisticsService>(StatisticsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getOverview', () => {
    it('should compute overview metrics correctly', async () => {
      mockUserRepo.findOne.mockResolvedValue(mockUser);
      mockWordSetRepo.find.mockResolvedValue([mockWordSet]);

      const overview = await service.getOverview('user-1');

      expect(overview.totalWords).toBe(5);
      expect(overview.dailyGoal).toBe(15);
      expect(overview.totalQuizzesCompleted).toBe(3);
    });
  });

  describe('getActivity', () => {
    it('should return daily activity log for 7 days', async () => {
      const activity = await service.getActivity('user-1', 7);
      expect(activity.length).toBe(7);
      expect(activity[0]).toHaveProperty('date');
      expect(activity[0]).toHaveProperty('count');
    });
  });
});
