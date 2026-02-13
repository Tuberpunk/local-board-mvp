# Структура проекта Next.js 14 - Локальная доска объявлений

```
local-board/
├── app/                          # App Router (Next.js 14)
│   ├── (auth)/                   # Группа маршрутов авторизации
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (main)/                   # Группа маршрутов основного сайта
│   │   ├── page.tsx              # Главная страница (/)
│   │   ├── layout.tsx
│   │   ├── shop/
│   │   │   └── [slug]/
│   │   │       └── page.tsx      # Страница магазина
│   │   └── product/
│   │       └── [id]/
│   │           └── page.tsx      # Страница товара
│   ├── dashboard/                # Личный кабинет продавца
│   │   ├── layout.tsx
│   │   ├── page.tsx              # Список товаров
│   │   ├── add-product/
│   │   │   └── page.tsx          # Форма добавления товара
│   │   └── edit-product/
│   │       └── [id]/
│   │           └── page.tsx      # Форма редактирования
│   ├── api/                      # API Routes (если нужны)
│   │   └── webhooks/
│   │       └── supabase/
│   │           └── route.ts
│   ├── layout.tsx                # Корневой layout
│   └── globals.css
├── components/                   # React компоненты
│   ├── ui/                       # shadcn/ui компоненты
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── textarea.tsx
│   │   ├── select.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── badge.tsx
│   │   ├── skeleton.tsx
│   │   ├── toast.tsx
│   │   └── toaster.tsx
│   ├── product/                  # Компоненты товаров
│   │   ├── ProductCard.tsx
│   │   ├── ProductGrid.tsx
│   │   ├── ProductGallery.tsx
│   │   └── ProductContactButtons.tsx
│   ├── shop/                     # Компоненты магазина
│   │   ├── ShopHeader.tsx
│   │   ├── ShopCard.tsx
│   │   └── ShopContactInfo.tsx
│   ├── layout/                   # Компоненты layout
│   │   ├── Header.tsx
│   │   ├── BottomNav.tsx         # Мобильная навигация
│   │   ├── SearchBar.tsx
│   │   └── CategoryFilter.tsx
│   ├── forms/                    # Формы
│   │   ├── ProductForm.tsx
│   │   ├── ShopForm.tsx
│   │   └── AuthForm.tsx
│   └── favorites/                # Избранное
│       └── FavoriteButton.tsx
├── lib/                          # Утилиты и конфигурация
│   ├── supabase/                 # Supabase клиенты
│   │   ├── client.ts             # Browser client
│   │   └── server.ts             # Server client
│   ├── hooks/                    # Custom hooks
│   │   ├── useSupabase.ts
│   │   ├── useProducts.ts
│   │   ├── useShop.ts
│   │   ├── useFavorites.ts       # LocalStorage избранное
│   │   └── useUser.ts
│   ├── utils/
│   │   ├── cn.ts                 # tailwind-merge
│   │   ├── formatters.ts         # Форматирование цен, дат
│   │   └── validators.ts         # Zod схемы
│   └── constants.ts              # Константы
├── types/                        # TypeScript типы
│   ├── database.ts               # Типы Supabase
│   ├── product.ts
│   ├── shop.ts
│   ├── profile.ts
│   └── category.ts
├── public/                       # Статические файлы
│   ├── images/
│   │   ├── placeholder-product.svg
│   │   └── placeholder-shop.svg
│   └── favicon.ico
├── middleware.ts                 # Next.js middleware (auth)
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── .env.local                    # Переменные окружения
```

## Переменные окружения (.env.local)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=LocalBoard
```

## Установка зависимостей

```bash
# Инициализация проекта
npx create-next-app@14 local-board --typescript --tailwind --eslint --app --src-dir=false

# shadcn/ui
npx shadcn-ui@latest init

# Supabase
npm install @supabase/supabase-js @supabase/ssr

# Forms
npm install react-hook-form @hookform/resolvers zod

# Icons
npm install lucide-react

# Utilities
npm install clsx tailwind-merge date-fns
```
