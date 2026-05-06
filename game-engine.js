// 🎮 GAME ENGINE — Core game state and logic

let game = {
    level: 1,
    tiger: { x: 0, y: 0 },
    score: 0,
    steps: 0,
    meatCollected: 0,
    totalMeat: 0,
    keys: 0,
    objects: [],
    isRunning: false,
    completedLevels: new Set(),
    hasBeenRun: false,
    startPosition: { x: 0, y: 0 },
    moveHistory: [],
    codeHistory: [],
    soundEnabled: true,
    moveSpeed: 300
};

let playerName = 'Гость';
let tigerName = 'Тигра';

// Game mode
let gameMode = {
    type: 'tutorial',
    lives: 3,
    currentLives: 3,
    maxLives: 3
};

function initGameMode() {
    const saved = localStorage.getItem('gameMode');
    if (saved) {
        gameMode = JSON.parse(saved);
    }
    saveGameMode();
}

function saveGameMode() {
    localStorage.setItem('gameMode', JSON.stringify(gameMode));
}

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
    updateGameModeButtons();
}

function loseLive(silent) {
    if (gameMode.type === 'advanced' && gameMode.currentLives > 0) {
        gameMode.currentLives--;
        saveGameMode();
        updateLivesDisplay();
        if (!silent && gameMode.currentLives > 0) {
            showMessage('⚠️ Ошибка!', 'Осталось ' + gameMode.currentLives + (gameMode.currentLives === 1 ? ' попытка' : ' попытки'));
        }
        if (gameMode.currentLives === 0) return true;
    }
    return false;
}

function resetLives() {
    if (gameMode.type === 'advanced') {
        gameMode.currentLives = gameMode.maxLives;
    } else {
        gameMode.currentLives = Infinity;
    }
    saveGameMode();
    updateLivesDisplay();
}

function updateLivesDisplay() {
    const el = document.getElementById('lives-display');
    if (!el) return;
    if (gameMode.type === 'tutorial') {
        el.innerHTML = '∞';
        el.style.color = '#10b981';
    } else {
        let h = '';
        for (let i = 0; i < gameMode.maxLives; i++) {
            h += i < gameMode.currentLives ? '❤️' : '🖤';
        }
        el.innerHTML = h;
        el.style.color = gameMode.currentLives > 1 ? '#10b981' : '#ef4444';
    }
}

function updateGameModeButtons() {
    const tBtn = document.getElementById('mode-tutorial');
    const aBtn = document.getElementById('mode-advanced');
    const desc = document.getElementById('mode-description');
    if (!tBtn || !aBtn) return;
    if (gameMode.type === 'tutorial') {
        tBtn.classList.add('active');
        aBtn.classList.remove('active');
        if (desc) desc.textContent = '📚 Обучающий: бесконечные попытки';
    } else {
        aBtn.classList.add('active');
        tBtn.classList.remove('active');
        if (desc) desc.textContent = '🎯 Продвинутый: 3 жизни за уровень';
    }
}

function getEditedLevelData(levelNum) {
    const edits = JSON.parse(localStorage.getItem('level_edits') || '{}');
    return edits[levelNum] || null;
}

function initGame(resetLivesFlag) {
    if (resetLivesFlag === undefined) resetLivesFlag = true;
    const completedArray = JSON.parse(localStorage.getItem('completedLevels') || '[]');
    game.completedLevels = new Set(completedArray);
    initGameMode();
    if (resetLivesFlag) resetLives();

    const level = levels[game.level];
    if (!level) return;
    game.tiger = { ...level.start };
    game.startPosition = { ...level.start };
    game.score = 0;
    game.steps = 0;
    game.meatCollected = 0;
    game.keys = 0;
    game.objects = level.objects.map(function(o) { return Object.assign({}, o); });
    game.hasBeenRun = false;
    game.moveHistory = [];
    game.totalMeat = game.objects.filter(function(o) { return o.type === 'meat'; }).length;

    const editedData = getEditedLevelData(game.level);
    if (editedData && editedData.objects) {
        game.objects = editedData.objects.map(function(o) { return Object.assign({}, o); });
        game.totalMeat = game.objects.filter(function(o) { return o.type === 'meat'; }).length;
    }

    renderBoard();
    updateStats();
    updateRunButton();
    updateTask();
}

