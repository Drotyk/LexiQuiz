import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Word } from '../../words/entities/word.entity';
import { LearningStatus } from '@wordforge/shared-types';

@Entity('learning_progress')
@Unique(['userId', 'wordId'])
export class LearningProgress {
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
  wordId: string;

  @ManyToOne(() => Word, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'wordId' })
  word: Word;

  @Column({
    type: 'enum',
    enum: LearningStatus,
    default: LearningStatus.NEW,
  })
  status: LearningStatus;

  @Column({ default: 0 })
  correctAnswers: number;

  @Column({ default: 0 })
  incorrectAnswers: number;

  @Column({ default: 0 })
  consecutiveCorrect: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 2.5 })
  easeFactor: number;

  @Column({ default: 0 })
  repetitionInterval: number; // Interval in minutes or days

  @Column({ type: 'timestamp', nullable: true })
  lastReviewedAt: Date | null;

  @Index()
  @Column({ type: 'timestamp', nullable: true })
  nextReviewAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
