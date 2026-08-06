# LexiQuiz REST API Overview

Документ містить опис REST API сервісу **LexiQuiz (WordForge)** backend (`apps/backend`).

Інтерактивна специфікація OpenAPI (Swagger UI) доступна за адресою: `http://localhost:3001/api/docs`.

---

## 🔑 Аутентифікація

API використовує гібридну схему JWT аутентифікації:
- **Access Token**: Короткоживучий Bearer JWT токен (15 хв), який передається у заголовку `Authorization: Bearer <token>`.
- **Refresh Token**: Довгоживучий JWT токен (7 днів), який зберігається у `httpOnly`, `sameSite=lax` cookie `refreshToken`.
- **Сесії**: Усі видані refresh токени відстежуються у таблиці `user_sessions` бази даних із можливістю дистанційного відкликання.

---

## 📌 Ендпоінти API

### Auth (`/auth`)
- `POST /auth/register` — Реєстрація нового користувача.
- `POST /auth/login` — Вхід користувача, видача Access Token та встановлення Refresh Cookie.
- `POST /auth/refresh` — Оновлення Access Token за допомогою Refresh Cookie.
- `POST /auth/logout` — Вихід із системи та видалення поточного Refresh Cookie і сесії.
- `GET /auth/sessions` — Отримання списку активних сесій користувача.
- `DELETE /auth/sessions/:id` — Відкликання конкретної сесії користувача.

### User Profile (`/users`)
- `GET /users/me` — Отримання профілю поточного авторизованого користувача.
- `PATCH /users/me` — Оновлення профілю (ім'я, dailyGoal, timezone).

### Word Sets (`/word-sets`)
- `GET /word-sets` — Список наборів користувача (з пагінацією та пошуком).
- `POST /word-sets` — Створення нового набору слів.
- `GET /word-sets/:id` — Отримання деталей набору.
- `PATCH /word-sets/:id` — Оновлення набору слів.
- `DELETE /word-sets/:id` — Видалення набору слів.

### Words (`/words`)
- `GET /words/set/:setId` — Список слів конкретного набору.
- `POST /words` — Створення нового слова.
- `POST /words/bulk` — Масовий імпорт слів у набір (`term — translation`).
- `PATCH /words/:id` — Оновлення слова.
- `DELETE /words/:id` — Видалення слова.

### Learning & Spaced Repetition (`/learning`)
- `GET /learning/due` — Отримання слів, запланованих до повторення на даний момент.
- `POST /learning/review` — Відправка оцінки складності слова (`1: Again`, `2: Hard`, `3: Good`, `4: Easy`).

### Quizzes (`/quizzes`)
- `POST /quizzes/generate` — Генерація сесії квізу для вибраного набору слів.
- `POST /quizzes/answer` — Відповідь на питання квізу з валідацією на сервері.
- `GET /quizzes/session/:id` — Отримання результатів сесії квізу.

### Statistics & Daily Activity (`/statistics`, `/daily-activity`)
- `GET /statistics/dashboard` — Зведена статистика користувача (загальна кількість вивчених слів, точність).
- `GET /daily-activity/streak` — Розрахунок поточного streak активності з урахуванням локального часового поясу.
