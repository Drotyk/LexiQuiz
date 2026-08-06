import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DailyActivity } from './entities/daily-activity.entity';
import { User } from '../users/entities/user.entity';
import { DailyActivityService } from './daily-activity.service';
import { DailyActivityController } from './daily-activity.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DailyActivity, User])],
  controllers: [DailyActivityController],
  providers: [DailyActivityService],
  exports: [DailyActivityService],
})
export class DailyActivityModule {}
