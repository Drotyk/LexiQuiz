import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { Word } from '../words/entities/word.entity';
import { WordSet } from '../word-sets/entities/word-set.entity';
import { LearningProgress } from '../learning/entities/learning-progress.entity';
import { QuizSession } from '../quizzes/entities/quiz-session.entity';
import { QuizAnswer } from '../quizzes/entities/quiz-answer.entity';
import { User } from '../users/entities/user.entity';
import { DailyActivityService } from '../daily-activity/daily-activity.service';
import {
  StatisticsOverviewDto,
  DifficultWordDto,
  SetStatisticsDto,
  DailyActivityItemDto,
  LearningStatus,
  QuizSessionStatus,
} from '@wordforge/shared-types';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(Word)
    private readonly wordRepository: Repository<Word>,
    @InjectRepository(WordSet)
    private readonly wordSetRepository: Repository<WordSet>,
    @InjectRepository(LearningProgress)
    private readonly progressRepository: Repository<LearningProgress>,
    @InjectRepository(QuizSession)
    private readonly sessionRepository: Repository<QuizSession>,
    @InjectRepository(QuizAnswer)
    private readonly answerRepository: Repository<QuizAnswer>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dailyActivityService: DailyActivityService,
  ) {}

  async getOverview(userId: string): Promise<StatisticsOverviewDto> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 1. Total user words across all sets owned by user
    const userWordSets = await this.wordSetRepository.find({
      where: { userId },
      select: ['id'],
    });

    const userSetIds = userWordSets.map((s) => s.id);
    let totalWords = 0;

    if (userSetIds.length > 0) {
      totalWords = await this.wordRepository
        .createQueryBuilder('word')
        .where('word.setId IN (:...userSetIds)', { userSetIds })
        .getCount();
    }

    // 2. Learning progress breakdown
    const progressRecords = await this.progressRepository.find({
      where: { userId },
    });

    let learningWords = 0;
    let reviewingWords = 0;
    let masteredWords = 0;

    progressRecords.forEach((p) => {
      if (p.status === LearningStatus.LEARNING) learningWords++;
      else if (p.status === LearningStatus.REVIEWING) reviewingWords++;
      else if (p.status === LearningStatus.MASTERED) masteredWords++;
    });

    const wordsWithProgress = progressRecords.length;
    const newWords = Math.max(0, totalWords - wordsWithProgress);

    // 3. Due today count
    const now = new Date();
    const dueRecords = await this.progressRepository.count({
      where: {
        userId,
        nextReviewAt: LessThanOrEqual(now),
      },
    });
    const dueTodayCount = dueRecords + newWords;

    // 4. Quiz accuracy over 7 days & average response time
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentAnswers = await this.answerRepository
      .createQueryBuilder('qa')
      .innerJoin('qa.session', 'qs')
      .where('qs.userId = :userId AND qa.createdAt >= :sevenDaysAgo', {
        userId,
        sevenDaysAgo,
      })
      .getMany();

    let accuracy7Days = 100;
    let avgResponseTimeMs = 0;

    if (recentAnswers.length > 0) {
      const correctCount = recentAnswers.filter((a) => a.isCorrect).length;
      accuracy7Days = Math.round((correctCount / recentAnswers.length) * 100);
      const totalTime = recentAnswers.reduce((sum, a) => sum + (a.responseTimeMs || 0), 0);
      avgResponseTimeMs = Math.round(totalTime / recentAnswers.length);
    }

    // 5. Total completed quizzes
    const totalQuizzesCompleted = await this.sessionRepository.count({
      where: { userId, status: QuizSessionStatus.COMPLETED },
    });

    // 6. Real streak & daily goal calculation
    let streakInfo = {
      currentStreak: 0,
      longestStreak: 0,
      todayReviewedWords: 0,
      goalCompletedToday: false,
    };

    try {
      streakInfo = await this.dailyActivityService.getStreakInfo(userId);
    } catch {
      // Handled
    }

    return {
      totalWords,
      newWords,
      learningWords,
      reviewingWords,
      masteredWords,
      dueTodayCount,
      dailyGoal: user.dailyGoal || 10,
      currentStreak: streakInfo.currentStreak,
      longestStreak: streakInfo.longestStreak,
      todayReviewedWords: streakInfo.todayReviewedWords,
      goalCompletedToday: streakInfo.goalCompletedToday,
      accuracy7Days,
      totalQuizzesCompleted,
      avgResponseTimeMs,
    };
  }

  async getActivity(userId: string, days = 7): Promise<DailyActivityItemDto[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const answers = await this.answerRepository
      .createQueryBuilder('qa')
      .innerJoin('qa.session', 'qs')
      .where('qs.userId = :userId AND qa.createdAt >= :startDate', {
        userId,
        startDate,
      })
      .getMany();

    const activityMap = new Map<string, { count: number; correct: number; incorrect: number }>();

    // Pre-populate days
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      activityMap.set(dateStr, { count: 0, correct: 0, incorrect: 0 });
    }

    answers.forEach((a) => {
      const dateStr = new Date(a.createdAt).toISOString().split('T')[0];
      if (activityMap.has(dateStr)) {
        const item = activityMap.get(dateStr)!;
        item.count += 1;
        if (a.isCorrect) item.correct += 1;
        else item.incorrect += 1;
      }
    });

    return Array.from(activityMap.entries()).map(([date, val]) => ({
      date,
      count: val.count,
      correct: val.correct,
      incorrect: val.incorrect,
    }));
  }

  async getDifficultWords(userId: string, limit = 10): Promise<DifficultWordDto[]> {
    const progressList = await this.progressRepository.find({
      where: { userId },
      relations: ['word', 'word.wordSet'],
      order: { incorrectAnswers: 'DESC' },
      take: limit * 2,
    });

    const filtered = progressList
      .filter((lp) => lp.word && lp.incorrectAnswers > 0)
      .slice(0, limit);

    return filtered.map((lp) => {
      const total = lp.correctAnswers + lp.incorrectAnswers;
      const accuracyPercent = total > 0 ? Math.round((lp.correctAnswers / total) * 100) : 0;
      return {
        wordId: lp.wordId,
        term: lp.word.term,
        translation: lp.word.translation,
        setName: lp.word.wordSet ? lp.word.wordSet.title : 'Unassigned Set',
        incorrectAnswers: lp.incorrectAnswers,
        correctAnswers: lp.correctAnswers,
        accuracyPercent,
      };
    });
  }

  async getSetStatistics(userId: string, setId: string): Promise<SetStatisticsDto> {
    const wordSet = await this.wordSetRepository.findOne({
      where: { id: setId },
    });

    if (!wordSet) {
      throw new NotFoundException('Word set not found');
    }

    if (wordSet.visibility === 'private' && wordSet.userId !== userId) {
      throw new ForbiddenException('You do not have access to this word set');
    }

    const words = await this.wordRepository.find({ where: { setId } });
    const totalWords = words.length;

    if (totalWords === 0) {
      return {
        setId,
        title: wordSet.title,
        totalWords: 0,
        newWords: 0,
        learningWords: 0,
        masteredWords: 0,
        accuracyPercent: 100,
      };
    }

    const wordIds = words.map((w) => w.id);
    const progressList = await this.progressRepository
      .createQueryBuilder('lp')
      .where('lp.userId = :userId AND lp.wordId IN (:...wordIds)', {
        userId,
        wordIds,
      })
      .getMany();

    let learningWords = 0;
    let masteredWords = 0;
    let totalCorrect = 0;
    let totalAttempts = 0;

    progressList.forEach((p) => {
      if (p.status === LearningStatus.MASTERED) masteredWords++;
      else if (p.status === LearningStatus.LEARNING || p.status === LearningStatus.REVIEWING) {
        learningWords++;
      }
      totalCorrect += p.correctAnswers;
      totalAttempts += p.correctAnswers + p.incorrectAnswers;
    });

    const newWords = Math.max(0, totalWords - progressList.length);
    const accuracyPercent = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 100;

    return {
      setId,
      title: wordSet.title,
      totalWords,
      newWords,
      learningWords,
      masteredWords,
      accuracyPercent,
    };
  }
}
