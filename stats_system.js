// СИСТЕМА СТАТИСТИКИ И ДОСТИЖЕНИЙ

let gameStats = {
    startTime: null,
    endTime: null,
    totalTime: 0,
    totalScore: 0,
    levelsCompleted: 0,
    totalMeatCollected: 0,
    totalSteps: 0,
    totalAttempts: 0,
    achievements: [],
    levelStats: {},
    rating: 0,
    sandboxLevels: []
};

// Система наград
let rewards = {
    speedrunner: { id: 'speedrunner', title: '⚡ Спидраннер', description: 'Пройти все уровни за 5 минут', icon: '⚡' },
    perfectionist: { id: 'perfectionist', title: '💎 Перфекционист', description: 'Собрать все мясо на всех уровнях', icon: '💎' },
    efficient: { id: 'efficient', title: '🎯 Эффективный', description: 'Пройти все уровни с минимумом шагов', icon: '🎯' },
    builder: { id: 'builder', title: '🏗️ Строитель', description: 'Создать 5 уровней в песочнице', icon: '🏗️' },
    master: { id: 'master', title: '👑 Мастер', description: 'Получить 5 звёзд на всех уровнях', icon: '👑' }
};

// Инициализация статистики
function initStats() {
    // Load existing stats if available
    const saved = localStorage.getItem('gameStats');
    if (saved) {
        gameStats = JSON.parse(saved);
    }
    
    // Ensure all required fields exist
    if (!gameStats.totalAttempts) gameStats.totalAttempts = 0;
    if (!gameStats.totalScore) gameStats.totalScore = 0;
    if (!gameStats.totalSteps) gameStats.totalSteps = 0;
    if (!gameStats.totalMeatCollected) gameStats.totalMeatCollected = 0;
    if (!gameStats.levelsCompleted) gameStats.levelsCompleted = 0;
    if (!gameStats.achievements) gameStats.achievements = [];
    
    // Initialize start time if not set
    if (!gameStats.startTime) {
        gameStats.startTime = Date.now();
    }
    
    // Initialize level stats if not set
    if (!gameStats.levelStats || Object.keys(gameStats.levelStats).length === 0) {
        gameStats.levelStats = {};
        for (let i = 1; i <= 6; i++) {
            gameStats.levelStats[i] = {
                completed: false,
                score: 0,
                steps: 0,
                meatCollected: 0,
                time: 0,
                startTime: null,
                attempts: 0
            };
        }
    } else {
        // Ensure attempts field exists for all levels
        for (let i = 1; i <= 6; i++) {
            if (!gameStats.levelStats[i]) {
                gameStats.levelStats[i] = {
                    completed: false,
                    score: 0,
                    steps: 0,
                    meatCollected: 0,
                    time: 0,
                    startTime: null,
                    attempts: 0
                };
            }
            if (!gameStats.levelStats[i].attempts) {
                gameStats.levelStats[i].attempts = 0;
            }
        }
    }
    
    localStorage.setItem('gameStats', JSON.stringify(gameStats));
}

// Начать уровень
function startLevelStats(levelNum) {
    // Always reset startTime to current time when starting a level
    gameStats.levelStats[levelNum].startTime = Date.now();
    gameStats.levelStats[levelNum].attempts++;
    gameStats.totalAttempts++;
    saveStats();
}

