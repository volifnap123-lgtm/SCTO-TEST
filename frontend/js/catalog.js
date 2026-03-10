document.addEventListener('DOMContentLoaded', function() {
    const catalogGrid = document.getElementById('catalog-grid');

    function loadCatalog() {
        catalogGrid.innerHTML = '<div class="neon-loader"></div>';

        setTimeout(() => {
            const mockData = [
                {
                    id: 1,
                    image: 'images/placeholder.jpg',
                    name: 'Правка литого диска',
                    description: 'Восстановление геометрии литого диска после деформации. Используем современное оборудование для точной правки без повреждения структуры диска.',
                    price: 'от 1 500 ₽'
                },
                {
                    id: 2,
                    image: 'images/placeholder.jpg',
                    name: 'Правка штампованного диска',
                    description: 'Выравнивание штампованного диска после ударов и деформаций. Гарантируем прочность и надёжность после ремонта.',
                    price: 'от 800 ₽'
                },
                {
                    id: 3,
                    image: 'images/placeholder.jpg',
                    name: 'Ремонт трещин на диске',
                    description: 'Сварка и восстановление трещин на литых дисках. Полное восстановление целостности и безопасности диска.',
                    price: 'от 2 000 ₽'
                },
                {
                    id: 4,
                    image: 'images/placeholder.jpg',
                    name: 'Покраска дисков',
                    description: 'Профессиональная покраска дисков в любой цвет. Используем качественные материалы для долговечного результата.',
                    price: 'от 2 500 ₽'
                },
                {
                    id: 5,
                    image: 'images/placeholder.jpg',
                    name: 'Полировка дисков',
                    description: 'Полировка литых дисков до зеркального блеска. Удаление царапин и восстановление внешнего вида.',
                    price: 'от 1 800 ₽'
                },
                {
                    id: 6,
                    image: 'images/placeholder.jpg',
                    name: 'Диагностика дисков',
                    description: 'Комплексная диагностика состояния дисков. Выявление скрытых дефектов и оценка возможности ремонта.',
                    price: '500 ₽'
                }
            ];

            catalogGrid.innerHTML = '';

            mockData.forEach(item => {
                const card = document.createElement('div');
                card.className = 'catalog-card neon-card';
                card.innerHTML = `
                    <div class="card-image">
                        <img src="${item.image}" alt="${item.name}">
                    </div>
                    <div class="card-content">
                        <h3>${item.name}</h3>
                        <div class="card-price">${item.price}</div>
                        <button class="card-btn neon-button show-description" data-id="${item.id}">Описание</button>
                        <div class="card-description-overlay">
                            <p>${item.description}</p>
                        </div>
                    </div>
                `;
                catalogGrid.appendChild(card);
            });

            setupDescriptionToggles();
        }, 800);
    }

    function setupDescriptionToggles() {
        const buttons = document.querySelectorAll('.show-description');
        buttons.forEach(btn => {
            btn.addEventListener('click', function() {
                const card = this.closest('.catalog-card');
                const overlay = card.querySelector('.card-description-overlay');
                overlay.classList.toggle('active');
            });
        });
    }

    loadCatalog();
});