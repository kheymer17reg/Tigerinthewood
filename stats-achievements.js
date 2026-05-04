// 📊 STATS & ACHIEVEMENTS — Statistics tracking, star ratings, achievements

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

function loadGameStats() {
    var saved = localStorage.getItem('gameStats');
    if (saved) {
        gameStats = JSON.parse(saved);
    }
}

function saveGameStats() {
    localStorage.setItem('gameStats', JSON.stringify(gameStats));
}

function startLevelStats(levelNum) {
    if (!gameStats.startTime) gameStats.startTime = Date.now();
    if (!gameStats.levelStats[levelNum]) {
        gameStats.levelStats[levelNum] = {
            completed: false,
            score: 0,
            steps: 0,
            meatCollected: 0,
            time: 0,
            attempts: 0,
            startTime: Date.now()
        };
    } else {
        gameStats.levelStats[levelNum].startTime = Date.now();
    }
    gameStats.levelStats[levelNum].attempts++;
    gameStats.totalAttempts++;
    saveGameStats();
}

function completeLevelStats(levelNum, score, steps, meatCollected) {
    if (!gameStats.levelStats[levelNum]) {
        gameStats.levelStats[levelNum] = { completed: false, score: 0, steps: 0, meatCollected: 0, time: 0, attempts: 1, startTime: Date.now() };
    }
    var ls = gameStats.levelStats[levelNum];
    var elapsed = (Date.now() - (ls.startTime || Date.now())) / 1000;
    ls.completed = true;
    ls.score = Math.max(ls.score, score);
    ls.steps = ls.steps > 0 ? Math.min(ls.steps, steps) : steps;
    ls.meatCollected = Math.max(ls.meatCollected, meatCollected);
    ls.time = ls.time > 0 ? Math.min(ls.time, elapsed) : elapsed;

    gameStats.levelsCompleted = Object.keys(gameStats.levelStats).filter(function(k) {
        return gameStats.levelStats[k].completed;
    }).length;
    gameStats.totalScore = Object.keys(gameStats.levelStats).reduce(function(sum, k) {
        return sum + (gameStats.levelStats[k].score || 0);
    }, 0);
    gameStats.totalSteps = Object.keys(gameStats.levelStats).reduce(function(sum, k) {
        return sum + (gameStats.levelStats[k].steps || 0);
    }, 0);
    gameStats.totalMeatCollected = Object.keys(gameStats.levelStats).reduce(function(sum, k) {
        return sum + (gameStats.levelStats[k].meatCollected || 0);
    }, 0);

    saveGameStats();
}

function calculateLevelRating(levelNum) {
    var ls = gameStats.levelStats[levelNum];
    if (!ls || !ls.completed) return 0;
    var level = levels[levelNum];
    if (!level) return 0;

    var totalMeat = level.objects.filter(function(o) { return o.type === 'meat'; }).length;
    var stars = 1;

    // 2 stars: completed
    stars = 2;

    // 3 stars: all meat collected
    if (totalMeat > 0 && ls.meatCollected >= totalMeat) stars = 3;

    // 4 stars: efficient steps
    if (stars >= 3 && ls.steps <= 15) stars = 4;

    // 5 stars: fast + efficient
    if (stars >= 4 && ls.time <= 30) stars = 5;

    return stars;
}

