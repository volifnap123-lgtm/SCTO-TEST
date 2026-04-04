const SUPABASE_URL = 'https://noskliwvsiejokzmczfp.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vc2tsaXd2c2llam9rem1jemZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMzU5MTgsImV4cCI6MjA4ODgxMTkxOH0.2NplRLLx1Annta9DL8Wus-OoObQwUbYR4X_vHouDEbE';

let supabase = null;

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

function showUserDashboard() {
    const savedUser = localStorage.getItem('user');
    const userName = document.getElementById('user-name');
    const userEmail = document.getElementById('user-email');
    const userPhone = document.getElementById('user-phone');
    const authForm = document.getElementById('auth-form');
    const userDashboard = document.getElementById('user-dashboard');
    
    if (savedUser && userName) {
        const user = JSON.parse(savedUser);
        userName.textContent = `Добро пожаловать, ${user.name}!`;
        if (userEmail) userEmail.textContent = user.email;
        if (userPhone) userPhone.textContent = user.phone;
        if (authForm) authForm.style.display = 'none';
        if (userDashboard) userDashboard.style.display = 'block';
    }
}

function showAuthForm() {
    const authForm = document.getElementById('auth-form');
    const userDashboard = document.getElementById('user-dashboard');
    if (authForm) authForm.style.display = 'block';
    if (userDashboard) userDashboard.style.display = 'none';
}

function togglePassword(inputId, button) {
    const input = document.getElementById(inputId);
    if (input) {
        input.type = input.type === 'password' ? 'text' : 'password';
        if (button) button.innerHTML = '<span class="eye">' + (input.type === 'text' ? '🙈' : '👁️') + '</span>';
    }
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
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('full_name, phone')
            .eq('id', data.user.id)
            .single();
        
        const userData = {
            name: profile?.full_name || data.user.email,
            email: data.user.email,
            phone: profile?.phone || '',
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
        options: { 
            data: { 
                full_name: name
            },
            emailRedirectTo: window.location.origin + '/profile.html'
        }
    });
    
    if (error) {
        if (error.message.includes('already') || error.message.includes('exists')) {
            showNotification('Этот email уже зарегистрирован', 'error');
        } else {
            showNotification('Ошибка регистрации: ' + error.message, 'error');
        }
        return;
    }
    
    if (data.user) {
        await supabase.from('user_profiles').upsert({
            id: data.user.id,
            full_name: name,
            phone: phone
        });
    }
    
    if (data.user && data.session === null) {
        showNotification('На вашу почту отправлено письмо для подтверждения. После подтверждения войдите в аккаунт.', 'success', function() {
            document.getElementById('loginTabBtn')?.click();
            document.getElementById('login-email').value = email;
        });
    } else if (data.user) {
        showNotification('Регистрация прошла успешно!', 'success');
    }
}

async function doLogout() {
    await supabase.auth.signOut();
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('sb_user_id');
    showAuthForm();
    showNotification('Вы вышли из аккаунта', 'info');
}

async function saveProfile() {
    const name = document.getElementById('edit-name')?.value;
    
    if (!name) {
        showNotification('Введите имя', 'warning');
        return;
    }
    
    const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
    
    const { error: metaError } = await supabase.auth.updateUser({
        data: { full_name: name }
    });
    
    if (metaError) {
        showNotification('Ошибка обновления: ' + metaError.message, 'error');
        return;
    }
    
    const userData = {
        name: name,
        email: savedUser.email || '',
        phone: savedUser.phone || '',
        avatar: '👤'
    };
    localStorage.setItem('user', JSON.stringify(userData));
    showUserDashboard();
    document.getElementById('editProfileModal').style.display = 'none';
    showNotification('Профиль обновлён!', 'success');
}

function openEditProfileModal() {
    const savedUser = localStorage.getItem('user');
    const editName = document.getElementById('edit-name');
    const editModal = document.getElementById('editProfileModal');
    
    if (savedUser && editName && editModal) {
        const user = JSON.parse(savedUser);
        editName.value = user.name || '';
        editModal.style.display = 'block';
    } else {
        showNotification('Форма редактирования недоступна', 'warning');
    }
}

