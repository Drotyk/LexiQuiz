import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { WordSet } from '../../word-sets/entities/word-set.entity';
import { QuizAnswer } from './quiz-answer.entity';
import { QuizSessionStatus } from '@wordforge/shared-types';

@Entity('quiz_sessions')
export class QuizSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Index()
  @Column({ type: 'uuid' })
  setId: string;

  @ManyToOne(() => WordSet, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'setId' })
  wordSet: WordSet;

  @Column({ default: 'standard' })
  mode: string;

  @Column({
    type: 'enum',
    enum: QuizSessionStatus,
    default: QuizSessionStatus.ACTIVE,
  })
  status: QuizSessionStatus;

  @Column({ default: 0 })
  totalQuestions: number;

  @Column({ default: 0 })
  correctAnswers: number;

  @Column({ type: 'jsonb', nullable: true })
  questionsData: any;

  @CreateDateColumn()
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date | null;

  @OneToMany(() => QuizAnswer, (answer) => answer.session)
  answers: QuizAnswer[];
}
