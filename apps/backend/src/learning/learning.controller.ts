import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { LearningService } from './learning.service';
import { ReviewWordDto } from './dto/review-word.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { StudyCardDto, LearningProgressDto } from '@wordforge/shared-types';

@ApiTags('Learning Cards')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('learning')
export class LearningController {
  constructor(private readonly learningService: LearningService) {}

  @Get('sets/:setId/cards')
  @ApiOperation({ summary: 'Get study flashcards for a specific word set' })
  @ApiResponse({ status: 200, description: 'List of study cards with user progress' })
  getCardsForSet(
    @Param('setId', ParseUUIDPipe) setId: string,
    @CurrentUser('id') userId: string,
  ): Promise<StudyCardDto[]> {
    return this.learningService.getCardsForSet(userId, setId);
  }

  @Get('due')
  @ApiOperation({ summary: 'Get words due for review' })
  @ApiResponse({ status: 200, description: 'List of due study cards' })
  getDueWords(
    @CurrentUser('id') userId: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ): Promise<StudyCardDto[]> {
    return this.learningService.getDueWords(userId, limit || 20);
  }

  @Post('words/:wordId/review')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit flashcard review rating (again, hard, good, easy)' })
  @ApiResponse({ status: 200, description: 'Updated learning progress' })
  reviewWord(
    @Param('wordId', ParseUUIDPipe) wordId: string,
    @CurrentUser('id') userId: string,
    @Body() reviewDto: ReviewWordDto,
  ): Promise<LearningProgressDto> {
    return this.learningService.reviewWord(userId, wordId, reviewDto.rating);
  }
}
