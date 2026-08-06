import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { StatisticsService } from './statistics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  StatisticsOverviewDto,
  DifficultWordDto,
  SetStatisticsDto,
  DailyActivityItemDto,
} from '@wordforge/shared-types';

@ApiTags('Statistics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Get overall vocabulary learning dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Overview metrics' })
  getOverview(
    @CurrentUser('id') userId: string,
  ): Promise<StatisticsOverviewDto> {
    return this.statisticsService.getOverview(userId);
  }

  @Get('activity')
  @ApiOperation({ summary: 'Get daily activity history for charts and calendars' })
  @ApiResponse({ status: 200, description: 'Daily activity log' })
  getActivity(
    @CurrentUser('id') userId: string,
    @Query('days', new ParseIntPipe({ optional: true })) days?: number,
  ): Promise<DailyActivityItemDto[]> {
    return this.statisticsService.getActivity(userId, days || 7);
  }

  @Get('difficult-words')
  @ApiOperation({ summary: 'Get list of words with highest error counts' })
  @ApiResponse({ status: 200, description: 'List of difficult words' })
  getDifficultWords(
    @CurrentUser('id') userId: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ): Promise<DifficultWordDto[]> {
    return this.statisticsService.getDifficultWords(userId, limit || 10);
  }

  @Get('sets/:setId')
  @ApiOperation({ summary: 'Get progress statistics for a specific word set' })
  @ApiResponse({ status: 200, description: 'Set progress metrics' })
  getSetStatistics(
    @Param('setId', ParseUUIDPipe) setId: string,
    @CurrentUser('id') userId: string,
  ): Promise<SetStatisticsDto> {
    return this.statisticsService.getSetStatistics(userId, setId);
  }
}
