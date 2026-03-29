document.addEventListener('DOMContentLoaded', function() {
    const catalogGrid = document.getElementById('catalog-grid');
    const supabase = window.supabaseClient;

    async function loadCatalog() {
        catalogGrid.innerHTML = '<div class="skeleton-card"></div><div class="skeleton-card"></div><div class="skeleton-card"></div>';

        try {
            const { data: products, error } = await supabase
                .from('products')
                .select('*')
                .eq('active', true)
                .order('created_at', { ascending: false });

            if (error) {
                console.log('Ошибка БД, показываем fallback услуги');
                renderFallbackCatalog();
                return;
            }

            catalogGrid.innerHTML = '';

            if (!products || products.length === 0) {
                renderFallbackCatalog();
                return;
            }

            products.forEach(product => {
                const card = document.createElement('div');
                card.className = 'catalog-card neon-card';
                card.innerHTML = `
                    <div class="card-image">
                        <img src="${product.image_url || 'images/placeholder.jpg'}" alt="${product.name}" onerror="this.src='images/placeholder.jpg'">
                    </div>
                    <div class="card-content">
                        <h3>${product.name}</h3>
                        <div class="card-price">${product.price}</div>
                        <button class="card-btn show-description" data-id="${product.id}">Описание</button>
                    </div>
                    <div class="card-description-overlay" data-id="${product.id}">
                        <p>${product.description}</p>
                    </div>
                `;
                catalogGrid.appendChild(card);
            });

            setupDescriptionToggles();
        } catch (error) {
            console.error('Ошибка загрузки каталога:', error);
            catalogGrid.innerHTML = `
                <div class="error-state" style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #e65100;">
                    <div style="font-size: 48px; margin-bottom: 20px;">⚠️</div>
                    <h3>Ошибка загрузки каталога</h3>
                    <p>Попробуйте обновить страницу позже</p>
                </div>
            `;
        }
    }

    function setupDescriptionToggles() {
        document.querySelectorAll('.show-description').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const cardId = this.getAttribute('data-id');
                const overlay = document.querySelector(`.card-description-overlay[data-id="${cardId}"]`);
                overlay.classList.toggle('active');
            });
        });

        document.addEventListener('click', function(e) {
            if (!e.target.closest('.show-description') && !e.target.closest('.card-description-overlay')) {
                document.querySelectorAll('.card-description-overlay').forEach(overlay => {
                    overlay.classList.remove('active');
                });
            }
        });
    }

    function renderFallbackCatalog() {
        const fallbackProducts = [
            {
                id: 1,
                name: 'Правка литых дисков',
                price: 'от 1500 ₽',
                description: 'Профессиональная правка литых дисков на современном оборудовании. Восстанавливаем геометрию диска до заводских параметров.',
                image_url: 'images/placeholder.jpg'
            },
            {
                id: 2,
                name: 'Правка стальных дисков',
                price: 'от 800 ₽',
                description: 'Рихтовка стальных дисков любой сложности. Работаем с дисками от 13 до 17 дюймов.',
                image_url: 'images/placeholder.jpg'
            },
            {
                id: 3,
                name: 'Балансировка',
                price: 'от 400 ₽',
                description: 'Высокоточная балансировка колёс на профессиональном стенде. Точность до 1 грамма.',
                image_url: 'images/placeholder.jpg'
            },
            {
                id: 4,
                name: 'Аргоновая сварка дисков',
                price: 'от 2500 ₽',
                description: 'Сварка алюминиевых и магниевых дисков аргоном. Устраняем трещины и сколы.',
                image_url: 'images/placeholder.jpg'
            },
            {
                id: 5,
                name: 'Покраска дисков',
                price: 'от 3000 ₽',
                description: 'Порошковая покраска дисков в любой цвет. Гарантия качества и долговечности покрытия.',
                image_url: 'images/placeholder.jpg'
            },
            {
                id: 6,
                name: 'Устранение биения',
                price: 'от 1000 ₽',
                description: 'Диагностика и устранение биения дисков. Возвращаем комфорт и безопасность вождения.',
                image_url: 'images/placeholder.jpg'
            }
        ];

        catalogGrid.innerHTML = '';
        
        fallbackProducts.forEach(product => {
            const card = document.createElement('div');
            card.className = 'catalog-card neon-card';
            card.innerHTML = `
                <div class="card-image">
                    <img src="${product.image_url}" alt="${product.name}" onerror="this.src='images/placeholder.jpg'">
                </div>
                <div class="card-content">
                    <h3>${product.name}</h3>
                    <div class="card-price">${product.price}</div>
                    <button class="card-btn show-description" data-id="${product.id}">Описание</button>
                </div>
                <div class="card-description-overlay" data-id="${product.id}">
                    <p>${product.description}</p>
                </div>
            `;
            catalogGrid.appendChild(card);
        });

        setupDescriptionToggles();
    }

    loadCatalog();
});