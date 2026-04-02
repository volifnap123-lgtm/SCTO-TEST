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
    const openChatBtn = document.getElementById('open-chat-btn');
    const openReviewBtn = document.getElementById('open-review-btn');
    const chatModal = document.getElementById('chatModal');
    const reviewModal = document.getElementById('reviewModal');
    const closeChatModal = document.getElementById('closeChatModal');
    const closeReviewModal = document.getElementById('closeReviewModal');
    const reviewForm = document.getElementById('review-form');

    let supabase = window.supabaseClient;
    
    if (!supabase && typeof window.supabase !== 'undefined') {
        supabase = window.supabase.createClient(
            'https://noskliwvsiejokzmczfp.supabase.co',
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vc2tsaXd2c2llam9rem1jemZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMzU5MTgsImV4cCI6MjA4ODgxMTkxOH0.2NplRLLx1Annta9DL8Wus-OoObQwUbYR4X_vHouDEbE'
        );
        window.supabaseClient = supabase;
    }
    
    let captchaNum1, captchaNum2, captchaAnswer;

    function generateCaptcha(elementId) {
        captchaNum1 = Math.floor(Math.random() * 10) + 1;
        captchaNum2 = Math.floor(Math.random() * 10) + 1;
        const operator = Math.random() > 0.5 ? '+' : '-';
        const question = `${captchaNum1} ${operator} ${captchaNum2} = ?`;
        
        const el = document.getElementById(elementId);
        if (el) el.textContent = question;
        
        captchaAnswer = operator === '+' ? captchaNum1 + captchaNum2 : captchaNum1 - captchaNum2;
    }

    function validateCaptcha(inputId) {
        const el = document.getElementById(inputId);
        if (!el) return false;
        const userAnswer = parseInt(el.value);
        return userAnswer === captchaAnswer;
    }

    generateCaptcha('captcha-question');
    generateCaptcha('captcha-question-reg');

    authTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            authTabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            this.classList.add('active');
            const targetContent = document.getElementById(targetTab + '-tab');
            if (targetContent) targetContent.classList.add('active');
            
            const authTabsContainer = document.getElementById('authTabs');
            if (authTabsContainer) {
                if (targetTab === 'register') {
                    authTabsContainer.classList.add('tab-register');
                } else {
                    authTabsContainer.classList.remove('tab-register');
                }
            }
        });
    });

    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (!validateCaptcha('captcha-answer')) {
                alert('Неверный ответ на проверку! Попробуйте ещё раз.');
                generateCaptcha('captcha-question');
                const el = document.getElementById('captcha-answer');
                if (el) el.value = '';
                return;
            }
            
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            
            simulateLogin(email, password);
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (!validateCaptcha('captcha-answer-reg')) {
                alert('Неверный ответ на проверку! Попробуйте ещё раз.');
                generateCaptcha('captcha-question-reg');
                const el = document.getElementById('captcha-answer-reg');
                if (el) el.value = '';
                return;
            }
            
            const name = document.getElementById('reg-name').value;
            const phone = document.getElementById('reg-phone').value;
            const email = document.getElementById('reg-email').value;
            const password = document.getElementById('reg-password').value;
            const passwordConfirm = document.getElementById('reg-password-confirm').value;
            
            if (password !== passwordConfirm) {
                alert('Пароли не совпадают!');
                return;
            }
            
            if (password.length < 6) {
                alert('Пароль должен быть минимум 6 символов!');
                return;
            }
            
            const agreeTerms = document.getElementById('agree-terms');
            if (agreeTerms && !agreeTerms.checked) {
                alert('Необходимо принять условия использования!');
                return;
            }
            
            simulateRegister(name, phone, email, password);
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

    if (openChatBtn && chatModal) {
        openChatBtn.addEventListener('click', function() {
            chatModal.style.display = 'block';
            loadChatMessages();
        });
    }

    if (openReviewBtn && reviewModal) {
        openReviewBtn.addEventListener('click', function() {
            reviewModal.style.display = 'block';
        });
    }

    if (closeChatModal) {
        closeChatModal.addEventListener('click', function() {
            if (chatModal) chatModal.style.display = 'none';
        });
    }

    if (closeReviewModal) {
        closeReviewModal.addEventListener('click', function() {
            if (reviewModal) reviewModal.style.display = 'none';
        });
    }

    if (reviewForm) {
        reviewForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const ratingInput = document.querySelector('input[name="rating"]:checked');
            const rating = ratingInput ? ratingInput.value : '5';
            const text = document.getElementById('review-text').value;
            simulateSubmitReview(rating, text);
        });
    }

    async function simulateLogin(email, password) {
        if (!email || !password) {
            alert('Пожалуйста, заполните все поля');
            return;
        }
        
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        
        if (error) {
            alert('Ошибка входа: ' + error.message);
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
        if (!name || !phone || !email || !password) {
            alert('Пожалуйста, заполните все поля');
            return;
        }
        
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: name, phone } }
        });
        
        if (error) {
            alert('Ошибка регистрации: ' + error.message);
            return;
        }
        
        if (data.user) {
            const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
            const userData = {
                name, email, phone,
                avatar: initials.length > 0 ? initials[0] : '👤'
            };
            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('sb_user_id', data.user.id);
            showUserDashboard();
            alert('Регистрация прошла успешно!');
        }
    }

    async function simulateLogout() {
        if (supabase) await supabase.auth.signOut();
        localStorage.removeItem('user');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('sb_user_id');
        if (authForm) authForm.style.display = 'block';
        if (userDashboard) userDashboard.style.display = 'none';
        generateCaptcha('captcha-question');
        generateCaptcha('captcha-question-reg');
    }

    function simulateSubmitReview(rating, text) {
        alert(`Спасибо за ваш отзыв!\nОценка: ${rating} звёзд\nВаш отзыв будет проверен и добавлен на сайт.`);
        if (reviewModal) reviewModal.style.display = 'none';
        if (reviewForm) reviewForm.reset();
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

    function loadChatMessages() {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;
        chatMessages.innerHTML = '';
        const msg = { text: 'Здравствуйте! Чем могу помочь?', sender: 'support', time: getCurrentTime() };
        addMessageToChat(chatMessages, msg.text, msg.sender, msg.time);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function addMessageToChat(container, text, sender, time) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${sender}`;
        messageDiv.innerHTML = `<div class="message-content">${escapeHtml(text)}</div><div class="message-time">${time}</div>`;
        container.appendChild(messageDiv);
    }

    function getCurrentTime() {
        const now = new Date();
        return now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    }

    function escapeHtml(unsafe) {
        return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }

    const savedUser = localStorage.getItem('user');
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (savedUser && isLoggedIn === 'true') {
        showUserDashboard();
    }

    window.addEventListener('click', function(event) {
        if (chatModal && event.target === chatModal) chatModal.style.display = 'none';
        if (reviewModal && event.target === reviewModal) reviewModal.style.display = 'none';
    });

    window.simulateLogout = simulateLogout;
}

function togglePassword(inputId, button) {
    const input = document.getElementById(inputId);
    if (input) {
        if (input.type === 'password') {
            input.type = 'text';
            if (button) button.innerHTML = '<span class="eye">🙈</span>';
        } else {
            input.type = 'password';
            if (button) button.innerHTML = '<span class="eye">👁️</span>';
        }
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuth);
} else {
    initAuth();
}
