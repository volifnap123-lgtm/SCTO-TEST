function initAuth() {
    const authTabs = document.querySelectorAll('.auth-tab');
    const tabContents = document.querySelectorAll('.tab-content');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const authForm = document.getElementById('auth-form');
    const userDashboard = document.getElementById('user-dashboard');
    const userName = document.getElementById('user-name');
    const userEmail = document.getElementById('user-email');
    const userPhone = document.getElementById('user-phone');
    const userAvatarIcon = document.getElementById('user-avatar-icon');
    const logoutBtn = document.getElementById('logout-btn');

    let supabase = window.supabaseClient;
    
    if (!supabase && typeof window.supabase !== 'undefined') {
        supabase = window.supabase.createClient(
            'https://noskliwvsiejokzmczfp.supabase.co',
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vc2tsaXd2c2llam9rem1jemZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMzU5MTgsImV4cCI6MjA4ODgxMTkxOH0.2NplRLLx1Annta9DL8Wus-OoObQwUbYR4X_vHouDEbE'
        );
        window.supabaseClient = supabase;
    }

    authTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            authTabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            this.classList.add('active');
            const targetContent = document.getElementById(targetTab + '-tab');
            if (targetContent) targetContent.classList.add('active');
        });
    });

    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            
            await simulateLogin(email, password);
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const name = document.getElementById('reg-name').value;
            const phone = document.getElementById('reg-phone').value;
            const email = document.getElementById('reg-email').value;
            const password = document.getElementById('reg-password').value;
            const passwordConfirm = document.getElementById('reg-password-confirm').value;
            const agreeTerms = document.getElementById('agree-terms');
            
            if (!name || !phone || !email || !password) {
                alert('⚠️ Заполните все поля!');
                return;
            }
            
            if (password !== passwordConfirm) {
                alert('⚠️ Пароли не совпадают!');
                return;
            }
            
            if (password.length < 6) {
                alert('⚠️ Пароль минимум 6 символов!');
                return;
            }
            
            if (!agreeTerms || !agreeTerms.checked) {
                alert('⚠️ Примите условия использования!');
                return;
            }
            
            await simulateRegister(name, phone, email, password);
        });
    }

    const regPassword = document.getElementById('reg-password');
    if (regPassword) {
        regPassword.addEventListener('input', function() {
            const password = this.value;
            const strengthBar = document.querySelector('.strength-bar');
            const strengthText = document.querySelector('.strength-text');
            
            if (password.length === 0) {
                if (strengthBar) strengthBar.style.width = '0';
                if (strengthText) strengthText.textContent = '';
            } else if (password.length < 6) {
                if (strengthBar) { strengthBar.style.width = '33%'; strengthBar.style.background = '#ff4444'; }
                if (strengthText) { strengthText.textContent = 'Слабый'; strengthText.style.color = '#ff4444'; }
            } else if (password.length < 10) {
                if (strengthBar) { strengthBar.style.width = '66%'; strengthBar.style.background = '#ffaa00'; }
                if (strengthText) { strengthText.textContent = 'Средний'; strengthText.style.color = '#ffaa00'; }
            } else {
                if (strengthBar) { strengthBar.style.width = '100%'; strengthBar.style.background = '#00cc00'; }
                if (strengthText) { strengthText.textContent = 'Надёжный'; strengthText.style.color = '#00cc00'; }
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', simulateLogout);
    }

    async function simulateLogin(email, password) {
        if (!email || !password) {
            alert('⚠️ Заполните все поля');
            return;
        }
        
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        
        if (error) {
            alert('❌ Введён неправильный логин или пароль');
            return;
        }
        
        if (data.user) {
            const userData = {
                name: data.user.user_metadata?.full_name || data.user.email,
                email: data.user.email,
                phone: data.user.user_metadata?.phone || '',
                avatar: '👤'
            };
            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('sb_user_id', data.user.id);
            showUserDashboard();
        }
    }

    async function simulateRegister(name, phone, email, password) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: name, phone } }
        });
        
        if (error) {
            alert('❌ Ошибка регистрации: ' + error.message);
            return;
        }
        
        if (data.user) {
            localStorage.removeItem('user');
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('sb_user_id');
            
            if (authForm) authForm.style.display = 'none';
            if (userDashboard) userDashboard.style.display = 'none';
            
            alert('✅ Вы зарегистрировались!\n\nПросьба занового зайти в профиль и войти в аккаунт.\n\nСпасибо что вы с нами! 🎉');
            
            window.location.reload();
        }
    }

    async function simulateLogout() {
        if (supabase) await supabase.auth.signOut();
        localStorage.removeItem('user');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('sb_user_id');
        if (authForm) authForm.style.display = 'block';
        if (userDashboard) userDashboard.style.display = 'none';
    }

    function showUserDashboard() {
        const savedUser = localStorage.getItem('user');
        if (savedUser && userName) {
            const user = JSON.parse(savedUser);
            userName.textContent = `Добро пожаловать, ${user.name}!`;
            if (userEmail) userEmail.textContent = user.email;
            if (userPhone) userPhone.textContent = user.phone;
            if (user.avatar && userAvatarIcon) userAvatarIcon.textContent = user.avatar;
            if (authForm) authForm.style.display = 'none';
            if (userDashboard) userDashboard.style.display = 'block';
        }
    }

    const savedUser = localStorage.getItem('user');
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (savedUser && isLoggedIn === 'true') {
        showUserDashboard();
    }
}

function togglePassword(inputId, button) {
    const input = document.getElementById(inputId);
    if (input) {
        input.type = input.type === 'password' ? 'text' : 'password';
        if (button) button.innerHTML = '<span class="eye">' + (input.type === 'text' ? '🙈' : '👁️') + '</span>';
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuth);
} else {
    initAuth();
}
