import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthModule } from './health/health.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { WordSetsModule } from './word-sets/word-sets.module';
import { WordsModule } from './words/words.module';
import { LearningModule } from './learning/learning.module';
import { QuizzesModule } from './quizzes/quizzes.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['../../.env', '.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DATABASE_HOST', 'localhost'),
        port: configService.get<number>('DATABASE_PORT', 5433),
        username: configService.get<string>('DATABASE_USER', 'wordforge_user'),
        password: configService.get<string>('DATABASE_PASSWORD', 'wordforge_pass'),
        database: configService.get<string>('DATABASE_NAME', 'wordforge'),
        autoLoadEntities: true,
        synchronize: true, // Enabled for development MVP
      }),
    }),
    HealthModule,
    UsersModule,
    AuthModule,
    WordSetsModule,
    WordsModule,
    LearningModule,
    QuizzesModule,
  ],
})
export class AppModule {}
