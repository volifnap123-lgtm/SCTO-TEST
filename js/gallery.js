document.addEventListener('DOMContentLoaded', function() {
    const mainImg = document.getElementById('main-img');
    const caption = document.getElementById('caption');
    const thumbsContainer = document.getElementById('gallery-thumbs');
    const prevBtn = document.querySelector('.prev');
    const nextBtn = document.querySelector('.next');
    let currentIndex = 0;
    let galleryItems = [];
    const supabase = window.supabaseClient;

    async function loadGallery() {
        thumbsContainer.innerHTML = '<div style="text-align:center; padding:20px; width:100%;">Загрузка фотографий...</div>';

        try {
            const { data: photos, error } = await supabase
                .from('gallery')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (photos.length === 0) {
                thumbsContainer.innerHTML = '<div style="text-align:center; padding:20px; width:100%;">Галерея пока пуста</div>';
                return;
            }

            galleryItems = photos;
            renderGallery(0);
        } catch (error) {
            console.error('Ошибка загрузки галереи:', error);
            thumbsContainer.innerHTML = '<div style="text-align:center; padding:20px; width:100%; color:#e65100;">Ошибка загрузки галереи</div>';
        }
    }

    function renderGallery(index) {
        if (index < 0 || index >= galleryItems.length) return;
        
        currentIndex = index;
        const item = galleryItems[currentIndex];
        
        mainImg.src = item.url || 'images/placeholder.jpg';
        caption.textContent = item.caption || 'Фотография работы';
        
        // Обновляем миниатюры
        thumbsContainer.innerHTML = galleryItems.map((photo, i) => `
            <img 
                src="${photo.url || 'images/placeholder.jpg'}" 
                alt="Миниатюра ${i + 1}" 
                class="thumb ${i === currentIndex ? 'active' : ''}" 
                data-index="${i}"
                onerror="this.src='images/placeholder.jpg'"
            >
        `).join('');
        
        // Навешиваем обработчики на миниатюры
        document.querySelectorAll('.thumb').forEach(thumb => {
            thumb.addEventListener('click', function() {
                const idx = parseInt(this.getAttribute('data-index'));
                renderGallery(idx);
            });
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            const newIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
            renderGallery(newIndex);
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            const newIndex = (currentIndex + 1) % galleryItems.length;
            renderGallery(newIndex);
        });
    }

    // Добавляем полупрозрачность стрелкам
    const navButtons = document.querySelectorAll('.gallery-nav');
    navButtons.forEach(btn => {
        btn.style.opacity = '0.7';
        btn.addEventListener('mouseenter', () => {
            btn.style.opacity = '1';
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.opacity = '0.7';
        });
    });

    loadGallery();
});