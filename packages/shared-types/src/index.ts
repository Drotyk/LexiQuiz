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
