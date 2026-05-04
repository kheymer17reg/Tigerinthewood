// 🎨 UI CONTROLLER — Modals, tabs, theme, navigation

// Tab switching
function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(function(tab) {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(function(btn) {
        btn.classList.remove('active');
    });
    var tabEl = document.getElementById(tabName);
    if (tabEl) tabEl.classList.add('active');
    var tabBtn = document.querySelector('.tab-btn[onclick="switchTab(\'' + tabName + '\')"]');
    if (tabBtn) tabBtn.classList.add('active');

    if (tabName === 'userlevels' && typeof displayUserLevelsInTab === 'function') {
        displayUserLevelsInTab();
    }
    if (tabName === 'sandbox' && typeof initSandbox === 'function') {
        initSandbox();
    }
}

// Modal helpers
function closeModal(id) {
    var modal = document.getElementById(id);
    if (modal) modal.classList.remove('active');
}

function openSettingsModal() {
    document.getElementById('settings-modal').classList.add('active');
    // Sync toggle states
    var themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.classList.toggle('active', document.body.classList.contains('light-mode'));
    }
    var soundToggle = document.getElementById('sound-toggle');
    if (soundToggle) {
        soundToggle.classList.toggle('active', game.soundEnabled);
    }
    updateGameModeButtons();
}

function openTutorialModal() {
    document.getElementById('tutorial-modal').classList.add('active');
}

function openStatsModal() {
    if (typeof showStats === 'function') {
        showStats();
    }
    document.getElementById('stats-modal').classList.add('active');
}

// Theme toggle
function toggleTheme() {
    document.body.classList.toggle('light-mode');
    var isLight = document.body.classList.contains('light-mode');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    var toggle = document.getElementById('theme-toggle');
    if (toggle) toggle.classList.toggle('active', isLight);
}

// Message modals
function showMessage(title, text) {
    var modal = document.getElementById('message-modal');
    var titleEl = document.getElementById('msg-title');
    var textEl = document.getElementById('msg-text');
    if (titleEl) titleEl.textContent = title;
    if (textEl) textEl.innerHTML = text.replace(/\n/g, '<br>');

    // Clean up any extra buttons
    var okBtn = document.querySelector('.ok-btn');
    if (okBtn) {
        var nextBtn = okBtn.nextElementSibling;
        if (nextBtn && nextBtn.textContent.indexOf('Следующий') !== -1) {
            nextBtn.remove();
        }
        okBtn.style.display = 'block';
        okBtn.onclick = function() { closeMessage(); };
        okBtn.textContent = 'Понятно!';
    }
    if (modal) modal.classList.add('active');
}

function showVictoryMessage(title, text, nextLevel) {
    var modal = document.getElementById('message-modal');
    var titleEl = document.getElementById('msg-title');
    var textEl = document.getElementById('msg-text');
    if (titleEl) titleEl.textContent = title;
    if (textEl) textEl.innerHTML = text.replace(/\n/g, '<br>');

    var okBtn = document.querySelector('.ok-btn');
    if (okBtn) {
        var nextBtn = document.createElement('button');
        nextBtn.className = 'btn-primary';
        nextBtn.style.cssText = 'max-width:220px;margin:8px auto 0;';
        nextBtn.textContent = '➜ Следующий уровень';
        nextBtn.onclick = function() {
            closeMessage();
            updateLevelButtons();
            loadLevel(nextLevel);
        };
        okBtn.style.display = 'none';
        okBtn.parentNode.insertBefore(nextBtn, okBtn.nextSibling);
    }
    if (modal) modal.classList.add('active');
}

function closeMessage() {
    var modal = document.getElementById('message-modal');
    var okBtn = document.querySelector('.ok-btn');
    if (okBtn) {
        var nextBtn = okBtn.nextElementSibling;
        if (nextBtn && nextBtn.textContent.indexOf('Следующий') !== -1) {
            nextBtn.remove();
        }
        okBtn.style.display = 'block';
        okBtn.onclick = function() { closeMessage(); };
        okBtn.textContent = 'Понятно!';
    }
    if (modal) modal.classList.remove('active');
}

