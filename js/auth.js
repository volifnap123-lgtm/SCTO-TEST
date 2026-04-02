const SUPABASE_URL = 'https://noskliwvsiejokzmczfp.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vc2tsaXd2c2llam9rem1jemZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMzU5MTgsImV4cCI6MjA4ODgxMTkxOH0.2NplRLLx1Annta9DL8Wus-OoObQwUbYR4X_vHouDEbE';

let supabase = null;

function initSupabase() {
    if (supabase) return true;
    
    if (typeof window.supabase !== 'undefined' && typeof window.supabase.createClient === 'function') {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        console.log('✅ Supabase инициализирован');
        return true;
    }
    return false;
}

function initAuth() {
    console.log('🔐 initAuth вызван');
    
    if (!initSupabase()) {
        console.error('❌ Supabase не загружен! Пробую повторить...');
        setTimeout(initAuth, 500);
        return;
    }
    
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

    console.log('supabase:', supabase);
    console.log('loginForm:', loginForm);
    console.log('registerForm:', registerForm);

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
            await doLogin(email, password);
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
            await doRegister(name, phone, email, password);
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', doLogout);
    }

    async function doLogin(email, password) {
        if (!email || !password) {
            alert('⚠️ Заполните все поля');
            return;
        }
        console.log('Попытка входа:', email);
        
        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            
            if (error) {
                console.error('Ошибка входа:', error);
                alert('❌ ' + error.message);
                return;
            }
            
            if (data.user) {
                console.log('✅ Вход успешен:', data.user);
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
                alert('✅ Успешный вход!');
            }
        } catch (err) {
            console.error('Критическая ошибка:', err);
            alert('❌ Ошибка: ' + err.message);
        }
    }

    async function doRegister(name, phone, email, password) {
        console.log('Попытка регистрации:', email);
        
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: { data: { full_name: name, phone } }
            });
            
            if (error) {
                console.error('Ошибка регистрации:', error);
                alert('❌ ' + error.message);
                return;
            }
            
            console.log('✅ Регистрация успешна:', data);
            alert('✅ Регистрация прошла успешно!\nТеперь можете войти в аккаунт.');
            
            if (document.getElementById('loginTabBtn')) {
                document.getElementById('loginTabBtn').click();
            }
            if (document.getElementById('login-email')) {
                document.getElementById('login-email').value = email;
            }
        } catch (err) {
            console.error('Критическая ошибка:', err);
            alert('❌ Ошибка: ' + err.message);
        }
    }

    async function doLogout() {
        await supabase.auth.signOut();
        localStorage.removeItem('user');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('sb_user_id');
        if (authForm) authForm.style.display = 'block';
        if (userDashboard) userDashboard.style.display = 'none';
        alert('👋 Вы вышли из аккаунта');
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
