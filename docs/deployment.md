# LexiQuiz Deployment & Infrastructure Guide

Документ описує варіанти розгортання проєкту **LexiQuiz (WordForge)** у локальному середовищі та на продакшн-серверах.

---

## Локальне середовище та Docker Compose (Dev)

Для локальної розробки використовується `docker-compose.dev.yml`, що запускає базу даних PostgreSQL:

```bash
docker compose -f docker-compose.dev.yml up -d
npm run migration:run --workspace=apps/backend
npm run dev
```

---

## Продакшн розгортання через Docker Compose (Single VPS)

Продакшн конфігурація `docker-compose.prod.yml` забезпечує повну ізоляцію контейнерів у локальній мережі `lexiquiz-network`:

### Особливості:
- База даних PostgreSQL не відкриває порт назові (ізольована в internal docker network).
- Автоматичний запуск міграцій перед запуском бекенду за допомогою окремого контейнера-ранера `migrations`.
- Окремі Dockerfile для `apps/backend` та `apps/frontend`.
- Налаштовані Healthcheck для забезпечення залежностей запуску.

### Кроки запуску на VPS:
```bash
cp .env.example .env.production
# Заповніть реальні значення змінних середовища у .env.production

docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

---

## Розгортання у хмарі (Managed Cloud Platforms)

### Frontend (Next.js) -> Vercel / Netlify
1. Підключіть GitHub репозиторій до Vercel.
2. Вкажіть `Root Directory`: `apps/frontend`.
3. Задайте змінну середовища `NEXT_PUBLIC_API_URL=https://api.yourdomain.com`.

### Backend (NestJS) & PostgreSQL -> Railway / Render / Fly.io
1. Створіть службу PostgreSQL у хмарі.
2. Створіть Web Service для `apps/backend/Dockerfile`.
3. Задайте змінні середовища підключення до БД та секрети JWT.
