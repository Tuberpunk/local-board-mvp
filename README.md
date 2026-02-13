# LocalBoard - Локальная доска объявлений

MVP веб-приложения для размещения объявлений о товарах и услугах в одном городе.

## Стек технологий

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui
- **Backend/DB**: Supabase (PostgreSQL, Auth, Storage)
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React

## Быстрый старт

### 1. Настройка Supabase

1. Создайте проект в [Supabase](https://supabase.com)
2. Откройте SQL Editor и выполните скрипт из `supabase-schema.sql`
3. Создайте Storage bucket `product-images` с публичным доступом
4. Скопируйте URL и anon key из Project Settings → API

### 2. Настройка проекта

```bash
# Установка зависимостей
npm install

# Создание .env.local
cp .env.example .env.local
```

Заполните `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Запуск

```bash
# Режим разработки
npm run dev

# Сборка
npm run build

# Продакшен
npm start
```

## Структура проекта

```
app/
├── (auth)/           # Группа маршрутов авторизации
├── (main)/           # Главная страница, магазины, товары
├── dashboard/        # Личный кабинет продавца
├── api/upload/       # API для загрузки изображений
components/
├── ui/               # shadcn/ui компоненты
├── product/          # Компоненты товаров
├── shop/             # Компоненты магазина
├── layout/           # Header, BottomNav
├── forms/            # Формы и загрузка изображений
lib/
├── supabase/         # Клиенты Supabase
├── hooks/            # Custom hooks (useFavorites)
├── utils/            # Утилиты (cn, formatters, validators)
types/                # TypeScript типы
```

## Функциональность

### Гость (Покупатель)
- Просмотр всех товаров и магазинов без регистрации
- Фильтрация по категориям (Товары / Услуги)
- Кнопка "Связаться" с выбором: WhatsApp, Telegram, Позвонить
- Добавление в "Избранное" (LocalStorage)

### Продавец
- Регистрация (Email/Password)
- Создание магазина (обязательно после регистрации)
- CRUD операции с объявлениями
- Загрузка до 10 изображений на товар

## База данных

### Таблицы

- `profiles` - профили пользователей (связаны с auth.users)
- `shops` - магазины продавцов
- `products` - товары и услуги
- `categories` - категории объявлений

### RLS Политики

- Продавцы могут редактировать только свои товары
- Все пользователи видят активные товары и магазины
- Автоматическое создание профиля при регистрации

## Маршруты

| Маршрут | Описание |
|---------|----------|
| `/` | Главная страница с поиском и фильтрами |
| `/shop/[slug]` | Страница магазина |
| `/product/[id]` | Карточка товара |
| `/dashboard` | Панель продавца |
| `/dashboard/add-product` | Добавление товара |
| `/login`, `/register` | Авторизация |

## Mobile-First

Приложение разработано с приоритетом на мобильные устройства:
- Bottom navigation для быстрого доступа
- Адаптивные карточки товаров
- Оптимизированные формы
- Touch-friendly интерфейс

## Дополнительно

### Создание администратора

```sql
-- Назначить пользователя администратором
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'admin@example.com';
```

### Деплой

Рекомендуемые платформы:
- [Vercel](https://vercel.com) - оптимально для Next.js
- [Netlify](https://netlify.com)
- Собственный сервер

## Лицензия

MIT
