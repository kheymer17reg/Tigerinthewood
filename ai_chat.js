// ИИ Чат с DeepSeek API
const AI_CONFIG = {
    apiKey: 'sk-09a7b73c5aa24670917de52f4d615423',
    model: 'deepseek-chat',
    apiUrl: 'https://api.deepseek.com/chat/completions'
};

let aiChatHistory = [];
let aiChatEnabled = true;

// Загружаем состояние ИИ чата из localStorage
function loadAIChatState() {
    const saved = localStorage.getItem('ai_chat_enabled');
    if (saved !== null) {
        aiChatEnabled = JSON.parse(saved);
    }
    const checkbox = document.getElementById('ai-enabled-checkbox');
    if (checkbox) {
        checkbox.checked = aiChatEnabled;
    }
}

// Переключаем видимость чата
function toggleAIChatWidget() {
    const widget = document.getElementById('ai-chat-widget');
    if (widget) {
        widget.classList.toggle('active');
        if (widget.classList.contains('active')) {
            document.getElementById('ai-chat-input').focus();
        }
    }
}

// Отправляем сообщение в ИИ
async function sendAIChatMessage() {
    const input = document.getElementById('ai-chat-input');
    const message = input.value.trim();
    
    if (!message) return;
    if (!aiChatEnabled) {
        showAIChatMessage('ИИ помощник отключен администратором', 'assistant');
        return;
    }
    
    // Добавляем сообщение пользователя
    showAIChatMessage(message, 'user');
    input.value = '';
    
    // Показываем индикатор загрузки
    showAIChatMessage('Думаю...', 'loading');
    
    try {
        // Формируем контекст из истории
        const systemPrompt = `Ты помощник для игры "Тигрёнок в лесу" - образовательной игры для обучения программированию на русском языке. 
Помогай игрокам с советами по программированию, объясняй команды игры, помогай решать уровни.
Команды игры: вправо(), влево(), вверх(), вниз(), есть(), взять(), открыть().
Ответы давай кратко и понятно, на русском языке.`;
        
        // Формируем сообщения для DeepSeek API
        const messages = [
            { role: 'system', content: systemPrompt }
        ];
        
        // Добавляем историю
        aiChatHistory.forEach(msg => {
            messages.push({
                role: msg.role === 'user' ? 'user' : 'assistant',
                content: msg.content
            });
        });
        
        // Добавляем текущее сообщение
        messages.push({ role: 'user', content: message });
        
        const response = await fetch(AI_CONFIG.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${AI_CONFIG.apiKey}`
            },
            body: JSON.stringify({
                model: AI_CONFIG.model,
                messages: messages,
                temperature: 0.7,
                max_tokens: 500,
                top_p: 0.95
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || `Ошибка API DeepSeek: ${response.status}`);
        }
        
        const data = await response.json();
        const assistantMessage = data.choices[0].message.content;
        
        // Удаляем сообщение "Думаю..."
        removeLastAIChatMessage();
        
        // Добавляем ответ ИИ
        showAIChatMessage(assistantMessage, 'assistant');
        
        // Сохраняем в историю
        aiChatHistory.push({ role: 'user', content: message });
        aiChatHistory.push({ role: 'assistant', content: assistantMessage });
        
        // Ограничиваем историю последними 10 сообщениями
        if (aiChatHistory.length > 20) {
            aiChatHistory = aiChatHistory.slice(-20);
        }
        
    } catch (error) {
        console.error('Ошибка ИИ чата:', error);
        removeLastAIChatMessage();
        showAIChatMessage(`❌ Ошибка: ${error.message}`, 'assistant');
    }
}

// Показываем сообщение в чате
function showAIChatMessage(text, role) {
    const messagesContainer = document.getElementById('ai-chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `ai-chat-message ${role}`;
    messageDiv.textContent = text;
    messagesContainer.appendChild(messageDiv);
    
    // Скролим вниз
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Удаляем последнее сообщение (для удаления "Думаю...")
function removeLastAIChatMessage() {
    const messagesContainer = document.getElementById('ai-chat-messages');
    const lastMessage = messagesContainer.lastChild;
    if (lastMessage) {
        lastMessage.remove();
    }
}

// Очищаем историю чата
function clearAIChatHistory() {
    aiChatHistory = [];
    const messagesContainer = document.getElementById('ai-chat-messages');
    if (messagesContainer) {
        messagesContainer.innerHTML = '';
    }
}

// Обработчик Enter в поле ввода
document.addEventListener('DOMContentLoaded', function() {
    const input = document.getElementById('ai-chat-input');
    if (input) {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendAIChatMessage();
            }
        });
    }
    
    // Загружаем состояние ИИ
    loadAIChatState();
    
    // Показываем приветственное сообщение
    setTimeout(() => {
        showAIChatMessage('👋 Привет! Я ИИ помощник. Задай мне вопрос о игре или программировании!', 'assistant');
    }, 500);
});

console.log('✅ ИИ чат загружен');
