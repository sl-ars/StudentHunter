# StudentHunter
## Список существующих API endpoints

### Аутентификация и пользователи (`/api/auth/`)
**Регистрация**
1. `POST /api/auth/register/` - Регистрация нового пользователя

**Аутентификация**
1. `POST /api/auth/token/` - Получение JWT токенов (access и refresh)
2. `POST /api/auth/token/refresh/` - Обновление access токена
3. `POST /api/auth/token/verify/` - Проверка валидности токена
4. `POST /api/auth/logout/` - Выход из системы (добавление токена в черный список)

**Профиль пользователя**
1. `GET /api/auth/me/` - Получение данных текущего пользователя
2. `PUT/PATCH /api/auth/me/` - Обновление данных пользователя
3. `GET /api/auth/me/stats/` - Получение статистики пользователя

**Резюме**
1. `GET /api/auth/resumes/` - Список резюме пользователя
2. `POST /api/auth/resumes/` - Создание нового резюме
3. `GET /api/auth/resumes/{id}/` - Получение резюме по ID
4. `PUT/PATCH /api/auth/resumes/{id}/` - Обновление резюме
5. `DELETE /api/auth/resumes/{id}/` - Удаление резюме

**Сохраненные вакансии**
1. `GET /api/auth/saved-jobs/` - Список сохраненных вакансий
2. `POST /api/auth/saved-jobs/` - Сохранение вакансии
3. `DELETE /api/auth/saved-jobs/{id}/` - Удаление сохраненной вакансии
4. `POST /api/auth/saved-jobs/save_job/` - Сохранение вакансии (альтернативный метод)
5. `POST /api/auth/saved-jobs/unsave_job/` - Удаление сохраненной вакансии (альтернативный метод)
6. `GET /api/auth/saved-jobs/recommended/` - Рекомендуемые вакансии на основе сохраненных

**Подписки на компании**
1. `GET /api/auth/followed-companies/` - Список подписок на компании
2. `POST /api/auth/followed-companies/` - Подписка на компанию
3. `DELETE /api/auth/followed-companies/{id}/` - Отписка от компании
4. `POST /api/auth/followed-companies/follow_company/` - Подписка на компанию (альтернативный метод)
5. `POST /api/auth/followed-companies/unfollow_company/` - Отписка от компании (альтернативный метод)
6. `GET /api/auth/followed-companies/recommended/` - Рекомендуемые компании на основе подписок

### Вакансии (`/api/jobs/`)

**Управление вакансиями**
1. `GET /api/jobs/` - Список вакансий с фильтрацией
2. `POST /api/jobs/` - Создание новой вакансии
3. `GET /api/jobs/{id}/` - Получение вакансии по ID
4. `PUT/PATCH /api/jobs/{id}/` - Обновление вакансии
5. `DELETE /api/jobs/{id}/` - Удаление вакансии
6. `GET /api/jobs/trending/` - Популярные вакансии
7. `GET /api/jobs/{id}/similar/` - Похожие вакансии

**Заявки на вакансии**
1. `POST /api/jobs/{id}/apply/` - Подача заявки на вакансию
2. `GET /api/jobs/{id}/applications/` - Список заявок на вакансию (для работодателя)
3. `GET /api/jobs/applications/` - Список заявок пользователя
4. `GET /api/jobs/applications/{id}/` - Получение заявки по ID
5. `PUT/PATCH /api/jobs/applications/{id}/` - Обновление заявки
6. `POST /api/jobs/applications/{id}/update_status/` - Обновление статуса заявки
7. `GET /api/jobs/applications/stats/` - Статистика по заявкам

### Компании (`/api/companies/`)
**Управление компаниями**
1. `GET /api/companies/` - Список компаний с фильтрацией
2. `POST /api/companies/` - Создание новой компании
3. `GET /api/companies/{id}/` - Получение компании по ID
4. `PUT/PATCH /api/companies/{id}/` - Обновление компании
5. `DELETE /api/companies/{id}/` - Удаление компании
6. `GET /api/companies/trending/` - Популярные компании
7. `POST /api/companies/{id}/verify/` - Верификация компании (для админов)
8. `GET /api/companies/{id}/jobs/` - Список вакансий компании
9. `GET /api/companies/{id}/followers/` - Список подписчиков компании
10. `GET /api/companies/{id}/stats/` - Статистика компании

**Преимущества компании**
1. `GET /api/companies/{company_id}/benefits/` - Список преимуществ компании
2. `POST /api/companies/{company_id}/benefits/` - Добавление преимущества
3. `GET /api/companies/{company_id}/benefits/{id}/` - Получение преимущества по ID
4. `PUT/PATCH /api/companies/{company_id}/benefits/{id}/` - Обновление преимущества
5. `DELETE /api/companies/{company_id}/benefits/{id}/` - Удаление преимущества

### Документация API
- `GET /swagger/` - Swagger UI документация
- `GET /redoc/` - ReDoc документация
- `GET /swagger.json` - Swagger JSON спецификация

## Админ панель
- `GET /admin/` - Админ панель Django