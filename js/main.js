document.addEventListener('DOMContentLoaded', function() {
    const navBtns = document.querySelectorAll('.nav-btn');
    const profileBtn = document.getElementById('profileBtn');
    const profileModal = document.getElementById('profileModal');
    const closeProfileModal = document.getElementById('closeProfileModal');
    const profileContent = document.getElementById('profileContent');
    const themeToggle = document.getElementById('themeToggle');

    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }

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
        if (document.getElementById('auth-form')) return;
        
        profileContent.innerHTML = '<div class="loading">Загрузка...</div>';
        
        fetch('profile.html')
            .then(response => response.text())
            .then(html => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const profileContainer = doc.getElementById('profile-container');
                
                if (profileContainer) {
                    profileContent.innerHTML = profileContainer.innerHTML;
                    
                    loadAuthScripts();
                }
            })
            .catch(error => {
                console.error('Ошибка загрузки профиля:', error);
                profileContent.innerHTML = '<p>Ошибка загрузки профиля. Пожалуйста, откройте страницу профиля напрямую.</p>';
            });
    }
    
    function loadAuthScripts() {
        if (document.querySelector('script[src*="auth.js"]')) return;
        
        console.log('Загрузка скриптов авторизации...');
        
        if (typeof window.supabase !== 'undefined') {
            loadAuthJS();
            return;
        }
        
        const cdnScript = document.createElement('script');
        cdnScript.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.0/dist/umd/supabase.min.js?v=7';
        cdnScript.onload = function() {
            loadAuthJS();
        };
        document.head.appendChild(cdnScript);
    }
    
    function loadAuthJS() {
        if (document.querySelector('script[src*="auth.js"]')) return;
        
        const authScript = document.createElement('script');
        authScript.src = 'js/auth.js?v=7';
        authScript.onload = function() {
            if (typeof initAuth === 'function') {
                initAuth();
            }
        };
        document.head.appendChild(authScript);
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
