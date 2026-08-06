import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { WordsService } from './words.service';
import { CreateWordDto } from './dto/create-word.dto';
import { UpdateWordDto } from './dto/update-word.dto';
import { BulkCreateWordsDto } from './dto/bulk-create-words.dto';
import { BulkPreviewDto } from './dto/bulk-preview.dto';
import { BulkDeleteWordsDto } from './dto/bulk-delete-words.dto';
import { QueryWordsDto } from './dto/query-words.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { WordDto, BulkPreviewResultDto } from '@wordforge/shared-types';

@ApiTags('Words')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class WordsController {
  constructor(private readonly wordsService: WordsService) {}

  @Post('word-sets/:setId/words')
  @ApiOperation({ summary: 'Add a new word to a set' })
  @ApiResponse({ status: 201, description: 'Word added successfully' })
  createWord(
    @Param('setId', ParseUUIDPipe) setId: string,
    @CurrentUser('id') userId: string,
    @Body() createDto: CreateWordDto,
  ): Promise<WordDto> {
    return this.wordsService.createWord(userId, setId, createDto);
  }

  @Post('word-sets/:setId/words/bulk-preview')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Preview bulk word import text without saving' })
  @ApiResponse({ status: 200, description: 'Parsed preview result' })
  bulkPreview(
    @Param('setId', ParseUUIDPipe) setId: string,
    @CurrentUser('id') userId: string,
    @Body() previewDto: BulkPreviewDto,
  ): Promise<BulkPreviewResultDto> {
    return this.wordsService.bulkPreview(userId, setId, previewDto.text);
  }

  @Post('word-sets/:setId/words/bulk')
  @ApiOperation({ summary: 'Bulk insert validated words into a set' })
  @ApiResponse({ status: 201, description: 'Words bulk inserted successfully' })
  bulkCreateWords(
    @Param('setId', ParseUUIDPipe) setId: string,
    @CurrentUser('id') userId: string,
    @Body() bulkDto: BulkCreateWordsDto,
  ): Promise<WordDto[]> {
    return this.wordsService.bulkCreateWords(userId, setId, bulkDto);
  }

  @Get('word-sets/:setId/words')
  @ApiOperation({ summary: 'Get list of words in a set with search, sorting, and pagination' })
  @ApiResponse({ status: 200, description: 'List of words in set' })
  findAllForSet(
    @Param('setId', ParseUUIDPipe) setId: string,
    @CurrentUser('id') userId: string,
    @Query() query: QueryWordsDto,
  ) {
    return this.wordsService.findAllForSet(userId, setId, query);
  }

  @Patch('words/:id')
  @ApiOperation({ summary: 'Update a specific word' })
  @ApiResponse({ status: 200, description: 'Word updated successfully' })
  updateWord(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
    @Body() updateDto: UpdateWordDto,
  ): Promise<WordDto> {
    return this.wordsService.updateWord(userId, id, updateDto);
  }

  @Delete('words/bulk')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bulk delete selected words' })
  @ApiResponse({ status: 200, description: 'Selected words deleted successfully' })
  bulkDeleteWords(
    @CurrentUser('id') userId: string,
    @Body() bulkDeleteDto: BulkDeleteWordsDto,
  ): Promise<{ message: string; count: number }> {
    return this.wordsService.bulkDeleteWords(userId, bulkDeleteDto.wordIds);
  }

  @Delete('words/:id')
  @ApiOperation({ summary: 'Delete a single word' })
  @ApiResponse({ status: 200, description: 'Word deleted successfully' })
  deleteWord(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ): Promise<{ message: string }> {
    return this.wordsService.deleteWord(userId, id);
  }
}
