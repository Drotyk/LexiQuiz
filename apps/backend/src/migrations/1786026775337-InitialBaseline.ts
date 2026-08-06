import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialBaseline1786026775337 implements MigrationInterface {
    name = 'InitialBaseline1786026775337'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "passwordHash" character varying NOT NULL, "name" character varying NOT NULL, "dailyGoal" integer NOT NULL DEFAULT '10', "timezone" character varying NOT NULL DEFAULT 'UTC', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."word_sets_visibility_enum" AS ENUM('private', 'link', 'public')`);
        await queryRunner.query(`CREATE TABLE "word_sets" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "title" character varying NOT NULL, "description" text, "sourceLanguage" character varying NOT NULL DEFAULT 'en', "targetLanguage" character varying NOT NULL DEFAULT 'uk', "visibility" "public"."word_sets_visibility_enum" NOT NULL DEFAULT 'private', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_bdc0215021db39d24b54c17abcb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_557ba0505fb5a124eea2cc6f48" ON "word_sets" ("userId") `);
        await queryRunner.query(`CREATE TABLE "words" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "setId" uuid NOT NULL, "term" character varying NOT NULL, "translation" character varying NOT NULL, "transcription" text, "example" text, "note" text, "partOfSpeech" character varying, "difficulty" integer NOT NULL DEFAULT '1', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_feaf97accb69a7f355fa6f58a3d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_b8aa8aa39bbf6b3d9858cd7529" ON "words" ("setId") `);
        await queryRunner.query(`CREATE TABLE "quiz_answers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "sessionId" uuid NOT NULL, "wordId" uuid NOT NULL, "questionType" character varying NOT NULL, "userAnswer" character varying NOT NULL, "correctAnswer" character varying NOT NULL, "isCorrect" boolean NOT NULL DEFAULT false, "responseTimeMs" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_3fefbc8a840a41b6a15a4f9ca5e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_6310f703fcdf738ef08d71bbe0" ON "quiz_answers" ("sessionId") `);
        await queryRunner.query(`CREATE INDEX "IDX_63a5aad6ac755ab79673dd6248" ON "quiz_answers" ("wordId") `);
        await queryRunner.query(`CREATE TYPE "public"."quiz_sessions_status_enum" AS ENUM('active', 'completed', 'abandoned')`);
        await queryRunner.query(`CREATE TABLE "quiz_sessions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "setId" uuid NOT NULL, "mode" character varying NOT NULL DEFAULT 'standard', "status" "public"."quiz_sessions_status_enum" NOT NULL DEFAULT 'active', "totalQuestions" integer NOT NULL DEFAULT '0', "correctAnswers" integer NOT NULL DEFAULT '0', "questionsData" jsonb, "startedAt" TIMESTAMP NOT NULL DEFAULT now(), "completedAt" TIMESTAMP, CONSTRAINT "PK_db4ac35661dd2f29269b272a4c2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_06f579d14ccc0dc29db1040829" ON "quiz_sessions" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_3cb908fd749aa11238ba157270" ON "quiz_sessions" ("setId") `);
        await queryRunner.query(`CREATE TYPE "public"."learning_progress_status_enum" AS ENUM('new', 'learning', 'reviewing', 'mastered')`);
        await queryRunner.query(`CREATE TABLE "learning_progress" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "wordId" uuid NOT NULL, "status" "public"."learning_progress_status_enum" NOT NULL DEFAULT 'new', "correctAnswers" integer NOT NULL DEFAULT '0', "incorrectAnswers" integer NOT NULL DEFAULT '0', "consecutiveCorrect" integer NOT NULL DEFAULT '0', "easeFactor" numeric(5,2) NOT NULL DEFAULT '2.5', "repetitionInterval" integer NOT NULL DEFAULT '0', "lastReviewedAt" TIMESTAMP, "nextReviewAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_551b25d579a064a4c8450f02e1d" UNIQUE ("userId", "wordId"), CONSTRAINT "PK_16865bc62510342e53570c3a31f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_b9b5fc4bbe202710fdf2223422" ON "learning_progress" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_b2fee184819c50c6ce32dbb582" ON "learning_progress" ("wordId") `);
        await queryRunner.query(`CREATE INDEX "IDX_3f0cdb5106f58dfc83692e9cf4" ON "learning_progress" ("nextReviewAt") `);
        await queryRunner.query(`CREATE TABLE "daily_activities" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "date" character varying(10) NOT NULL, "reviewedWords" integer NOT NULL DEFAULT '0', "correctAnswers" integer NOT NULL DEFAULT '0', "incorrectAnswers" integer NOT NULL DEFAULT '0', "completedGoal" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_ff55e9a6941694133e7ba890e6b" UNIQUE ("userId", "date"), CONSTRAINT "PK_c9ad6830783dbd1a7337ea21a18" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_31ac6bd1a81d1a246065144f6d" ON "daily_activities" ("userId") `);
        await queryRunner.query(`CREATE TABLE "user_sessions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "refreshTokenHash" character varying NOT NULL, "userAgent" character varying, "ipAddress" character varying, "isRevoked" boolean NOT NULL DEFAULT false, "expiresAt" TIMESTAMP NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_e93e031a5fed190d4789b6bfd83" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_55fa4db8406ed66bc704432842" ON "user_sessions" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_a5f2c875043dcf84df7b73ed73" ON "user_sessions" ("expiresAt") `);
        await queryRunner.query(`ALTER TABLE "word_sets" ADD CONSTRAINT "FK_557ba0505fb5a124eea2cc6f48d" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "words" ADD CONSTRAINT "FK_b8aa8aa39bbf6b3d9858cd75297" FOREIGN KEY ("setId") REFERENCES "word_sets"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "quiz_answers" ADD CONSTRAINT "FK_6310f703fcdf738ef08d71bbe08" FOREIGN KEY ("sessionId") REFERENCES "quiz_sessions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "quiz_answers" ADD CONSTRAINT "FK_63a5aad6ac755ab79673dd62480" FOREIGN KEY ("wordId") REFERENCES "words"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "quiz_sessions" ADD CONSTRAINT "FK_06f579d14ccc0dc29db10408293" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "quiz_sessions" ADD CONSTRAINT "FK_3cb908fd749aa11238ba1572708" FOREIGN KEY ("setId") REFERENCES "word_sets"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "learning_progress" ADD CONSTRAINT "FK_b9b5fc4bbe202710fdf22234227" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "learning_progress" ADD CONSTRAINT "FK_b2fee184819c50c6ce32dbb5823" FOREIGN KEY ("wordId") REFERENCES "words"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "daily_activities" ADD CONSTRAINT "FK_31ac6bd1a81d1a246065144f6d8" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_sessions" ADD CONSTRAINT "FK_55fa4db8406ed66bc7044328427" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_sessions" DROP CONSTRAINT "FK_55fa4db8406ed66bc7044328427"`);
        await queryRunner.query(`ALTER TABLE "daily_activities" DROP CONSTRAINT "FK_31ac6bd1a81d1a246065144f6d8"`);
        await queryRunner.query(`ALTER TABLE "learning_progress" DROP CONSTRAINT "FK_b2fee184819c50c6ce32dbb5823"`);
        await queryRunner.query(`ALTER TABLE "learning_progress" DROP CONSTRAINT "FK_b9b5fc4bbe202710fdf22234227"`);
        await queryRunner.query(`ALTER TABLE "quiz_sessions" DROP CONSTRAINT "FK_3cb908fd749aa11238ba1572708"`);
        await queryRunner.query(`ALTER TABLE "quiz_sessions" DROP CONSTRAINT "FK_06f579d14ccc0dc29db10408293"`);
        await queryRunner.query(`ALTER TABLE "quiz_answers" DROP CONSTRAINT "FK_63a5aad6ac755ab79673dd62480"`);
        await queryRunner.query(`ALTER TABLE "quiz_answers" DROP CONSTRAINT "FK_6310f703fcdf738ef08d71bbe08"`);
        await queryRunner.query(`ALTER TABLE "words" DROP CONSTRAINT "FK_b8aa8aa39bbf6b3d9858cd75297"`);
        await queryRunner.query(`ALTER TABLE "word_sets" DROP CONSTRAINT "FK_557ba0505fb5a124eea2cc6f48d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a5f2c875043dcf84df7b73ed73"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_55fa4db8406ed66bc704432842"`);
        await queryRunner.query(`DROP TABLE "user_sessions"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_31ac6bd1a81d1a246065144f6d"`);
        await queryRunner.query(`DROP TABLE "daily_activities"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3f0cdb5106f58dfc83692e9cf4"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b2fee184819c50c6ce32dbb582"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b9b5fc4bbe202710fdf2223422"`);
        await queryRunner.query(`DROP TABLE "learning_progress"`);
        await queryRunner.query(`DROP TYPE "public"."learning_progress_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3cb908fd749aa11238ba157270"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_06f579d14ccc0dc29db1040829"`);
        await queryRunner.query(`DROP TABLE "quiz_sessions"`);
        await queryRunner.query(`DROP TYPE "public"."quiz_sessions_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_63a5aad6ac755ab79673dd6248"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6310f703fcdf738ef08d71bbe0"`);
        await queryRunner.query(`DROP TABLE "quiz_answers"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b8aa8aa39bbf6b3d9858cd7529"`);
        await queryRunner.query(`DROP TABLE "words"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_557ba0505fb5a124eea2cc6f48"`);
        await queryRunner.query(`DROP TABLE "word_sets"`);
        await queryRunner.query(`DROP TYPE "public"."word_sets_visibility_enum"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
