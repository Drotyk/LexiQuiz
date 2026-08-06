# WordForge (LexiQuiz)

> **WordForge (LexiQuiz)** — Повнофункціональний сучасний вебзастосунок для персоналізованого вивчення іноземних слів з інтервальною системою повторення (SM-2), розумним масовим імпортом, 4 типами адаптивних квізів та аналітикою активності.

---

## Основні переваги та функціональність

- **Управління наборами слів**: Створення, редагування, пагінація та налаштування приватності наборів (`Private` / `Public`).
- **Розумний масовий імпорт (Bulk Import)**: Швидке додавання слів простим вставленням списку із підтримкою популярних розділювачів (`—`, `–`, `-`, `:`, `;`, `Tab`) без пошкодження складних слів із дефісами (`well-being`, `mother-in-law`).
- **Режим карток (Flashcards)**: Інтерактивний мобільний фліпер із підтримкою тач-жестів та гарячих клавіш (`Space`/`Enter` для перегортання, `1`/`2`/`3`/`4` для оцінки).
- **Рушій квізів з 4 типами питань**:
  1. **Multiple Choice** (Вибір з 4 варіантів без витоку правильної відповіді).
  2. **Direct Input** (Пряме введення перекладу).
  3. **Reverse Translation** (Зворотний переклад терміну).
  4. **True/False** (Перевірка пари «слово — переклад»).
- **Інтервальне повторення (Spaced Repetition / SM-2)**: Сервіс `SpacedRepetitionService` реалізує алгоритм оцінювання (`Again`, `Hard`, `Good`, `Easy`) із гнучкими інтервалами від 10 хвилин до 365 днів.
- **Серія днів (Streak) та часові пояси**: Автоматичний підрахунок активних днів і виконання щоденної мети з прив'язкою до локального часового поясу користувача (`Europe/Kyiv` тощо).
- **Безпека та інфраструктура**:
  - Хешовані `UserSession` сесії refresh-токенів у PostgreSQL з підтримкою відкликання.
  - Fail-fast перевірка конфігурації через `Joi`.
  - Захист від зловживань: `Helmet` безпекові заголовки та `@nestjs/throttler` rate-limiting.
  - Контрольовані міграції TypeORM (`synchronize: false`).

---

## Технологічний стек

### Frontend
![Next.js](https://img.shields.io/badge/Next.js_14-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React_18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![TanStack Query](https://img.shields.io/badge/TanStack_Query-FF4154?style=for-the-badge&logo=reactquery&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-443E38?style=for-the-badge&logo=react&logoColor=white)

### Backend
![NestJS](https://img.shields.io/badge/NestJS_10-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL_16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![TypeORM](https://img.shields.io/badge/TypeORM-FE0803?style=for-the-badge&logo=typeorm&logoColor=white)
![Swagger](https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

### Monorepo & Інфраструктура
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-4B32C3?style=for-the-badge&logo=eslint&logoColor=white)

---

## Структура проєкту

```text
LexiQuiz/
├── apps/
│   ├── backend/             # NestJS REST API сервер (Port: 3001)
│   │   ├── src/
│   │   │   ├── auth/        # JWT & Session Revocation
│   │   │   ├── word-sets/   # WordSet CRUD & Stats
│   │   │   ├── words/       # Words & Bulk Parser
│   │   │   ├── learning/    # Flashcards & SpacedRepetition (SM-2)
│   │   │   ├── quizzes/     # Quiz Generation & Engine
│   │   │   ├── statistics/  # Analytics & Dashboard Stats
│   │   │   ├── daily-activity/ # Streaks & Daily Goals
│   │   │   └── migrations/  # TypeORM Versioned Migrations
│   │   └── test/            # NestJS E2E Integration Suite
│   └── frontend/            # Next.js 14 Web App (Port: 3000)
├── packages/
│   └── shared-types/        # Спільні DTOs та Interfaces
├── .github/
│   └── workflows/ci.yml     # GitHub Actions CI Pipeline
├── docker-compose.yml       # PostgreSQL 16 Database
└── package.json             # Root monorepo scripts
```

---

## Швидкий старт

### **1. Передумови**
- Node.js `>= 18.x`
- npm `>= 9.x`
- Docker та Docker Compose

### **2. Клонування репозиторію**
```bash
git clone https://github.com/Drotyk/LexiQuiz.git
cd LexiQuiz
```

### **3. Встановлення залежностей**
```bash
npm install
```

### **4. Змінні середовища**
Скопіюйте `.env.example` у `.env`:
```bash
cp .env.example .env
```

### **5. Запуск бази даних PostgreSQL**
```bash
docker compose up -d
```

### **6. Виконання міграцій бази даних**
```bash
npm run migration:run --workspace=apps/backend
```

### **7. Запуск проєкту у режимі розробки**
```bash
npm run dev
```

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:3001](http://localhost:3001)
- **Swagger API Docs**: [http://localhost:3001/api/docs](http://localhost:3001/api/docs)

---

## Тестування та перевірка коду

```bash
# Unit-тести
npm run test

# Integration E2E тести бекенду
npm run test:e2e --workspace=apps/backend

# Перевірка типів TypeScript
npm run typecheck

# Перевірка стилю коду (ESLint)
npm run lint

# Продуктивна збірка всіх пакетів
npm run build
```

---

## Ліцензія

Відкритий вихідний код розповсюджується під ліцензією [MIT License](LICENSE).
