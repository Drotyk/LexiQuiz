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
import { WordSet } from '../../word-sets/entities/word-set.entity';

@Entity('words')
export class Word {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  setId: string;

  @ManyToOne(() => WordSet, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'setId' })
  wordSet: WordSet;

  @Column()
  term: string;

  @Column()
  translation: string;

  @Column({ type: 'text', nullable: true })
  transcription: string | null;

  @Column({ type: 'text', nullable: true })
  example: string | null;

  @Column({ type: 'text', nullable: true })
  note: string | null;

  @Column({ type: 'varchar', nullable: true })
  partOfSpeech: string | null;

  @Column({ default: 1 })
  difficulty: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
