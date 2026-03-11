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

            if (error) throw error;

            catalogGrid.innerHTML = '';

            if (products.length === 0) {
                catalogGrid.innerHTML = `
                    <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                        <div style="font-size: 48px; margin-bottom: 20px;">📦</div>
                        <h3>Каталог пока пуст</h3>
                        <p>Администратор скоро добавит услуги</p>
                    </div>
                `;
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

    loadCatalog();
});