import { Injectable, BadRequestException } from '@nestjs/common';
import { Word } from '../../words/entities/word.entity';
import { QuestionType, QuizQuestionDto } from '@wordforge/shared-types';

export interface InternalQuizQuestion {
  questionIndex: number;
  wordId: string;
  questionType: QuestionType;
  prompt: string;
  correctAnswer: string;
  options?: string[];
  displayPair?: { term: string; translation: string };
  isTrue?: boolean;
}

@Injectable()
export class QuizGenerationService {
  generateQuestions(words: Word[], requestedCount = 10): InternalQuizQuestion[] {
    if (words.length === 0) {
      throw new BadRequestException('Cannot generate quiz from an empty word set');
    }

    const questionTypes = [
      QuestionType.MULTIPLE_CHOICE,
      QuestionType.DIRECT_TYPING,
      QuestionType.REVERSE_TYPING,
      QuestionType.TRUE_FALSE,
    ];

    // Shuffle words copy
    const shuffledWords = [...words].sort(() => Math.random() - 0.5);
    const count = Math.min(requestedCount, shuffledWords.length);
    const selectedWords = shuffledWords.slice(0, count);

    const questions: InternalQuizQuestion[] = [];

    selectedWords.forEach((word, index) => {
      // Pick random question type
      const type =
        words.length >= 4
          ? questionTypes[index % questionTypes.length]
          : QuestionType.DIRECT_TYPING; // Fallback if not enough words for 4 options

      let question: InternalQuizQuestion;

      switch (type) {
        case QuestionType.MULTIPLE_CHOICE:
          question = this.generateMultipleChoiceQuestion(word, words, index);
          break;
        case QuestionType.TRUE_FALSE:
          question = this.generateTrueFalseQuestion(word, words, index);
          break;
        case QuestionType.REVERSE_TYPING:
          question = {
            questionIndex: index,
            wordId: word.id,
            questionType: type,
            prompt: `Translate to ${word.wordSet?.sourceLanguage || 'source language'}: "${word.translation}"`,
            correctAnswer: word.term,
          };
          break;
        case QuestionType.DIRECT_TYPING:
        default:
          question = {
            questionIndex: index,
            wordId: word.id,
            questionType: QuestionType.DIRECT_TYPING,
            prompt: `Translate: "${word.term}"`,
            correctAnswer: word.translation,
          };
          break;
      }

      questions.push(question);
    });

    return questions;
  }

  private generateMultipleChoiceQuestion(
    targetWord: Word,
    allWords: Word[],
    index: number,
  ): InternalQuizQuestion {
    const distractors = allWords
      .filter((w) => w.id !== targetWord.id && w.translation !== targetWord.translation)
      .map((w) => w.translation);

    const shuffledDistractors = [...new Set(distractors)].sort(() => Math.random() - 0.5);
    const selectedDistractors = shuffledDistractors.slice(0, 3);

    const options = [targetWord.translation, ...selectedDistractors].sort(
      () => Math.random() - 0.5,
    );

    return {
      questionIndex: index,
      wordId: targetWord.id,
      questionType: QuestionType.MULTIPLE_CHOICE,
      prompt: `Select the correct translation for "${targetWord.term}"`,
      correctAnswer: targetWord.translation,
      options,
    };
  }

  private generateTrueFalseQuestion(
    targetWord: Word,
    allWords: Word[],
    index: number,
  ): InternalQuizQuestion {
    const isTrue = Math.random() < 0.5;

    let shownTranslation = targetWord.translation;

    if (!isTrue && allWords.length > 1) {
      const otherWords = allWords.filter(
        (w) => w.id !== targetWord.id && w.translation !== targetWord.translation,
      );
      if (otherWords.length > 0) {
        const randomOther = otherWords[Math.floor(Math.random() * otherWords.length)];
        shownTranslation = randomOther.translation;
      }
    }

    return {
      questionIndex: index,
      wordId: targetWord.id,
      questionType: QuestionType.TRUE_FALSE,
      prompt: `Is this pair correct?`,
      correctAnswer: isTrue ? 'true' : 'false',
      displayPair: {
        term: targetWord.term,
        translation: shownTranslation,
      },
      isTrue,
    };
  }

  toPublicQuestionDto(
    internal: InternalQuizQuestion,
    totalQuestions: number,
  ): QuizQuestionDto {
    return {
      questionIndex: internal.questionIndex,
      totalQuestions,
      wordId: internal.wordId,
      questionType: internal.questionType,
      prompt: internal.prompt,
      options: internal.options,
      displayPair: internal.displayPair,
    };
  }
}