// Завершить уровень
function completeLevelStats(levelNum, score, steps, meatCollected) {
    const levelStat = gameStats.levelStats[levelNum];
    
    // Check if this is a repeat completion
    const wasAlreadyCompleted = levelStat.completed;
    
    levelStat.completed = true;
    levelStat.score = score;
    levelStat.steps = steps;
    levelStat.meatCollected = meatCollected;
    
    // Calculate time - ensure startTime is valid
    let elapsedTime = 0;
    if (levelStat.startTime && typeof levelStat.startTime === 'number') {
        elapsedTime = (Date.now() - levelStat.startTime) / 1000; // в секундах
    }
    levelStat.time = Math.max(0, elapsedTime); // Ensure non-negative
    
    // Only add to totals if this is the first completion
    if (!wasAlreadyCompleted) {
        gameStats.totalScore += score;
        gameStats.totalSteps += steps;
        gameStats.totalMeatCollected += meatCollected;
        gameStats.levelsCompleted++;
    } else {
        // Update totals if replaying (subtract old, add new)
        gameStats.totalScore = gameStats.totalScore - levelStat.score + score;
        gameStats.totalSteps = gameStats.totalSteps - levelStat.steps + steps;
        gameStats.totalMeatCollected = gameStats.totalMeatCollected - levelStat.meatCollected + meatCollected;
    }
    
    checkAchievements(levelNum, score, steps, meatCollected);
    saveStats();
}

// Проверить достижения
function checkAchievements(levelNum, score, steps, meatCollected) {
    // Достижение: Быстрый старт (пройти уровень 1 за < 30 сек)
    if (levelNum === 1 && gameStats.levelStats[1].time < 30) {
        addAchievement('speedster', '⚡ Быстрый старт', 'Пройти уровень 1 за 30 секунд');
    }
    
    // Достижение: Идеальный уровень (собрать все мясо)
    if (meatCollected > 0) {
        const level = levels[levelNum];
        const totalMeat = level.objects.filter(obj => obj.type === 'meat').length;
        if (meatCollected === totalMeat) {
            addAchievement(`perfect_${levelNum}`, `🎯 Идеальный уровень ${levelNum}`, 'Собрать все мясо на уровне');
        }
    }
    
    // Достижение: Экономный (пройти уровень с минимумом шагов)
    if (steps <= 10) {
        addAchievement(`efficient_${levelNum}`, `💨 Экономный уровень ${levelNum}`, 'Пройти уровень за 10 шагов');
    }
    
    // Достижение: Все уровни пройдены
    if (gameStats.levelsCompleted === 6) {
        addAchievement('champion', '🏆 Чемпион', 'Пройти все 6 уровней');
    }
}

// Добавить достижение
function addAchievement(id, title, description) {
    if (!gameStats.achievements.find(a => a.id === id)) {
        gameStats.achievements.push({
            id: id,
            title: title,
            description: description,
            unlockedAt: new Date().toLocaleString('ru-RU')
        });
    }
}

// Рассчитать звёзды для уровня (1-5 звёзд)
function calculateLevelRating(levelNum) {
    const levelStat = gameStats.levelStats[levelNum];
    if (!levelStat.completed) return 0;
    
    const level = levels[levelNum];
    const totalMeat = level.objects.filter(obj => obj.type === 'meat').length;
    
    let stars = 1; // Минимум 1 звезда за прохождение
    
    // +1 звезда за сбор всего мяса
    if (levelStat.meatCollected === totalMeat) {
        stars++;
    }
    
    // +1 звезда за экономию шагов (≤ 15 шагов)
    if (levelStat.steps <= 15) {
        stars++;
    }
    
    // +1 звезда за скорость (≤ 60 сек)
    if (levelStat.time <= 60) {
        stars++;
    }
    
    // +1 звезда за идеальное прохождение (все условия)
    if (levelStat.meatCollected === totalMeat && levelStat.steps <= 10 && levelStat.time <= 45) {
        stars++;
    }
    
    return Math.min(5, stars);
}

// Получить звёзды для уровня в виде строки
function getStarsDisplay(stars) {
    return '⭐'.repeat(stars) + '☆'.repeat(5 - stars);
}

