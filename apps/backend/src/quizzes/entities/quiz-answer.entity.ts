import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { QuizSession } from './quiz-session.entity';
import { Word } from '../../words/entities/word.entity';

@Entity('quiz_answers')
export class QuizAnswer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  sessionId: string;

  @ManyToOne(() => QuizSession, (session) => session.answers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'sessionId' })
  session: QuizSession;

  @Index()
  @Column({ type: 'uuid' })
  wordId: string;

  @ManyToOne(() => Word, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'wordId' })
  word: Word;

  @Column()
  questionType: string;

  @Column()
  userAnswer: string;

  @Column()
  correctAnswer: string;

  @Column({ default: false })
  isCorrect: boolean;

  @Column({ default: 0 })
  responseTimeMs: number;

  @CreateDateColumn()
  createdAt: Date;
}
