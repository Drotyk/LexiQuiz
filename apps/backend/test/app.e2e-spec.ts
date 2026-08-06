import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let setId: string;
  let sessionId: string;

  const testUser = {
    email: `e2e_${Date.now()}@example.com`,
    password: 'Password123!',
    name: 'E2E Tester',
  };

  beforeAll(async () => {
    // Override JWT secrets for E2E testing environment
    process.env.JWT_ACCESS_SECRET = 'e2e_jwt_access_secret_1234567890';
    process.env.JWT_REFRESH_SECRET = 'e2e_jwt_refresh_secret_0987654321';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('1. POST /auth/register - Register new user', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send(testUser)
      .expect(201);

    expect(res.body).toHaveProperty('accessToken');
    expect(res.body.user.email).toBe(testUser.email.toLowerCase());
    accessToken = res.body.accessToken;
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('2. POST /auth/login - Login user', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      })
      .expect(200);

    expect(res.body).toHaveProperty('accessToken');
    accessToken = res.body.accessToken;
  });

  it('3. POST /word-sets - Create Word Set', async () => {
    const res = await request(app.getHttpServer())
      .post('/word-sets')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'E2E Test Set',
        description: 'Word set created during E2E integration test',
        sourceLanguage: 'en',
        targetLanguage: 'uk',
        visibility: 'private',
      })
      .expect(201);

    expect(res.body.title).toBe('E2E Test Set');
    setId = res.body.id;
  });

  it('4. POST /word-sets/:setId/words/bulk - Bulk Import Words', async () => {
    const res = await request(app.getHttpServer())
      .post(`/word-sets/${setId}/words/bulk`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        words: [
          { term: 'destination', translation: 'місце призначення' },
          { term: 'luggage', translation: 'багаж' },
        ],
      })
      .expect(201);

    expect(res.body.length).toBe(2);
    expect(res.body[0]).toHaveProperty('id');
  });

  it('5. POST /quizzes - Create Quiz Session', async () => {
    const res = await request(app.getHttpServer())
      .post('/quizzes')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        setId,
        questionCount: 5,
      })
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body.status).toBe('active');
    sessionId = res.body.id;
  });

  let activeQuestionWordId: string;

  it('6. GET /quizzes/:sessionId/question - Get Active Question', async () => {
    const res = await request(app.getHttpServer())
      .get(`/quizzes/${sessionId}/question`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body).toHaveProperty('prompt');
    expect(res.body).not.toHaveProperty('correctAnswer');
    activeQuestionWordId = res.body.wordId;
  });

  it('7. POST /quizzes/:sessionId/answer - Submit Quiz Answer', async () => {
    const res = await request(app.getHttpServer())
      .post(`/quizzes/${sessionId}/answer`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        wordId: activeQuestionWordId,
        userAnswer: 'місце призначення',
        responseTimeMs: 1200,
      })
      .expect(200);

    expect(res.body).toHaveProperty('isCorrect');
  });

  it('8. GET /statistics/overview - Verify Overview Metrics', async () => {
    const res = await request(app.getHttpServer())
      .get('/statistics/overview')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.totalWords).toBeGreaterThanOrEqual(2);
  });
});
