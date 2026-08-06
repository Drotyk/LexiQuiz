import { QuizGenerationService } from './quiz-generation.service';
import { Word } from '../../words/entities/word.entity';

describe('QuizGenerationService', () => {
  let service: QuizGenerationService;

  const mockWords: Word[] = [
    {
      id: 'w-1',
      setId: 'set-1',
      wordSet: null as any,
      term: 'destination',
      translation: 'місце призначення',
      transcription: null,
      example: null,
      note: null,
      partOfSpeech: null,
      difficulty: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'w-2',
      setId: 'set-1',
      wordSet: null as any,
      term: 'luggage',
      translation: 'багаж',
      transcription: null,
      example: null,
      note: null,
      partOfSpeech: null,
      difficulty: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'w-3',
      setId: 'set-1',
      wordSet: null as any,
      term: 'departure',
      translation: 'відправлення',
      transcription: null,
      example: null,
      note: null,
      partOfSpeech: null,
      difficulty: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'w-4',
      setId: 'set-1',
      wordSet: null as any,
      term: 'arrival',
      translation: 'прибуття',
      transcription: null,
      example: null,
      note: null,
      partOfSpeech: null,
      difficulty: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(() => {
    service = new QuizGenerationService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateQuestions', () => {
    it('should generate requested number of questions', () => {
      const questions = service.generateQuestions(mockWords, 4);
      expect(questions.length).toBe(4);
    });

    it('should obfuscate correct answer when converting to public DTO', () => {
      const questions = service.generateQuestions(mockWords, 4);
      const publicDto = service.toPublicQuestionDto(questions[0], 4);
      expect(publicDto).not.toHaveProperty('correctAnswer');
    });
  });
});
