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

document.addEventListener('DOMContentLoaded', function() {
    let currentTicketId = null;
    let ticketCheckInterval = null;
    
    function waitForSupabase() {
        if (!initChatSupabase()) {
            setTimeout(waitForSupabase, 100);
            return;
        }
        initChat();
    }
    
    function initChat() {
        const openChatBtn = document.getElementById('open-chat-btn');
        if (openChatBtn) {
            openChatBtn.addEventListener('click', openSupportModal);
        }
        
        const sendBtn = document.getElementById('send-message-btn');
        if (sendBtn) {
            sendBtn.addEventListener('click', sendMessage);
        }
        
        const chatInput = document.getElementById('chat-message-input');
        if (chatInput) {
            chatInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') sendMessage();
            });
        }
    }
    
    async function openSupportModal() {
        const modal = document.getElementById('chatModal');
        if (!modal) return;
        
        modal.style.display = 'block';
        
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        
        const { data: tickets } = await supabase
            .from('tickets')
            .select('*')
            .eq('user_id', localStorage.getItem('sb_user_id'))
            .order('created_at', { ascending: false });
        
        if (!tickets || tickets.length === 0) {
            showNewTicketForm();
        } else {
            showTicketsList(tickets);
        }
    }
    
    function showNewTicketForm() {
        const container = document.getElementById('chat-messages');
        container.innerHTML = `
            <div class="ticket-form">
                <h3>Новое обращение</h3>
                <input type="text" id="ticket-subject" class="neon-input" placeholder="Тема обращения" style="margin-bottom: 10px;">
                <textarea id="ticket-message" class="neon-input" placeholder="Опишите вашу проблему..." rows="4" style="margin-bottom: 10px;"></textarea>
                <button class="neon-button" id="create-ticket-btn" style="width: 100%;">Отправить</button>
            </div>
        `;
        
        document.getElementById('create-ticket-btn').addEventListener('click', createTicket);
    }
    
    async function createTicket() {
        const subject = document.getElementById('ticket-subject').value.trim();
        const message = document.getElementById('ticket-message').value.trim();
        
        if (!subject || !message) {
            showNotification('Заполните все поля', 'warning');
            return;
        }
        
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        
        const { data: ticket, error } = await supabase
            .from('tickets')
            .insert({
                user_id: localStorage.getItem('sb_user_id'),
                user_email: user.email || '',
                user_name: user.name || 'Пользователь',
                subject: subject,
                status: 'new'
            })
            .select()
            .single();
        
        if (error) {
            showNotification('Ошибка: ' + error.message, 'error');
            return;
        }
        
        await supabase.from('ticket_messages').insert({
            ticket_id: ticket.id,
            sender: 'user',
            message: message
        });
        
        currentTicketId = ticket.id;
        showTicketChat(ticket);
        startTicketCheck();
    }
    
    async function showTicketsList(tickets) {
        const container = document.getElementById('chat-messages');
        
        let html = '<div class="tickets-list">';
        html += '<h3>Ваши обращения</h3>';
        
        for (const ticket of tickets) {
            const statusText = ticket.status === 'closed' ? '🔒 Закрыт' : 
                              ticket.status === 'processing' ? '⚡ В обработке' : 
                              ticket.status === 'answered' ? '💬 Есть ответ' : '📩 Новый';
            
            html += `
                <div class="ticket-item" data-id="${ticket.id}">
                    <div class="ticket-header">
                        <strong>${ticket.subject}</strong>
                        <span class="ticket-status">${statusText}</span>
                    </div>
                    <div class="ticket-date">${formatDate(ticket.created_at)}</div>
                </div>
            `;
        }
        
        html += '<button class="neon-button" id="new-ticket-btn" style="margin-top: 15px; width: 100%;">➕ Новое обращение</button>';
        html += '</div>';
        
        container.innerHTML = html;
        
        document.querySelectorAll('.ticket-item').forEach(item => {
            item.addEventListener('click', async function() {
                const id = this.dataset.id;
                const { data: ticket } = await supabase.from('tickets').select('*').eq('id', id).single();
                if (ticket) {
                    currentTicketId = id;
                    showTicketChat(ticket);
                    startTicketCheck();
                }
            });
        });
        
        document.getElementById('new-ticket-btn').addEventListener('click', showNewTicketForm);
    }
    
    async function showTicketChat(ticket) {
        const container = document.getElementById('chat-messages');
        
        const { data: messages } = await supabase
            .from('ticket_messages')
            .select('*')
            .eq('ticket_id', ticket.id)
            .order('created_at', { ascending: true });
        
        let html = `
            <div class="ticket-chat-header">
                <button class="back-btn" id="back-to-tickets">← Назад</button>
                <strong>${ticket.subject}</strong>
                <span class="ticket-status-badge ${ticket.status}">${getStatusText(ticket.status)}</span>
            </div>
        `;
        
        if (messages && messages.length > 0) {
            html += '<div class="messages-container">';
            messages.forEach(m => {
                const isUser = m.sender === 'user';
                html += `
                    <div class="chat-message ${isUser ? 'user' : 'support'}">
                        <div class="message-content">${escapeHtml(m.message)}</div>
                        <div class="message-time">${formatTime(m.created_at)}</div>
                    </div>
                `;
            });
            html += '</div>';
        } else {
            html += '<div class="no-messages">Нет сообщений</div>';
        }
        
        html += `
            <div class="chat-input-container">
                <input type="text" id="chat-message-input" class="neon-input" placeholder="Введите сообщение...">
                <button class="neon-button" id="send-message-btn">Отправить</button>
            </div>
        `;
        
        container.innerHTML = html;
        
        document.getElementById('back-to-tickets').addEventListener('click', openSupportModal);
        document.getElementById('send-message-btn').addEventListener('click', sendMessage);
        document.getElementById('chat-message-input').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') sendMessage();
        });
        
        container.scrollTop = container.scrollHeight;
    }
    
    async function sendMessage() {
        const input = document.getElementById('chat-message-input');
        if (!input) return;
        
        const message = input.value.trim();
        if (!message || !currentTicketId) return;
        
        const { error } = await supabase.from('ticket_messages').insert({
            ticket_id: currentTicketId,
            sender: 'user',
            message: message
        });
        
        if (error) {
            showNotification('Ошибка отправки', 'error');
            return;
        }
        
        input.value = '';
        
        const { data: ticket } = await supabase.from('tickets').select('*').eq('id', currentTicketId).single();
        if (ticket) showTicketChat(ticket);
    }
    
    async function checkForNewMessages() {
        if (!currentTicketId) return;
        
        const { data: ticket } = await supabase.from('tickets').select('*').eq('id', currentTicketId).single();
        if (!ticket) return;
        
        const statusBadge = document.querySelector('.ticket-status-badge');
        if (statusBadge) {
            statusBadge.className = `ticket-status-badge ${ticket.status}`;
            statusBadge.textContent = getStatusText(ticket.status);
        }
        
        const { data: messages } = await supabase
            .from('ticket_messages')
            .select('*')
            .eq('ticket_id', currentTicketId)
            .order('created_at', { ascending: true });
        
        const container = document.querySelector('.messages-container');
        if (container && messages) {
            const lastMsg = container.querySelector('.chat-message:last-child');
            const lastMsgId = lastMsg ? lastMsg.dataset.id : 0;
            
            const newMessages = messages.filter(m => m.id > lastMsgId);
            if (newMessages.length > 0) {
                newMessages.forEach(m => {
                    const isUser = m.sender === 'user';
                    const msgHtml = `
                        <div class="chat-message ${isUser ? 'user' : 'support'}" data-id="${m.id}">
                            <div class="message-content">${escapeHtml(m.message)}</div>
                            <div class="message-time">${formatTime(m.created_at)}</div>
                        </div>
                    `;
                    container.insertAdjacentHTML('beforeend', msgHtml);
                });
                container.parentElement.scrollTop = container.parentElement.scrollHeight;
            }
        }
    }
    
    function startTicketCheck() {
        if (ticketCheckInterval) clearInterval(ticketCheckInterval);
        ticketCheckInterval = setInterval(checkForNewMessages, 3000);
    }
    
    function getStatusText(status) {
        switch(status) {
            case 'new': return '📩 Новый';
            case 'processing': return '⚡ В обработке';
            case 'answered': return '💬 Есть ответ';
            case 'closed': return '🔒 Закрыт';
            default: return status;
        }
    }
    
    function formatDate(dateStr) {
        const d = new Date(dateStr);
        return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
    }
    
    function formatTime(dateStr) {
        const d = new Date(dateStr);
        return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    }
    
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    waitForSupabase();
});
