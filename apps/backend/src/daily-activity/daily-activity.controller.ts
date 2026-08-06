import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { DailyActivityService } from './daily-activity.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { StreakInfoDto } from '@wordforge/shared-types';

@ApiTags('Daily Activity & Streak')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('daily-activity')
export class DailyActivityController {
  constructor(private readonly activityService: DailyActivityService) {}

  @Get('streak')
  @ApiOperation({ summary: 'Get user streak metrics, daily goal progress, and history' })
  @ApiResponse({ status: 200, description: 'Streak and daily goal summary' })
  getStreakInfo(
    @CurrentUser('id') userId: string,
  ): Promise<StreakInfoDto> {
    return this.activityService.getStreakInfo(userId);
  }
}
