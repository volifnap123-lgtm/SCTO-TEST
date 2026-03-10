document.addEventListener('DOMContentLoaded', function() {
    const productsGrid = document.getElementById('productsGrid');
    const addProductBtn = document.getElementById('addProductBtn');
    const addProductModal = document.getElementById('addProductModal');
    const closeProductModal = document.getElementById('closeProductModal');
    const addProductForm = document.getElementById('addProductForm');

    function loadProducts() {
        if (!productsGrid) return;
        
        productsGrid.innerHTML = '<div class="skeleton-product"></div><div class="skeleton-product"></div><div class="skeleton-product"></div>';
        
        setTimeout(() => {
            const products = JSON.parse(localStorage.getItem('adminProducts') || '[]');
            productsGrid.innerHTML = '';
            
            if (products.length === 0) {
                productsGrid.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">📦</div>
                        <h3>Каталог пуст</h3>
                        <p>Добавьте первый товар, чтобы он появился на сайте</p>
                    </div>
                `;
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
                    <div class="product-desc">${product.description}</div>
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
        }, 800);
    }

    function setupProductActions() {
        const toggleButtons = document.querySelectorAll('.toggle-status');
        const deleteButtons = document.querySelectorAll('.delete-product');
        
        toggleButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                toggleProductStatus(id);
            });
        });
        
        deleteButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                if (confirm('Вы уверены, что хотите удалить этот товар?')) {
                    deleteProduct(id);
                }
            });
        });
    }

    function toggleProductStatus(id) {
        const products = JSON.parse(localStorage.getItem('adminProducts') || '[]');
        const product = products.find(p => p.id === id);
        
        if (product) {
            product.active = !product.active;
            localStorage.setItem('adminProducts', JSON.stringify(products));
            loadProducts();
            alert(`Товар "${product.name}" ${product.active ? 'активирован' : 'деактивирован'}`);
        }
    }

    function deleteProduct(id) {
        let products = JSON.parse(localStorage.getItem('adminProducts') || '[]');
        const product = products.find(p => p.id === id);
        
        if (product) {
            products = products.filter(p => p.id !== id);
            localStorage.setItem('adminProducts', JSON.stringify(products));
            loadProducts();
            alert(`Товар "${product.name}" удален`);
        }
    }

    if (addProductBtn) {
        addProductBtn.addEventListener('click', () => {
            addProductModal.style.display = 'block';
        });
    }

    if (closeProductModal) {
        closeProductModal.addEventListener('click', () => {
            addProductModal.style.display = 'none';
        });
    }

    if (addProductForm) {
        addProductForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('productName').value;
            const description = document.getElementById('productDescription').value;
            const price = document.getElementById('productPrice').value;
            const image = document.getElementById('productImage').value || 'images/placeholder.jpg';
            const active = document.getElementById('productActive').checked;
            
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
            addProductForm.reset();
            addProductModal.style.display = 'none';
            loadProducts();
        });
    }

    loadProducts();
});