function renderBoard() {
    const grid = document.getElementById('game-grid');
    if (!grid) return;
    grid.innerHTML = '';
    const level = levels[game.level];
    if (!level) return;

    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            const cell = document.createElement('div');
            cell.className = 'cell empty';
            cell.id = 'cell-' + x + '-' + y;

            if (x === game.tiger.x && y === game.tiger.y) {
                cell.className = 'cell tiger';
                cell.textContent = '🐅';
            } else {
                const obj = game.objects.find(function(o) { return o.x === x && o.y === y; });
                const exit = level.exit;

                if (x === exit.x && y === exit.y) {
                    cell.className = 'cell exit';
                    cell.textContent = level.isHome ? '🏠' : '🟢';
                } else if (obj) {
                    if (obj.type === 'door' && obj.locked) {
                        cell.className = 'cell locked-door';
                        cell.textContent = '🚪';
                    } else {
                        cell.className = 'cell ' + obj.type;
                        switch (obj.type) {
                            case 'tree': cell.textContent = '🌳'; break;
                            case 'meat': cell.textContent = '🍖'; break;
                            case 'key': cell.textContent = '🔑'; break;
                            case 'door': cell.textContent = '🚪'; break;
                            case 'wall': cell.textContent = '🧱'; break;
                        }
                    }
                }
            }
            grid.appendChild(cell);
        }
    }
}

function updateStats() {
    var el;
    el = document.getElementById('score'); if (el) el.textContent = game.score;
    el = document.getElementById('steps'); if (el) el.textContent = game.steps;
    el = document.getElementById('meat'); if (el) el.textContent = game.meatCollected + '/' + game.totalMeat;
    el = document.getElementById('keys'); if (el) el.textContent = game.keys;
}

function updateTask() {
    const taskEl = document.getElementById('task-text');
    if (!taskEl) return;
    const level = levels[game.level];
    if (!level) return;
    const editedData = getEditedLevelData(game.level);
    taskEl.innerHTML = editedData ? editedData.task : level.task;
}

function updateRunButton() {
    const runBtn = document.getElementById('run-btn');
    const undoBtn = document.getElementById('undo-btn');
    if (!runBtn) return;
    if (game.hasBeenRun && !game.isRunning) {
        runBtn.disabled = true;
        runBtn.textContent = '▶ НАЖМИ "ВЕРНУТЬ ТИГРА"';
    } else if (game.isRunning) {
        runBtn.disabled = true;
        runBtn.classList.add('running');
        runBtn.textContent = '🐾 ИДЁТ...';
    } else {
        runBtn.disabled = false;
        runBtn.classList.remove('running');
        runBtn.textContent = '▶ ЗАПУСТИТЬ';
    }
    if (undoBtn) {
        const codeInput = document.getElementById('code-input');
        undoBtn.disabled = !codeInput || codeInput.value.length === 0 || game.isRunning;
    }
}

function canMove(dx, dy) {
    const nx = game.tiger.x + dx;
    const ny = game.tiger.y + dy;
    if (nx < 0 || nx >= 8 || ny < 0 || ny >= 8) return false;
    const wall = game.objects.find(function(o) {
        return (o.type === 'wall' || o.type === 'tree') && o.x === nx && o.y === ny;
    });
    if (wall) return false;
    const door = game.objects.find(function(o) {
        return o.type === 'door' && o.x === nx && o.y === ny;
    });
    if (door && door.locked === true) return false;
    return true;
}

function sleep(ms) {
    return new Promise(function(resolve) { setTimeout(resolve, ms); });
}

