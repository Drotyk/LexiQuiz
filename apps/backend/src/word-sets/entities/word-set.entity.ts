import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { WordSetVisibility } from '@wordforge/shared-types';

@Entity('word_sets')
export class WordSet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ default: 'en' })
  sourceLanguage: string;

  @Column({ default: 'uk' })
  targetLanguage: string;

  @Column({
    type: 'enum',
    enum: WordSetVisibility,
    default: WordSetVisibility.PRIVATE,
  })
  visibility: WordSetVisibility;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
