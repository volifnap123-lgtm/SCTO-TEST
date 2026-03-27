document.addEventListener('DOMContentLoaded', function() {
    const mainImg = document.getElementById('main-img');
    const caption = document.getElementById('caption');
    const thumbsContainer = document.getElementById('gallery-thumbs');
    const prevBtn = document.querySelector('.prev');
    const nextBtn = document.querySelector('.next');
    const galleryContainer = document.querySelector('.gallery-container');
    let currentIndex = 0;
    let galleryItems = [];

    const LOCAL_IMAGES = [
        'images/images1.jpg',
        'images/images2.jpg',
        'images/images3.jpg',
        'images/images4.jpg',
        'images/images5.jpg',
        'images/work1.jpg',
        'images/work2.jpg',
        'images/work3.jpg',
        'images/gallery1.jpg',
        'images/gallery2.jpg',
        'images/gallery3.jpg',
        'images/photo1.jpg',
        'images/photo2.jpg',
        'images/photo3.jpg',
        'images/img1.jpg',
        'images/img2.jpg',
        'images/img3.jpg',
        'images/img4.jpg',
        'images/img5.jpg',
        'images/pic1.jpg',
        'images/pic2.jpg',
        'images/pic3.jpg',
        'images/dish1.jpg',
        'images/dish2.jpg',
        'images/disk1.jpg',
        'images/disk2.jpg',
        'images/disk3.jpg'
    ];

    async function checkImageExists(src) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = src;
        });
    }

    async function loadLocalImages() {
        const existingImages = [];
        for (const imgSrc of LOCAL_IMAGES) {
            if (await checkImageExists(imgSrc)) {
                existingImages.push({
                    url: imgSrc,
                    caption: 'Наша работа'
                });
            }
        }
        return existingImages;
    }

    async function loadGallery() {
        thumbsContainer.innerHTML = '<div class="gallery-loading"><div class="neon-loader"></div><p>Загрузка фотографий...</p></div>';

        // Try to load from Supabase first
        try {
            const { data: photos, error } = await window.supabaseClient
                .from('gallery')
                .select('*')
                .order('created_at', { ascending: false });

            if (!error && photos && photos.length > 0) {
                galleryItems = photos;
                renderGallery(0);
                return;
            }
        } catch (error) {
            console.log('Ошибка загрузки из БД:', error);
        }

        // Fallback to local images
        const localImages = await loadLocalImages();
        
        if (localImages.length > 0) {
            galleryItems = localImages;
            renderGallery(0);
        } else {
            showEmptyState();
        }
    }

    function showEmptyState() {
        if (galleryContainer) {
            galleryContainer.innerHTML = `
                <div class="gallery-empty">
                    <div class="empty-icon">📷</div>
                    <h3>Фотографии скоро появятся</h3>
                    <p>В скором времени разработчики добавят фотографии наших работ</p>
                </div>
            `;
        }
        thumbsContainer.style.display = 'none';
        if (prevBtn) prevBtn.style.display = 'none';
        if (nextBtn) nextBtn.style.display = 'none';
    }

    function renderGallery(index) {
        if (index < 0 || index >= galleryItems.length) return;
        
        currentIndex = index;
        const item = galleryItems[currentIndex];
        
        if (!item || !item.url) return;
        
        mainImg.src = item.url;
        mainImg.onerror = function() {
            this.src = 'images/placeholder.jpg';
        };
        caption.textContent = item.caption || 'Фотография работы';
        
        thumbsContainer.innerHTML = galleryItems.map((photo, i) => `
            <img 
                src="${photo.url}" 
                alt="Миниатюра ${i + 1}" 
                class="thumb ${i === currentIndex ? 'active' : ''}" 
                data-index="${i}"
                onerror="this.src='images/placeholder.jpg'"
            >
        `).join('');
        
        document.querySelectorAll('.thumb').forEach(thumb => {
            thumb.addEventListener('click', function() {
                const idx = parseInt(this.getAttribute('data-index'));
                renderGallery(idx);
            });
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            if (galleryItems.length === 0) return;
            const newIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
            renderGallery(newIndex);
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            if (galleryItems.length === 0) return;
            const newIndex = (currentIndex + 1) % galleryItems.length;
            renderGallery(newIndex);
        });
    }

    document.addEventListener('keydown', function(e) {
        if (galleryItems.length === 0) return;
        if (e.key === 'ArrowLeft') {
            const newIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
            renderGallery(newIndex);
        } else if (e.key === 'ArrowRight') {
            const newIndex = (currentIndex + 1) % galleryItems.length;
            renderGallery(newIndex);
        }
    });

    loadGallery();
});