// Player management
function changePlayer() {
    localStorage.removeItem('currentPlayer');
    localStorage.removeItem('tigerName');
    localStorage.removeItem('completedLevels');
    localStorage.removeItem('gameStats');
    game.completedLevels = new Set();
    playerName = 'Гость';
    tigerName = 'Тигра';
    document.getElementById('player-info').textContent = 'Игрок: Гость';
    document.getElementById('welcome-modal').classList.add('active');
    var loginInput = document.getElementById('player-login');
    if (loginInput) { loginInput.value = ''; loginInput.focus(); }
}

// Developers modal
function showDevelopersModal() {
    var modal = document.getElementById('developers-modal');
    if (modal) modal.classList.add('active');
}

// Story selection
function showStorySelection() {
    var modal = document.getElementById('story-selection-modal');
    if (modal) modal.classList.add('active');
    if (typeof updateStoryButtonStates === 'function') {
        updateStoryButtonStates();
    }
}

function showStorySelectionDetail(storyKey) {
    var completedLevels = JSON.parse(localStorage.getItem('completedLevels') || '[]');
    var isAvailable = false;

    if (storyKey === 'intro' || storyKey === 'tutorial') {
        isAvailable = true;
    } else if (storyKey.indexOf('level') === 0) {
        var levelNum = parseInt(storyKey.replace('level', ''));
        isAvailable = levelNum === 1 || completedLevels.includes(levelNum - 1);
    } else if (storyKey === 'ending') {
        isAvailable = completedLevels.length === 6;
    }

    if (!isAvailable) {
        showMessage('🔒 Заблокировано', 'Эта история ещё не доступна. Продолжай играть!');
        return;
    }

    if (storyKey === 'tutorial') {
        closeModal('story-selection-modal');
        openTutorialModal();
        return;
    }

    var storyMap = {
        'intro': { level: 'intro', name: playerName, tiger: tigerName },
        'level1': { level: 1, name: playerName, tiger: tigerName },
        'level2': { level: 2, name: playerName, tiger: tigerName },
        'level3': { level: 3, name: playerName, tiger: tigerName },
        'level4': { level: 4, name: playerName, tiger: tigerName },
        'level5': { level: 5, name: playerName, tiger: tigerName },
        'level6': { level: 6, name: playerName, tiger: tigerName },
        'ending': { level: 'ending', name: playerName, tiger: tigerName }
    };

    var story = storyMap[storyKey];
    if (story) {
        closeModal('story-selection-modal');
        if (typeof showStory === 'function') {
            showStory(story.level, story.name, story.tiger);
        }
    }
}

function updateStoryButtonStates() {
    var completedLevels = JSON.parse(localStorage.getItem('completedLevels') || '[]');
    ['intro', 'tutorial'].forEach(function(key) {
        var btn = document.getElementById('story-btn-' + key);
        if (btn) { btn.disabled = false; btn.classList.remove('locked'); }
    });
    for (var i = 1; i <= 6; i++) {
        var btn = document.getElementById('story-btn-level' + i);
        if (btn) {
            var available = i === 1 || completedLevels.includes(i - 1);
            btn.disabled = !available;
            btn.classList.toggle('locked', !available);
        }
    }
    var endBtn = document.getElementById('story-btn-ending');
    if (endBtn) {
        var available = completedLevels.length === 6;
        endBtn.disabled = !available;
        endBtn.classList.toggle('locked', !available);
    }
}

// Display user levels in tab
function displayUserLevelsInTab() {
    var container = document.getElementById('user-levels-content');
    if (!container) return;
    if (typeof moderation === 'undefined') {
        container.innerHTML = '<p style="color:var(--text-secondary);text-align:center;padding:20px;">У вас нет опубликованных уровней</p>';
        return;
    }
    var userLevels = moderation.approvedLevels.filter(function(l) { return l.playerName === playerName; })
        .concat(moderation.pendingLevels.filter(function(l) { return l.playerName === playerName; }))
        .concat(moderation.rejectedLevels.filter(function(l) { return l.playerName === playerName; }));

    if (userLevels.length === 0) {
        container.innerHTML = '<p style="color:var(--text-secondary);text-align:center;padding:20px;">У вас нет опубликованных уровней</p>';
        return;
    }

    container.innerHTML = userLevels.map(function(level) {
        var statusColor = level.status === 'approved' ? '#10b981' : level.status === 'rejected' ? '#ef4444' : '#f59e0b';
        var statusText = level.status === 'approved' ? '✅ Одобрен' : level.status === 'rejected' ? '❌ Отклонен' : '⏳ На модерации';
        return '<div style="background:var(--bg-glass);padding:14px;border-radius:var(--radius);margin-bottom:10px;border-left:3px solid ' + statusColor + ';">' +
            '<strong>' + level.levelName + '</strong>' +
            '<p style="color:var(--text-secondary);font-size:13px;margin-top:4px;">' + (level.description || 'Нет описания') + '</p>' +
            '<p style="color:' + statusColor + ';font-size:13px;margin-top:4px;">' + statusText + '</p>' +
            '</div>';
    }).join('');
}

