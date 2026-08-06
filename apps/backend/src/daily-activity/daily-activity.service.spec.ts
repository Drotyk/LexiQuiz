import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DailyActivityService } from './daily-activity.service';
import { DailyActivity } from './entities/daily-activity.entity';
import { User } from '../users/entities/user.entity';

describe('DailyActivityService', () => {
  let service: DailyActivityService;

  const mockUser: User = {
    id: 'user-1',
    email: 'test@example.com',
    passwordHash: 'hash',
    name: 'User One',
    dailyGoal: 5,
    timezone: 'Europe/Kyiv',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockActivity: DailyActivity = {
    id: 'act-1',
    userId: 'user-1',
    user: mockUser,
    date: '2026-08-06',
    reviewedWords: 4,
    correctAnswers: 4,
    incorrectAnswers: 0,
    completedGoal: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUserRepo = {
    findOne: jest.fn().mockResolvedValue(mockUser),
  };

  const mockActivityRepo = {
    findOne: jest.fn().mockResolvedValue(mockActivity),
    find: jest.fn().mockResolvedValue([mockActivity]),
    create: jest.fn().mockReturnValue(mockActivity),
    save: jest.fn().mockImplementation((entity) => Promise.resolve(entity)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DailyActivityService,
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
        { provide: getRepositoryToken(DailyActivity), useValue: mockActivityRepo },
      ],
    }).compile();

    service = module.get<DailyActivityService>(DailyActivityService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('recordActivity', () => {
    it('should record activity and mark goal completed when daily goal reached', async () => {
      mockUserRepo.findOne.mockResolvedValue(mockUser);
      mockActivityRepo.findOne.mockResolvedValue({
        ...mockActivity,
        reviewedWords: 4,
      });

      const updated = await service.recordActivity('user-1', true);

      expect(updated.reviewedWords).toBe(5);
      expect(updated.completedGoal).toBe(true);
    });
  });

  describe('getUserDateStr', () => {
    it('should format date string according to user timezone', () => {
      const date = new Date('2026-08-06T12:00:00Z');
      const dateStr = service.getUserDateStr(date, 'Europe/Kyiv');
      expect(dateStr).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });
});
