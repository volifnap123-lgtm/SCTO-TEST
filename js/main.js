document.addEventListener('DOMContentLoaded', function() {
    // Инициализация клиента уже выполнена в supabase.js
    
    const navBtns = document.querySelectorAll('.nav-btn');
    const profileBtn = document.getElementById('profileBtn');
    const profileModal = document.getElementById('profileModal');
    const closeProfileModal = document.getElementById('closeProfileModal');
    const profileContent = document.getElementById('profileContent');

    navBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const page = this.getAttribute('data-page');
            if (page === 'index') {
                window.location.href = 'index.html';
            } else if (page === 'catalog') {
                window.location.href = 'catalog.html';
            } else if (page === 'gallery') {
                window.location.href = 'gallery.html';
            } else if (page === 'reviews') {
                window.location.href = 'reviews.html';
            }
        });
    });

    if (profileBtn) {
        profileBtn.addEventListener('click', function() {
            profileModal.style.display = 'block';
            loadProfileContent();
        });
    }

    if (closeProfileModal) {
        closeProfileModal.addEventListener('click', function() {
            profileModal.style.display = 'none';
        });
    }

    window.addEventListener('click', function(event) {
        if (event.target === profileModal) {
            profileModal.style.display = 'none';
        }
    });

    function loadProfileContent() {
        profileContent.innerHTML = '<div class="loading">Загрузка...</div>';
        
        fetch('profile.html')
            .then(response => response.text())
            .then(html => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const profileContainer = doc.getElementById('profile-container');
                
                if (profileContainer) {
                    profileContent.innerHTML = profileContainer.innerHTML;
                    
                    const script = document.createElement('script');
                    script.src = 'js/auth.js';
                    document.body.appendChild(script);
                }
            })
            .catch(error => {
                console.error('Ошибка загрузки профиля:', error);
                profileContent.innerHTML = '<p>Ошибка загрузки профиля. Пожалуйста, откройте страницу профиля напрямую.</p>';
            });
    }

    const currentPage = window.location.pathname.split('/').pop();
    if (currentPage === 'index.html' || currentPage === '') {
        document.querySelector('.nav-btn[data-page="index"]').classList.add('active');
    } else if (currentPage === 'catalog.html') {
        document.querySelector('.nav-btn[data-page="catalog"]').classList.add('active');
    } else if (currentPage === 'gallery.html') {
        document.querySelector('.nav-btn[data-page="gallery"]').classList.add('active');
    } else if (currentPage === 'reviews.html') {
        document.querySelector('.nav-btn[data-page="reviews"]').classList.add('active');
    } else if (currentPage === 'profile.html') {
        document.querySelector('.profile-btn').classList.add('active');
    }

    console.log('СЦТО "Правка Дисков" - Сайт загружен');
});