-- =====================================================
-- ЛОКАЛЬНАЯ ДОСКА ОБЪЯВЛЕНИЙ - SQL СХЕМА SUPABASE
-- =====================================================

-- Включение расширения для генерации UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ТАБЛИЦА ПРОФИЛЕЙ (связана с auth.users)
-- =====================================================
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'seller' CHECK (role IN ('seller', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- ТАБЛИЦА КАТЕГОРИЙ
-- =====================================================
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    icon TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- ТАБЛИЦА МАГАЗИНОВ
-- =====================================================
CREATE TABLE shops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    avatar_url TEXT,
    cover_url TEXT,
    -- Контактная информация
    contact_phone TEXT,
    contact_whatsapp TEXT,
    contact_telegram TEXT,
    contact_email TEXT,
    -- Геоданные
    address TEXT,
    city TEXT,
    coordinates POINT,
    -- Настройки
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Индекс для поиска по slug
CREATE INDEX idx_shops_slug ON shops(slug);
CREATE INDEX idx_shops_profile_id ON shops(profile_id);

-- =====================================================
-- ТАБЛИЦА ТОВАРОВ/УСЛУГ
-- =====================================================
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    
    -- Основная информация
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('good', 'service')),
    
    -- Цена и наличие
    price DECIMAL(12, 2),
    price_from BOOLEAN DEFAULT FALSE, -- Для услуг "цена от"
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Медиа
    images TEXT[] DEFAULT '{}',
    
    -- Статистика
    views_count INTEGER DEFAULT 0,
    
    -- Мета
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Индексы для оптимизации
CREATE INDEX idx_products_shop_id ON products(shop_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_type ON products(type);
CREATE INDEX idx_products_created_at ON products(created_at DESC);
CREATE INDEX idx_products_is_active ON products(is_active);

-- =====================================================
-- ТРИГГЕРЫ ДЛЯ ОБНОВЛЕНИЯ updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shops_updated_at
    BEFORE UPDATE ON shops
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ТРИГГЕР: Автоматическое создание профиля при регистрации
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) ПОЛИТИКИ
-- =====================================================

-- Включение RLS для всех таблиц
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- ПОЛИТИКИ ДЛЯ profiles
-- =====================================================

-- Чтение: пользователи видят все профили
CREATE POLICY "Profiles are viewable by everyone"
    ON profiles FOR SELECT
    USING (TRUE);

-- Обновление: только свой профиль
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- =====================================================
-- ПОЛИТИКИ ДЛЯ shops
-- =====================================================

-- Чтение: все видят активные магазины
CREATE POLICY "Shops are viewable by everyone"
    ON shops FOR SELECT
    USING (is_active = TRUE);

-- Вставка: только авторизованные пользователи
CREATE POLICY "Authenticated users can create shops"
    ON shops FOR INSERT
    WITH CHECK (auth.uid() = profile_id);

-- Обновление: только владелец магазина
CREATE POLICY "Shop owners can update their shops"
    ON shops FOR UPDATE
    USING (auth.uid() = profile_id);

-- Удаление: только владелец магазина
CREATE POLICY "Shop owners can delete their shops"
    ON shops FOR DELETE
    USING (auth.uid() = profile_id);

-- =====================================================
-- ПОЛИТИКИ ДЛЯ products
-- =====================================================

-- Чтение: все видят активные товары
CREATE POLICY "Products are viewable by everyone"
    ON products FOR SELECT
    USING (is_active = TRUE);

-- Вставка: только владелец магазина
CREATE POLICY "Shop owners can create products"
    ON products FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM shops 
            WHERE shops.id = products.shop_id 
            AND shops.profile_id = auth.uid()
        )
    );

-- Обновление: только владелец магазина
CREATE POLICY "Shop owners can update their products"
    ON products FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM shops 
            WHERE shops.id = products.shop_id 
            AND shops.profile_id = auth.uid()
        )
    );

