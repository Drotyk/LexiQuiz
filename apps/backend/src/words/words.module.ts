import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Word } from './entities/word.entity';
import { WordSet } from '../word-sets/entities/word-set.entity';
import { WordsService } from './words.service';
import { WordsParserService } from './words-parser.service';
import { WordsController } from './words.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Word, WordSet])],
  controllers: [WordsController],
  providers: [WordsService, WordsParserService],
  exports: [WordsService, WordsParserService],
})
export class WordsModule {}
