document.addEventListener('DOMContentLoaded', function() {
    const logsContainer = document.getElementById('logsContainer');
    const clearLogsBtn = document.getElementById('clearLogsBtn');

    function addLog(message, type = 'INFO') {
        if (!logsContainer) return;
        
        const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
        const logElement = document.createElement('div');
        logElement.className = 'log-item';
        logElement.textContent = `[${type}] [${timestamp}] ${message}`;
        
        logsContainer.appendChild(logElement);
        logsContainer.scrollTop = logsContainer.scrollHeight;
    }

    function loadServerLogs() {
        if (!logsContainer) return;
        
        logsContainer.innerHTML = '<div class="log-item">[INFO] Загрузка логов сервера...</div>';
        
        setTimeout(() => {
            const mockLogs = [
                '[INFO] [2026-03-10 08:30:00] Сервер запущен',
                '[INFO] [2026-03-10 08:30:01] Подключение к базе данных установлено',
                '[INFO] [2026-03-10 08:30:02] Инициализация Supabase клиента',
                '[DEBUG] [2026-03-10 08:30:05] Загрузка конфигурации приложения',
                '[INFO] [2026-03-10 08:35:12] Пользователь вошел в систему: Иван Иванов',
                '[INFO] [2026-03-10 09:15:45] Загрузка каталога товаров',
                '[INFO] [2026-03-10 10:22:33] Добавлен новый товар: Правка литого диска',
                '[INFO] [2026-03-10 11:05:18] Пользователь отправил сообщение в поддержку',
                '[INFO] [2026-03-10 11:06:02] Отправлен ответ пользователю',
                '[INFO] [2026-03-10 12:30:45] Загрузка галереи фотографий',
                '[INFO] [2026-03-10 13:15:22] Добавлено новое фото в галерею',
                '[INFO] [2026-03-10 14:45:10] Пользователь оставил отзыв',
                '[INFO] [2026-03-10 15:20:33] Обновлен статус товара: Правка штампованного диска',
                '[DEBUG] [2026-03-10 16:00:00] Проверка обновлений...',
                '[INFO] [2026-03-10 16:00:05] Обновлений не найдено',
                '[INFO] [2026-03-10 17:30:15] Резервное копирование базы данных',
                '[INFO] [2026-03-10 17:30:18] Резервное копирование успешно завершено',
                '[INFO] [2026-03-10 18:45:22] Администратор вошел в систему',
                '[INFO] [2026-03-10 19:10:45] Просмотр логов сервера',
                '[INFO] [2026-03-10 19:55:30] Система работает в штатном режиме'
            ];
            
            logsContainer.innerHTML = '';
            mockLogs.forEach(log => {
                const logElement = document.createElement('div');
                logElement.className = 'log-item';
                logElement.textContent = log;
                logsContainer.appendChild(logElement);
            });
        }, 1000);
    }

    if (clearLogsBtn) {
        clearLogsBtn.addEventListener('click', function() {
            if (confirm('Вы уверены, что хотите очистить все логи? Это действие нельзя отменить.')) {
                logsContainer.innerHTML = '<div class="log-item">[INFO] Логи были очищены администратором</div>';
                addLog('Логи очищены', 'INFO');
            }
        });
    }

    loadServerLogs();

    setInterval(() => {
        addLog('Система работает в штатном режиме', 'INFO');
    }, 60000);
});