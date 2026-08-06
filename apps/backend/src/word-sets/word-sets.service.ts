import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WordSet } from './entities/word-set.entity';
import { CreateWordSetDto } from './dto/create-word-set.dto';
import { UpdateWordSetDto } from './dto/update-word-set.dto';
import { QueryWordSetsDto } from './dto/query-word-sets.dto';
import {
  WordSetDto,
  PaginatedWordSetsDto,
  WordSetVisibility,
} from '@wordforge/shared-types';

@Injectable()
export class WordSetsService {
  constructor(
    @InjectRepository(WordSet)
    private readonly wordSetRepository: Repository<WordSet>,
  ) {}

  async create(userId: string, createDto: CreateWordSetDto): Promise<WordSetDto> {
    const wordSet = this.wordSetRepository.create({
      userId,
      title: createDto.title.trim(),
      description: createDto.description ? createDto.description.trim() : null,
      sourceLanguage: createDto.sourceLanguage || 'en',
      targetLanguage: createDto.targetLanguage || 'uk',
      visibility: createDto.visibility || WordSetVisibility.PRIVATE,
    });

    const savedSet = await this.wordSetRepository.save(wordSet);
    return this.toWordSetDto(savedSet, 0, 0);
  }

  async findAllForUser(
    userId: string,
    query: QueryWordSetsDto,
  ): Promise<PaginatedWordSetsDto> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const queryBuilder = this.wordSetRepository
      .createQueryBuilder('set')
      .where('set.userId = :userId', { userId });

    if (query.search) {
      const searchTerm = `%${query.search.trim().toLowerCase()}%`;
      queryBuilder.andWhere(
        '(LOWER(set.title) LIKE :searchTerm OR LOWER(set.description) LIKE :searchTerm)',
        { searchTerm },
      );
    }

    const sortField = query.sort || 'createdAt';
    const orderDirection = query.order || 'DESC';
    queryBuilder.orderBy(`set.${sortField}`, orderDirection);

    queryBuilder.skip(skip).take(limit);

    const [sets, total] = await queryBuilder.getManyAndCount();

    const data = await Promise.all(
      sets.map(async (set) => {
        const stats = await this.calculateSetStats(set.id, userId);
        return this.toWordSetDto(set, stats.wordCount, stats.progressPercent);
      }),
    );

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async findOne(id: string, currentUserId: string): Promise<WordSetDto> {
    const wordSet = await this.wordSetRepository.findOne({ where: { id } });

    if (!wordSet) {
      throw new NotFoundException('Word set not found');
    }

    if (
      wordSet.visibility === WordSetVisibility.PRIVATE &&
      wordSet.userId !== currentUserId
    ) {
      throw new ForbiddenException('You do not have access to this word set');
    }

    const stats = await this.calculateSetStats(id, currentUserId);
    return this.toWordSetDto(wordSet, stats.wordCount, stats.progressPercent);
  }

  async update(
    id: string,
    userId: string,
    updateDto: UpdateWordSetDto,
  ): Promise<WordSetDto> {
    const wordSet = await this.wordSetRepository.findOne({ where: { id } });

    if (!wordSet) {
      throw new NotFoundException('Word set not found');
    }

    if (wordSet.userId !== userId) {
      throw new ForbiddenException('You are not authorized to update this set');
    }

    if (updateDto.title !== undefined) {
      wordSet.title = updateDto.title.trim();
    }
    if (updateDto.description !== undefined) {
      wordSet.description = updateDto.description ? updateDto.description.trim() : null;
    }
    if (updateDto.sourceLanguage !== undefined) {
      wordSet.sourceLanguage = updateDto.sourceLanguage;
    }
    if (updateDto.targetLanguage !== undefined) {
      wordSet.targetLanguage = updateDto.targetLanguage;
    }
    if (updateDto.visibility !== undefined) {
      wordSet.visibility = updateDto.visibility;
    }

    const updatedSet = await this.wordSetRepository.save(wordSet);
    const stats = await this.calculateSetStats(id, userId);
    return this.toWordSetDto(updatedSet, stats.wordCount, stats.progressPercent);
  }

  async remove(id: string, userId: string): Promise<{ message: string }> {
    const wordSet = await this.wordSetRepository.findOne({ where: { id } });

    if (!wordSet) {
      throw new NotFoundException('Word set not found');
    }

    if (wordSet.userId !== userId) {
      throw new ForbiddenException('You are not authorized to delete this set');
    }

    await this.wordSetRepository.remove(wordSet);
    return { message: 'Word set deleted successfully' };
  }

  private async calculateSetStats(
    setId: string,
    userId: string,
  ): Promise<{ wordCount: number; progressPercent: number }> {
    const query = await this.wordSetRepository.query(
      `
      SELECT 
        COUNT(w.id)::int as "wordCount",
        COUNT(CASE WHEN lp.status IN ('mastered', 'reviewing') THEN 1 END)::int as "masteredCount"
      FROM words w
      LEFT JOIN learning_progress lp ON lp."wordId" = w.id AND lp."userId" = $2
      WHERE w."setId" = $1
      `,
      [setId, userId],
    );

    const wordCount = query[0]?.wordCount ? parseInt(query[0].wordCount, 10) : 0;
    const masteredCount = query[0]?.masteredCount ? parseInt(query[0].masteredCount, 10) : 0;

    const progressPercent =
      wordCount > 0 ? Math.round((masteredCount / wordCount) * 100) : 0;

    return { wordCount, progressPercent };
  }

  toWordSetDto(set: WordSet, wordCount = 0, progressPercent = 0): WordSetDto {
    return {
      id: set.id,
      userId: set.userId,
      title: set.title,
      description: set.description,
      sourceLanguage: set.sourceLanguage,
      targetLanguage: set.targetLanguage,
      visibility: set.visibility,
      wordCount,
      progressPercent,
      createdAt: set.createdAt,
      updatedAt: set.updatedAt,
    };
  }
}
