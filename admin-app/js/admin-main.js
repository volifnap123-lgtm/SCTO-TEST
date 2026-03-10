document.addEventListener('DOMContentLoaded', function() {
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
        });
    });

    if (minimizeBtn) {
        minimizeBtn.addEventListener('click', () => {
            if (window.electronAPI) window.electronAPI.minimizeWindow();
        });
    }

    if (maximizeBtn) {
        maximizeBtn.addEventListener('click', () => {
            if (window.electronAPI) window.electronAPI.maximizeWindow();
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            if (window.electronAPI) window.electronAPI.closeWindow();
        });
    }

    if (addProductBtn) {
        addProductBtn.addEventListener('click', () => {
            addProductModal.style.display = 'block';
        });
    }

    if (addPhotoBtn) {
        addPhotoBtn.addEventListener('click', () => {
            addPhotoModal.style.display = 'block';
        });
    }

    if (closeProductModal) {
        closeProductModal.addEventListener('click', () => {
            addProductModal.style.display = 'none';
        });
    }

    if (closePhotoModal) {
        closePhotoModal.addEventListener('click', () => {
            addPhotoModal.style.display = 'none';
        });
    }

    if (addProductForm) {
        addProductForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('productName').value;
            const description = document.getElementById('productDescription').value;
            const price = document.getElementById('productPrice').value;
            const image = document.getElementById('productImage').value;
            const active = document.getElementById('productActive').checked;
            
            addProduct(name, description, price, image, active);
            
            addProductForm.reset();
            addProductModal.style.display = 'none';
            
            loadProducts();
        });
    }

    if (addPhotoForm) {
        addPhotoForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const url = document.getElementById('photoUrl').value;
            const caption = document.getElementById('photoCaption').value;
            
            addPhoto(url, caption);
            
            addPhotoForm.reset();
            addPhotoModal.style.display = 'none';
            
            loadPhotos();
        });
    }

    if (adminLogout) {
        adminLogout.addEventListener('click', function() {
            if (confirm('Вы уверены, что хотите выйти?')) {
                window.location.href = '../frontend/profile.html';
            }
        });
    }

    function addProduct(name, description, price, image, active) {
        console.log('Добавление товара:', { name, description, price, image, active });
        
        const products = JSON.parse(localStorage.getItem('adminProducts') || '[]');
        products.push({
            id: Date.now(),
            name,
            description,
            price,
            image,
            active,
            createdAt: new Date().toISOString()
        });
        localStorage.setItem('adminProducts', JSON.stringify(products));
        
        alert('Товар успешно добавлен!');
    }

    function addPhoto(url, caption) {
        console.log('Добавление фото:', { url, caption });
        
        const photos = JSON.parse(localStorage.getItem('adminPhotos') || '[]');
        photos.push({
            id: Date.now(),
            url,
            caption,
            createdAt: new Date().toISOString()
        });
        localStorage.setItem('adminPhotos', JSON.stringify(photos));
        
        alert('Фото успешно добавлено!');
    }

    function loadProducts() {
        const productsGrid = document.getElementById('productsGrid');
        if (!productsGrid) return;
        
        productsGrid.innerHTML = '<div class="skeleton-product"></div><div class="skeleton-product"></div><div class="skeleton-product"></div>';
        
        setTimeout(() => {
            const products = JSON.parse(localStorage.getItem('adminProducts') || '[]');
            productsGrid.innerHTML = '';
            
            if (products.length === 0) {
                productsGrid.innerHTML = '<p class="empty-state">Нет товаров в каталоге. Добавьте первый товар!</p>';
                return;
            }
            
            products.forEach(product => {
                const card = document.createElement('div');
                card.className = 'product-card-admin';
                card.innerHTML = `
                    <div class="product-img">
                        <img src="${product.image}" alt="${product.name}" onerror="this.src='images/placeholder.jpg'">
                    </div>
                    <h3>${product.name}</h3>
                    <div class="product-price">${product.price}</div>
                    <div class="product-desc">${product.description.substring(0, 60)}${product.description.length > 60 ? '...' : ''}</div>
                    <div class="product-status ${product.active ? 'active' : 'inactive'}">
                        ${product.active ? 'Активен' : 'Неактивен'}
                    </div>
                    <div class="product-actions">
                        <button class="neon-button">${product.active ? 'Скрыть' : 'Показать'}</button>
                        <button class="neon-button">Удалить</button>
                    </div>
                `;
                productsGrid.appendChild(card);
            });
        }, 800);
    }

    function loadPhotos() {
        const photosGrid = document.getElementById('photosGrid');
        if (!photosGrid) return;
        
        photosGrid.innerHTML = '<div class="skeleton-photo"></div><div class="skeleton-photo"></div><div class="skeleton-photo"></div><div class="skeleton-photo"></div>';
        
        setTimeout(() => {
            const photos = JSON.parse(localStorage.getItem('adminPhotos') || '[]');
            photosGrid.innerHTML = '';
            
            if (photos.length === 0) {
                photosGrid.innerHTML = '<p class="empty-state">Нет фото в галерее. Добавьте первое фото!</p>';
                return;
            }
            
            photos.forEach(photo => {
                const card = document.createElement('div');
                card.className = 'photo-card-admin';
                card.innerHTML = `
                    <img src="${photo.url}" alt="${photo.caption}" onerror="this.src='images/placeholder.jpg'">
                    <div class="photo-caption">${photo.caption.substring(0, 30)}${photo.caption.length > 30 ? '...' : ''}</div>
                    <div class="photo-actions">
                        <button title="Редактировать">✏️</button>
                        <button title="Удалить">🗑️</button>
                    </div>
                `;
                photosGrid.appendChild(card);
            });
        }, 800);
    }

    function loadDashboardStats() {
        const productsCount = document.getElementById('productsCount');
        const photosCount = document.getElementById('photosCount');
        const reviewsCount = document.getElementById('reviewsCount');
        const supportCount = document.getElementById('supportCount');
        
        if (productsCount) {
            const products = JSON.parse(localStorage.getItem('adminProducts') || '[]');
            productsCount.textContent = products.length;
        }
        
        if (photosCount) {
            const photos = JSON.parse(localStorage.getItem('adminPhotos') || '[]');
            photosCount.textContent = photos.length;
        }
        
        if (reviewsCount) {
            reviewsCount.textContent = '335';
        }
        
        if (supportCount) {
            supportCount.textContent = '12';
        }
    }

    loadDashboardStats();
    loadProducts();
    loadPhotos();

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

    window.addEventListener('click', function(event) {
        if (event.target === addProductModal) {
            addProductModal.style.display = 'none';
        }
        if (event.target === addPhotoModal) {
            addPhotoModal.style.display = 'none';
        }
    });

    const sendAdminMessage = document.getElementById('sendAdminMessage');
    const adminChatInput = document.getElementById('adminChatInput');
    
    if (sendAdminMessage && adminChatInput) {
        sendAdminMessage.addEventListener('click', function() {
            const message = adminChatInput.value.trim();
            if (message) {
                const chatMessages = document.getElementById('chatMessagesAdmin');
                if (chatMessages) {
                    const msgDiv = document.createElement('div');
                    msgDiv.className = 'chat-message-admin support';
                    msgDiv.innerHTML = `
                        <div class="message-content">${message}</div>
                        <div class="message-time">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                    `;
                    chatMessages.appendChild(msgDiv);
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                    adminChatInput.value = '';
                }
            }
        });
        
        adminChatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendAdminMessage.click();
            }
        });
    }

    console.log('Админ-панель СЦТО загружена');
});