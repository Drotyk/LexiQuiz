import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DailyActivity } from './entities/daily-activity.entity';
import { User } from '../users/entities/user.entity';
import { StreakInfoDto, DailyActivityDto } from '@wordforge/shared-types';

@Injectable()
export class DailyActivityService {
  constructor(
    @InjectRepository(DailyActivity)
    private readonly activityRepository: Repository<DailyActivity>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async recordActivity(userId: string, isCorrect: boolean): Promise<DailyActivity> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const timezone = user.timezone || 'UTC';
    const dateStr = this.getUserDateStr(new Date(), timezone);

    let activity = await this.activityRepository.findOne({
      where: { userId, date: dateStr },
    });

    if (!activity) {
      activity = this.activityRepository.create({
        userId,
        date: dateStr,
        reviewedWords: 0,
        correctAnswers: 0,
        incorrectAnswers: 0,
        completedGoal: false,
      });
    }

    activity.reviewedWords += 1;
    if (isCorrect) {
      activity.correctAnswers += 1;
    } else {
      activity.incorrectAnswers += 1;
    }

    const dailyGoal = user.dailyGoal || 10;
    if (activity.reviewedWords >= dailyGoal) {
      activity.completedGoal = true;
    }

    return await this.activityRepository.save(activity);
  }

  async getStreakInfo(userId: string): Promise<StreakInfoDto> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const timezone = user.timezone || 'UTC';
    const todayStr = this.getUserDateStr(new Date(), timezone);

    const activities = await this.activityRepository.find({
      where: { userId },
      order: { date: 'DESC' },
    });

    const activityMap = new Map<string, DailyActivity>();
    activities.forEach((a) => activityMap.set(a.date, a));

    const todayActivity = activityMap.get(todayStr);
    const todayReviewedWords = todayActivity ? todayActivity.reviewedWords : 0;
    const goalCompletedToday = todayActivity ? todayActivity.completedGoal : false;

    // Calculate current streak
    let currentStreak = 0;
    const checkDate = new Date();

    // Check if user reviewed today
    if (activityMap.has(todayStr) && activityMap.get(todayStr)!.reviewedWords > 0) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      // If not today yet, check starting from yesterday
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
      const dStr = this.getUserDateStr(checkDate, timezone);
      if (activityMap.has(dStr) && activityMap.get(dStr)!.reviewedWords > 0) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 0;

    const sortedDates = Array.from(activityMap.keys()).sort();
    for (let i = 0; i < sortedDates.length; i++) {
      const act = activityMap.get(sortedDates[i])!;
      if (act.reviewedWords > 0) {
        tempStreak++;
        if (tempStreak > longestStreak) longestStreak = tempStreak;

        // Check if next day in sequence is consecutive
        if (i + 1 < sortedDates.length) {
          const curr = new Date(sortedDates[i]);
          const next = new Date(sortedDates[i + 1]);
          const diffDays = Math.round(
            (next.getTime() - curr.getTime()) / (1000 * 3600 * 24),
          );
          if (diffDays > 1) {
            tempStreak = 0;
          }
        }
      } else {
        tempStreak = 0;
      }
    }

    const historyDtos: DailyActivityDto[] = activities.slice(0, 30).map((a) => ({
      id: a.id,
      userId: a.userId,
      date: a.date,
      reviewedWords: a.reviewedWords,
      correctAnswers: a.correctAnswers,
      incorrectAnswers: a.incorrectAnswers,
      completedGoal: a.completedGoal,
    }));

    return {
      currentStreak,
      longestStreak: Math.max(currentStreak, longestStreak),
      todayReviewedWords,
      dailyGoal: user.dailyGoal || 10,
      goalCompletedToday,
      history: historyDtos,
    };
  }

  getUserDateStr(date: Date, timezone: string): string {
    try {
      const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
      return formatter.format(date); // Output format: YYYY-MM-DD
    } catch {
      return date.toISOString().split('T')[0];
    }
  }
}
