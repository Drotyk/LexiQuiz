# LexiQuiz

Повнофункціональний сучасний вебзастосунок для персоналізованого вивчення іноземних слів з інтервальним повторенням SM-2, масовим імпортом та адаптивними квізами.

[Live Demo](http://localhost:3000) • [Swagger API Docs](http://localhost:3001/api/docs) • [Report Bug](https://github.com/Drotyk/LexiQuiz/issues)

[![CI Pipeline](https://github.com/Drotyk/LexiQuiz/actions/workflows/ci.yml/badge.svg)](https://github.com/Drotyk/LexiQuiz/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
![Node.js](https://img.shields.io/badge/Node.js-22.x_LTS-green?logo=node.js)
![Next.js](https://img.shields.io/badge/Next.js-14_App_Router-black?logo=next.js)
![NestJS](https://img.shields.io/badge/NestJS-10.x-red?logo=nestjs)

---

## Статус MVP

- [x] JWT Авторизація (Access Token + HttpOnly Refresh Token Cookie)
- [x] Ротація сесій та відкликання Refresh токенів (`UserSession`)
- [x] Управління наборами слів (CRUD, приватність Private/Public)
- [x] Розумний масовий імпорт з розпізнаванням складних дефісних слів (`mother-in-law`, `well-being`)
- [x] Режим карток (Flashcards) з анімацією та клавіатурним управлінням
- [x] Чотири типи квізів (`multiple_choice`, `direct_typing`, `reverse_typing`, `true_false`)
- [x] Сервіс інтервального повторення Spaced Repetition (SM-2) із капом до 365 днів
- [x] Статистика та аналітика (дашборд, складні слова, активність)
- [x] Врахування часового поясу користувача для Daily Streak
- [x] Контрольовані міграції TypeORM (`synchronize: false`)
- [x] Fail-fast валідація зміних середовища та Rate Limiting (Throttler + Helmet)
- [ ] Публічні спільнотні набори
- [ ] Аудіовимова слів (Text-to-Speech)
- [ ] Progressive Web App (PWA) режим
- [ ] AI-генерація прикладів вживання слів

---

## Технологічний стек

### Frontend
![Next.js](https://img.shields.io/badge/Next.js_14-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React_18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

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
│   │   │   ├── auth/        # JWT, UserSession & Revocation
│   │   │   ├── word-sets/   # WordSet CRUD & Aggregate Stats
│   │   │   ├── words/       # Words & Bulk Parser
│   │   │   ├── learning/    # Flashcards & SpacedRepetition (SM-2)
│   │   │   ├── quizzes/     # Quiz Generation & Engine
│   │   │   ├── statistics/  # Analytics & Dashboard Stats
│   │   │   ├── daily-activity/ # Streaks & Timezone Daily Goals
│   │   │   └── migrations/  # TypeORM Versioned Migrations
│   │   └── test/            # NestJS E2E Integration Test Suite
│   └── frontend/            # Next.js 14 Web App (Port: 3000)
├── packages/
│   └── shared-types/        # Спільні DTOs та Інтерфейси
├── .github/
│   └── workflows/ci.yml     # GitHub Actions CI Pipeline
├── docker-compose.yml       # PostgreSQL 16 Database
└── package.json             # Root monorepo scripts
```

---

## Швидкий старт

### **1. Передумови**
- Node.js `>= 20.x` або `22.x` (LTS)
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

## Демонстраційний обліковий запис

Для швидкого тестування можна використати попередньо налаштований акаунт або створити новий через реєстрацію:

- **Email**: `demo@lexiquiz.app`
- **Пароль**: `DemoPass123!`

---

## Тестування та перевірка коду

```bash
# Побудова спільних типів
npm run build:shared

# Unit-тести
npm run test

# Integration E2E тести бекенду
npm run test:e2e --workspace=apps/backend

# Перевірка типів TypeScript
npm run typecheck

# Перевірка стилю коду (ESLint)
npm run lint

# Повна продуктивна збірка
npm run build
```

---

## Roadmap

- [ ] Підтримка публічного каталогу спільнотних наборів
- [ ] Озвучка слів за допомогою Web Speech API та Text-to-Speech
- [ ] Офлайн-режим (Service Workers & PWA)
- [ ] Інтеграція FSRS (Free Spaced Repetition Scheduler) алгоритму

---

## Відомі обмеження

- Для коректної роботи квізів у режимі `multiple_choice` рекомендується створювати набори з 4+ слів. Якщо слів менше, система автоматично використовує режим `direct_typing`.
- Часовий пояс користувача за замовчуванням встановлюється як `Europe/Kyiv` або `UTC` і може бути змінений у налаштуваннях профілю.

---

## Внесок у проект (Contribution)

Внески вітаються! Якщо ви знайшли помилку або маєте ідею щодо покращення:
1. Форкніть репозиторій.
2. Створіть гілку для фічі (`git checkout -b feature/amazing-feature`).
3. Закомітьте зміни (`git commit -m 'Add amazing feature'`).
4. Запустіть тестування (`npm run test && npm run typecheck`).
5. Зробіть Push у гілку та відкрийте Pull Request.

---

## Автори та Ліцензія

Розроблено **WordForge (LexiQuiz) Team**.
Відкритий вихідний код розповсюджується під ліцензією [MIT License](LICENSE).
