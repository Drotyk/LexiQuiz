import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WordSet } from './entities/word-set.entity';
import { WordSetsService } from './word-sets.service';
import { WordSetsController } from './word-sets.controller';

@Module({
  imports: [TypeOrmModule.forFeature([WordSet])],
  controllers: [WordSetsController],
  providers: [WordSetsService],
  exports: [WordSetsService],
})
export class WordSetsModule {}