async function move(dx, dy, count) {
    if (count === undefined) count = 1;
    for (let i = 0; i < count; i++) {
        if (!canMove(dx, dy)) {
            const obj = game.objects.find(function(o) {
                return o.x === game.tiger.x + dx && o.y === game.tiger.y + dy;
            });
            if (obj && obj.type === 'door' && obj.locked) {
                showMessage('Дверь закрыта!', 'Найди ключ и открой дверь командой открыть()');
            } else {
                showMessage('Ой!', 'Не могу пройти! Препятствие на шаге ' + (i + 1) + '.');
            }
            return false;
        }
        playSound('step');
        const oldCell = document.getElementById('cell-' + game.tiger.x + '-' + game.tiger.y);
        const level = levels[game.level];
        if (oldCell && !oldCell.classList.contains('exit')) {
            oldCell.className = 'cell paw';
            oldCell.textContent = '🐾';
        }
        game.tiger.x += dx;
        game.tiger.y += dy;
        game.steps++;
        const newCell = document.getElementById('cell-' + game.tiger.x + '-' + game.tiger.y);
        if (newCell) {
            newCell.className = 'cell tiger tiger-move';
            newCell.textContent = '🐅';
        }
        updateStats();

        if (game.tiger.x === level.exit.x && game.tiger.y === level.exit.y) {
            await sleep(game.moveSpeed);
            checkWin();
            return true;
        }
        await sleep(game.moveSpeed);
    }
    return true;
}

async function eatMeat() {
    const obj = game.objects.find(function(o) {
        return o.type === 'meat' && o.x === game.tiger.x && o.y === game.tiger.y;
    });
    if (obj) {
        game.objects = game.objects.filter(function(o) { return o !== obj; });
        game.meatCollected++;
        game.score += 10;
        playSound('eat');
        updateStats();
        renderBoard();
    } else {
        showMessage('Нет мяса!', 'Здесь нет мяса для еды');
    }
}

async function takeKey() {
    const obj = game.objects.find(function(o) {
        return o.type === 'key' && o.x === game.tiger.x && o.y === game.tiger.y;
    });
    if (obj) {
        game.objects = game.objects.filter(function(o) { return o !== obj; });
        game.keys++;
        game.score += 15;
        playSound('key');
        updateStats();
        renderBoard();
    } else {
        showMessage('Нет ключа!', 'Здесь нет ключа');
    }
}

async function openDoor() {
    if (game.keys <= 0) {
        showMessage('Нет ключей!', 'Сначала подбери ключ командой взять()');
        return;
    }
    const adjacentDoors = game.objects.filter(function(o) {
        return o.type === 'door' && o.locked &&
            Math.abs(o.x - game.tiger.x) + Math.abs(o.y - game.tiger.y) <= 1;
    });
    if (adjacentDoors.length > 0) {
        adjacentDoors.forEach(function(d) { d.locked = false; });
        game.score += 20;
        playSound('door');
        updateStats();
        renderBoard();
    } else {
        showMessage('Нет двери!', 'Рядом нет закрытой двери');
    }
}

function resetTiger() {
    game.isRunning = false;
    game.hasBeenRun = false;
    const level = levels[game.level];
    if (!level) return;
    game.tiger = { ...level.start };
    game.steps = 0;
    game.score = 0;
    game.meatCollected = 0;
    game.keys = 0;
    game.objects = level.objects.map(function(o) { return Object.assign({}, o); });
    game.totalMeat = game.objects.filter(function(o) { return o.type === 'meat'; }).length;
    game.moveHistory = [];

    const editedData = getEditedLevelData(game.level);
    if (editedData && editedData.objects) {
        game.objects = editedData.objects.map(function(o) { return Object.assign({}, o); });
        game.totalMeat = game.objects.filter(function(o) { return o.type === 'meat'; }).length;
    }

    renderBoard();
    updateStats();
    updateRunButton();
}

