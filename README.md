# Dvorfs Market - Интернет-магазин с микросервисной архитектурой

Полнофункциональный интернет-магазин с микросервисной архитектурой.

## Технологический стек

**Backend:**
- Node.js + Express
- TypeScript
- PostgreSQL (Knex.js)
- Redis (ioredis)
- JWT (jsonwebtoken)
- bcrypt
- Zod для валидации

**Frontend:**
- Next.js 14+ (App Router)
- TypeScript
- TailwindCSS
- Zustand
- React Hook Form
- Axios

**Инфраструктура:**
- Docker & Docker Compose
- Микросервисная архитектура

## Структура проекта

```
dvorfs-market/
├── services/
│   ├── api-gateway/          # API Gateway
│   ├── auth-service/         # Авторизация и регистрация
│   ├── products-service/     # Товары, категории, поиск
│   ├── orders-service/       # Заказы, корзина
│   ├── payments-service/     # Платежи (Stripe, YooKassa)
│   └── notifications-service/# Уведомления
├── frontend/                 # Next.js приложение
├── shared/                   # Общие типы, утилиты
└── docker-compose.yml        # Локальная разработка
```

## Быстрый старт

### Требования
- Docker и Docker Compose (версия 3.8+)
- Make (опционально, для удобных команд)

### Установка и запуск

1. Клонируйте репозиторий

2. (Опционально) Создайте файл `.env` в корне проекта для переменных окружения:
```bash
JWT_SECRET=your-super-secret-jwt-key-change-this
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
YOOKASSA_SHOP_ID=your-shop-id
YOOKASSA_SECRET_KEY=your-secret-key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

3. Соберите и запустите все сервисы:
```bash
# С помощью Make (рекомендуется)
make build
make up

# Или напрямую с docker-compose
docker-compose build
docker-compose up -d
```

**Примечание:** Миграции базы данных запускаются автоматически при старте каждого сервиса через docker-entrypoint.sh

4. Приложение будет доступно:
   - Frontend: http://localhost:3001
   - API Gateway: http://localhost:3000

### Разработка с hot-reload

Для разработки с автоматической перезагрузкой:
```bash
make dev
# или
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

### Полезные команды

```bash
# Просмотр логов всех сервисов
make logs
# или для конкретного сервиса
docker-compose logs -f auth-service

# Остановка всех сервисов
make down

# Перезапуск
make restart

# Очистка (удаляет все volumes и контейнеры)
make clean

# Запуск миграций вручную (если нужно)
make migrate-all
# или для конкретного сервиса
docker-compose exec auth-service npm run migrate
```

### Структура Docker

Все сервисы запускаются в Docker контейнерах:
- **Базы данных**: PostgreSQL (5 инстансов для каждого сервиса)
- **Кеш**: Redis
- **Backend сервисы**: Node.js приложения
- **Frontend**: Next.js приложение

Сервисы общаются через внутреннюю Docker сеть `dvorfs-network`.

## Порты сервисов

- API Gateway: http://localhost:3000
- Auth Service: http://localhost:3007 (внутренний порт 3001)
- Products Service: http://localhost:3002
- Orders Service: http://localhost:3003
- Payments Service: http://localhost:3004
- Notifications Service: http://localhost:3005
- Frontend: http://localhost:3001 (Next.js)

## Базы данных

- Auth DB: localhost:5432
- Products DB: localhost:5433
- Orders DB: localhost:5434
- Payments DB: localhost:5435
- Notifications DB: localhost:5436
- Redis: localhost:6379

## API Endpoints

### Auth
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `POST /api/auth/refresh` - Обновление токена
- `GET /api/auth/me` - Текущий пользователь

### Products
- `GET /api/products` - Список товаров
- `GET /api/products/:id` - Детали товара
- `GET /api/categories` - Список категорий
- `GET /api/wishlist` - Избранное

### Orders
- `GET /api/cart` - Корзина
- `POST /api/cart/items` - Добавить в корзину
- `POST /api/orders` - Создать заказ
- `GET /api/orders` - Список заказов

### Payments
- `POST /api/payments/create` - Создать платеж
- `GET /api/payments/:id` - Статус платежа

### Notifications
- `GET /api/notifications` - Список уведомлений
- `PUT /api/notifications/:id/read` - Отметить как прочитанное

## Переменные окружения

Каждый сервис требует свой `.env` файл. Основные переменные:

**Auth Service:**
- DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
- JWT_SECRET
- SMTP settings для восстановления пароля

**Products Service:**
- DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
- REDIS_HOST, REDIS_PORT

**Orders Service:**
- DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
- PRODUCTS_SERVICE_URL

**Payments Service:**
- DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
- STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
- YOOKASSA_SHOP_ID, YOOKASSA_SECRET_KEY

**Notifications Service:**
- DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
- SMTP settings

**Frontend:**
- NEXT_PUBLIC_API_URL=http://localhost:3000/api

## Разработка

Для разработки рекомендуется использовать `ts-node-dev` для автоматической перезагрузки при изменении кода.

## Тестирование

Для запуска тестов (когда будут добавлены):
```bash
npm test
```

## Деплой

Для production деплоя:
1. Настройте переменные окружения для production
2. Соберите все сервисы: `npm run build`
3. Используйте PM2 или Docker для управления процессами
4. Настройте Nginx как reverse proxy

## Лицензия

MIT

