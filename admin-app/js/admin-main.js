document.addEventListener('DOMContentLoaded', function() {
    const SUPABASE_URL = 'https://noskliwvsiejokzmczfp.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_VO6LwV9CJe-45tDjFgXGug_TzYoQ-6v';
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    const sidebarBtns = document.querySelectorAll('.sidebar-btn');
    const pages = document.querySelectorAll('.page');
    const pageTitle = document.getElementById('pageTitle');
    const adminUserName = document.getElementById('adminUserName');
    const minimizeBtn = document.getElementById('minimizeBtn');
    const maximizeBtn = document.getElementById('maximizeBtn');
    const closeBtn = document.getElementById('closeBtn');
    const appVersion = document.getElementById('appVersion');
    const addProductBtn = document.getElementById('addProductBtn');
    const addPhotoBtn = document.getElementById('addPhotoBtn');
    const addProductModal = document.getElementById('addProductModal');
    const addPhotoModal = document.getElementById('addPhotoModal');
    const closeProductModal = document.getElementById('closeProductModal');
    const closePhotoModal = document.getElementById('closePhotoModal');
    const addProductForm = document.getElementById('addProductForm');
    const addPhotoForm = document.getElementById('addPhotoForm');
    const adminLogout = document.getElementById('adminLogout');
    const productsGrid = document.getElementById('productsGrid');
    const photosGrid = document.getElementById('photosGrid');

    if (window.electronAPI) {
        window.electronAPI.getAppVersion().then(version => {
            if (appVersion) appVersion.textContent = `v${version}`;
        });
    }

    sidebarBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const targetPage = this.getAttribute('data-page');
            
            sidebarBtns.forEach(b => b.classList.remove('active'));
            pages.forEach(p => p.classList.remove('active'));
            
            this.classList.add('active');
            document.getElementById(`${targetPage}-page`).classList.add('active');
            
            const pageTitles = {
                'dashboard': 'Панель управления',
                'catalog-admin': 'Каталог',
                'gallery-admin': 'Галерея',
                'reviews-admin': 'Отзывы',
                'support-admin': 'Поддержка',
                'logs': 'Логи',
                'settings': 'Настройки'
            };
            
            pageTitle.textContent = pageTitles[targetPage] || 'Админ-панель';
            
            // Автоматическая загрузка данных при переходе
            if (targetPage === 'catalog-admin') loadProducts();
            if (targetPage === 'gallery-admin') loadPhotos();
            if (targetPage === 'dashboard') loadDashboardStats();
        });
    });

    // Управление окном
    if (minimizeBtn) minimizeBtn.addEventListener('click', () => window.electronAPI?.minimizeWindow());
    if (maximizeBtn) maximizeBtn.addEventListener('click', () => window.electronAPI?.maximizeWindow());
    if (closeBtn) closeBtn.addEventListener('click', () => window.electronAPI?.closeWindow());

    // Модальные окна
    if (addProductBtn) addProductBtn.addEventListener('click', () => addProductModal.style.display = 'block');
    if (addPhotoBtn) addPhotoBtn.addEventListener('click', () => addPhotoModal.style.display = 'block');
    if (closeProductModal) closeProductModal.addEventListener('click', () => addProductModal.style.display = 'none');
    if (closePhotoModal) closePhotoModal.addEventListener('click', () => addPhotoModal.style.display = 'none');

    // Форма добавления товара
    if (addProductForm) {
        addProductForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const name = document.getElementById('productName').value.trim();
            const description = document.getElementById('productDescription').value.trim();
            const price = document.getElementById('productPrice').value.trim();
            const image = document.getElementById('productImage').value.trim() || 'images/placeholder.jpg';
            const active = document.getElementById('productActive').checked;
            
            try {
                const { error } = await supabase
                    .from('products')
                    .insert([{ name, description, price, image_url: image, active }]);
                
                if (error) throw error;
                
                alert('Товар успешно добавлен!');
                addProductForm.reset();
                addProductModal.style.display = 'none';
                loadProducts();
            } catch (error) {
                console.error('Ошибка добавления товара:', error);
                alert('Ошибка добавления товара: ' + error.message);
            }
        });
    }

    // Форма добавления фото
    if (addPhotoForm) {
        addPhotoForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const url = document.getElementById('photoUrl').value.trim();
            const caption = document.getElementById('photoCaption').value.trim();
            
            if (!url || !caption) {
                alert('Заполните все поля');
                return;
            }
            
            try {
                const { error } = await supabase
                    .from('gallery')
                    .insert([{ url, caption }]);
                
                if (error) throw error;
                
                alert('Фото успешно добавлено!');
                addPhotoForm.reset();
                addPhotoModal.style.display = 'none';
                loadPhotos();
            } catch (error) {
                console.error('Ошибка добавления фото:', error);
                alert('Ошибка добавления фото: ' + error.message);
            }
        });
    }

    // Выход из админки
    if (adminLogout) {
        adminLogout.addEventListener('click', function() {
            if (confirm('Вы уверены, что хотите выйти?')) {
                window.location.href = '../frontend/profile.html';
            }
        });
    }

    // Загрузка товаров
    async function loadProducts() {
        if (!productsGrid) return;
        
        productsGrid.innerHTML = '<div class="skeleton-product"></div><div class="skeleton-product"></div><div class="skeleton-product"></div>';
        
        try {
            const { data: products, error } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            
            productsGrid.innerHTML = '';
            
            if (products.length === 0) {
                productsGrid.innerHTML = `
                    <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                        <div style="font-size: 48px; margin-bottom: 20px;">📦</div>
                        <h3>Каталог пуст</h3>
                        <p>Добавьте первый товар</p>
                    </div>
                `;
                return;
            }
            
            products.forEach(product => {
                const card = document.createElement('div');
                card.className = 'product-card-admin';
                card.innerHTML = `
                    <div class="product-img">
                        <img src="${product.image_url || 'images/placeholder.jpg'}" alt="${product.name}" onerror="this.src='../frontend/images/placeholder.jpg'">
                    </div>
                    <h3>${product.name}</h3>
                    <div class="product-price">${product.price}</div>
                    <div class="product-desc">${product.description.substring(0, 60)}${product.description.length > 60 ? '...' : ''}</div>
                    <div class="product-status ${product.active ? 'active' : 'inactive'}">
                        ${product.active ? '✅ Активен' : '❌ Неактивен'}
                    </div>
                    <div class="product-actions">
                        <button class="neon-button toggle-status" data-id="${product.id}">
                            ${product.active ? 'Скрыть' : 'Показать'}
                        </button>
                        <button class="neon-button delete-product" data-id="${product.id}">Удалить</button>
                    </div>
                `;
                productsGrid.appendChild(card);
            });
            
            setupProductActions();
        } catch (error) {
            console.error('Ошибка загрузки товаров:', error);
            productsGrid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: #e65100; padding: 20px;">Ошибка загрузки: ${error.message}</div>`;
        }
    }

    // Загрузка фото
    async function loadPhotos() {
        if (!photosGrid) return;
        
        photosGrid.innerHTML = '<div class="skeleton-photo"></div><div class="skeleton-photo"></div><div class="skeleton-photo"></div><div class="skeleton-photo"></div>';
        
        try {
            const { data: photos, error } = await supabase
                .from('gallery')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            
            photosGrid.innerHTML = '';
            
            if (photos.length === 0) {
                photosGrid.innerHTML = `
                    <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                        <div style="font-size: 48px; margin-bottom: 20px;">🖼️</div>
                        <h3>Галерея пуста</h3>
                        <p>Добавьте первое фото</p>
                    </div>
                `;
                return;
            }
            
            photos.forEach(photo => {
                const card = document.createElement('div');
                card.className = 'photo-card-admin';
                card.innerHTML = `
                    <img src="${photo.url}" alt="${photo.caption}" onerror="this.src='../frontend/images/placeholder.jpg'">
                    <div class="photo-caption">${photo.caption.substring(0, 30)}${photo.caption.length > 30 ? '...' : ''}</div>
                    <div class="photo-actions">
                        <button class="delete-photo" data-id="${photo.id}" title="Удалить">🗑️</button>
                    </div>
                `;
                photosGrid.appendChild(card);
            });
            
            setupPhotoActions();
        } catch (error) {
            console.error('Ошибка загрузки фото:', error);
            photosGrid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: #e65100; padding: 20px;">Ошибка загрузки: ${error.message}</div>`;
        }
    }

    // Статистика дашборда
    async function loadDashboardStats() {
        try {
            const { data: products } = await supabase.from('products').select('*');
            const { data: photos } = await supabase.from('gallery').select('*');
            
            document.getElementById('productsCount').textContent = products?.length || 0;
            document.getElementById('photosCount').textContent = photos?.length || 0;
            document.getElementById('reviewsCount').textContent = '335';
            document.getElementById('supportCount').textContent = '12';
        } catch (error) {
            console.error('Ошибка загрузки статистики:', error);
        }
    }

    // Действия с товарами
    function setupProductActions() {
        document.querySelectorAll('.toggle-status').forEach(btn => {
            btn.addEventListener('click', async function() {
                const id = this.getAttribute('data-id');
                const isActive = this.textContent.includes('Скрыть');
                
                try {
                    const { error } = await supabase
                        .from('products')
                        .update({ active: !isActive })
                        .eq('id', id);
                    
                    if (error) throw error;
                    
                    alert(`Товар ${isActive ? 'скрыт' : 'активирован'}`);
                    loadProducts();
                } catch (error) {
                    console.error('Ошибка обновления статуса:', error);
                    alert('Ошибка: ' + error.message);
                }
            });
        });
        
        document.querySelectorAll('.delete-product').forEach(btn => {
            btn.addEventListener('click', async function() {
                const id = this.getAttribute('data-id');
                if (!confirm('Удалить этот товар?')) return;
                
                try {
                    const { error } = await supabase
                        .from('products')
                        .delete()
                        .eq('id', id);
                    
                    if (error) throw error;
                    
                    alert('Товар удалён');
                    loadProducts();
                } catch (error) {
                    console.error('Ошибка удаления товара:', error);
                    alert('Ошибка: ' + error.message);
                }
            });
        });
    }

    // Действия с фото
    function setupPhotoActions() {
        document.querySelectorAll('.delete-photo').forEach(btn => {
            btn.addEventListener('click', async function() {
                const id = this.getAttribute('data-id');
                if (!confirm('Удалить это фото?')) return;
                
                try {
                    const { error } = await supabase
                        .from('gallery')
                        .delete()
                        .eq('id', id);
                    
                    if (error) throw error;
                    
                    alert('Фото удалено');
                    loadPhotos();
                } catch (error) {
                    console.error('Ошибка удаления фото:', error);
                    alert('Ошибка: ' + error.message);
                }
            });
        });
    }

    // Инициализация
    loadDashboardStats();
    loadProducts();
    loadPhotos();

    // Очистка логов
    const clearLogsBtn = document.getElementById('clearLogsBtn');
    if (clearLogsBtn) {
        clearLogsBtn.addEventListener('click', function() {
            if (confirm('Очистить все логи?')) {
                const logsContainer = document.getElementById('logsContainer');
                if (logsContainer) {
                    logsContainer.innerHTML = '<div class="log-item">[INFO] Логи очищены</div>';
                }
            }
        });
    }

    // Модальные окна закрываются по клику вне
    window.addEventListener('click', function(event) {
        if (event.target === addProductModal) addProductModal.style.display = 'none';
        if (event.target === addPhotoModal) addPhotoModal.style.display = 'none';
    });

    console.log('Админ-панель СЦТО загружена с подключением к Supabase');
});