function createLevelButtons() {
    const container = document.getElementById('level-buttons');
    if (!container) return;
    container.innerHTML = '';
    const totalLevels = Object.keys(levels).length;
    const completedLevels = JSON.parse(localStorage.getItem('completedLevels') || '[]');

    for (let i = 1; i <= totalLevels; i++) {
        const lvlData = levels[i];
        if (!lvlData) continue;
        const btn = document.createElement('button');
        btn.className = 'level-btn' + (i === 1 ? ' active' : '');
        if (completedLevels.includes(i)) btn.classList.add('completed');
        const isAccessible = i === 1 || completedLevels.includes(i - 1);
        if (!isAccessible) {
            btn.disabled = true;
            btn.title = 'Пройди уровень ' + (i - 1) + ', чтобы разблокировать';
        }
        const icon = lvlData.name ? lvlData.name.split(' ')[0] : '🎮';
        btn.innerHTML = '<span class="level-icon">' + icon + '</span><span>Уровень ' + i + '</span>';
        btn.onclick = (function(num) { return function() { loadLevel(num); }; })(i);
        container.appendChild(btn);
    }
}

function updateLevelButtons() {
    const completedLevels = JSON.parse(localStorage.getItem('completedLevels') || '[]');
    document.querySelectorAll('.level-btn').forEach(function(btn, i) {
        const lvl = i + 1;
        if (completedLevels.includes(lvl)) {
            btn.classList.add('completed');
        } else {
            btn.classList.remove('completed');
        }
        const isAccessible = lvl === 1 || completedLevels.includes(lvl - 1);
        btn.disabled = !isAccessible;
        if (!isAccessible) {
            btn.title = 'Пройди уровень ' + (lvl - 1) + ', чтобы разблокировать';
        } else {
            btn.title = '';
        }
    });
}

function loadLevel(levelNum) {
    const completedLevels = JSON.parse(localStorage.getItem('completedLevels') || '[]');
    if (levelNum > 1 && !completedLevels.includes(levelNum - 1)) {
        showMessage('🔒 Уровень недоступен', 'Пройди уровень ' + (levelNum - 1) + ', чтобы разблокировать этот уровень!');
        return;
    }
    updateLevelButtons();
    document.querySelectorAll('.level-btn').forEach(function(btn, i) {
        btn.classList.toggle('active', i + 1 === levelNum);
    });
    game.level = levelNum;
    game.isRunning = false;
    game.hasBeenRun = false;
    const isCompleted = completedLevels.includes(levelNum);
    initGame(!isCompleted);
    updateRunButton();
    var codeInput = document.getElementById('code-input');
    if (codeInput) { codeInput.value = ''; codeInput.classList.remove('error'); }
    if (!isCompleted && typeof showStory === 'function') {
        showStory(levelNum, playerName, tigerName);
    } else if (typeof startLevelStats === 'function') {
        startLevelStats(levelNum);
    }
}

