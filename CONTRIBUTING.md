# Contributing to LexiQuiz

Дякуємо за ваш інтерес до розвитку проєкту **LexiQuiz (WordForge)**! 

---

## 🚀 Як зробити внесок (Workflow)

1. **Форкніть репозиторій** та клонуйте його локально:
   ```bash
   git clone https://github.com/YOUR_USERNAME/LexiQuiz.git
   cd LexiQuiz
   ```

2. **Встановіть залежності та запустіть сервіси**:
   ```bash
   npm install
   docker compose -f docker-compose.dev.yml up -d
   npm run build:shared
   npm run dev
   ```

3. **Створіть нову гілку для вашої фічі**:
   ```bash
   git checkout -b feature/my-new-feature
   ```

4. **Дотримуйтесь угод комітів (Conventional Commits)**:
   - `feat: add audio pronunciation support`
   - `fix(backend): correct SM-2 interval calculation`
   - `docs: update deployment instructions`
   - `test(frontend): add flashcard interaction tests`

5. **Перевірте якість коду перед створенням PR**:
   ```bash
   npm run typecheck
   npm run lint
   npm run test
   ```

6. **Відкрийте Pull Request** до гілки `main`.

---

## 🏷 Використані мітки (Labels)

- `bug`: Помилка або дефект функціональності.
- `feature`: Нова функціональність або покращення.
- `security`: Безпека, аутентифікація та сесії.
- `documentation`: Оновлення або створення документації.
- `frontend`: Зміни у воркспейсі `apps/frontend`.
- `backend`: Зміни у воркспейсі `apps/backend`.
- `database`: Міграції та сутності TypeORM.
- `testing`: Тести Jest, Vitest або Playwright.
- `good first issue`: Чудове завдання для нових учасників.
- `priority: high` / `priority: medium` / `priority: low`: Пріоритетність виконання.
