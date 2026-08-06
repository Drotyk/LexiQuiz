import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Word } from './entities/word.entity';
import { WordSet } from '../word-sets/entities/word-set.entity';
import { WordsParserService } from './words-parser.service';
import { CreateWordDto } from './dto/create-word.dto';
import { UpdateWordDto } from './dto/update-word.dto';
import { BulkCreateWordsDto } from './dto/bulk-create-words.dto';
import { QueryWordsDto } from './dto/query-words.dto';
import { WordDto, BulkPreviewResultDto } from '@wordforge/shared-types';

@Injectable()
export class WordsService {
  constructor(
    @InjectRepository(Word)
    private readonly wordRepository: Repository<Word>,
    @InjectRepository(WordSet)
    private readonly wordSetRepository: Repository<WordSet>,
    private readonly wordsParserService: WordsParserService,
  ) {}

  async createWord(
    userId: string,
    setId: string,
    createDto: CreateWordDto,
  ): Promise<WordDto> {
    await this.verifySetOwnership(setId, userId);

    const word = this.wordRepository.create({
      setId,
      term: createDto.term.trim(),
      translation: createDto.translation.trim(),
      transcription: createDto.transcription
        ? createDto.transcription.trim()
        : null,
      example: createDto.example ? createDto.example.trim() : null,
      note: createDto.note ? createDto.note.trim() : null,
      partOfSpeech: createDto.partOfSpeech
        ? createDto.partOfSpeech.trim()
        : null,
      difficulty: createDto.difficulty || 1,
    });

    const savedWord = await this.wordRepository.save(word);
    return this.toWordDto(savedWord);
  }

  async bulkPreview(
    userId: string,
    setId: string,
    text: string,
  ): Promise<BulkPreviewResultDto> {
    await this.verifySetOwnership(setId, userId);

    const existingWords = await this.wordRepository.find({
      where: { setId },
      select: ['term'],
    });

    const existingTerms = existingWords.map((w) => w.term);

    return this.wordsParserService.parseText(text, existingTerms);
  }

  async bulkCreateWords(
    userId: string,
    setId: string,
    bulkDto: BulkCreateWordsDto,
  ): Promise<WordDto[]> {
    await this.verifySetOwnership(setId, userId);

    const wordsToCreate = bulkDto.words.map((item) =>
      this.wordRepository.create({
        setId,
        term: item.term.trim(),
        translation: item.translation.trim(),
        transcription: item.transcription ? item.transcription.trim() : null,
        example: item.example ? item.example.trim() : null,
        note: item.note ? item.note.trim() : null,
        partOfSpeech: item.partOfSpeech ? item.partOfSpeech.trim() : null,
        difficulty: item.difficulty || 1,
      }),
    );

    const savedWords = await this.wordRepository.save(wordsToCreate);
    return savedWords.map((w) => this.toWordDto(w));
  }

  async findAllForSet(
    userId: string,
    setId: string,
    query: QueryWordsDto,
  ): Promise<{ data: WordDto[]; total: number; page: number; limit: number; totalPages: number }> {
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
      throw new ForbiddenException('You do not have access to this set');
    }

    const page = query.page || 1;
    const limit = query.limit || 50;
    const skip = (page - 1) * limit;

    const queryBuilder = this.wordRepository
      .createQueryBuilder('word')
      .where('word.setId = :setId', { setId });

    if (query.search) {
      const searchTerm = `%${query.search.trim().toLowerCase()}%`;
      queryBuilder.andWhere(
        '(LOWER(word.term) LIKE :searchTerm OR LOWER(word.translation) LIKE :searchTerm)',
        { searchTerm },
      );
    }

    const sortField = query.sort || 'createdAt';
    const orderDirection = query.order || 'ASC';
    queryBuilder.orderBy(`word.${sortField}`, orderDirection);

    queryBuilder.skip(skip).take(limit);

    const [words, total] = await queryBuilder.getManyAndCount();

    return {
      data: words.map((w) => this.toWordDto(w)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async updateWord(
    userId: string,
    id: string,
    updateDto: UpdateWordDto,
  ): Promise<WordDto> {
    const word = await this.wordRepository.findOne({
      where: { id },
      relations: ['wordSet'],
    });

    if (!word) {
      throw new NotFoundException('Word not found');
    }

    if (word.wordSet.userId !== userId) {
      throw new ForbiddenException('You are not authorized to edit this word');
    }

    if (updateDto.term !== undefined) {
      word.term = updateDto.term.trim();
    }
    if (updateDto.translation !== undefined) {
      word.translation = updateDto.translation.trim();
    }
    if (updateDto.transcription !== undefined) {
      word.transcription = updateDto.transcription
        ? updateDto.transcription.trim()
        : null;
    }
    if (updateDto.example !== undefined) {
      word.example = updateDto.example ? updateDto.example.trim() : null;
    }
    if (updateDto.note !== undefined) {
      word.note = updateDto.note ? updateDto.note.trim() : null;
    }
    if (updateDto.partOfSpeech !== undefined) {
      word.partOfSpeech = updateDto.partOfSpeech
        ? updateDto.partOfSpeech.trim()
        : null;
    }
    if (updateDto.difficulty !== undefined) {
      word.difficulty = updateDto.difficulty;
    }

    const updatedWord = await this.wordRepository.save(word);
    return this.toWordDto(updatedWord);
  }

  async deleteWord(userId: string, id: string): Promise<{ message: string }> {
    const word = await this.wordRepository.findOne({
      where: { id },
      relations: ['wordSet'],
    });

    if (!word) {
      throw new NotFoundException('Word not found');
    }

    if (word.wordSet.userId !== userId) {
      throw new ForbiddenException('You are not authorized to delete this word');
    }

    await this.wordRepository.remove(word);
    return { message: 'Word deleted successfully' };
  }

  async bulkDeleteWords(
    userId: string,
    wordIds: string[],
  ): Promise<{ message: string; count: number }> {
    const words = await this.wordRepository.find({
      where: { id: In(wordIds) },
      relations: ['wordSet'],
    });

    if (words.length === 0) {
      return { message: 'No words deleted', count: 0 };
    }

    // Verify all words belong to the requesting user
    const unauthorizedWord = words.find((w) => w.wordSet.userId !== userId);
    if (unauthorizedWord) {
      throw new ForbiddenException(
        'You are not authorized to delete one or more selected words',
      );
    }

    await this.wordRepository.remove(words);
    return { message: 'Words deleted successfully', count: words.length };
  }

  private async verifySetOwnership(
    setId: string,
    userId: string,
  ): Promise<WordSet> {
    const wordSet = await this.wordSetRepository.findOne({
      where: { id: setId },
    });

    if (!wordSet) {
      throw new NotFoundException('Word set not found');
    }

    if (wordSet.userId !== userId) {
      throw new ForbiddenException(
        'You are not authorized to modify words in this set',
      );
    }

    return wordSet;
  }

  toWordDto(word: Word): WordDto {
    return {
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
    };
  }
}
