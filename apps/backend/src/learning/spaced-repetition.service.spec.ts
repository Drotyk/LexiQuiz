import { SpacedRepetitionService } from './spaced-repetition.service';
import { LearningRating, LearningStatus } from '@wordforge/shared-types';

describe('SpacedRepetitionService', () => {
  let service: SpacedRepetitionService;

  beforeEach(() => {
    service = new SpacedRepetitionService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateNextReview', () => {
    it('1. should initialize intervals correctly for a new word', () => {
      const result = service.calculateNextReview({}, LearningRating.GOOD);

      expect(result.status).toBe(LearningStatus.LEARNING);
      expect(result.consecutiveCorrect).toBe(1);
      expect(result.repetitionInterval).toBe(1440);
      expect(result.nextReviewAt.getTime()).toBeGreaterThan(Date.now());
    });

    it('2. should not advance consecutive streak when rating HARD', () => {
      const initial = {
        status: LearningStatus.LEARNING,
        consecutiveCorrect: 1,
        easeFactor: 2.5,
        repetitionInterval: 1440,
      };

      const result = service.calculateNextReview(initial, LearningRating.HARD);

      expect(result.consecutiveCorrect).toBe(1); // Streak unchanged
      expect(result.status).toBe(LearningStatus.LEARNING);
    });

    it('3. should handle incorrect answer (AGAIN) by resetting streak to 0', () => {
      const initial = {
        status: LearningStatus.REVIEWING,
        consecutiveCorrect: 4,
        easeFactor: 2.5,
        repetitionInterval: 10080,
      };

      const result = service.calculateNextReview(initial, LearningRating.AGAIN);

      expect(result.consecutiveCorrect).toBe(0);
      expect(result.status).toBe(LearningStatus.LEARNING);
      expect(result.repetitionInterval).toBe(10);
    });

    it('4. should allow interval growth up to 365 days max interval', () => {
      const initial = {
        status: LearningStatus.MASTERED,
        consecutiveCorrect: 10,
        easeFactor: 3.0,
        repetitionInterval: 400000,
      };

      const result = service.calculateNextReview(initial, LearningRating.EASY);

      expect(result.repetitionInterval).toBeLessThanOrEqual(525600); // 365 days cap
    });
  });
});
