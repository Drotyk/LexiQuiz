# Changelog

Усі вагомі зміни в проєкті **LexiQuiz (WordForge)** документуються в цьому файлі відповідно до принципів [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) та [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.0] - 2026-08-06

### Added
- **JWT & Session Revocation System**: Access token у пам'яті + HttpOnly Refresh Cookie та таблиця `user_sessions` у PostgreSQL.
- **WordSets & Bulk Import**: CRUD управління наборами слів, приватність (Private/Public) та інтелектуальний імпорт слів із підтримкою складних дефісних термінів (`mother-in-law`).
- **Learning & Flashcards**: Інтерактивний режим фліп-карт із підтримкою гарячих клавіш та мобільних жестів.
- **Quiz Engine**: 4 типи квізів (`multiple_choice`, `direct_typing`, `reverse_typing`, `true_false`).
- **Spaced Repetition (SM-2)**: Реалізація алгоритму SuperMemo-2 з оцінками `Again`, `Hard`, `Good`, `Easy`.
- **Daily Activity & Streaks**: Розрахунок активних днів з урахуванням локального часового поясу користувача.
- **Frontend Testing Infrastructure**: Підключено Vitest, React Testing Library та Playwright E2E.
- **Docker & Deployment Setup**: Додано мультистедж `Dockerfile` для бекенду та фронтенду, `docker-compose.dev.yml` та `docker-compose.prod.yml`.
- **Open Source Templates**: Файли `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`, GitHub Issue/PR шаблони, Dependabot та CodeQL workflow.
