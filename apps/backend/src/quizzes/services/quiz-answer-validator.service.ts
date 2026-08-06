import { Injectable } from '@nestjs/common';

@Injectable()
export class QuizAnswerValidatorService {
  validateAnswer(userAnswer: string, correctAnswer: string): boolean {
    const normUser = this.normalize(userAnswer);
    const normCorrect = this.normalize(correctAnswer);

    if (!normUser || !normCorrect) {
      return false;
    }

    // Support multiple acceptable answers separated by slash or comma
    const acceptableAnswers = normCorrect
      .split(/[/,;]/)
      .map((a) => this.normalize(a));

    return acceptableAnswers.some((ans) => ans === normUser);
  }

  normalize(text: string): string {
    if (!text) return '';
    return text
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ');
  }
}
