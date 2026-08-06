export interface HealthResponse {
  status: string;
  database: string;
}

export enum WordSetVisibility {
  PRIVATE = 'private',
  LINK = 'link',
  PUBLIC = 'public'
}

export enum LearningStatus {
  NEW = 'new',
  LEARNING = 'learning',
  REVIEWING = 'reviewing',
  MASTERED = 'mastered'
}

export enum LearningRating {
  AGAIN = 'again',
  HARD = 'hard',
  GOOD = 'good',
  EASY = 'easy'
}

export enum QuizSessionStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned'
}

export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  DIRECT_TYPING = 'direct_typing',
  REVERSE_TYPING = 'reverse_typing',
  TRUE_FALSE = 'true_false'
}

export interface UserDto {
  id: string;
  email: string;
  name: string;
  dailyGoal: number;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  accessToken: string;
  user: UserDto;
}

export interface WordSetDto {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  sourceLanguage: string;
  targetLanguage: string;
  visibility: WordSetVisibility;
  wordCount?: number;
  progressPercent?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedWordSetsDto {
  data: WordSetDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface WordDto {
  id: string;
  setId: string;
  term: string;
  translation: string;
  transcription: string | null;
  example: string | null;
  note: string | null;
  partOfSpeech: string | null;
  difficulty: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface BulkPreviewValidItem {
  term: string;
  translation: string;
  transcription?: string;
  example?: string;
  note?: string;
}

export interface BulkPreviewInvalidItem {
  line: number;
  value: string;
  reason: string;
}

export interface BulkPreviewDuplicateItem {
  line: number;
  term: string;
  translation: string;
  reason: string;
}

export interface BulkPreviewResultDto {
  valid: BulkPreviewValidItem[];
  invalid: BulkPreviewInvalidItem[];
  duplicates: BulkPreviewDuplicateItem[];
}

export interface LearningProgressDto {
  id: string;
  userId: string;
  wordId: string;
  status: LearningStatus;
  correctAnswers: number;
  incorrectAnswers: number;
  consecutiveCorrect: number;
  easeFactor: number;
  repetitionInterval: number;
  lastReviewedAt: Date | null;
  nextReviewAt: Date | null;
}

export interface StudyCardDto {
  word: WordDto;
  progress: LearningProgressDto | null;
}
