-- Схема базы данных для СЦТО "Правка Дисков"
-- Создана: 2026-03-10

-- Таблица пользователей
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

-- Таблица товаров/услуг каталога
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price TEXT NOT NULL,
    image_url TEXT DEFAULT 'images/placeholder.jpg',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_products_active ON products(active);

-- Таблица галереи фотографий
CREATE TABLE IF NOT EXISTS gallery (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url TEXT NOT NULL,
    caption TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_gallery_created_at ON gallery(created_at DESC);

-- Таблица отзывов
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    text TEXT NOT NULL,
    photos TEXT[],
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_reviews_rating ON reviews(rating DESC);
CREATE INDEX idx_reviews_date ON reviews(date DESC);

-- Таблица сообщений поддержки
CREATE TABLE IF NOT EXISTS support_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    user_email TEXT,
    message TEXT NOT NULL,
    response TEXT,
    responded BOOLEAN DEFAULT false,
    responded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_support_messages_user_id ON support_messages(user_id);
CREATE INDEX idx_support_messages_responded ON support_messages(responded);
CREATE INDEX idx_support_messages_created_at ON support_messages(created_at DESC);

-- Таблица логов
CREATE TABLE IF NOT EXISTS logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level TEXT NOT NULL CHECK (level IN ('INFO', 'WARN', 'ERROR', 'DEBUG')),
    message TEXT NOT NULL,
    source TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_logs_level ON logs(level);
CREATE INDEX idx_logs_created_at ON logs(created_at DESC);

-- Триггеры для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gallery_updated_at BEFORE UPDATE ON gallery
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_support_messages_updated_at BEFORE UPDATE ON support_messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) - включить при необходимости
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;

-- Политики доступа (примеры)
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Public can view active products" ON products
    FOR SELECT USING (active = true);

CREATE POLICY "Public can view gallery" ON gallery
    FOR SELECT USING (true);

CREATE POLICY "Public can view reviews" ON reviews
    FOR SELECT USING (true);

CREATE POLICY "Users can create support messages" ON support_messages
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can view support messages" ON support_messages
    FOR SELECT USING (true);

-- Вставка тестовых данных
INSERT INTO products (name, description, price, active) VALUES
    ('Правка литого диска', 'Восстановление геометрии литого диска после деформации. Используем современное оборудование для точной правки без повреждения структуры диска.', 'от 1 500 ₽', true),
    ('Правка штампованного диска', 'Выравнивание штампованного диска после ударов и деформаций. Гарантируем прочность и надёжность после ремонта.', 'от 800 ₽', true),
    ('Ремонт трещин на диске', 'Сварка и восстановление трещин на литых дисках. Полное восстановление целостности и безопасности диска.', 'от 2 000 ₽', true),
    ('Покраска дисков', 'Профессиональная покраска дисков в любой цвет. Используем качественные материалы для долговечного результата.', 'от 2 500 ₽', true),
    ('Полировка дисков', 'Полировка литых дисков до зеркального блеска. Удаление царапин и восстановление внешнего вида.', 'от 1 800 ₽', true),
    ('Диагностика дисков', 'Комплексная диагностика состояния дисков. Выявление скрытых дефектов и оценка возможности ремонта.', '500 ₽', true);

INSERT INTO gallery (url, caption) VALUES
    ('images/placeholder.jpg', 'До и после правки диска R16'),
    ('images/placeholder.jpg', 'Правка литого диска после удара'),
    ('images/placeholder.jpg', 'Восстановление штампованного диска'),
    ('images/placeholder.jpg', 'Оборудование для правки дисков'),
    ('images/placeholder.jpg', 'Результат работы мастера');

INSERT INTO reviews (author, rating, text, date) VALUES
    ('Иван Петров', 5, 'Отличная работа! Привёз колесо после сильного удара, думал уже не спасти. Мастера сделали всё качественно, диск как новый. Рекомендую!', '2026-02-15'),
    ('Алексей Смирнов', 5, 'Обратился в эту мастерскую по рекомендации друга. Не пожалел! Правка диска заняла меньше часа, цена адекватная. Теперь только сюда!', '2026-02-10'),
    ('Мария Козлова', 4, 'Хороший сервис. Отремонтировали два диска после зимней эксплуатации. Единственное, пришлось подождать дольше обещанного времени, но результат того стоил.', '2026-02-05'),
    ('Дмитрий Иванов', 5, 'Профессионалы своего дела! Правили литой диск после попадания в яму. Сделали аккуратно, без следов ремонта. Спасибо за качественную работу!', '2026-01-28'),
    ('Елена Васильева', 5, 'Очень довольна сервисом. Мастера вежливые, всё объяснили, показали. Диск восстановили полностью. Цены вполне адекватные за такое качество.', '2026-01-20');