-- Удаление: только владелец магазина
CREATE POLICY "Shop owners can delete their products"
    ON products FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM shops 
            WHERE shops.id = products.shop_id 
            AND shops.profile_id = auth.uid()
        )
    );

-- =====================================================
-- ПОЛИТИКИ ДЛЯ categories
-- =====================================================

-- Чтение: все видят категории
CREATE POLICY "Categories are viewable by everyone"
    ON categories FOR SELECT
    USING (TRUE);

-- Изменение: только админы (через сервисную роль)
CREATE POLICY "Only admins can modify categories"
    ON categories FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- =====================================================
-- НАЧАЛЬНЫЕ ДАННЫЕ
-- =====================================================

-- Категории товаров
INSERT INTO categories (name, slug, icon, sort_order) VALUES
    ('Электроника', 'electronics', 'smartphone', 1),
    ('Одежда и обувь', 'clothing', 'shirt', 2),
    ('Дом и сад', 'home', 'home', 3),
    ('Авто', 'auto', 'car', 4),
    ('Недвижимость', 'real-estate', 'building', 5),
    ('Услуги', 'services', 'wrench', 6),
    ('Работа', 'jobs', 'briefcase', 7),
    ('Животные', 'animals', 'paw', 8),
    ('Хобби и спорт', 'hobby', 'gamepad', 9),
    ('Детские товары', 'kids', 'baby', 10);

-- =====================================================
-- ФУНКЦИИ ДЛЯ ПРИЛОЖЕНИЯ
-- =====================================================

-- Функция инкремента просмотров
CREATE OR REPLACE FUNCTION increment_product_views(product_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE products 
    SET views_count = views_count + 1 
    WHERE id = product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Функция получения товаров магазина с пагинацией
CREATE OR REPLACE FUNCTION get_shop_products(
    shop_slug TEXT,
    page_size INTEGER DEFAULT 20,
    page_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    description TEXT,
    type TEXT,
    price DECIMAL,
    price_from BOOLEAN,
    is_available BOOLEAN,
    images TEXT[],
    views_count INTEGER,
    created_at TIMESTAMPTZ,
    category_name TEXT,
    category_slug TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.title,
        p.description,
        p.type,
        p.price,
        p.price_from,
        p.is_available,
        p.images,
        p.views_count,
        p.created_at,
        c.name as category_name,
        c.slug as category_slug
    FROM products p
    JOIN shops s ON p.shop_id = s.id
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE s.slug = shop_slug 
        AND p.is_active = TRUE 
        AND s.is_active = TRUE
    ORDER BY p.created_at DESC
    LIMIT page_size
    OFFSET page_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Функция поиска товаров
CREATE OR REPLACE FUNCTION search_products(
    search_query TEXT,
    product_type TEXT DEFAULT NULL,
    category_slug TEXT DEFAULT NULL,
    min_price DECIMAL DEFAULT NULL,
    max_price DECIMAL DEFAULT NULL,
    page_size INTEGER DEFAULT 20,
    page_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    description TEXT,
    type TEXT,
    price DECIMAL,
    price_from BOOLEAN,
    images TEXT[],
    created_at TIMESTAMPTZ,
    shop_name TEXT,
    shop_slug TEXT,
    category_name TEXT,
    category_slug TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.title,
        p.description,
        p.type,
        p.price,
        p.price_from,
        p.images,
        p.created_at,
        s.name as shop_name,
        s.slug as shop_slug,
        c.name as category_name,
        c.slug as category_slug
    FROM products p
    JOIN shops s ON p.shop_id = s.id
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.is_active = TRUE 
        AND s.is_active = TRUE
        AND (
            search_query IS NULL 
            OR p.title ILIKE '%' || search_query || '%'
            OR p.description ILIKE '%' || search_query || '%'
        )
        AND (product_type IS NULL OR p.type = product_type)
        AND (category_slug IS NULL OR c.slug = category_slug)
        AND (min_price IS NULL OR p.price >= min_price)
        AND (max_price IS NULL OR p.price <= max_price)
    ORDER BY p.created_at DESC
    LIMIT page_size
    OFFSET page_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