// Sandbox rating
function showSandboxRating() {
    if (typeof showPublishedLevelsModal === 'function') {
        showPublishedLevelsModal();
    } else {
        showMessage('⭐ Рейтинг', 'Создайте уровни в песочнице, чтобы увидеть рейтинг!');
    }
}

function showPublishedLevels() {
    if (typeof showPublishedLevelsModal === 'function') {
        showPublishedLevelsModal();
    } else {
        showMessage('🚀 Новые уровни', 'Скоро здесь появятся уровни от других игроков!');
    }
}

// Rating
let currentRatingLevelId = null;

function showRatingModal(levelId, levelName) {
    currentRatingLevelId = levelId;
    var nameEl = document.getElementById('rating-level-name');
    if (nameEl) nameEl.textContent = levelName;
    document.getElementById('rating-modal').classList.add('active');
}

function setRating(stars) {
    if (currentRatingLevelId && typeof rateSandboxLevel === 'function') {
        rateSandboxLevel(currentRatingLevelId, stars);
    }
    closeModal('rating-modal');
    showMessage('✅ Спасибо!', 'Ты оценил уровень на ' + stars + ' звёзд!');
}

// AI Chat toggle
function toggleAIChatWidget() {
    var widget = document.getElementById('ai-chat-widget');
    if (widget) {
        widget.classList.toggle('active');
        if (widget.classList.contains('active')) {
            var input = document.getElementById('ai-chat-input');
            if (input) input.focus();
        }
    }
}

function toggleAIChat() {
    var toggle = document.getElementById('ai-toggle');
    var status = document.getElementById('ai-status');
    if (toggle) {
        toggle.classList.toggle('active');
        var enabled = toggle.classList.contains('active');
        localStorage.setItem('ai_chat_enabled', enabled);
        if (status) status.textContent = enabled ? 'Включен' : 'Выключен';
    }
}

function toggleAIChatAdmin() {
    var checkbox = document.getElementById('ai-enabled-checkbox');
    if (checkbox) {
        localStorage.setItem('ai_chat_enabled', checkbox.checked);
    }
}

// Ending celebration
function finishGameAndShowEnding() {
    closeModal('stats-modal');
    if (typeof showStory === 'function') {
        showStory('ending', playerName, tigerName);
    }
    setTimeout(function() { showEndingCelebration(); }, 3000);
}

function showEndingCelebration() {
    var div = document.createElement('div');
    div.style.cssText = 'position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.7);z-index:5000;flex-direction:column;gap:20px;';
    var emojis = document.createElement('div');
    emojis.style.cssText = 'display:flex;gap:20px;font-size:80px;';
    emojis.innerHTML = '🎉 🐯 🎉';
    var text = document.createElement('div');
    text.style.cssText = 'color:white;font-size:2em;font-weight:bold;text-align:center;';
    text.innerHTML = tigerName + ' вернулся домой! 🏠';
    div.appendChild(emojis);
    div.appendChild(text);
    document.body.appendChild(div);
    createFireworks();
    setTimeout(function() { div.remove(); }, 5000);
}

// Theme initialization
document.addEventListener('DOMContentLoaded', function() {
    var theme = localStorage.getItem('theme');
    if (theme === 'light') {
        document.body.classList.add('light-mode');
    }
    var soundSaved = localStorage.getItem('soundEnabled');
    if (soundSaved === 'false') {
        game.soundEnabled = false;
        var label = document.getElementById('sound-label');
        if (label) label.textContent = '🔇 Без звука';
    }
    var speed = localStorage.getItem('moveSpeed');
    if (speed) game.moveSpeed = parseInt(speed);
});
