const SUPABASE_URL = 'https://noskliwvsiejokzmczfp.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vc2tsaXd2c2llam9rem1jemZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMzU5MTgsImV4cCI6MjA4ODgxMTkxOH0.2NplRLLx1Annta9DL8Wus-OoObQwUbYR4X_vHouDEbE';

let supabase = null;

function initChatSupabase() {
    if (supabase) return true;
    if (typeof window.supabase !== 'undefined') {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        return true;
    }
    return false;
}

document.addEventListener('DOMContentLoaded', function() {
    const chatModal = document.getElementById('chatModal');
    const closeChatModal = document.getElementById('closeChatModal');
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-message-input');
    const sendMessageBtn = document.getElementById('send-message-btn');

    function waitForSupabase() {
        if (!initChatSupabase()) {
            setTimeout(waitForSupabase, 100);
            return;
        }
        initChat();
    }

    function initChat() {
        if (closeChatModal) {
            closeChatModal.addEventListener('click', function() {
                chatModal.style.display = 'none';
            });
        }

        if (sendMessageBtn) {
            sendMessageBtn.addEventListener('click', sendMessage);
        }

        if (chatInput) {
            chatInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    sendMessage();
                }
            });
        }
    }

    async function sendMessage() {
        const message = chatInput.value.trim();
        const user = JSON.parse(localStorage.getItem('user'));
        
        if (!message) return;
        
        if (!supabase) {
            waitForSupabase();
            return;
        }
        
        try {
            const { error } = await supabase
                .from('support_messages')
                .insert({
                    name: user ? user.name : 'Гость',
                    message: message,
                    read: false
                });
            
            if (error) throw error;
            
            addMessage(message, 'user');
            chatInput.value = '';
            
            setTimeout(() => {
                addMessage('Ваше сообщение получено! Мы ответим вам в ближайшее время.', 'support');
            }, 1000);
        } catch (error) {
            console.error('Ошибка отправки сообщения:', error);
            addMessage('Произошла ошибка при отправке сообщения.', 'support');
        }
    }

    function addMessage(text, sender) {
        if (!chatMessages) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${sender}`;
        messageDiv.innerHTML = `
            <div class="message-content">${escapeHtml(text)}</div>
            <div class="message-time">${getCurrentTime()}</div>
        `;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function getCurrentTime() {
        const now = new Date();
        return now.getHours().toString().padStart(2, '0') + ':' + 
               now.getMinutes().toString().padStart(2, '0');
    }

    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    window.addEventListener('click', function(event) {
        if (event.target === chatModal) {
            chatModal.style.display = 'none';
        }
    });

    waitForSupabase();
});