async function deleteProfile() {
    const confirmed = confirm('Запрос на удаление аккаунта будет отправлен.');
    if (!confirmed) return;
    
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
        const user = JSON.parse(savedUser);
        await supabase.from('delete_requests').insert({
            user_email: user.email,
            user_name: user.name,
            user_id: localStorage.getItem('sb_user_id')
        });
    }
    
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('sb_user_id');
    await supabase.auth.signOut();
    showAuthForm();
    showNotification('Запрос на удаление отправлен!', 'success');
}

async function checkAuthState() {
    const savedUser = localStorage.getItem('user');
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
        showUserDashboard();
    } else if (savedUser && isLoggedIn === 'true') {
        const { data: { session: newSession } } = await supabase.auth.refreshSession();
        if (newSession) {
            showUserDashboard();
        } else {
            localStorage.removeItem('user');
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('sb_user_id');
            showAuthForm();
        }
    } else {
        showAuthForm();
    }
}

function setupEventListeners() {
    document.addEventListener('click', function(e) {
        const target = e.target;
        
        if (target.closest('.auth-tab')) {
            e.preventDefault();
            const tab = target.closest('.auth-tab');
            const targetTab = tab.getAttribute('data-tab');
            document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            const targetContent = document.getElementById(targetTab + '-tab');
            if (targetContent) targetContent.classList.add('active');
            return;
        }
        
        if (target.closest('#login-form .auth-btn')) {
            e.preventDefault();
            const email = document.getElementById('login-email')?.value;
            const password = document.getElementById('login-password')?.value;
            doLogin(email, password);
            return;
        }
        
        if (target.closest('#register-form .auth-btn')) {
            e.preventDefault();
            const name = document.getElementById('reg-name')?.value;
            let phone = document.getElementById('reg-phone')?.value;
            const email = document.getElementById('reg-email')?.value;
            const password = document.getElementById('reg-password')?.value;
            const passwordConfirm = document.getElementById('reg-password-confirm')?.value;
            const agreeTerms = document.getElementById('agree-terms')?.checked;
            
            phone = formatPhone(phone);
            
            if (!name || !phone || !email || !password) {
                showNotification('Заполните все поля', 'warning');
                return;
            }
            if (!agreeTerms) {
                showNotification('Необходимо согласиться с условиями использования', 'warning');
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
            return;
        }
        
        if (target.closest('#edit-profile-form .neon-button')) {
            e.preventDefault();
            saveProfile();
            return;
        }
        
        if (target.closest('#logout-btn')) {
            doLogout();
            return;
        }
        
        if (target.closest('#edit-profile-btn')) {
            openEditProfileModal();
            return;
        }
        
        if (target.closest('#delete-profile-btn')) {
            deleteProfile();
            return;
        }
        
        if (target.closest('#open-chat-btn')) {
            if (typeof openSupportModal === 'function') {
                openSupportModal();
            }
            return;
        }
        
        if (target.closest('#open-review-btn')) {
            window.open('https://2gis.ru/ulanude/firm/5207815350139447/reviews', '_blank');
            return;
        }
        
        if (target.closest('#closeEditProfileModal')) {
            document.getElementById('editProfileModal').style.display = 'none';
            return;
        }
        
        if (target.closest('#closeChatModal')) {
            document.getElementById('chatModal').style.display = 'none';
            return;
        }
        
        if (target.closest('.password-toggle')) {
            const inputId = target.closest('.password-toggle').previousElementSibling?.id;
            if (inputId) togglePassword(inputId, target.closest('.password-toggle'));
            return;
        }
    });
}

async function initAuth() {
    if (!initSupabase()) {
        setTimeout(initAuth, 100);
        return;
    }
    
    setupEventListeners();
    
    supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session) {
            checkAuthState();
        } else if (event === 'SIGNED_OUT') {
            localStorage.removeItem('user');
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('sb_user_id');
            showAuthForm();
        }
    });
    
    await checkAuthState();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuth);
} else {
    initAuth();
}