// Проверить награды после завершения всех уровней
function checkRewards() {
    const totalTime = (gameStats.endTime - gameStats.startTime) / 1000;
    let newRewards = [];
    
    // Спидраннер: все уровни за 5 минут
    if (totalTime <= 300) {
        if (!gameStats.achievements.find(a => a.id === 'speedrunner')) {
            newRewards.push(rewards.speedrunner);
            addAchievement('speedrunner', rewards.speedrunner.title, rewards.speedrunner.description);
            showRewardNotification(rewards.speedrunner);
        }
    }
    
    // Перфекционист: все мясо на всех уровнях
    let totalMeatInGame = 0;
    for (let i = 1; i <= 6; i++) {
        const level = levels[i];
        totalMeatInGame += level.objects.filter(obj => obj.type === 'meat').length;
    }
    if (gameStats.totalMeatCollected === totalMeatInGame) {
        if (!gameStats.achievements.find(a => a.id === 'perfectionist')) {
            newRewards.push(rewards.perfectionist);
            addAchievement('perfectionist', rewards.perfectionist.title, rewards.perfectionist.description);
            showRewardNotification(rewards.perfectionist);
        }
    }
    
    // Эффективный: все уровни с минимумом шагов
    let avgSteps = gameStats.totalSteps / 6;
    if (avgSteps <= 12) {
        if (!gameStats.achievements.find(a => a.id === 'efficient')) {
            newRewards.push(rewards.efficient);
            addAchievement('efficient', rewards.efficient.title, rewards.efficient.description);
            showRewardNotification(rewards.efficient);
        }
    }
    
    // Мастер: 5 звёзд на всех уровнях
    let totalStars = 0;
    for (let i = 1; i <= 6; i++) {
        totalStars += calculateLevelRating(i);
    }
    if (totalStars >= 25) {
        if (!gameStats.achievements.find(a => a.id === 'master')) {
            newRewards.push(rewards.master);
            addAchievement('master', rewards.master.title, rewards.master.description);
            showRewardNotification(rewards.master);
        }
    }
    
    return newRewards;
}

