import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import * as Joi from 'joi';

import { HealthModule } from './health/health.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { WordSetsModule } from './word-sets/word-sets.module';
import { WordsModule } from './words/words.module';
import { LearningModule } from './learning/learning.module';
import { QuizzesModule } from './quizzes/quizzes.module';
import { StatisticsModule } from './statistics/statistics.module';
import { DailyActivityModule } from './daily-activity/daily-activity.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['../../.env', '.env'],
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        PORT: Joi.number().default(3001),
        JWT_ACCESS_SECRET: Joi.string().required(),
        JWT_REFRESH_SECRET: Joi.string().required(),
        DATABASE_HOST: Joi.string().default('localhost'),
        DATABASE_PORT: Joi.number().default(5433),
        DATABASE_USER: Joi.string().default('wordforge_user'),
        DATABASE_PASSWORD: Joi.string().default('wordforge_pass'),
        DATABASE_NAME: Joi.string().default('wordforge'),
      }),
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 60, // 60 requests per minute global rate limit
      },
    ]),
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
        synchronize: false, // Disabled for controlled migration management
        migrationsRun: false,
        migrations: [__dirname + '/migrations/*{.ts,.js}'],
      }),
    }),
    HealthModule,
    UsersModule,
    AuthModule,
    WordSetsModule,
    WordsModule,
    LearningModule,
    QuizzesModule,
    StatisticsModule,
    DailyActivityModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
