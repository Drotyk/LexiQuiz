import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { QuizSessionService } from './services/quiz-session.service';
import { CreateQuizSessionDto } from './dto/create-quiz-session.dto';
import { SubmitAnswerDto } from './dto/submit-answer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  QuizQuestionDto,
  QuizAnswerResultDto,
  QuizSessionResultDto,
  QuizSessionDto,
} from '@wordforge/shared-types';

@ApiTags('Quizzes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('quizzes')
export class QuizzesController {
  constructor(private readonly quizSessionService: QuizSessionService) {}

  @Post()
  @ApiOperation({ summary: 'Start a new quiz session' })
  @ApiResponse({ status: 201, description: 'Quiz session created' })
  async createSession(
    @CurrentUser('id') userId: string,
    @Body() createDto: CreateQuizSessionDto,
  ): Promise<QuizSessionDto> {
    const session = await this.quizSessionService.createSession(userId, createDto);
    return {
      id: session.id,
      userId: session.userId,
      setId: session.setId,
      mode: session.mode,
      status: session.status,
      totalQuestions: session.totalQuestions,
      correctAnswers: session.correctAnswers,
      startedAt: session.startedAt,
      completedAt: session.completedAt,
    };
  }

  @Get(':sessionId/question')
  @ApiOperation({ summary: 'Get current active question in session' })
  @ApiResponse({ status: 200, description: 'Current question payload without correct answer' })
  getQuestion(
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
    @CurrentUser('id') userId: string,
  ): Promise<QuizQuestionDto> {
    return this.quizSessionService.getCurrentQuestion(sessionId, userId);
  }

  @Post(':sessionId/answer')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit an answer to current question' })
  @ApiResponse({ status: 200, description: 'Answer validation result' })
  submitAnswer(
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
    @CurrentUser('id') userId: string,
    @Body() submitDto: SubmitAnswerDto,
  ): Promise<QuizAnswerResultDto> {
    return this.quizSessionService.submitAnswer(sessionId, userId, submitDto);
  }

  @Post(':sessionId/complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Finish quiz session early and compile results' })
  @ApiResponse({ status: 200, description: 'Quiz session summary' })
  completeSession(
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
    @CurrentUser('id') userId: string,
  ): Promise<QuizSessionResultDto> {
    return this.quizSessionService.completeSession(sessionId, userId);
  }

  @Get(':sessionId/result')
  @ApiOperation({ summary: 'Get summary result of completed quiz session' })
  @ApiResponse({ status: 200, description: 'Detailed quiz performance' })
  getResult(
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
    @CurrentUser('id') userId: string,
  ): Promise<QuizSessionResultDto> {
    return this.quizSessionService.getSessionResult(sessionId, userId);
  }
}