// Показать уведомление о достижении
function showRewardNotification(reward) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 20px 30px;
        border-radius: 15px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        z-index: 5000;
        animation: slideInRight 0.5s ease-out;
        max-width: 300px;
    `;
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 15px;">
            <div style="font-size: 2.5em;">${reward.icon}</div>
            <div>
                <div style="font-size: 1.1em; font-weight: 600; margin-bottom: 5px;">${reward.title}</div>
                <div style="font-size: 0.9em; opacity: 0.9;">${reward.description}</div>
            </div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.5s ease-out';
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 3000);
}

// Сохранить статистику
function saveStats() {
    localStorage.setItem('gameStats', JSON.stringify(gameStats));
}

// Загрузить статистику
function loadStats() {
    const saved = localStorage.getItem('gameStats');
    if (saved) {
        gameStats = JSON.parse(saved);
    }
}

// Система рейтинга песочницы
function saveSandboxLevel(levelName, levelData) {
    const sandboxLevel = {
        id: Date.now(),
        name: levelName,
        data: levelData,
        createdAt: new Date().toLocaleString('ru-RU'),
        rating: 0,
        plays: 0,
        difficulty: 'Средняя'
    };
    
    gameStats.sandboxLevels.push(sandboxLevel);
    saveStats();
    return sandboxLevel;
}

// Оценить уровень песочницы
function rateSandboxLevel(levelId, rating) {
    const level = gameStats.sandboxLevels.find(l => l.id === levelId);
    if (level) {
        level.rating = rating;
        saveStats();
    }
}

// Увеличить счётчик игр уровня
function incrementSandboxLevelPlays(levelId) {
    const level = gameStats.sandboxLevels.find(l => l.id === levelId);
    if (level) {
        level.plays++;
        saveStats();
    }
}

// Получить все уровни песочницы отсортированные по рейтингу
function getSandboxLevelsByRating() {
    return [...gameStats.sandboxLevels].sort((a, b) => b.rating - a.rating);
}

// Показать рейтинг всех уровней пользователей
function showSandboxRating() {
    loadPublishedLevels();
    const publishedLevels = getPublishedLevels();
    
    let ratingHTML = `
        <div style="padding: 20px;">
            <h2 style="color: var(--primary-color); text-align: center; font-size: 1.8em; margin-bottom: 20px;">🏆 Рейтинг уровней пользователей</h2>
            
            ${publishedLevels.length === 0 ? `
                <div style="color: var(--text-secondary); text-align: center; padding: 40px;">
                    <p style="font-size: 1.1em;">Пока нет опубликованных уровней</p>
                    <p style="margin-top: 10px;">Создай свой уровень и поделись им с другими!</p>
                </div>
            ` : `
                <div style="display: grid; gap: 15px;">
                    ${publishedLevels
                        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
                        .map((level, index) => `
                        <div style="background: var(--bg-primary); padding: 15px; border-radius: 10px; border-left: 4px solid var(--primary-color);">
                            <div style="display: flex; justify-content: space-between; align-items: start;">
                                <div style="flex: 1;">
                                    <div style="font-weight: 600; color: var(--text-primary); font-size: 1.1em;">
                                        ${index + 1}. ${level.name}
                                    </div>
                                    <div style="font-size: 0.85em; color: var(--text-secondary); margin-top: 5px;">
                                        👤 ${level.publishedBy || 'Неизвестный автор'}
                                    </div>
                                    <div style="font-size: 0.85em; color: var(--text-secondary); margin-top: 3px;">
                                        📝 ${level.description || 'Нет описания'}
                                    </div>
                                </div>
                                <div style="text-align: right;">
                                    <div style="font-size: 1.3em; margin-bottom: 5px;">
                                        ${getStarsDisplay(level.rating || 0)}
                                    </div>
                                    <div style="font-size: 0.85em; color: var(--text-secondary); margin-bottom: 3px;">
                                        📥 ${level.downloads || 0} скачиваний
                                    </div>
                                    <div style="font-size: 0.85em; color: var(--text-secondary); margin-bottom: 10px;">
                                        🎮 ${level.plays || 0} игр
                                    </div>
                                    <button onclick="playPublishedLevel(${publishedLevels.indexOf(level)})" style="padding: 8px 12px; background: var(--success-color); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.9em; width: 100%;">▶️ Играть</button>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `}
        </div>
    `;
    
    document.getElementById('stats-content').innerHTML = ratingHTML;
    document.getElementById('stats-modal').classList.add('active');
}

// Форматировать время
function formatTime(seconds) {
    // Handle NaN and invalid values
    if (!seconds || isNaN(seconds) || seconds < 0) {
        return '0с';
    }
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
        return `${hours}ч ${minutes}м ${secs}с`;
    } else if (minutes > 0) {
        return `${minutes}м ${secs}с`;
    } else {
        return `${secs}с`;
    }
}

