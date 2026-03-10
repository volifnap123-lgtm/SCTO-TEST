const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function createClient(url, key) {
    return {
        url,
        key,
        auth: {
            session: null,
            user: null,
            signIn: function(email, password) {
                console.log('Supabase Auth: signIn', { email });
                localStorage.setItem('supabase_session', JSON.stringify({
                    email,
                    user: { email, id: Date.now() }
                }));
                this.session = { email };
                this.user = { email, id: Date.now() };
                return Promise.resolve({ data: { user: this.user }, error: null });
            },
            signUp: function(email, password, options) {
                console.log('Supabase Auth: signUp', { email, options });
                localStorage.setItem('supabase_session', JSON.stringify({
                    email,
                    user: { email, id: Date.now(), ...options?.data }
                }));
                this.session = { email };
                this.user = { email, id: Date.now(), ...options?.data };
                return Promise.resolve({ data: { user: this.user }, error: null });
            },
            signOut: function() {
                console.log('Supabase Auth: signOut');
                localStorage.removeItem('supabase_session');
                this.session = null;
                this.user = null;
                return Promise.resolve({ error: null });
            },
            getSession: function() {
                const session = localStorage.getItem('supabase_session');
                if (session) {
                    const parsed = JSON.parse(session);
                    this.session = parsed;
                    this.user = parsed.user;
                    return Promise.resolve({ data: { session: parsed }, error: null });
                }
                return Promise.resolve({ data: { session: null }, error: null });
            }
        },
        from: function(table) {
            return {
                table,
                select: function(columns = '*') {
                    console.log(`Supabase: SELECT ${columns} FROM ${table}`);
                    const mockData = {
                        products: [
                            { id: 1, name: 'Правка литого диска', description: 'Восстановление геометрии литого диска после деформации', price: 'от 1 500 ₽', image: 'images/placeholder.jpg', active: true, created_at: new Date().toISOString() },
                            { id: 2, name: 'Правка штампованного диска', description: 'Выравнивание штампованного диска после ударов', price: 'от 800 ₽', image: 'images/placeholder.jpg', active: true, created_at: new Date().toISOString() },
                            { id: 3, name: 'Ремонт трещин на диске', description: 'Сварка и восстановление трещин на литых дисках', price: 'от 2 000 ₽', image: 'images/placeholder.jpg', active: true, created_at: new Date().toISOString() }
                        ],
                        gallery: [
                            { id: 1, url: 'images/placeholder.jpg', caption: 'До и после правки диска R16', created_at: new Date().toISOString() },
                            { id: 2, url: 'images/placeholder.jpg', caption: 'Правка литого диска после удара', created_at: new Date().toISOString() },
                            { id: 3, url: 'images/placeholder.jpg', caption: 'Восстановление штампованного диска', created_at: new Date().toISOString() }
                        ],
                        reviews: [
                            { id: 1, author: 'Иван Петров', rating: 5, text: 'Отличная работа! Привёз колесо после сильного удара...', date: '2026-02-15', photos: [], comments: 3 },
                            { id: 2, author: 'Алексей Смирнов', rating: 5, text: 'Обратился в эту мастерскую по рекомендации друга...', date: '2026-02-10', photos: [], comments: 1 }
                        ],
                        support: [
                            { id: 1, user_id: 1, user_name: 'Иван Иванов', message: 'Здравствуйте! Хочу узнать о правке диска R16', created_at: new Date().toISOString() }
                        ],
                        users: [
                            { id: 1, email: 'user@example.com', name: 'Иван Иванов', phone: '+7 (999) 123-45-67', created_at: new Date().toISOString() }
                        ]
                    };
                    return Promise.resolve({ data: mockData[table] || [], error: null });
                },
                insert: function(data) {
                    console.log(`Supabase: INSERT INTO ${this.table}`, data);
                    return Promise.resolve({ data, error: null });
                },
                update: function(data) {
                    console.log(`Supabase: UPDATE ${this.table}`, data);
                    return Promise.resolve({ data, error: null });
                },
                delete: function() {
                    console.log(`Supabase: DELETE FROM ${this.table}`);
                    return Promise.resolve({ data: null, error: null });
                },
                eq: function(column, value) {
                    console.log(`Supabase: WHERE ${column} = ${value}`);
                    return this;
                },
                neq: function(column, value) {
                    console.log(`Supabase: WHERE ${column} != ${value}`);
                    return this;
                },
                gt: function(column, value) {
                    console.log(`Supabase: WHERE ${column} > ${value}`);
                    return this;
                },
                lt: function(column, value) {
                    console.log(`Supabase: WHERE ${column} < ${value}`);
                    return this;
                },
                order: function(column, options) {
                    console.log(`Supabase: ORDER BY ${column}`, options);
                    return this;
                },
                limit: function(count) {
                    console.log(`Supabase: LIMIT ${count}`);
                    return this;
                }
            };
        },
        storage: {
            from: function(bucket) {
                return {
                    bucket,
                    upload: function(path, file) {
                        console.log(`Supabase Storage: Upload to ${bucket}/${path}`, file);
                        return Promise.resolve({ data: { path }, error: null });
                    },
                    download: function(path) {
                        console.log(`Supabase Storage: Download from ${bucket}/${path}`);
                        return Promise.resolve({ data: null, error: null });
                    },
                    remove: function(paths) {
                        console.log(`Supabase Storage: Remove from ${bucket}`, paths);
                        return Promise.resolve({ data: null, error: null });
                    },
                    list: function(path) {
                        console.log(`Supabase Storage: List ${bucket}/${path}`);
                        return Promise.resolve({ data: [], error: null });
                    }
                };
            }
        }
    };
}

export function initSupabase() {
    console.log('Supabase инициализирован');
    return supabase;
}