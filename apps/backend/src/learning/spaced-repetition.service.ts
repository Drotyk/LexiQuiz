import { Injectable } from '@nestjs/common';
import { LearningRating, LearningStatus } from '@wordforge/shared-types';

export interface SpacedRepetitionCalculationResult {
  nextReviewAt: Date;
  repetitionInterval: number; // in minutes
  consecutiveCorrect: number;
  easeFactor: number;
  status: LearningStatus;
}

export interface CurrentProgressInput {
  status?: LearningStatus;
  consecutiveCorrect?: number;
  easeFactor?: number;
  repetitionInterval?: number;
}

@Injectable()
export class SpacedRepetitionService {
  calculateNextReview(
    input: CurrentProgressInput,
    rating: LearningRating,
    baseDate: Date = new Date(),
  ): SpacedRepetitionCalculationResult {
    let ease = Number(input.easeFactor) || 2.5;
    let interval = input.repetitionInterval || 0; // in minutes
    let consecutive = input.consecutiveCorrect || 0;
    let status = input.status || LearningStatus.NEW;

    switch (rating) {
      case LearningRating.AGAIN: {
        consecutive = 0;
        // Revert mastered or reviewing word back to learning
        status = LearningStatus.LEARNING;
        interval = 10; // 10 minutes
        ease = Math.max(1.3, ease - 0.2);
        break;
      }

      case LearningRating.HARD: {
        // Hard does NOT increment consecutiveCorrect streak to prevent premature mastering
        status = LearningStatus.LEARNING;
        interval = Math.max(1440, Math.round((interval || 1440) * 1.2)); // ~1 day
        ease = Math.max(1.3, ease - 0.15);
        break;
      }

      case LearningRating.GOOD: {
        consecutive += 1;
        if (consecutive === 1) {
          interval = 1440; // 1 day
          status = LearningStatus.LEARNING;
        } else if (consecutive === 2) {
          interval = 4320; // 3 days
          status = LearningStatus.REVIEWING;
        } else {
          interval = Math.round(interval * ease);
          status =
            consecutive >= 4
              ? LearningStatus.MASTERED
              : LearningStatus.REVIEWING;
        }
        break;
      }

      case LearningRating.EASY: {
        consecutive += 1;
        ease = Number((ease + 0.15).toFixed(2));
        if (consecutive === 1) {
          interval = 10080; // 7 days
          status = LearningStatus.REVIEWING;
        } else if (consecutive === 2) {
          interval = 20160; // 14 days
          status = LearningStatus.MASTERED;
        } else {
          interval = Math.round(interval * ease * 1.3);
          status = LearningStatus.MASTERED;
        }
        break;
      }
    }

    // Ensure strictly positive non-zero interval (min 10 mins) and cap at 365 days (525600 mins)
    const MAX_INTERVAL = 525600; // 1 year in minutes
    interval = Math.min(MAX_INTERVAL, Math.max(10, interval));
    ease = Number(ease.toFixed(2));

    const nextReviewAt = new Date(baseDate.getTime() + interval * 60 * 1000);

    return {
      nextReviewAt,
      repetitionInterval: interval,
      consecutiveCorrect: consecutive,
      easeFactor: ease,
      status,
    };
  }
}