// Показать статистику
function showStats() {
    const totalTime = (Date.now() - gameStats.startTime) / 1000;
    
    let statsHTML = `
        <div style="padding: 20px;">
            <h2 style="color: var(--primary-color); text-align: center; font-size: 1.8em; margin-bottom: 20px;">📊 Общая статистика</h2>
            
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 30px;">
                <div style="background: var(--bg-primary); padding: 15px; border-radius: 10px; text-align: center; border-left: 4px solid var(--primary-color);">
                    <div style="font-size: 1.8em; font-weight: bold; color: var(--primary-color);">${gameStats.levelsCompleted}/6</div>
                    <div style="color: var(--text-secondary); margin-top: 5px; font-size: 0.9em;">Уровней пройдено</div>
                </div>
                
                <div style="background: var(--bg-primary); padding: 15px; border-radius: 10px; text-align: center; border-left: 4px solid var(--success-color);">
                    <div style="font-size: 1.8em; font-weight: bold; color: var(--success-color);">${gameStats.totalScore}</div>
                    <div style="color: var(--text-secondary); margin-top: 5px; font-size: 0.9em;">Всего очков</div>
                </div>
                
                <div style="background: var(--bg-primary); padding: 15px; border-radius: 10px; text-align: center; border-left: 4px solid var(--warning-color);">
                    <div style="font-size: 1.8em; font-weight: bold; color: var(--warning-color);">${gameStats.totalSteps}</div>
                    <div style="color: var(--text-secondary); margin-top: 5px; font-size: 0.9em;">Всего шагов</div>
                </div>
                
                <div style="background: var(--bg-primary); padding: 15px; border-radius: 10px; text-align: center; border-left: 4px solid #ff9800;">
                    <div style="font-size: 1.8em; font-weight: bold; color: #ff9800;">${formatTime(totalTime)}</div>
                    <div style="color: var(--text-secondary); margin-top: 5px; font-size: 0.9em;">Время игры</div>
                </div>
                
                <div style="background: var(--bg-primary); padding: 15px; border-radius: 10px; text-align: center; border-left: 4px solid #e91e63;">
                    <div style="font-size: 1.8em; font-weight: bold; color: #e91e63;">${gameStats.totalAttempts || 0}</div>
                    <div style="color: var(--text-secondary); margin-top: 5px; font-size: 0.9em;">Всего попыток</div>
                </div>
            </div>
            
            <h3 style="color: var(--primary-color); margin-bottom: 15px; font-size: 1.3em;">📈 Статистика по уровням</h3>
            <div style="display: grid; gap: 10px;">
    `;
    
    for (let i = 1; i <= 6; i++) {
        const levelStat = gameStats.levelStats[i];
        const status = levelStat.completed ? '✓' : '○';
        const statusColor = levelStat.completed ? 'var(--success-color)' : 'var(--text-secondary)';
        const stars = calculateLevelRating(i);
        const starsDisplay = getStarsDisplay(stars);
        
        statsHTML += `
            <div style="background: var(--bg-primary); padding: 12px; border-radius: 8px; border-left: 4px solid ${statusColor};">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <span style="font-weight: 600; color: ${statusColor}; font-size: 1.1em;">${status}</span>
                        <span style="color: var(--text-primary); margin-left: 10px;">Уровень ${i}</span>
                    </div>
                    <div style="text-align: right; font-size: 0.85em; color: var(--text-secondary);">
                        ${levelStat.completed ? `
                            <div style="margin-bottom: 5px; font-size: 1.1em;">${starsDisplay}</div>
                            <div>⭐ ${levelStat.score} очков</div>
                            <div>🐾 ${levelStat.steps} шагов</div>
                            <div>🍖 ${levelStat.meatCollected} мяса</div>
                            <div>⏱️ ${formatTime(levelStat.time)}</div>
                            <div>🎯 ${levelStat.attempts} попыт${levelStat.attempts % 10 === 1 && levelStat.attempts % 100 !== 11 ? 'ка' : levelStat.attempts % 10 >= 2 && levelStat.attempts % 10 <= 4 && (levelStat.attempts % 100 < 10 || levelStat.attempts % 100 >= 20) ? 'ки' : 'ок'}</div>
                        ` : 'Не пройден'}
                    </div>
                </div>
            </div>
        `;
    }
    
    statsHTML += `
            </div>
        </div>
    `;
    
    document.getElementById('stats-content').innerHTML = statsHTML;
    document.getElementById('stats-modal').classList.add('active');
}

// Закрыть статистику
function closeStats() {
    document.getElementById('stats-modal').classList.remove('active');
}