function checkWin() {
    const level = levels[game.level];
    game.completedLevels.add(game.level);
    const completedArray = Array.from(game.completedLevels);
    localStorage.setItem('completedLevels', JSON.stringify(completedArray));
    playSound('levelComplete');

    const meatBonus = (game.meatCollected === game.totalMeat) ? 50 : 0;
    const stepBonus = Math.max(0, 100 - game.steps * 2);
    const totalBonus = meatBonus + stepBonus;
    game.score += totalBonus;
    updateStats();

    if (typeof completeLevelStats === 'function') {
        completeLevelStats(game.level, game.score, game.steps, game.meatCollected);
    }

    const tigerCell = document.getElementById('cell-' + game.tiger.x + '-' + game.tiger.y);
    if (tigerCell) {
        if (level.isHome) {
            tigerCell.classList.add('jump');
            const jumpInterval = setInterval(function() {
                if (tigerCell && tigerCell.classList.contains('jump')) {
                    tigerCell.classList.remove('jump');
                    setTimeout(function() { if (tigerCell) tigerCell.classList.add('jump'); }, 50);
                } else {
                    clearInterval(jumpInterval);
                }
            }, 600);
        } else {
            tigerCell.classList.add('dance');
        }
    }

    createFireworks();

    setTimeout(function() {
        const msg = 'Тигрёнок прошёл уровень!<br><br>🍖 Мяса: ' + game.meatCollected + '/' + game.totalMeat + '<br>🐾 Шагов: ' + game.steps + '<br>⭐ Бонусы: +' + totalBonus + '<br>🏆 Всего: ' + game.score;
        var totalLevels = Object.keys(levels).length;
        if (game.level < totalLevels) {
            showVictoryMessage('Молодец, ' + playerName + '! 🎉', msg, game.level + 1);
        } else {
            showMessage('Молодец, ' + playerName + '! 🎉', msg);
        }
    }, 100);

    updateLevelButtons();

    if (game.completedLevels.size === Object.keys(levels).length) {
        setTimeout(function() {
            if (typeof showFinalStats === 'function') showFinalStats();
        }, 2000);
    }
}

function createFireworks() {
    const container = document.getElementById('fireworks-container');
    if (!container) return;
    container.innerHTML = '';
    const colors = ['#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#3b82f6', '#ec4899'];
    for (let burst = 0; burst < 5; burst++) {
        setTimeout(function() {
            const cx = 100 + Math.random() * (window.innerWidth - 200);
            const cy = 100 + Math.random() * (window.innerHeight - 300);
            for (let p = 0; p < 20; p++) {
                const particle = document.createElement('div');
                particle.style.cssText = 'position:absolute;width:6px;height:6px;border-radius:50%;background:' + colors[Math.floor(Math.random() * colors.length)] + ';left:' + cx + 'px;top:' + cy + 'px;';
                const angle = (Math.PI * 2 * p) / 20;
                const velocity = 2 + Math.random() * 3;
                const tx = Math.cos(angle) * velocity * 50;
                const ty = Math.sin(angle) * velocity * 50;
                particle.animate([
                    { transform: 'translate(0, 0) scale(1)', opacity: 1 },
                    { transform: 'translate(' + tx + 'px, ' + ty + 'px) scale(0)', opacity: 0 }
                ], { duration: 1000, easing: 'ease-out' });
                container.appendChild(particle);
            }
        }, burst * 200);
    }
    setTimeout(function() { if (container) container.innerHTML = ''; }, 3000);
}

function resetGameProgress() {
    localStorage.removeItem('completedLevels');
    localStorage.removeItem('viewedStories');
    localStorage.removeItem('level_edits');
    localStorage.removeItem('gameStats');
    game.completedLevels = new Set();
    if (typeof gameStats !== 'undefined') {
        gameStats = { startTime: null, endTime: null, totalTime: 0, totalScore: 0, levelsCompleted: 0, totalMeatCollected: 0, totalSteps: 0, totalAttempts: 0, achievements: [], levelStats: {}, rating: 0, sandboxLevels: [] };
    }
    createLevelButtons();
    showMessage('✅ Прогресс очищен', 'Все уровни разблокированы заново.');
}

// Keyboard controls
document.addEventListener('keydown', function(event) {
    var codeInput = document.getElementById('code-input');
    if (document.activeElement === codeInput) return;
    var command = null;
    switch (event.key) {
        case 'ArrowUp': command = 'вверх()'; event.preventDefault(); break;
        case 'ArrowDown': command = 'вниз()'; event.preventDefault(); break;
        case 'ArrowLeft': command = 'влево()'; event.preventDefault(); break;
        case 'ArrowRight': command = 'вправо()'; event.preventDefault(); break;
    }
    if (command && typeof addCommand === 'function') addCommand(command);
});

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    initGameMode();
    updateGameModeButtons();
    updateLivesDisplay();
});
