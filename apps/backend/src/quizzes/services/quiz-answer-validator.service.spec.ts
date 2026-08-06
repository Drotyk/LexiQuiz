import { QuizAnswerValidatorService } from './quiz-answer-validator.service';

describe('QuizAnswerValidatorService', () => {
  let validator: QuizAnswerValidatorService;

  beforeEach(() => {
    validator = new QuizAnswerValidatorService();
  });

  it('should normalize and validate exact match ignoring case and spaces', () => {
    expect(validator.validateAnswer('  Destination ', 'destination')).toBe(true);
    expect(validator.validateAnswer('Місце   Призначення', 'місце призначення')).toBe(true);
  });

  it('should validate multi-option answers separated by slash or comma', () => {
    expect(validator.validateAnswer('багаж', 'багаж / валіза')).toBe(true);
    expect(validator.validateAnswer('валіза', 'багаж / валіза')).toBe(true);
  });

  it('should reject incorrect answers', () => {
    expect(validator.validateAnswer('wrong answer', 'destination')).toBe(false);
  });
});