// Показать финальную статистику после всех уровней
// Показать финальную статистику после всех уровней
// Показать финальную статистику после всех уровней
function showFinalStats() {
    gameStats.endTime = Date.now();
    const totalTime = (gameStats.endTime - gameStats.startTime) / 1000;

    // Проверить награды
    const newRewards = checkRewards();

    // Рассчитать общий рейтинг
    let totalStars = 0;
    for (let i = 1; i <= 6; i++) {
        totalStars += calculateLevelRating(i);
    }
    const avgRating = (totalStars / 30 * 5).toFixed(1);

    let finalHTML = `
        <div style="padding: 20px; max-width: 500px;">
            <h2 style="color: var(--primary-color); text-align: center; font-size: 1.8em; margin-bottom: 20px;">🎉 ПОЗДРАВЛЯЕМ! 🎉</h2>
            <p style="text-align: center; color: var(--text-secondary); margin-bottom: 20px; font-size: 1.1em;">Ты прошел все 6 уровней!</p>

            ${newRewards.length > 0 ? `
            <h3 style="color: var(--primary-color); margin-bottom: 12px; font-size: 1.2em;">🏆 Достижения:</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 10px; margin-bottom: 20px;">
                ${newRewards.map(reward => `
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 15px; border-radius: 10px; text-align: center; color: white;">
                        <div style="font-size: 2em; margin-bottom: 5px;">${reward.icon}</div>
                        <div style="font-size: 0.8em; font-weight: 600; line-height: 1.2;">${reward.title}</div>
                    </div>
                `).join('')}
            </div>
            ` : ''}

            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 20px;">
                <div style="background: var(--bg-primary); padding: 15px; border-radius: 10px; text-align: center; border-left: 3px solid var(--primary-color);">
                    <div style="font-size: 1.5em; font-weight: bold; color: var(--primary-color);">${gameStats.totalScore}</div>
                    <div style="font-size: 0.9em; color: var(--text-secondary); margin-top: 5px;">Очки</div>
                </div>

                <div style="background: var(--bg-primary); padding: 15px; border-radius: 10px; text-align: center; border-left: 3px solid #ff9800;">
                    <div style="font-size: 1.5em; font-weight: bold; color: #ff9800;">${formatTime(totalTime)}</div>
                    <div style="font-size: 0.9em; color: var(--text-secondary); margin-top: 5px;">Время</div>
                </div>

                <div style="background: var(--bg-primary); padding: 15px; border-radius: 10px; text-align: center; border-left: 3px solid var(--warning-color);">
                    <div style="font-size: 1.5em; font-weight: bold; color: var(--warning-color);">${gameStats.totalSteps}</div>
                    <div style="font-size: 0.9em; color: var(--text-secondary); margin-top: 5px;">Шаги</div>
                </div>

                <div style="background: var(--bg-primary); padding: 15px; border-radius: 10px; text-align: center; border-left: 3px solid #ffc107;">
                    <div style="font-size: 1.5em; font-weight: bold; color: #ffc107;">${gameStats.totalMeatCollected}</div>
                    <div style="font-size: 0.9em; color: var(--text-secondary); margin-top: 5px;">Мясо 🍖</div>
                </div>
            </div>

            <h3 style="color: var(--primary-color); margin-bottom: 12px; font-size: 1.2em;">📈 По уровням:</h3>
            <div style="display: grid; gap: 8px; margin-bottom: 20px; max-height: 250px; overflow-y: auto;">
    `;

    for (let i = 1; i <= 6; i++) {
        const levelStat = gameStats.levelStats[i];
        const stars = calculateLevelRating(i);
        const starsDisplay = getStarsDisplay(stars);
        
        finalHTML += `
            <div style="background: var(--bg-primary); padding: 10px; border-radius: 8px; border-left: 3px solid var(--primary-color); font-size: 0.9em;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="font-weight: 600;">Уровень ${i}</div>
                    <div>${starsDisplay}</div>
                </div>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; margin-top: 6px; font-size: 0.85em; color: var(--text-secondary);">
                    <div>🎯 ${levelStat.score} очков</div>
                    <div>👣 ${levelStat.steps} шагов</div>
                    <div>🍖 ${levelStat.meatCollected} мяса</div>
                    <div>⏱️ ${formatTime(levelStat.time)}</div>
                </div>
            </div>
        `;
    }

    finalHTML += `
            </div>
    `;

    finalHTML += `
            <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                <button onclick="showStats()" style="flex: 1; min-width: 120px; padding: 12px; background: var(--primary-color); color: white; border: none; border-radius: 8px; font-size: 0.95em; font-weight: 600; cursor: pointer; transition: all 0.3s;">📊 Статистика</button>
                <button onclick="finishGameAndShowEnding()" style="flex: 1; min-width: 120px; padding: 12px; background: var(--success-color); color: white; border: none; border-radius: 8px; font-size: 0.95em; font-weight: 600; cursor: pointer; transition: all 0.3s;">✅ Завершить игру</button>
                <button onclick="changePlayer()" style="flex: 1; min-width: 120px; padding: 12px; background: var(--warning-color); color: white; border: none; border-radius: 8px; font-size: 0.95em; font-weight: 600; cursor: pointer; transition: all 0.3s;">👤 Другой игрок</button>
            </div>
        </div>
    `;

    document.getElementById('stats-content').innerHTML = finalHTML;
    document.getElementById('stats-modal').classList.add('active');
}




