const SUPABASE_URL = 'https://noskliwvsiejokzmczfp.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vc2tsaXd2c2llam9rem1jemZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMzU5MTgsImV4cCI6MjA4ODgxMTkxOH0.2NplRLLx1Annta9DL8Wus-OoObQwUbYR4X_vHouDEbE';

let supabase = null;
let authInitialized = false;

function showNotification(message, type = 'info', callback = null) {
    const existing = document.querySelector('.auth-notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = `auth-notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️'}</span>
            <span class="notification-text">${message}</span>
        </div>
        <button class="notification-btn">OK</button>
    `;
    
    document.body.appendChild(notification);
    
    notification.querySelector('.notification-btn').addEventListener('click', function() {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
            if (callback) callback();
        }, 300);
    });
    
    setTimeout(() => notification.classList.add('show'), 10);
}

function formatPhone(phone) {
    if (!phone) return '';
    phone = phone.trim();
    if (phone && !phone.startsWith('+')) {
        phone = '+' + phone;
    }
    return phone;
}

function initSupabase() {
    if (supabase) return true;
    
    if (typeof window.supabase !== 'undefined' && typeof window.supabase.createClient === 'function') {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        return true;
    }
    return false;
}

function initAuth() {
    if (authInitialized) return;
    authInitialized = true;
    
    if (!initSupabase()) {
        authInitialized = false;
        return;
    }
    
    document.addEventListener('click', function(e) {
        const target = e.target;
        
        if (target.closest('.auth-tab')) {
            const tab = target.closest('.auth-tab');
            const targetTab = tab.getAttribute('data-tab');
            document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            const targetContent = document.getElementById(targetTab + '-tab');
            if (targetContent) targetContent.classList.add('active');
        }
        
        if (target.closest('#open-chat-btn')) {
            const chatModal = document.getElementById('chatModal');
            if (chatModal) chatModal.style.display = 'block';
        }
        
        if (target.closest('#open-review-btn')) {
            window.open('https://2gis.ru/ulanude/firm/5207815350139447/reviews', '_blank');
        }
        
        if (target.closest('#edit-profile-btn')) {
            openEditProfileModal();
        }
        
        if (target.closest('#delete-profile-btn')) {
            deleteProfile();
        }
        
        if (target.closest('#logout-btn')) {
            doLogout();
        }
        
        if (target.closest('#forgot-password-link')) {
            e.preventDefault();
            handleForgotPassword();
        }
        
        if (target.closest('#closeEditProfileModal')) {
            document.getElementById('editProfileModal').style.display = 'none';
        }
        
        if (target.closest('#closeChatModal')) {
            document.getElementById('chatModal').style.display = 'none';
        }
    });
    
    document.addEventListener('submit', function(e) {
        if (e.target.id === 'login-form') {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            doLogin(email, password);
        }
        
        if (e.target.id === 'register-form') {
            e.preventDefault();
            const name = document.getElementById('reg-name').value;
            let phone = document.getElementById('reg-phone').value;
            const email = document.getElementById('reg-email').value;
            const password = document.getElementById('reg-password').value;
            const passwordConfirm = document.getElementById('reg-password-confirm').value;
            
            phone = formatPhone(phone);
            
            if (!name || !phone || !email || !password) {
                showNotification('Заполните все поля', 'warning');
                return;
            }
            if (password !== passwordConfirm) {
                showNotification('Пароли не совпадают', 'error');
                return;
            }
            if (password.length < 6) {
                showNotification('Пароль минимум 6 символов', 'warning');
                return;
            }
            doRegister(name, phone, email, password);
        }
        
        if (e.target.id === 'edit-profile-form') {
            e.preventDefault();
            saveProfile();
        }
    });

    const savedUser = localStorage.getItem('user');
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (savedUser && isLoggedIn === 'true') {
        showUserDashboard();
    }
}

async function handleForgotPassword() {
    const email = prompt('Введите ваш email:');
    if (!email) return;
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/profile.html'
    });
    
    if (error) {
        showNotification('Ошибка: ' + error.message, 'error');
    } else {
        showNotification('На указанный email отправлена ссылка для восстановления пароля', 'success');
    }
}

function openEditProfileModal() {
    const savedUser = localStorage.getItem('user');
    const editName = document.getElementById('edit-name');
    const editPhone = document.getElementById('edit-phone');
    const editEmail = document.getElementById('edit-email');
    const editModal = document.getElementById('editProfileModal');
    
    if (savedUser && editName && editPhone && editEmail && editModal) {
        const user = JSON.parse(savedUser);
        editName.value = user.name || '';
        editPhone.value = user.phone || '';
        editEmail.value = user.email || '';
        editModal.style.display = 'block';
    } else {
        showNotification('Форма редактирования недоступна. Обновите страницу.', 'warning');
    }
}

async function saveProfile() {
    const name = document.getElementById('edit-name').value;
    const phone = formatPhone(document.getElementById('edit-phone').value);
    const email = document.getElementById('edit-email').value;
    
    if (!name || !phone || !email) {
        showNotification('Заполните все поля', 'warning');
        return;
    }
    
    const userId = localStorage.getItem('sb_user_id');
    if (!userId) {
        showNotification('Ошибка: пользователь не найден', 'error');
        return;
    }
    
    const { error } = await supabase.auth.updateUser({
        email: email,
        data: { full_name: name, phone: phone }
    });
    
    if (error) {
        showNotification('Ошибка: ' + error.message, 'error');
    } else {
        const userData = {
            name: name,
            email: email,
            phone: phone,
            avatar: '👤'
        };
        localStorage.setItem('user', JSON.stringify(userData));
        showUserDashboard();
        document.getElementById('editProfileModal').style.display = 'none';
        showNotification('Профиль обновлён!', 'success');
    }
}

async function deleteProfile() {
    const confirmed = confirm('Вы уверены?\nЗапрос на удаление аккаунта будет отправлен администратору.');
    if (!confirmed) return;
    
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
        const user = JSON.parse(savedUser);
        
        const { error } = await supabase
            .from('support_messages')
            .insert({
                user_id: localStorage.getItem('sb_user_id'),
                user_email: user.email,
                user_name: user.name,
                message: 'ЗАПРОС НА УДАЛЕНИЕ АККАУНТА',
                created_at: new Date().toISOString()
            });
        
        if (error) {
            showNotification('Ошибка отправки запроса', 'error');
            return;
        }
    }
    
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('sb_user_id');
    
    const authForm = document.getElementById('auth-form');
    const userDashboard = document.getElementById('user-dashboard');
    if (authForm) authForm.style.display = 'block';
    if (userDashboard) userDashboard.style.display = 'none';
    
    try {
        await supabase.auth.signOut();
    } catch (e) {}
    
    showNotification('Запрос на удаление отправлен!', 'success');
}

async function doLogin(email, password) {
    if (!email || !password) {
        showNotification('Заполните все поля', 'warning');
        return;
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
        showNotification('Неверный логин или пароль', 'error');
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
        showNotification('Вход выполнен успешно!', 'success');
    }
}

async function doRegister(name, phone, email, password) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name, phone: phone } }
    });
    
    if (error) {
        if (error.message.includes('already') || error.message.includes('exists')) {
            showNotification('Этот email уже зарегистрирован', 'error');
        } else {
            showNotification('Ошибка регистрации: ' + error.message, 'error');
        }
        return;
    }
    
    if (data.user && data.session === null) {
        showNotification('На вашу почту отправлено письмо для подтверждения. После подтверждения войдите в аккаунт.', 'success', function() {
            switchToLogin(email);
        });
    } else if (data.user) {
        showNotification('Регистрация прошла успешно!', 'success', function() {
            switchToLogin(email);
        });
    }
}

function switchToLogin(email) {
    if (document.getElementById('loginTabBtn')) {
        document.getElementById('loginTabBtn').click();
    }
    if (document.getElementById('login-email')) {
        document.getElementById('login-email').value = email;
    }
}

async function doLogout() {
    await supabase.auth.signOut();
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('sb_user_id');
    const authForm = document.getElementById('auth-form');
    const userDashboard = document.getElementById('user-dashboard');
    if (authForm) authForm.style.display = 'block';
    if (userDashboard) userDashboard.style.display = 'none';
    showNotification('Вы вышли из аккаунта', 'info');
}

function showUserDashboard() {
    const savedUser = localStorage.getItem('user');
    const userName = document.getElementById('user-name');
    const userEmail = document.getElementById('user-email');
    const userPhone = document.getElementById('user-phone');
    const userAvatarIcon = document.getElementById('user-avatar-icon');
    const authForm = document.getElementById('auth-form');
    const userDashboard = document.getElementById('user-dashboard');
    
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
