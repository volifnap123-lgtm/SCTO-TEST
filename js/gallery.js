document.addEventListener('DOMContentLoaded', function() {
    const galleryContainer = document.getElementById('gallery-container');
    const supabase = window.supabaseClient;
    let currentIndex = 0;
    let galleryItems = [];
    const VISIBLE_THUMBS = 5;

    function showEmptyState() {
        galleryContainer.innerHTML = `
            <div class="gallery-empty">
                <div class="empty-icon">📷</div>
                <h3>Фотографии скоро появятся</h3>
                <p>В скором времени мы добавим фотографии наших работ</p>
            </div>
        `;
    }

    function getVisibleRange() {
        const half = Math.floor(VISIBLE_THUMBS / 2);
        let start = currentIndex - half;
        let end = currentIndex + half;
        
        if (start < 0) {
            end += Math.abs(start);
            start = 0;
        }
        if (end >= galleryItems.length) {
            start -= (end - galleryItems.length + 1);
            end = galleryItems.length - 1;
            if (start < 0) start = 0;
        }
        
        return { start, end };
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

        const { start, end } = getVisibleRange();
        let thumbsHtml = '';
        
        for (let i = start; i <= end; i++) {
            const isActive = i === currentIndex;
            const photo = galleryItems[i];
            thumbsHtml += `
                <img src="${photo.url}" alt="Миниатюра ${i + 1}" class="thumb ${isActive ? 'active' : ''}" data-index="${i}" onerror="this.src='images/placeholder.jpg'" onclick="goToPhoto(${i})">
            `;
        }

        galleryContainer.innerHTML = `
            <button class="gallery-nav prev" onclick="prevPhoto()">‹</button>
            <div class="gallery-main">
                <img src="${item.url}" alt="Работа СЦТО" class="gallery-main-img" id="main-img" onerror="this.src='images/placeholder.jpg'">
                <div class="gallery-caption" id="caption">${item.caption || 'Фотография работы'}</div>
            </div>
            <button class="gallery-nav next" onclick="nextPhoto()">›</button>
            <div class="gallery-thumbs" id="gallery-thumbs">
                ${thumbsHtml}
            </div>
        `;
    }

    window.nextPhoto = function() {
        if (galleryItems.length === 0) return;
        currentIndex = (currentIndex + 1) % galleryItems.length;
        renderGallery(currentIndex);
    };

    window.prevPhoto = function() {
        if (galleryItems.length === 0) return;
        currentIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
        renderGallery(currentIndex);
    };

    window.goToPhoto = function(index) {
        renderGallery(index);
    };

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