// Показать опубликованные уровни администратора
function showPublishedLevels() {
    loadPublishedLevels();
    const publishedLevels = getPublishedLevels();
    
    let html = `
        <div style="padding: 20px;">
            <h2 style="color: var(--primary-color); text-align: center; font-size: 1.8em; margin-bottom: 20px;">🚀 Опубликованные уровни</h2>
            
            ${publishedLevels.length === 0 ? `
                <div style="color: var(--text-secondary); text-align: center; padding: 40px;">
                    <p style="font-size: 1.1em;">Нет опубликованных уровней</p>
                    <p style="margin-top: 10px;">Администратор скоро опубликует новые уровни!</p>
                </div>
            ` : `
                <div style="display: grid; gap: 15px;">
                    ${publishedLevels.map((level, index) => `
                        <div style="background: var(--bg-primary); padding: 15px; border-radius: 10px; border-left: 4px solid var(--primary-color);">
                            <div style="display: flex; justify-content: space-between; align-items: start;">
                                <div style="flex: 1;">
                                    <div style="font-weight: 600; color: var(--text-primary); font-size: 1.1em;">
                                        ${level.name}
                                    </div>
                                    <div style="font-size: 0.85em; color: var(--text-secondary); margin-top: 5px;">
                                        📝 ${level.description || 'Нет описания'}
                                    </div>
                                    <div style="font-size: 0.85em; color: var(--text-secondary); margin-top: 3px;">
                                        ⭐ Сложность: ${level.difficulty || 'Средняя'}
                                    </div>
                                    <div style="font-size: 0.85em; color: var(--text-secondary); margin-top: 3px;">
                                        👤 Опубликовано: ${level.publishedBy || 'Администратор'}
                                    </div>
                                    <div style="font-size: 0.85em; color: var(--text-secondary); margin-top: 3px;">
                                        📅 ${level.publishedAt || 'Неизвестно'}
                                    </div>
                                </div>
                                <div style="text-align: right;">
                                    <div style="font-size: 1.3em; margin-bottom: 5px;">
                                        ${getStarsDisplay(level.rating || 0)}
                                    </div>
                                    <div style="font-size: 0.85em; color: var(--text-secondary); margin-bottom: 10px;">
                                        🎮 ${level.plays || 0} игр
                                    </div>
                                    <button onclick="playPublishedLevel(${index})" style="padding: 8px 12px; background: var(--success-color); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.9em; width: 100%;">▶️ Играть</button>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `}
        </div>
    `;
    
    document.getElementById('stats-content').innerHTML = html;
    document.getElementById('stats-modal').classList.add('active');
}

// Играть в опубликованный уровень
function playPublishedLevel(index) {
    loadPublishedLevels();
    const publishedLevels = getPublishedLevels();
    const level = publishedLevels[index];
    
    if (!level || !level.data) {
        showMessage('❌ Ошибка', 'Уровень не содержит данных!');
        return;
    }
    
    // Загрузить уровень в песочницу
    sandbox.gridSize = level.data.gridSize;
    if (sandbox.gridSize <= 6) {
        sandbox.cellSize = 70;
    } else if (sandbox.gridSize <= 10) {
        sandbox.cellSize = 50;
    } else {
        sandbox.cellSize = 40;
    }
    
    sandbox.tigerPos = level.data.start;
    sandbox.exitPos = level.data.exit;
    sandbox.objects = level.data.objects || [];
    
    // Увеличить счетчик игр
    level.plays = (level.plays || 0) + 1;
    savePublishedLevels();
    
    // Закрыть модальное окно и начать игру
    document.getElementById('stats-modal').classList.remove('active');
    playSandboxLevel();
}

// Показать все уровни пользователей с рейтингом и скачиваниями
function displayUserLevelsInTab() {
    loadPublishedLevels();
    const publishedLevels = getPublishedLevels();
    
    let html = `
        <div style="padding: 20px; background: var(--bg-secondary); border-radius: 10px; margin-top: 20px;">
            <h3 style="color: var(--primary-color); font-size: 1.4em; margin-bottom: 15px;">🏆 Рейтинг уровней пользователей</h3>
            
            ${publishedLevels.length === 0 ? `
                <div style="color: var(--text-secondary); text-align: center; padding: 30px;">
                    <p style="font-size: 1em;">Пока нет опубликованных уровней</p>
                    <p style="margin-top: 10px; font-size: 0.9em;">Создай свой уровень и поделись им с другими!</p>
                </div>
            ` : `
                <div style="display: grid; gap: 12px;">
                    ${publishedLevels
                        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
                        .map((level, index) => `
                        <div style="background: var(--bg-primary); padding: 12px; border-radius: 8px; border-left: 3px solid var(--primary-color); display: flex; justify-content: space-between; align-items: center;">
                            <div style="flex: 1;">
                                <div style="font-weight: 600; color: var(--text-primary); font-size: 1em;">
                                    ${index + 1}. ${level.name}
                                </div>
                                <div style="font-size: 0.8em; color: var(--text-secondary); margin-top: 3px;">
                                    👤 ${level.publishedBy || 'Неизвестный автор'}
                                </div>
                            </div>
                            <div style="text-align: right; min-width: 120px;">
                                <div style="font-size: 1.1em; margin-bottom: 3px;">
                                    ${getStarsDisplay(level.rating || 0)}
                                </div>
                                <div style="font-size: 0.8em; color: var(--text-secondary); margin-bottom: 5px;">
                                    📥 ${level.downloads || 0} скачиваний
                                </div>
                                <div style="font-size: 0.8em; color: var(--text-secondary);">
                                    🎮 ${level.plays || 0} игр
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `}
        </div>
    `;
    
    const userLevelsDisplay = document.getElementById('user-levels-display');
    if (userLevelsDisplay) {
        userLevelsDisplay.innerHTML = html;
    }
}

// Обновить счетчик скачиваний при загрузке уровня
function incrementDownloadCount(levelIndex) {
    loadPublishedLevels();
    const publishedLevels = getPublishedLevels();
    if (publishedLevels[levelIndex]) {
        publishedLevels[levelIndex].downloads = (publishedLevels[levelIndex].downloads || 0) + 1;
        savePublishedLevels();
    }
}

// Обновить рейтинг уровня
function updateLevelRating(levelIndex, rating) {
    loadPublishedLevels();
    const publishedLevels = getPublishedLevels();
    if (publishedLevels[levelIndex]) {
        publishedLevels[levelIndex].rating = rating;
        savePublishedLevels();
        displayUserLevelsInTab();
    }
}
