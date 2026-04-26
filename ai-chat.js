// 🤖 AI CHAT — Google Gemini integration

const AI_CONFIG = {
    apiKey: 'AIzaSyAG97eXSEAW_qZZiiW498uhbzao1x2qqaA',
    model: 'gemini-2.0-flash',
    apiUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'
};

let chatHistory = [];

function sendAIChatMessage() {
    var input = document.getElementById('ai-chat-input');
    if (!input || !input.value.trim()) return;

    var userMessage = input.value.trim();
    input.value = '';

    addChatMessage('user', userMessage);

    var context = buildContext();
    callGeminiAPI(context, userMessage);
}

function addChatMessage(role, text) {
    var messagesDiv = document.getElementById('ai-chat-messages');
    if (!messagesDiv) return;

    var div = document.createElement('div');
    div.className = 'ai-chat-message ' + role;
    div.textContent = text;
    messagesDiv.appendChild(div);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    chatHistory.push({ role: role, text: text });
}

function buildContext() {
    var level = levels[game.level];
    var levelName = level ? level.name : 'Неизвестно';
    var task = level ? level.task.replace(/<[^>]+>/g, '') : '';

    var context = 'Ты — дружелюбный ИИ-помощник в игре Tigerinthewood. ' +
        'Игра учит программированию через головоломки на сетке 8x8. ' +
        'Тигрёнок управляется командами: вправо(), влево(), вверх(), вниз(), есть(), взять(), открыть(). ' +
        'Команды можно использовать с числом: вправо(3) = 3 шага вправо.\n\n' +
        'Текущий уровень: ' + game.level + ' - ' + levelName + '\n' +
        'Задание: ' + task + '\n' +
        'Позиция тигра: (' + game.tiger.x + ', ' + game.tiger.y + ')\n' +
        'Шаги: ' + game.steps + ', Мясо: ' + game.meatCollected + '/' + game.totalMeat + ', Ключи: ' + game.keys + '\n\n' +
        'Отвечай кратко и на русском языке. Давай подсказки, но не решай задачу полностью.';

    if (chatHistory.length > 0) {
        context += '\n\nИстория:\n';
        chatHistory.slice(-6).forEach(function(msg) {
            context += (msg.role === 'user' ? 'Игрок' : 'Помощник') + ': ' + msg.text + '\n';
        });
    }

    return context;
}

async function callGeminiAPI(context, userMessage) {
    var messagesDiv = document.getElementById('ai-chat-messages');
    var loadingDiv = document.createElement('div');
    loadingDiv.className = 'ai-chat-message assistant loading';
    loadingDiv.textContent = 'Думаю...';
    if (messagesDiv) messagesDiv.appendChild(loadingDiv);

    try {
        var response = await fetch(AI_CONFIG.apiUrl + '?key=' + AI_CONFIG.apiKey, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: context + '\n\nИгрок: ' + userMessage }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 300
                }
            })
        });

        if (loadingDiv.parentNode) loadingDiv.remove();

        if (!response.ok) {
            addChatMessage('assistant', '😿 Не могу связаться с ИИ. Попробуй позже!');
            return;
        }

        var data = await response.json();
        var text = data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]
            ? data.candidates[0].content.parts[0].text
            : 'Не получил ответ от ИИ.';

        addChatMessage('assistant', text);
    } catch (e) {
        if (loadingDiv.parentNode) loadingDiv.remove();
        addChatMessage('assistant', '😿 Ошибка подключения. Проверь интернет!');
    }
}

function clearAIChatHistory() {
    chatHistory = [];
    var messagesDiv = document.getElementById('ai-chat-messages');
    if (messagesDiv) messagesDiv.innerHTML = '';
    addChatMessage('assistant', 'Привет! Я ИИ помощник 🐯 Спроси меня что-нибудь об игре!');
}

// Handle Enter key
document.addEventListener('DOMContentLoaded', function() {
    var input = document.getElementById('ai-chat-input');
    if (input) {
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                sendAIChatMessage();
            }
        });
    }

    // Init message
    setTimeout(function() {
        addChatMessage('assistant', 'Привет! Я ИИ помощник 🐯 Спроси меня что-нибудь об игре!');
    }, 500);
});
