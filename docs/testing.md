# LexiQuiz Testing Strategy & Pipeline

Документ описує стратегію тестування та інструментарій, що використовується в проєкті **LexiQuiz (WordForge)**.

---

## Рівні тестування

| Рівень | Інструмент | Локація | Команда |
|---|---|---|---|
| **Backend Unit Tests** | Jest | `apps/backend/src/**/*.spec.ts` | `npm run test` |
| **Backend E2E Tests** | Jest + Supertest | `apps/backend/test/**/*.e2e-spec.ts` | `npm run test:e2e --workspace=apps/backend` |
| **Frontend Unit & Component Tests** | Vitest + Testing Library | `apps/frontend/src/**/*.test.tsx` | `npm run test --workspace=apps/frontend` |
| **Frontend E2E Tests** | Playwright | `apps/frontend/e2e/**/*.spec.ts` | `npm run test:e2e --workspace=apps/frontend` |

---

## Покриття критичних функціональностей

1. **Аутентифікація**:
   - Форми входу та реєстрації на фронтенді.
   - Отримання JWT токена та ротація HttpOnly Refresh Cookie.
   - Автоматичний повтор запитів у разі 401 через Axios Interceptor.

2. **Набори слів та імпорт**:
   - Валідація форм створення наборів.
   - Розпізнавання складних дефісних слів під час масового імпорту (`mother-in-law`).

3. **Навчання та Квізи**:
   - Інтерактивні картки Flashcards (перегортання, гарячі клавіші).
   - Розрахунок інтервального повторення Spaced Repetition (SM-2).
   - 4 типи питань у квізах.

---

## GitHub Actions CI Workflow

Конфігурація [.github/workflows/ci.yml](file:///home/palamar/Documents/Project/LexiQuiz/.github/workflows/ci.yml) виконує ізольовані перевірки для забезпечення швидкості під час відкриття PR:

1. **`build-shared`**: Збірка `@wordforge/shared-types`.
2. **`typecheck`**: Перевірка типів TypeScript у всіх воркспейсах.
3. **`lint`**: Перевірка стилю коду ESLint.
4. **`backend-unit`**: Unit-тести NestJS.
5. **`backend-e2e`**: E2E тести бекенду із запущеним контейнером PostgreSQL.
6. **`frontend-unit`**: Unit & Component тести Vitest.
7. **`frontend-e2e`**: E2E тести Playwright у браузерному середовищі.
8. **`build`**: Фінальна продуктивна збірка всіх пакетів.
