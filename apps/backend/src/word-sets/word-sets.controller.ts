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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { WordSetsService } from './word-sets.service';
import { CreateWordSetDto } from './dto/create-word-set.dto';
import { UpdateWordSetDto } from './dto/update-word-set.dto';
import { QueryWordSetsDto } from './dto/query-word-sets.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { WordSetDto, PaginatedWordSetsDto } from '@wordforge/shared-types';

@ApiTags('Word Sets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('word-sets')
export class WordSetsController {
  constructor(private readonly wordSetsService: WordSetsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new word set' })
  @ApiResponse({ status: 201, description: 'Word set created successfully' })
  create(
    @CurrentUser('id') userId: string,
    @Body() createDto: CreateWordSetDto,
  ): Promise<WordSetDto> {
    return this.wordSetsService.create(userId, createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get paginated list of user word sets with search and sorting' })
  @ApiResponse({ status: 200, description: 'Paginated list of word sets' })
  findAll(
    @CurrentUser('id') userId: string,
    @Query() query: QueryWordSetsDto,
  ): Promise<PaginatedWordSetsDto> {
    return this.wordSetsService.findAllForUser(userId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific word set by ID' })
  @ApiResponse({ status: 200, description: 'Word set details' })
  @ApiResponse({ status: 403, description: 'Access forbidden to private set' })
  @ApiResponse({ status: 404, description: 'Word set not found' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ): Promise<WordSetDto> {
    return this.wordSetsService.findOne(id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a word set' })
  @ApiResponse({ status: 200, description: 'Word set updated' })
  @ApiResponse({ status: 403, description: 'Unauthorized to edit set' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
    @Body() updateDto: UpdateWordSetDto,
  ): Promise<WordSetDto> {
    return this.wordSetsService.update(id, userId, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a word set' })
  @ApiResponse({ status: 200, description: 'Word set deleted' })
  @ApiResponse({ status: 403, description: 'Unauthorized to delete set' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ): Promise<{ message: string }> {
    return this.wordSetsService.remove(id, userId);
  }
}
