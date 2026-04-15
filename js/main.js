document.addEventListener('DOMContentLoaded', function() {
    const navBtns = document.querySelectorAll('.nav-btn');
    const burgerMenu = document.getElementById('burgerMenu');
    const menuLeft = document.getElementById('menuLeft');
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

    if (burgerMenu && menuLeft) {
        burgerMenu.addEventListener('click', function() {
            burgerMenu.classList.toggle('active');
            menuLeft.classList.toggle('active');
        });

        navBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                burgerMenu.classList.remove('active');
                menuLeft.classList.remove('active');
            });
        });
    }

    navBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const page = this.getAttribute('data-page');
            if (page === 'index') window.location.href = 'index.html';
            else if (page === 'catalog') window.location.href = 'catalog.html';
            else if (page === 'gallery') window.location.href = 'gallery.html';
            else if (page === 'reviews') window.location.href = 'reviews.html';
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

    if (profileModal) {
        profileModal.addEventListener('click', function(event) {
            if (event.target === profileModal) {
                profileModal.style.display = 'none';
            }
        });
    }

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
                profileContent.innerHTML = '<p>Ошибка загрузки профиля.</p>';
            });
    }
    
    function loadAuthScripts() {
        if (typeof window.authReady === 'function') {
            window.authReady();
            return;
        }
        
        const cdnScript = document.createElement('script');
        cdnScript.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.0/dist/umd/supabase.min.js?v=25';
        cdnScript.onload = function() {
            if (!window.supabaseClient && window.supabase?.createClient) {
                window.supabaseClient = window.supabase.createClient(
                    'https://noskliwvsiejokzmczfp.supabase.co',
                    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vc2tsaXd2c2llam9rem1jemZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMzU5MTgsImV4cCI6MjA4ODgxMTkxOH0.2NplRLLx1Annta9DL8Wus-OoObQwUbYR4X_vHouDEbE'
                );
            }
            
            const authScript = document.createElement('script');
            authScript.src = 'js/auth.js?v=25';
            authScript.onload = function() {
                if (typeof window.initAuth === 'function') {
                    window.initAuth();
                    window.authReady = function() {
                        window.initAuth();
                    };
                }
            };
            document.head.appendChild(authScript);
            
            const chatScript = document.createElement('script');
            chatScript.src = 'js/chat.js?v=25';
            document.head.appendChild(chatScript);
        };
        document.head.appendChild(cdnScript);
    }

    const currentPage = window.location.pathname.split('/').pop();
    if (currentPage === 'index.html' || currentPage === '') {
        document.querySelector('.nav-btn[data-page="index"]')?.classList.add('active');
    } else if (currentPage === 'catalog.html') {
        document.querySelector('.nav-btn[data-page="catalog"]')?.classList.add('active');
    } else if (currentPage === 'gallery.html') {
        document.querySelector('.nav-btn[data-page="gallery"]')?.classList.add('active');
    } else if (currentPage === 'reviews.html') {
        document.querySelector('.nav-btn[data-page="reviews"]')?.classList.add('active');
    } else if (currentPage === 'profile.html') {
        document.querySelector('.profile-btn')?.classList.add('active');
    }
    
    loadAuthScripts();
});
