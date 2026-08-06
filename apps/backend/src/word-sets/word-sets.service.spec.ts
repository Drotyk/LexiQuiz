import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { WordSetsService } from './word-sets.service';
import { WordSet } from './entities/word-set.entity';
import { WordSetVisibility } from '@wordforge/shared-types';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('WordSetsService', () => {
  let service: WordSetsService;

  const mockWordSet: WordSet = {
    id: 'set-uuid-1',
    userId: 'user-uuid-1',
    user: null as any,
    title: 'Travel Vocabulary',
    description: 'Airport and hotel words',
    sourceLanguage: 'en',
    targetLanguage: 'uk',
    visibility: WordSetVisibility.PRIVATE,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockResolvedValue([[mockWordSet], 1]),
  };

  const mockRepository = {
    create: jest.fn().mockReturnValue(mockWordSet),
    save: jest.fn().mockResolvedValue(mockWordSet),
    findOne: jest.fn(),
    remove: jest.fn().mockResolvedValue(mockWordSet),
    createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WordSetsService,
        {
          provide: getRepositoryToken(WordSet),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<WordSetsService>(WordSetsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new word set', async () => {
      const result = await service.create('user-uuid-1', {
        title: 'Travel Vocabulary',
        description: 'Airport and hotel words',
      });

      expect(result.title).toBe('Travel Vocabulary');
      expect(result.userId).toBe('user-uuid-1');
    });
  });

  describe('findAllForUser', () => {
    it('should return paginated word sets', async () => {
      const result = await service.findAllForUser('user-uuid-1', {
        page: 1,
        limit: 10,
      });

      expect(result.data.length).toBe(1);
      expect(result.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return set if user is owner', async () => {
      mockRepository.findOne.mockResolvedValue(mockWordSet);

      const result = await service.findOne('set-uuid-1', 'user-uuid-1');
      expect(result.id).toBe('set-uuid-1');
    });

    it('should throw ForbiddenException if set is private and requested by another user', async () => {
      mockRepository.findOne.mockResolvedValue(mockWordSet);

      await expect(
        service.findOne('set-uuid-1', 'other-user-uuid'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if set does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.findOne('non-existent', 'user-uuid-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete set if user is owner', async () => {
      mockRepository.findOne.mockResolvedValue(mockWordSet);

      const result = await service.remove('set-uuid-1', 'user-uuid-1');
      expect(result.message).toBe('Word set deleted successfully');
    });

    it('should throw ForbiddenException if non-owner tries to delete set', async () => {
      mockRepository.findOne.mockResolvedValue(mockWordSet);

      await expect(
        service.remove('set-uuid-1', 'other-user-uuid'),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
