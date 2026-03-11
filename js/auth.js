document.addEventListener('DOMContentLoaded', function() {
    const authTabs = document.querySelectorAll('.auth-tab');
    const tabContents = document.querySelectorAll('.tab-content');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const authForm = document.getElementById('auth-form');
    const userDashboard = document.getElementById('user-dashboard');
    const userName = document.getElementById('user-name');
    const userEmail = document.getElementById('user-email');
    const userPhone = document.getElementById('user-phone');
    const logoutBtn = document.getElementById('logout-btn');
    const openChatBtn = document.getElementById('open-chat-btn');
    const openReviewBtn = document.getElementById('open-review-btn');
    const chatModal = document.getElementById('chatModal');
    const reviewModal = document.getElementById('reviewModal');
    const closeChatModal = document.getElementById('closeChatModal');
    const closeReviewModal = document.getElementById('closeReviewModal');
    const reviewForm = document.getElementById('review-form');

    authTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            authTabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            this.classList.add('active');
            document.getElementById(targetTab + '-tab').classList.add('active');
        });
    });

    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            
            simulateLogin(email, password);
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('reg-name').value;
            const phone = document.getElementById('reg-phone').value;
            const email = document.getElementById('reg-email').value;
            const password = document.getElementById('reg-password').value;
            const passwordConfirm = document.getElementById('reg-password-confirm').value;
            
            if (password !== passwordConfirm) {
                alert('Пароли не совпадают!');
                return;
            }
            
            simulateRegister(name, phone, email, password);
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            simulateLogout();
        });
    }

    if (openChatBtn) {
        openChatBtn.addEventListener('click', function() {
            chatModal.style.display = 'block';
            loadChatMessages();
        });
    }

    if (openReviewBtn) {
        openReviewBtn.addEventListener('click', function() {
            reviewModal.style.display = 'block';
        });
    }

    if (closeChatModal) {
        closeChatModal.addEventListener('click', function() {
            chatModal.style.display = 'none';
        });
    }

    if (closeReviewModal) {
        closeReviewModal.addEventListener('click', function() {
            reviewModal.style.display = 'none';
        });
    }

    if (reviewForm) {
        reviewForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const rating = document.querySelector('input[name="rating"]:checked').value;
            const text = document.getElementById('review-text').value;
            
            simulateSubmitReview(rating, text);
        });
    }

    function simulateLogin(email, password) {
        if (email && password) {
            localStorage.setItem('user', JSON.stringify({
                name: 'Иван Иванов',
                email: email,
                phone: '+7 (999) 123-45-67'
            }));
            
            showUserDashboard();
        } else {
            alert('Пожалуйста, заполните все поля');
        }
    }

    function simulateRegister(name, phone, email, password) {
        if (name && phone && email && password) {
            localStorage.setItem('user', JSON.stringify({
                name: name,
                email: email,
                phone: phone
            }));
            
            showUserDashboard();
        } else {
            alert('Пожалуйста, заполните все поля');
        }
    }

    function simulateLogout() {
        localStorage.removeItem('user');
        authForm.style.display = 'block';
        userDashboard.style.display = 'none';
    }

    function simulateSubmitReview(rating, text) {
        alert(`Отзыв отправлен!\nОценка: ${rating} звёзд\nТекст: ${text}`);
        reviewModal.style.display = 'none';
        reviewForm.reset();
    }

    function showUserDashboard() {
        const user = JSON.parse(localStorage.getItem('user'));
        
        if (user) {
            userName.textContent = user.name;
            userEmail.textContent = user.email;
            userPhone.textContent = user.phone;
            
            authForm.style.display = 'none';
            userDashboard.style.display = 'block';
        }
    }

    function loadChatMessages() {
        const chatMessages = document.getElementById('chat-messages');
        chatMessages.innerHTML = '';
        
        const messages = [
            { text: 'Здравствуйте! Чем могу помочь?', sender: 'support', time: '10:30' },
            { text: 'Добрый день! Хотел узнать о правке диска R16.', sender: 'user', time: '10:31' },
            { text: 'Конечно! Правка диска R16 стоит от 1500 рублей. Привезите на осмотр, и мы дадим точную оценку.', sender: 'support', time: '10:32' }
        ];
        
        messages.forEach(msg => {
            const messageDiv = document.createElement('div');
            messageDiv.className = `chat-message ${msg.sender}`;
            messageDiv.innerHTML = `
                <div class="message-content">${msg.text}</div>
                <div class="message-time">${msg.time}</div>
            `;
            chatMessages.appendChild(messageDiv);
        });
        
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    const savedUser = localStorage.getItem('user');
    if (savedUser) {
        showUserDashboard();
    }

    window.addEventListener('click', function(event) {
        if (event.target === chatModal) {
            chatModal.style.display = 'none';
        }
        if (event.target === reviewModal) {
            reviewModal.style.display = 'none';
        }
    });
});