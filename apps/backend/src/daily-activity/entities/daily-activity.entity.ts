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

@Entity('daily_activities')
@Unique(['userId', 'date'])
export class DailyActivity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'varchar', length: 10 }) // YYYY-MM-DD in user's timezone
  date: string;

  @Column({ default: 0 })
  reviewedWords: number;

  @Column({ default: 0 })
  correctAnswers: number;

  @Column({ default: 0 })
  incorrectAnswers: number;

  @Column({ default: false })
  completedGoal: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
