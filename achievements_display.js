// ОТОБРАЖЕНИЕ ДОСТИЖЕНИЙ В КОНЦЕ СТАТИСТИКИ

function getEarnedAchievements() {
    const earned = [];
    
    // Спидраннер - все уровни за 5 минут
    const totalTime = (Date.now() - gameStats.startTime) / 1000;
    if (gameStats.levelsCompleted === 6 && totalTime < 300) {
        earned.push({
            id: 'speedrunner',
            title: '⚡ Спидраннер',
            description: 'Пройти все уровни за 5 минут',
            icon: '⚡'
        });
    }
    
    // Перфекционист - все мясо на всех уровнях
    let allMeatCollected = true;
    for (let i = 1; i <= 6; i++) {
        const level = levels[i];
        const totalMeat = level.objects.filter(obj => obj.type === 'meat').length;
        if (totalMeat > 0 && gameStats.levelStats[i].meatCollected < totalMeat) {
            allMeatCollected = false;
            break;
        }
    }
    if (gameStats.levelsCompleted === 6 && allMeatCollected) {
        earned.push({
            id: 'perfectionist',
            title: '💎 Перфекционист',
            description: 'Собрать все мясо на всех уровнях',
            icon: '💎'
        });
    }
    
    // Эффективный - все уровни с минимумом шагов
    let avgSteps = gameStats.totalSteps / gameStats.levelsCompleted;
    if (gameStats.levelsCompleted === 6 && avgSteps <= 12) {
        earned.push({
            id: 'efficient',
            title: '🎯 Эффективный',
            description: 'Пройти все уровни с минимумом шагов',
            icon: '🎯'
        });
    }
    
    // Мастер - 5 звезд на всех уровнях
    let allFiveStars = true;
    for (let i = 1; i <= 6; i++) {
        if (calculateLevelRating(i) < 5) {
            allFiveStars = false;
            break;
        }
    }
    if (gameStats.levelsCompleted === 6 && allFiveStars) {
        earned.push({
            id: 'master',
            title: '👑 Мастер',
            description: 'Получить 5 звёзд на всех уровнях',
            icon: '👑'
        });
    }
    
    // Строитель - 5 уровней в песочнице
    const sandboxLevels = gameStats.sandboxLevels || [];
    if (sandboxLevels.length >= 5) {
        earned.push({
            id: 'builder',
            title: '🏗️ Строитель',
            description: 'Создать 5 уровней в песочнице',
            icon: '🏗️'
        });
    }
    
    return earned;
}

function displayAchievementsInStats() {
    const earned = getEarnedAchievements();
    
    if (earned.length === 0) {
        return `
            <div style="background: var(--bg-primary); padding: 15px; border-radius: 10px; text-align: center; color: var(--text-secondary);">
                <div style="font-size: 2em; margin-bottom: 10px;">🎯</div>
                <div>Продолжай играть, чтобы получить достижения!</div>
            </div>
        `;
    }
    
    let html = `
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px; margin-top: 20px;">
            <h3 style="color: white; text-align: center; margin-bottom: 15px; font-size: 1.3em;">🏆 Твои достижения:</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px;">
    `;
    
    earned.forEach(achievement => {
        html += `
            <div style="background: rgba(255, 255, 255, 0.1); padding: 15px; border-radius: 8px; text-align: center; color: white; border: 2px solid rgba(255, 255, 255, 0.3);">
                <div style="font-size: 2.5em; margin-bottom: 8px;">${achievement.icon}</div>
                <div style="font-weight: 600; margin-bottom: 5px;">${achievement.title}</div>
                <div style="font-size: 0.85em; opacity: 0.9;">${achievement.description}</div>
            </div>
        `;
    });
    
    html += `
            </div>
        </div>
    `;
    
    return html;
}
