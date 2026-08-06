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
      expect(result.repetitionInterval).toBe(1440); // 1 day in minutes
      expect(result.nextReviewAt.getTime()).toBeGreaterThan(Date.now());
    });

    it('2. should increase interval for a correct answer (GOOD)', () => {
      const initial = {
        status: LearningStatus.LEARNING,
        consecutiveCorrect: 1,
        easeFactor: 2.5,
        repetitionInterval: 1440,
      };

      const result = service.calculateNextReview(initial, LearningRating.GOOD);

      expect(result.consecutiveCorrect).toBe(2);
      expect(result.status).toBe(LearningStatus.REVIEWING);
      expect(result.repetitionInterval).toBe(4320); // 3 days
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
      expect(result.repetitionInterval).toBe(10); // 10 minutes
    });

    it('4. should significantly expand interval over multiple consecutive correct answers', () => {
      let state = service.calculateNextReview({}, LearningRating.GOOD);
      expect(state.consecutiveCorrect).toBe(1);

      state = service.calculateNextReview(state, LearningRating.GOOD);
      expect(state.consecutiveCorrect).toBe(2);
      expect(state.repetitionInterval).toBe(4320);

      state = service.calculateNextReview(state, LearningRating.EASY);
      expect(state.consecutiveCorrect).toBe(3);
      expect(state.status).toBe(LearningStatus.MASTERED);
      expect(state.repetitionInterval).toBeGreaterThan(4320);
    });

    it('5. should revert a mastered word back to learning status after a mistake', () => {
      const initial = {
        status: LearningStatus.MASTERED,
        consecutiveCorrect: 10,
        easeFactor: 2.8,
        repetitionInterval: 43200,
      };

      const result = service.calculateNextReview(initial, LearningRating.AGAIN);

      expect(result.status).toBe(LearningStatus.LEARNING);
      expect(result.consecutiveCorrect).toBe(0);
      expect(result.repetitionInterval).toBe(10);
    });

    it('6. should never allow a negative or zero interval', () => {
      const initial = {
        status: LearningStatus.NEW,
        consecutiveCorrect: -5,
        easeFactor: -1.0,
        repetitionInterval: -100,
      };

      const result = service.calculateNextReview(initial, LearningRating.AGAIN);

      expect(result.repetitionInterval).toBeGreaterThan(0);
      expect(result.repetitionInterval).toBe(10); // Minimum 10 minutes
    });
  });
});
