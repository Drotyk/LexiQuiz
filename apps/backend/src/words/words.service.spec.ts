import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { WordsService } from './words.service';
import { WordsParserService } from './words-parser.service';
import { Word } from './entities/word.entity';
import { WordSet } from '../word-sets/entities/word-set.entity';
import { WordSetVisibility } from '@wordforge/shared-types';
import { ForbiddenException } from '@nestjs/common';

describe('WordsService', () => {
  let service: WordsService;

  const mockWordSet: WordSet = {
    id: 'set-uuid-1',
    userId: 'user-uuid-1',
    user: null as any,
    title: 'Travel Set',
    description: null,
    sourceLanguage: 'en',
    targetLanguage: 'uk',
    visibility: WordSetVisibility.PRIVATE,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockWord: Word = {
    id: 'word-uuid-1',
    setId: 'set-uuid-1',
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

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockResolvedValue([[mockWord], 1]),
  };

  const mockWordRepository = {
    create: jest.fn().mockReturnValue(mockWord),
    save: jest.fn().mockResolvedValue(mockWord),
    findOne: jest.fn(),
    find: jest.fn().mockResolvedValue([mockWord]),
    remove: jest.fn().mockResolvedValue(mockWord),
    createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
  };

  const mockWordSetRepository = {
    findOne: jest.fn().mockResolvedValue(mockWordSet),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WordsService,
        WordsParserService,
        {
          provide: getRepositoryToken(Word),
          useValue: mockWordRepository,
        },
        {
          provide: getRepositoryToken(WordSet),
          useValue: mockWordSetRepository,
        },
      ],
    }).compile();

    service = module.get<WordsService>(WordsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createWord', () => {
    it('should create and return a word if set ownership is verified', async () => {
      mockWordSetRepository.findOne.mockResolvedValue(mockWordSet);
      mockWordRepository.create.mockReturnValue(mockWord);
      mockWordRepository.save.mockResolvedValue(mockWord);

      const result = await service.createWord('user-uuid-1', 'set-uuid-1', {
        term: 'destination',
        translation: 'місце призначення',
      });

      expect(result.term).toBe('destination');
    });

    it('should throw ForbiddenException if user is not set owner', async () => {
      mockWordSetRepository.findOne.mockResolvedValue(mockWordSet);

      await expect(
        service.createWord('other-user-uuid', 'set-uuid-1', {
          term: 'destination',
          translation: 'місце призначення',
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('deleteWord', () => {
    it('should delete word if authorized owner', async () => {
      mockWordRepository.findOne.mockResolvedValue(mockWord);

      const result = await service.deleteWord('user-uuid-1', 'word-uuid-1');
      expect(result.message).toBe('Word deleted successfully');
    });

    it('should throw ForbiddenException if user is not set owner', async () => {
      mockWordRepository.findOne.mockResolvedValue(mockWord);

      await expect(
        service.deleteWord('other-user-uuid', 'word-uuid-1'),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
