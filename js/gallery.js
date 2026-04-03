document.addEventListener('DOMContentLoaded', function() {
    const galleryContainer = document.getElementById('gallery-container');
    const supabase = window.supabaseClient;
    let currentIndex = 0;
    let galleryItems = [];

    function showEmptyState() {
        galleryContainer.innerHTML = `
            <div class="gallery-empty">
                <div class="empty-icon">📷</div>
                <h3>Фотографии скоро появятся</h3>
                <p>В скором времени мы добавим фотографии наших работ</p>
            </div>
        `;
    }

    function renderGallery(index) {
        if (!galleryItems || galleryItems.length === 0) {
            showEmptyState();
            return;
        }

        if (index < 0) index = galleryItems.length - 1;
        if (index >= galleryItems.length) index = 0;
        
        currentIndex = index;
        const item = galleryItems[currentIndex];
        
        if (!item || !item.url) {
            showEmptyState();
            return;
        }

        const mainItem = galleryItems[currentIndex];
        const otherItems = galleryItems.filter((_, i) => i !== currentIndex);

        galleryContainer.innerHTML = `
            <button class="gallery-nav prev" onclick="prevPhoto()">‹</button>
            <div class="gallery-main">
                <img src="${mainItem.url}" alt="Работа СЦТО" class="gallery-main-img" id="main-img" onerror="this.src='images/placeholder.jpg'">
                <div class="gallery-caption" id="caption">${mainItem.caption || 'Фотография работы'}</div>
            </div>
            <button class="gallery-nav next" onclick="nextPhoto()">›</button>
            <div class="gallery-thumbs" id="gallery-thumbs">
                ${galleryItems.map((photo, i) => `
                    <img src="${photo.url}" alt="Миниатюра ${i + 1}" class="thumb ${i === currentIndex ? 'active' : ''}" data-index="${i}" onerror="this.src='images/placeholder.jpg'" onclick="goToPhoto(${i})">
                `).join('')}
            </div>
        `;
    }

    window.nextPhoto = function() {
        if (galleryItems.length === 0) return;
        currentIndex = (currentIndex + 1) % galleryItems.length;
        renderGallery(currentIndex);
        setTimeout(scrollActiveThumb, 50);
    };

    window.prevPhoto = function() {
        if (galleryItems.length === 0) return;
        currentIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
        renderGallery(currentIndex);
        setTimeout(scrollActiveThumb, 50);
    };

    window.goToPhoto = function(index) {
        renderGallery(index);
        setTimeout(scrollActiveThumb, 50);
    };

    function scrollActiveThumb() {
        const thumbsContainer = document.getElementById('gallery-thumbs');
        const activeThumb = thumbsContainer?.querySelector('.thumb.active');
        if (activeThumb && thumbsContainer) {
            const containerRect = thumbsContainer.getBoundingClientRect();
            const thumbRect = activeThumb.getBoundingClientRect();
            const scrollLeft = thumbsContainer.scrollLeft;
            const thumbCenter = thumbRect.left + thumbRect.width / 2 - containerRect.left;
            const containerCenter = containerRect.width / 2;
            thumbsContainer.scrollTo({
                left: scrollLeft + thumbCenter - containerCenter,
                behavior: 'smooth'
            });
        }
    }

    async function loadGallery() {
        galleryContainer.innerHTML = '<div class="gallery-loading"><div class="neon-loader"></div><p>Загрузка фотографий...</p></div>';

        try {
            const { data: photos, error } = await supabase
                .from('gallery')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Ошибка загрузки галереи:', error);
                showEmptyState();
                return;
            }

            if (!photos || photos.length === 0) {
                showEmptyState();
                return;
            }

            galleryItems = photos;
            renderGallery(0);
        } catch (error) {
            console.error('Ошибка:', error);
            showEmptyState();
        }
    }

    document.addEventListener('keydown', function(e) {
        if (galleryItems.length === 0) return;
        if (e.key === 'ArrowLeft') {
            prevPhoto();
        } else if (e.key === 'ArrowRight') {
            nextPhoto();
        }
    });

    loadGallery();
});