function getEarnedAchievements() {
    var earned = [];
    var totalTime = gameStats.startTime ? (Date.now() - gameStats.startTime) / 1000 : Infinity;

    // Speedrunner
    if (gameStats.levelsCompleted === 6 && totalTime < 300) {
        earned.push({ id: 'speedrunner', title: '⚡ Спидраннер', description: 'Пройти все уровни за 5 минут', icon: '⚡' });
    }

    // Perfectionist
    var allMeat = true;
    for (var i = 1; i <= 6; i++) {
        if (!levels[i]) continue;
        var totalMeatL = levels[i].objects.filter(function(o) { return o.type === 'meat'; }).length;
        var ls = gameStats.levelStats[i];
        if (totalMeatL > 0 && (!ls || ls.meatCollected < totalMeatL)) { allMeat = false; break; }
    }
    if (gameStats.levelsCompleted === 6 && allMeat) {
        earned.push({ id: 'perfectionist', title: '💎 Перфекционист', description: 'Собрать все мясо на всех уровнях', icon: '💎' });
    }

    // Efficient
    if (gameStats.levelsCompleted === 6 && gameStats.totalSteps / 6 <= 12) {
        earned.push({ id: 'efficient', title: '🎯 Эффективный', description: 'Средний минимум шагов за уровень', icon: '🎯' });
    }

    // Master
    var all5 = true;
    for (var j = 1; j <= 6; j++) {
        if (calculateLevelRating(j) < 5) { all5 = false; break; }
    }
    if (gameStats.levelsCompleted === 6 && all5) {
        earned.push({ id: 'master', title: '👑 Мастер', description: '5 звёзд на всех уровнях', icon: '👑' });
    }

    // Builder
    if ((gameStats.sandboxLevels || []).length >= 5) {
        earned.push({ id: 'builder', title: '🏗️ Строитель', description: 'Создать 5 уровней в песочнице', icon: '🏗️' });
    }

    return earned;
}

function showStats() {
    loadGameStats();
    var content = document.getElementById('stats-content');
    if (!content) return;

    var html = '<div class="stats-grid">' +
        '<div class="stats-card"><div class="value">' + gameStats.levelsCompleted + '/6</div><div class="label">Пройдено</div></div>' +
        '<div class="stats-card"><div class="value">' + gameStats.totalScore + '</div><div class="label">Очки</div></div>' +
        '<div class="stats-card"><div class="value">' + gameStats.totalSteps + '</div><div class="label">Шагов</div></div>' +
        '<div class="stats-card"><div class="value">' + gameStats.totalAttempts + '</div><div class="label">Попыток</div></div>' +
        '</div>';

    html += '<h3 style="margin:20px 0 12px;color:var(--primary);">По уровням</h3>';
    html += '<div class="level-stats-list">';
    for (var i = 1; i <= 6; i++) {
        var ls = gameStats.levelStats[i] || {};
        var stars = calculateLevelRating(i);
        var starsHtml = '';
        for (var s = 0; s < 5; s++) {
            starsHtml += s < stars ? '⭐' : '☆';
        }
        html += '<div class="level-stat-row">' +
            '<div><strong>Уровень ' + i + '</strong>' +
            (ls.completed ? '<span style="color:var(--success);margin-left:8px;">✓</span>' : '') +
            '</div>' +
            '<div style="display:flex;gap:12px;align-items:center;font-size:13px;color:var(--text-secondary);">' +
            '<span>' + (ls.steps || '-') + ' шагов</span>' +
            '<span>' + (ls.time ? Math.round(ls.time) + 'с' : '-') + '</span>' +
            '<span class="stars">' + starsHtml + '</span>' +
            '</div></div>';
    }
    html += '</div>';

    // Achievements
    var achievements = getEarnedAchievements();
    html += '<h3 style="margin:20px 0 12px;color:var(--primary);">🏆 Достижения</h3>';
    if (achievements.length === 0) {
        html += '<div style="text-align:center;padding:20px;color:var(--text-secondary);">Продолжай играть, чтобы получить достижения!</div>';
    } else {
        html += '<div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(140px, 1fr));gap:10px;">';
        achievements.forEach(function(a) {
            html += '<div style="padding:14px;text-align:center;background:var(--bg-glass);border:1px solid var(--border-color);border-radius:var(--radius);">' +
                '<div style="font-size:2em;margin-bottom:4px;">' + a.icon + '</div>' +
                '<div style="font-weight:700;font-size:13px;">' + a.title + '</div>' +
                '<div style="font-size:11px;color:var(--text-secondary);margin-top:2px;">' + a.description + '</div>' +
                '</div>';
        });
        html += '</div>';
    }

    content.innerHTML = html;
}

function showFinalStats() {
    loadGameStats();
    gameStats.endTime = Date.now();
    gameStats.totalTime = (gameStats.endTime - gameStats.startTime) / 1000;
    saveGameStats();
    showStats();
    document.getElementById('stats-modal').classList.add('active');
}
