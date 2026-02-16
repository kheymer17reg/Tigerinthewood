// СИСТЕМА РЕЖИМОВ ИГРЫ

let gameMode = {
    type: 'tutorial', // 'tutorial' или 'advanced'
    lives: 3,
    currentLives: 3,
    maxLives: 3
};

// Инициализация режима игры
function initGameMode() {
    const saved = localStorage.getItem('gameMode');
    if (saved) {
        gameMode = JSON.parse(saved);
    } else {
        gameMode = {
            type: 'tutorial',
            lives: 3,
            currentLives: 3,
            maxLives: 3
        };
    }
    saveGameMode();
}

// Сохранить режим игры
function saveGameMode() {
    localStorage.setItem('gameMode', JSON.stringify(gameMode));
}

// Установить режим игры
function setGameMode(mode) {
    gameMode.type = mode;
    if (mode === 'tutorial') {
        gameMode.currentLives = Infinity;
        gameMode.lives = Infinity;
    } else {
        gameMode.currentLives = 3;
        gameMode.lives = 3;
        gameMode.maxLives = 3;
    }
    saveGameMode();
    updateLivesDisplay();
}

// Потратить жизнь
function loseLive(silent = false) {
    if (gameMode.type === 'advanced' && gameMode.currentLives > 0) {
        gameMode.currentLives--;
        saveGameMode();
        updateLivesDisplay();
        
        // Показываем сообщение о потере жизни (если не silent режим)
        if (!silent && gameMode.currentLives > 0) {
            showMessage('⚠️ Ошибка!', `Осталось ${gameMode.currentLives} ${gameMode.currentLives === 1 ? 'попытка' : 'попытки'}`);
        }
        
        if (gameMode.currentLives === 0) {
            return true; // Game Over
        }
    }
    return false;
}

// Восстановить жизни для нового уровня
function resetLives() {
    if (gameMode.type === 'advanced') {
        gameMode.currentLives = gameMode.maxLives;
    } else {
        gameMode.currentLives = Infinity;
    }
    saveGameMode();
    updateLivesDisplay();
}

// Обновить отображение жизней
function updateLivesDisplay() {
    const livesDisplay = document.getElementById('lives-display');
    if (livesDisplay) {
        if (gameMode.type === 'tutorial') {
            livesDisplay.innerHTML = '∞';
            livesDisplay.style.color = '#4caf50';
            livesDisplay.style.fontSize = '32px';
        } else {
            let hearts = '';
            for (let i = 0; i < gameMode.maxLives; i++) {
                hearts += i < gameMode.currentLives ? '❤️' : '🖤';
            }
            livesDisplay.innerHTML = hearts;
            livesDisplay.style.color = gameMode.currentLives > 1 ? '#4caf50' : '#f44336';
            livesDisplay.style.fontSize = '28px';
        }
    }
}

// Получить текст режима
function getGameModeText() {
    return gameMode.type === 'tutorial' ? '📚 Обучающий режим' : '🎯 Продвинутый режим';
}
