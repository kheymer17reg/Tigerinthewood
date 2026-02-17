// ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
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
let globalAudioContext = null;

const levels = improvedLevels;

function getAudioContext() {
    if (!globalAudioContext) {
        globalAudioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return globalAudioContext;
}

// Функция для получения отредактированных данных уровня
function getEditedLevelData(levelNum) {
    const edits = JSON.parse(localStorage.getItem('level_edits') || '{}');
    return edits[levelNum] || null;
}

function playSound(soundType) {
    if (!game.soundEnabled) return;
    const audioContext = getAudioContext();
    const now = audioContext.currentTime;
    
    switch(soundType) {
        case 'step':
            const osc4 = audioContext.createOscillator();
            const gain4 = audioContext.createGain();
            osc4.connect(gain4);
            gain4.connect(audioContext.destination);
            osc4.type = 'triangle';
            osc4.frequency.value = 800;
            gain4.gain.setValueAtTime(0.08, now);
            gain4.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
            osc4.start(now);
            osc4.stop(now + 0.15);
            break;
        case 'levelComplete':
            const melody = [523, 659, 784, 1047, 784, 659, 523, 659];
            melody.forEach((freq, i) => {
                const osc = audioContext.createOscillator();
                const gain = audioContext.createGain();
                osc.connect(gain);
                gain.connect(audioContext.destination);
                osc.type = 'sine';
                osc.frequency.value = freq;
                gain.gain.setValueAtTime(0.2, now + i * 0.12);
                gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.12 + 0.15);
                osc.start(now + i * 0.12);
                osc.stop(now + i * 0.12 + 0.15);
            });
            break;
    }
}

function changePlayer() {
    // Clear player data
    localStorage.removeItem('currentPlayer');
    localStorage.removeItem('tigerName');
    
    // Reset game progress
    localStorage.removeItem('completedLevels');
    localStorage.removeItem('gameStats');
    
    // Reset game state
    game.completedLevels = new Set();
    gameStats = {
        startTime: null,
        endTime: null,
        totalTime: 0,
        totalScore: 0,
        levelsCompleted: 0,
        totalMeatCollected: 0,
        totalSteps: 0,
        achievements: [],
        levelStats: {},
        rating: 0,
        sandboxLevels: []
    };
    
    // Show welcome modal
    document.getElementById('welcome-modal').classList.add('active');
    const nameInput = document.getElementById('player-name');
    nameInput.value = '';
    nameInput.focus();
    playerName = 'Гость';
    tigerName = 'Тигра';
    document.getElementById('player-info').textContent = `Игрок: Гость`;
}

function startGame() {
    const nameInput = document.getElementById('player-name').value.trim();
    if (nameInput) playerName = nameInput;
    document.getElementById('welcome-modal').classList.remove('active');
    document.getElementById('player-info').textContent = `Игрок: ${playerName}`;
    localStorage.setItem('currentPlayer', playerName);
    
    // Показываем модаль для выбора имени тигрёнка
    document.getElementById('tiger-name-modal').classList.add('active');
    document.getElementById('tiger-name').focus();
}

function confirmTigerName() {
    const tigerNameInput = document.getElementById('tiger-name').value.trim();
    if (tigerNameInput) tigerName = tigerNameInput;
    document.getElementById('tiger-name-modal').classList.remove('active');
    localStorage.setItem('tigerName', tigerName);
    
    // Initialize statistics system
    initStats();
    
    // Проверяем, нужно ли пропустить историю (для админа)
    const storySkipped = sessionStorage.getItem('story_skipped');
    
    if (!storySkipped) {
        // Показываем вводную историю
        showStory('intro', playerName, tigerName);
    }
    
    initGame();
    createLevelButtons();
}

function createLevelButtons() {
    const container = document.getElementById('level-buttons');
    container.innerHTML = '';
    const icons = ['🌱', '🍃', '🌿', '🌳', '🔑', '🏆'];
    const completedLevels = JSON.parse(localStorage.getItem('completedLevels') || '[]');
    
    for (let i = 1; i <= 6; i++) {
        const btn = document.createElement('button');
        btn.className = 'level-btn' + (i === 1 ? ' active' : '');
        
        // Check if level is completed (from localStorage)
        if (completedLevels.includes(i)) {
            btn.classList.add('completed');
        }
        
        // Check if level is accessible
        const isAccessible = i === 1 || completedLevels.includes(i - 1);
        
        if (!isAccessible) {
            btn.style.opacity = '0.5';
            btn.style.cursor = 'not-allowed';
            btn.title = `Пройди уровень ${i - 1}, чтобы разблокировать`;
            btn.disabled = true;
        }
        
        btn.innerHTML = `<span class="level-icon">${icons[i - 1]}</span><span>Уровень ${i}</span>`;
        btn.onclick = () => loadLevel(i);
        container.appendChild(btn);
    }
}

// Обновить статус кнопок уровней
function updateLevelButtons() {
    const completedLevels = JSON.parse(localStorage.getItem('completedLevels') || '[]');
    
    document.querySelectorAll('.level-btn').forEach((btn, i) => {
        const levelIndex = i + 1;
        
        // Update completed status
        if (completedLevels.includes(levelIndex)) {
            btn.classList.add('completed');
        } else {
            btn.classList.remove('completed');
        }
        
        // Update accessibility
        const isAccessible = levelIndex === 1 || completedLevels.includes(levelIndex - 1);
        if (isAccessible) {
            btn.disabled = false;
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';
            btn.title = '';
        } else {
            btn.disabled = true;
            btn.style.opacity = '0.5';
            btn.style.cursor = 'not-allowed';
            btn.title = `Пройди уровень ${levelIndex - 1}, чтобы разблокировать`;
        }
    });
}

function initGame(resetLivesFlag = true) {
    // Load completed levels from localStorage
    const completedArray = JSON.parse(localStorage.getItem('completedLevels') || '[]');
    game.completedLevels = new Set(completedArray);
    
    // Initialize game mode
    initGameMode();
    if (resetLivesFlag) {
        resetLives();
    }
    
    const level = levels[game.level];
    game.tiger = { ...level.start };
    game.startPosition = { ...level.start };
    game.score = 0;
    game.steps = 0;
    game.meatCollected = 0;
    game.keys = 0;
    game.objects = [...level.objects];
    game.hasBeenRun = false;
    game.moveHistory = [];
    game.totalMeat = game.objects.filter(obj => obj.type === 'meat').length;
    
    // Apply edited level data if available
    const editedData = getEditedLevelData(game.level);
    if (editedData && editedData.objects) {
        game.objects = [...editedData.objects];
        game.totalMeat = game.objects.filter(obj => obj.type === 'meat').length;
    }
    
    renderBoard();
    updateStats();
    updateRunButton();
    updateTask();
}

// Функция для очистки прогресса (для тестирования)
function resetGameProgress() {
    localStorage.removeItem('completedLevels');
    localStorage.removeItem('viewedStories');
    localStorage.removeItem('level_edits');
    localStorage.removeItem('gameStats');
    
    game.completedLevels = new Set();
    gameStats = {
        startTime: null,
        endTime: null,
        totalTime: 0,
        totalScore: 0,
        levelsCompleted: 0,
        totalMeatCollected: 0,
        totalSteps: 0,
        achievements: [],
        levelStats: {},
        rating: 0,
        sandboxLevels: []
    };
    
    createLevelButtons();
    alert('✅ Прогресс очищен! Все уровни разблокированы заново.');
}

function renderBoard() {
    const grid = document.getElementById('game-grid');
    grid.innerHTML = '';
    const level = levels[game.level];
    
    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            const cell = document.createElement('div');
            cell.className = 'cell empty';
            cell.id = `cell-${x}-${y}`;
            
            // Сначала проверяем тигра
            if (x === game.tiger.x && y === game.tiger.y) {
                cell.className = 'cell tiger';
                cell.textContent = '🐅';
            } else {
                const obj = game.objects.find(o => o.x === x && o.y === y);
                const exit = level.exit;
                
                if (x === exit.x && y === exit.y) {
                    cell.className = 'cell exit';
                    // На последнем уровне показываем домик вместо выхода
                    if (level.isHome) {
                        cell.textContent = '🏠';
                    } else {
                        cell.textContent = '🟢';
                    }
                } else if (obj) {
                    if (obj.type === 'door' && obj.locked) {
                        cell.className = 'cell locked-door';
                        cell.textContent = '🚪';
                    } else {
                        cell.className = `cell ${obj.type}`;
                        switch (obj.type) {
                            case 'tree': cell.textContent = '🌳'; break;
                            case 'meat': cell.textContent = '🍖'; break;
                            case 'key': cell.textContent = '🔑'; break;
                            case 'door': cell.textContent = '🚪'; break;
                        }
                    }
                }
            }
            grid.appendChild(cell);
        }
    }
}

function updateStats() {
    document.getElementById('score').textContent = game.score;
    document.getElementById('steps').textContent = game.steps;
    document.getElementById('meat').textContent = `${game.meatCollected}/${game.totalMeat}`;
    document.getElementById('keys').textContent = game.keys;
}

function updateTask() {
    const taskElement = document.getElementById('task-text');
    const level = levels[game.level];
    
    // Apply edited level data if available
    const editedData = getEditedLevelData(game.level);
    const taskText = editedData ? editedData.task : level.task;
    
    taskElement.innerHTML = taskText;
}

function updateRunButton() {
    const runBtn = document.getElementById('run-btn');
    const undoBtn = document.getElementById('undo-btn');
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
    undoBtn.disabled = document.getElementById('code-input').value.length === 0 || game.isRunning;
}

function loadLevel(levelNum) {
    // Check if level is accessible
    const completedLevels = JSON.parse(localStorage.getItem('completedLevels') || '[]');
    
    // Level 1 is always accessible, others need previous level completed
    if (levelNum > 1 && !completedLevels.includes(levelNum - 1)) {
        showMessage('🔒 Уровень недоступен', `Пройди уровень ${levelNum - 1}, чтобы разблокировать этот уровень!`);
        return;
    }
    
    // Update level buttons
    updateLevelButtons();
    
    // Mark current level as active
    document.querySelectorAll('.level-btn').forEach((btn, i) => {
        const levelIndex = i + 1;
        btn.classList.toggle('active', levelIndex === levelNum);
    });
    
    game.level = levelNum;
    game.isRunning = false;
    game.hasBeenRun = false;
    
    // Don't reset lives if level is already completed
    const isLevelCompleted = completedLevels.includes(levelNum);
    initGame(!isLevelCompleted);
    updateRunButton();
    document.getElementById('code-input').value = '';
    document.getElementById('code-input').classList.remove('error');
    
    // Показываем историю перед уровнем (только если не пройден)
    if (!isLevelCompleted) {
        showStory(levelNum, playerName, tigerName);
    } else {
        // If level already completed, start stats tracking immediately
        startLevelStats(levelNum);
    }
}

function canMove(dx, dy) {
    const newX = game.tiger.x + dx;
    const newY = game.tiger.y + dy;
    if (newX < 0 || newX >= 8 || newY < 0 || newY >= 8) return false;
    const wall = game.objects.find(o => (o.type === 'wall' || o.type === 'tree') && o.x === newX && o.y === newY);
    if (wall) return false;
    const door = game.objects.find(o => o.type === 'door' && o.x === newX && o.y === newY);
    // Дверь блокирует движение только если она заблокирована
    if (door && door.locked === true) return false;
    return true;
}

async function move(dx, dy, count = 1) {
    for (let i = 0; i < count; i++) {
        if (!canMove(dx, dy)) {
            const obj = game.objects.find(o => o.x === game.tiger.x + dx && o.y === game.tiger.y + dy);
            if (obj && obj.type === 'door' && obj.locked) {
                showMessage('Дверь закрыта!', 'Найди ключ и открой дверь командой открыть()');
            } else {
                showMessage('Ой!', `Не могу пройти! Препятствие на шаге ${i + 1}.`);
            }
            return false;
        }
        playSound('step');
        const oldCell = document.getElementById(`cell-${game.tiger.x}-${game.tiger.y}`);
        const level = levels[game.level];
        if (!oldCell.classList.contains('exit')) {
            oldCell.className = 'cell paw';
            oldCell.textContent = '🐾';
        }
        game.tiger.x += dx;
        game.tiger.y += dy;
        game.steps++;
        const newCell = document.getElementById(`cell-${game.tiger.x}-${game.tiger.y}`);
        newCell.className = 'cell tiger';
        newCell.textContent = '🐅';
        updateStats();
        const exit = level.exit;
        if (game.tiger.x === exit.x && game.tiger.y === exit.y) {
            checkWin();
            return true;
        }
        if (i < count - 1) {
            await sleep(game.moveSpeed);
        }
    }
    return true;
}

function eat() {
    const meatIndex = game.objects.findIndex(o => o.type === 'meat' && o.x === game.tiger.x && o.y === game.tiger.y);
    if (meatIndex !== -1) {
        game.objects.splice(meatIndex, 1);
        game.score += 10;
        game.meatCollected++;
        const cell = document.getElementById(`cell-${game.tiger.x}-${game.tiger.y}`);
        cell.textContent = '🐅';
        updateStats();
        return true;
    }
    showMessage('Э-э-э', 'Здесь нет мяса!');
    return false;
}

function takeKey() {
    const keyIndex = game.objects.findIndex(o => o.type === 'key' && o.x === game.tiger.x && o.y === game.tiger.y);
    if (keyIndex !== -1) {
        game.objects.splice(keyIndex, 1);
        game.keys++;
        const cell = document.getElementById(`cell-${game.tiger.x}-${game.tiger.y}`);
        cell.textContent = '🐅';
        updateStats();
        return true;
    }
    showMessage('Ой', 'Здесь нет ключа!');
    return false;
}

function openDoor() {
    const directions = [{dx: 1, dy: 0}, {dx: -1, dy: 0}, {dx: 0, dy: 1}, {dx: 0, dy: -1}];
    for (const dir of directions) {
        const doorIndex = game.objects.findIndex(o => o.type === 'door' && o.x === game.tiger.x + dir.dx && o.y === game.tiger.y + dir.dy);
        if (doorIndex !== -1) {
            const door = game.objects[doorIndex];
            if (door.locked) {
                if (game.keys > 0) {
                    game.objects[doorIndex].locked = false;
                    game.keys--;
                    const doorCell = document.getElementById(`cell-${game.tiger.x + dir.dx}-${game.tiger.y + dir.dy}`);
                    doorCell.className = 'cell door';
                    doorCell.textContent = '🚪';
                    updateStats();
                    showMessage('Дверь открыта!', 'Теперь можно пройти через дверь!');
                    return true;
                } else {
                    showMessage('Нужен ключ!', 'Возьми ключ сначала! Без ключа дверь не откроется!');
                    return false;
                }
            } else {
                return true;
            }
        }
    }
    showMessage('Рядом нет двери', 'Подойди ближе к двери!');
    return false;
}

// Подсветить текущую строку кода
function highlightCodeLine(lineIndex, lineNumber) {
    const codeInput = document.getElementById('code-input');
    const lines = codeInput.value.split('\n');
    
    // Вычисляем позицию начала строки
    let startPos = 0;
    for (let i = 0; i < lineIndex; i++) {
        startPos += lines[i].length + 1; // +1 для \n
    }
    
    const endPos = startPos + lines[lineIndex].length;
    
    // Создаем визуальный индикатор текущего шага
    const stepIndicator = document.getElementById('current-step-indicator');
    if (stepIndicator) {
        stepIndicator.textContent = `Шаг ${lineNumber}`;
    }
}

// Убрать подсветку
function removeCodeHighlight() {
    const stepIndicator = document.getElementById('current-step-indicator');
    if (stepIndicator) {
        stepIndicator.textContent = '';
    }
}

async function runCode() {
    if (game.isRunning || game.hasBeenRun) return;
    game.isRunning = true;
    game.hasBeenRun = true;
    updateRunButton();
    const code = document.getElementById('code-input').value;
    const codeInput = document.getElementById('code-input');
    codeInput.classList.remove('error');
    
    const lines = code.split('\n');
    let lineNumber = 0;
    
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        if (line === '' || line.startsWith('#')) continue;
        
        // Подсвечиваем текущую строку
        lineNumber++;
        highlightCodeLine(i, lineNumber);
        
        const success = await executeCommand(line);
        if (!success) {
            game.isRunning = false;
            game.hasBeenRun = true;
            codeInput.classList.add('error');
            
            // Проверяем жизни в продвинутом режиме
            if (gameMode.type === 'advanced') {
                const gameOver = loseLive();
                if (gameOver) {
                    showMessage('💀 Игра окончена!', 'Ты потратил все 3 попытки. Уровень перезагружается...');
                    setTimeout(() => {
                        game.hasBeenRun = false;
                        resetGame();
                        loadLevel(game.level);
                    }, 2000);
                } else {
                    setTimeout(() => {
                        game.hasBeenRun = false;
                        resetGame();
                    }, 1500);
                }
            } else {
                showMessage('❌ Ошибка!', 'Попробуй еще раз!');
                setTimeout(() => {
                    game.hasBeenRun = false;
                    resetGame();
                }, 1500);
            }
            
            updateRunButton();
            return;
        }
        await sleep(500);
    }
    
    // Убираем подсветку после завершения
    removeCodeHighlight();
    
    game.isRunning = false;
    updateRunButton();
    const level = levels[game.level];
    const exit = level.exit;
    if (game.tiger.x !== exit.x || game.tiger.y !== exit.y) {
        showMessage('Программа завершена', 'Но тигрёнок ещё не у выхода!');
    }
}

async function executeCommand(line) {
    line = line.trim();
    const withNumber = line.match(/^(вправо|влево|вверх|вниз|шаг|вперед)\s*\(\s*(\d+)\s*\)$/);
    if (withNumber) {
        const command = withNumber[1];
        const count = parseInt(withNumber[2]);
        if (count <= 0) {
            showMessage('Ошибка!', `Число должно быть больше 0: "${line}"`);
            return false;
        }
        switch (command) {
            case 'вправо':
            case 'шаг':
            case 'вперед': return move(1, 0, count);
            case 'влево': return move(-1, 0, count);
            case 'вверх': return move(0, -1, count);
            case 'вниз': return move(0, 1, count);
            default: return false;
        }
    }
    const commandMatch = line.match(/^(вправо|влево|вверх|вниз|есть|взять|открыть|шаг|вперед)\s*\(\s*\)$/);
    if (commandMatch) {
        const cmd = commandMatch[1];
        switch (cmd) {
            case 'вправо':
            case 'шаг':
            case 'вперед': return move(1, 0);
            case 'влево': return move(-1, 0);
            case 'вверх': return move(0, -1);
            case 'вниз': return move(0, 1);
            case 'есть': return eat();
            case 'взять': return takeKey();
            case 'открыть': return openDoor();
            default:
                showMessage('Ошибка синтаксиса', `"${cmd}" — неизвестная команда!`);
                return false;
        }
    }
    const simpleCmd = line.match(/^(вправо|влево|вверх|вниз|есть|взять|открыть|шаг|вперед)$/);
    if (simpleCmd) {
        const cmd = simpleCmd[1];
        switch (cmd) {
            case 'вправо':
            case 'шаг':
            case 'вперед': return move(1, 0);
            case 'влево': return move(-1, 0);
            case 'вверх': return move(0, -1);
            case 'вниз': return move(0, 1);
            case 'есть': return eat();
            case 'взять': return takeKey();
            case 'открыть': return openDoor();
            default:
                showMessage('Ошибка синтаксиса', `"${cmd}" — неизвестная команда!`);
                return false;
        }
    }
    showMessage('Синтаксическая ошибка', `Неверный формат команды: "${line}"`);
    return false;
}

function addCommand(cmd) {
    const editor = document.getElementById('code-input');
    const cursorPos = editor.selectionStart;
    const textBefore = editor.value.substring(0, cursorPos);
    const textAfter = editor.value.substring(cursorPos);
    const prefix = (textBefore.trim() !== '' && !textBefore.endsWith('\n')) ? '\n' : '';
    editor.value = textBefore + prefix + cmd + textAfter;
    const newPos = cursorPos + prefix.length + cmd.length;
    editor.setSelectionRange(newPos, newPos);
    editor.focus();
    editor.classList.remove('error');
    updateRunButton();
}

// Добавить команду со стрелок клавиатуры (без фокуса)
function addCommandFromKeyboard(cmd) {
    const editor = document.getElementById('code-input');
    const textBefore = editor.value;
    const prefix = (textBefore.trim() !== '' && !textBefore.endsWith('\n')) ? '\n' : '';
    editor.value = textBefore + prefix + cmd;
    editor.classList.remove('error');
    updateRunButton();
}

function addNumber(num) {
    const editor = document.getElementById('code-input');
    const cursorPos = editor.selectionStart;
    const textBefore = editor.value.substring(0, cursorPos);
    const textAfter = editor.value.substring(cursorPos);
    const lines = textBefore.split('\n');
    const currentLine = lines[lines.length - 1];
    const commandMatch = currentLine.match(/(вправо|влево|вверх|вниз)\(\)$/);
    if (commandMatch) {
        const command = commandMatch[1];
        const lineStart = textBefore.lastIndexOf('\n') + 1;
        const beforeCommand = textBefore.substring(0, lineStart);
        const newText = beforeCommand + command + '(' + num + ')' + textAfter;
        editor.value = newText;
        editor.setSelectionRange(newText.length - textAfter.length, newText.length - textAfter.length);
    } else {
        editor.value = textBefore + num + textAfter;
        editor.setSelectionRange(cursorPos + 1, cursorPos + 1);
    }
    editor.focus();
    editor.classList.remove('error');
    updateRunButton();
}

function undoCommand() {
    const editor = document.getElementById('code-input');
    if (editor.value.length === 0) return;
    
    // Remove the last command (line)
    const lines = editor.value.split('\n');
    if (lines.length > 0) {
        lines.pop();
        editor.value = lines.join('\n');
    }
    
    editor.focus();
    editor.classList.remove('error');
    updateRunButton();
}

function clearCode() {
    document.getElementById('code-input').value = '';
    document.getElementById('code-input').classList.remove('error');
    updateRunButton();
}

function resetGame() {
    game.isRunning = false;
    game.hasBeenRun = false;
    game.moveHistory = [];
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        if (cell.classList.contains('paw')) {
            cell.className = 'cell empty';
            cell.textContent = '';
        }
    });
    game.tiger = { ...game.startPosition };
    
    // Reinitialize game without resetting lives
    const level = levels[game.level];
    game.score = 0;
    game.steps = 0;
    game.meatCollected = 0;
    game.keys = 0;
    game.objects = [...level.objects];
    game.hasBeenRun = false;
    game.moveHistory = [];
    game.totalMeat = game.objects.filter(obj => obj.type === 'meat').length;
    
    // Apply edited level data if available
    const editedData = getEditedLevelData(game.level);
    if (editedData && editedData.objects) {
        game.objects = [...editedData.objects];
        game.totalMeat = game.objects.filter(obj => obj.type === 'meat').length;
    }
    
    renderBoard();
    updateStats();
    updateRunButton();
    updateTask();
    
    document.getElementById('code-input').classList.remove('error');
}

function createFireworks() {
    let fireworksContainer = document.getElementById('fireworks-container');
    if (!fireworksContainer) {
        fireworksContainer = document.createElement('div');
        fireworksContainer.id = 'fireworks-container';
        fireworksContainer.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 999;';
        document.body.appendChild(fireworksContainer);
    }
    fireworksContainer.innerHTML = '';
    
    const explosions = 8;
    for (let i = 0; i < explosions; i++) {
        setTimeout(() => {
            const x = Math.random() * window.innerWidth;
            const y = Math.random() * window.innerHeight * 0.6;
            const particleCount = 30;
            for (let j = 0; j < particleCount; j++) {
                const particle = document.createElement('div');
                particle.style.cssText = `
                    position: absolute;
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    left: ${x}px;
                    top: ${y}px;
                    pointer-events: none;
                `;
                const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#ff69b4'];
                const color = colors[Math.floor(Math.random() * colors.length)];
                particle.style.backgroundColor = color;
                
                const angle = (Math.PI * 2 * j) / particleCount;
                const velocity = 3 + Math.random() * 5;
                const tx = Math.cos(angle) * velocity * 50;
                const ty = Math.sin(angle) * velocity * 50;
                
                particle.animate([
                    { transform: 'translate(0, 0) scale(1)', opacity: 1 },
                    { transform: `translate(${tx}px, ${ty}px) scale(0)`, opacity: 0 }
                ], {
                    duration: 1000,
                    easing: 'ease-out'
                });
                
                fireworksContainer.appendChild(particle);
            }
        }, i * 200);
    }
    
    setTimeout(() => {
        if (fireworksContainer) {
            fireworksContainer.innerHTML = '';
        }
    }, 3000);
}

function checkWin() {
    const level = levels[game.level];
    game.completedLevels.add(game.level);
    
    // Save completed levels to localStorage
    const completedArray = Array.from(game.completedLevels);
    localStorage.setItem('completedLevels', JSON.stringify(completedArray));
    
    playSound('levelComplete');
    const meatBonus = (game.meatCollected === game.totalMeat) ? 50 : 0;
    const stepBonus = Math.max(0, 100 - game.steps * 2);
    const totalBonus = meatBonus + stepBonus;
    game.score += totalBonus;
    updateStats();
    
    // Record level completion in statistics
    completeLevelStats(game.level, game.score, game.steps, game.meatCollected);
    
    const tigerCell = document.getElementById(`cell-${game.tiger.x}-${game.tiger.y}`);
    if (tigerCell) {
        // На последнем уровне - постоянный прыжок, на остальных - танец
        if (level.isHome) {
            tigerCell.classList.add('jump');
            // Повторяем прыжок каждые 0.6 секунды
            const jumpInterval = setInterval(() => {
                if (tigerCell && tigerCell.classList.contains('jump')) {
                    tigerCell.classList.remove('jump');
                    setTimeout(() => {
                        if (tigerCell) tigerCell.classList.add('jump');
                    }, 50);
                } else {
                    clearInterval(jumpInterval);
                }
            }, 600);
        } else {
            tigerCell.classList.add('dance');
        }
    }
    
    // Фейерверк при победе
    createFireworks();
    
    setTimeout(() => {
        const messageText = `Тигрёнок прошёл уровень!<br><br>🍖 Мяса: ${game.meatCollected}/${game.totalMeat}<br>🐾 Шагов: ${game.steps}<br>⭐ Бонусы: +${totalBonus}<br>🏆 Всего: ${game.score}`;
        
        // Show victory message with next level button if not last level
        if (game.level < 6) {
            showVictoryMessage(`Молодец, ${playerName}! 🎉`, messageText, game.level + 1);
        } else {
            showMessage(`Молодец, ${playerName}! 🎉`, messageText);
        }
    }, 100);
    document.querySelectorAll('.level-btn').forEach((btn, i) => {
        const levelIndex = i + 1;
        const completedLevels = JSON.parse(localStorage.getItem('completedLevels') || '[]');
        
        // Mark as completed
        if (completedLevels.includes(levelIndex)) {
            btn.classList.add('completed');
        }
        
        // Update accessibility
        const isAccessible = levelIndex === 1 || completedLevels.includes(levelIndex - 1);
        if (isAccessible) {
            btn.disabled = false;
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';
            btn.title = '';
        } else {
            btn.disabled = true;
            btn.style.opacity = '0.5';
            btn.style.cursor = 'not-allowed';
            btn.title = `Пройди уровень ${levelIndex - 1}, чтобы разблокировать`;
        }
    });
    
    // Проверяем, прошел ли все уровни
    if (game.completedLevels.size === 6) {
        setTimeout(() => {
            // Show final statistics before ending story
            showFinalStats();
        }, 2000);
    }
}

function showMessage(title, text) {
    const modal = document.getElementById('message-modal');
    document.getElementById('msg-title').textContent = title;
    document.getElementById('msg-text').innerHTML = text.replace(/\n/g, '<br>');
    
    // Clean up any extra buttons from previous messages
    const okBtn = document.querySelector('.ok-btn');
    const nextBtn = okBtn.nextElementSibling;
    if (nextBtn && nextBtn.textContent.includes('Следующий')) {
        nextBtn.remove();
    }
    
    // Restore original button state
    okBtn.style.display = 'block';
    okBtn.onclick = function() { closeMessage(); };
    okBtn.textContent = 'Понятно!';
    
    modal.classList.add('active');
}

function showVictoryMessage(title, text, nextLevel) {
    const modal = document.getElementById('message-modal');
    document.getElementById('msg-title').textContent = title;
    document.getElementById('msg-text').innerHTML = text.replace(/\n/g, '<br>');
    
    // Create button container
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = 'display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;';
    
    const okBtn = document.querySelector('.ok-btn');
    const nextBtn = document.createElement('button');
    nextBtn.style.cssText = 'padding: 12px 30px; background: var(--success-color); color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.3s;';
    nextBtn.textContent = '➜ Следующий уровень';
    nextBtn.onclick = function() {
        closeMessage();
        updateLevelButtons(); // Update buttons before loading next level
        loadLevel(nextLevel);
    };
    
    // Hide original button and show next button
    okBtn.style.display = 'none';
    okBtn.parentNode.insertBefore(nextBtn, okBtn.nextSibling);
    
    modal.classList.add('active');
}

function closeMessage() {
    const modal = document.getElementById('message-modal');
    const okBtn = document.querySelector('.ok-btn');
    
    // Remove any extra buttons that were added
    const nextBtn = okBtn.nextElementSibling;
    if (nextBtn && nextBtn.textContent.includes('Следующий')) {
        nextBtn.remove();
    }
    
    // Restore original button
    okBtn.style.display = 'block';
    okBtn.onclick = function() { closeMessage(); };
    okBtn.textContent = 'Понятно!';
    
    modal.classList.remove('active');
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
}

function toggleSound() {
    game.soundEnabled = !game.soundEnabled;
    const btn = document.getElementById('sound-btn');
    btn.textContent = game.soundEnabled ? '🔊 Звук' : '🔇 Без звука';
    localStorage.setItem('soundEnabled', game.soundEnabled);
}

function changeSpeed(speed) {
    game.moveSpeed = parseInt(speed);
    localStorage.setItem('moveSpeed', game.moveSpeed);
}

function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(tabName).classList.add('active');
    document.querySelector(`.tab-btn[onclick="switchTab('${tabName}')"]`).classList.add('active');
    
    // Отобразить уровни пользователей при переключении на вкладку
    if (tabName === 'userlevels') {
        displayUserLevelsInTab();
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}



window.onload = function() {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
    }
    const soundEnabled = localStorage.getItem('soundEnabled');
    if (soundEnabled === 'false') {
        game.soundEnabled = false;
        document.getElementById('sound-btn').textContent = '🔇 Без звука';
    }
    const moveSpeed = localStorage.getItem('moveSpeed');
    if (moveSpeed) {
        game.moveSpeed = parseInt(moveSpeed);
        document.getElementById('speed-select').value = moveSpeed;
    }
    const savedPlayerName = localStorage.getItem('currentPlayer');
    const nameInput = document.getElementById('player-name');
    if (savedPlayerName) {
        playerName = savedPlayerName;
        nameInput.value = savedPlayerName;
        document.getElementById('player-info').textContent = `Игрок: ${playerName}`;
        setTimeout(() => {
            document.getElementById('welcome-modal').classList.remove('active');
            showStory('intro', playerName);
            initGame();
            createLevelButtons();
        }, 500);
    } else {
        nameInput.focus();
        nameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') startGame();
        });
    }
};


// ПЕСОЧНИЦА
let sandbox = {
    selectedObject: 'tiger',
    objects: [],
    tigerPos: { x: 0, y: 0 },
    exitPos: { x: 7, y: 7 },
    isDrawing: false,
    lastCell: null,
    gridSize: 8,
    cellSize: 60
};

function initSandbox() {
    const grid = document.getElementById('sandbox-grid');
    grid.innerHTML = '';
    grid.style.gridTemplateColumns = `repeat(${sandbox.gridSize}, ${sandbox.cellSize}px)`;
    grid.style.gridTemplateRows = `repeat(${sandbox.gridSize}, ${sandbox.cellSize}px)`;
    
    let isMouseDown = false;
    grid.addEventListener('mousedown', function(e) {
        isMouseDown = true;
        sandbox.isDrawing = true;
        const cell = e.target.closest('.sandbox-cell');
        if (cell) handleSandboxClick(cell);
    });
    grid.addEventListener('mousemove', function(e) {
        if (isMouseDown && sandbox.isDrawing) {
            const cell = e.target.closest('.sandbox-cell');
            if (cell) handleSandboxClick(cell);
        }
    });
    document.addEventListener('mouseup', function() {
        isMouseDown = false;
        sandbox.isDrawing = false;
        sandbox.lastCell = null;
    });
    
    for (let y = 0; y < sandbox.gridSize; y++) {
        for (let x = 0; x < sandbox.gridSize; x++) {
            const cell = document.createElement('div');
            cell.className = 'sandbox-cell empty';
            cell.dataset.x = x;
            cell.dataset.y = y;
            cell.style.width = `${sandbox.cellSize}px`;
            cell.style.height = `${sandbox.cellSize}px`;
            cell.addEventListener('click', function(e) {
                if (!sandbox.isDrawing) {
                    const x = parseInt(this.dataset.x);
                    const y = parseInt(this.dataset.y);
                    placeSandboxObject(x, y);
                }
            });
            grid.appendChild(cell);
        }
    }
    updateSandbox();
}

function handleSandboxClick(cell) {
    const x = parseInt(cell.dataset.x);
    const y = parseInt(cell.dataset.y);
    placeSandboxObject(x, y);
}

function setSandboxSize(size) {
    sandbox.gridSize = size;
    if (size <= 6) {
        sandbox.cellSize = 70;
    } else if (size <= 10) {
        sandbox.cellSize = 50;
    } else {
        sandbox.cellSize = 40;
    }
    document.querySelectorAll('.size-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    sandbox.tigerPos = {x: 0, y: 0};
    sandbox.exitPos = {x: size-1, y: size-1};
    sandbox.objects = [];
    initSandbox();
}

function selectSandboxObject(objectType) {
    sandbox.selectedObject = objectType;
    sandbox.isDrawing = false;
    document.querySelectorAll('.obj-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.closest('.obj-btn').classList.add('active');
}

function placeSandboxObject(x, y) {
    if (sandbox.selectedObject === 'tiger') {
        sandbox.tigerPos = {x, y};
    } else if (sandbox.selectedObject === 'exit') {
        sandbox.exitPos = {x, y};
    } else if (sandbox.selectedObject === 'empty') {
        sandbox.objects = sandbox.objects.filter(obj => !(obj.x === x && obj.y === y));
        if (sandbox.tigerPos.x === x && sandbox.tigerPos.y === y) {
            sandbox.tigerPos = {x: 0, y: 0};
        }
        if (sandbox.exitPos.x === x && sandbox.exitPos.y === y) {
            sandbox.exitPos = {x: sandbox.gridSize-1, y: sandbox.gridSize-1};
        }
    } else if (sandbox.selectedObject !== 'tiger' && sandbox.selectedObject !== 'exit') {
        if ((sandbox.tigerPos.x === x && sandbox.tigerPos.y === y) || (sandbox.exitPos.x === x && sandbox.exitPos.y === y)) {
            return;
        }
        const existingIndex = sandbox.objects.findIndex(obj => obj.x === x && obj.y === y);
        if (existingIndex !== -1) {
            sandbox.objects[existingIndex].type = sandbox.selectedObject;
        } else {
            sandbox.objects.push({type: sandbox.selectedObject, x: x, y: y});
        }
    }
    updateSandbox();
}

function updateSandbox() {
    const cells = document.querySelectorAll('.sandbox-cell');
    cells.forEach(cell => {
        const x = parseInt(cell.dataset.x);
        const y = parseInt(cell.dataset.y);
        cell.className = 'sandbox-cell empty';
        cell.textContent = '';
        cell.style.background = '';
        cell.style.borderColor = '';
        cell.style.fontSize = '';
        
        if (sandbox.tigerPos.x === x && sandbox.tigerPos.y === y) {
            cell.textContent = '🐅';
            cell.style.fontSize = `${sandbox.cellSize * 0.7}px`;
            cell.style.background = '#ff9800';
            cell.style.borderColor = '#f57c00';
        } else if (sandbox.exitPos.x === x && sandbox.exitPos.y === y) {
            cell.textContent = '🟢';
            cell.style.background = '#4caf50';
            cell.style.borderColor = '#388e3c';
        } else {
            const obj = sandbox.objects.find(o => o.x === x && o.y === y);
            if (obj) {
                switch(obj.type) {
                    case 'wall': cell.textContent = '🧱'; cell.style.background = '#2e7d32'; cell.style.borderColor = '#1b5e20'; break;
                    case 'tree': cell.textContent = '🌳'; cell.style.background = '#388e3c'; cell.style.borderColor = '#2e7d32'; break;
                    case 'meat': cell.textContent = '🍖'; cell.style.background = '#ffb74d'; cell.style.borderColor = '#ffa726'; break;
                    case 'key': cell.textContent = '🔑'; cell.style.background = '#ffd54f'; cell.style.borderColor = '#ffca28'; break;
                    case 'door': cell.textContent = '🚪'; cell.style.background = '#ba68c8'; cell.style.borderColor = '#ab47bc'; break;
                }
            } else {
                cell.style.background = '';
                cell.style.borderColor = '';
            }
        }
    });
}

function clearSandbox() {
    if (confirm('Очистить конструктор? Все несохраненные изменения будут потеряны.')) {
        sandbox.objects = [];
        sandbox.tigerPos = {x: 0, y: 0};
        sandbox.exitPos = {x: sandbox.gridSize-1, y: sandbox.gridSize-1};
        sandbox.selectedObject = 'tiger';
        updateSandbox();
        document.querySelectorAll('.obj-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector('.obj-btn[onclick="selectSandboxObject(\'tiger\')"]').classList.add('active');
        showMessage('✅ Конструктор очищен', 'Панель очищена. Теперь ты можешь создать новый уровень!');
    }
}

function playSandboxLevel() {
    if (sandbox.tigerPos.x === sandbox.exitPos.x && sandbox.tigerPos.y === sandbox.exitPos.y) {
        showMessage('❌ Ошибка', 'Тигрёнок и выход не могут находиться в одной клетке!');
        return;
    }
    
    const tigerOnObject = sandbox.objects.find(obj => obj.x === sandbox.tigerPos.x && obj.y === sandbox.tigerPos.y);
    if (tigerOnObject) {
        showMessage('❌ Ошибка', 'Тигрёнок не может находиться на объекте!');
        return;
    }
    
    const exitOnObject = sandbox.objects.find(obj => obj.x === sandbox.exitPos.x && obj.y === sandbox.exitPos.y);
    if (exitOnObject) {
        showMessage('❌ Ошибка', 'Выход не может находиться на объекте!');
        return;
    }
    
    const levelData = {
        name: 'Конструктор',
        start: sandbox.tigerPos,
        exit: sandbox.exitPos,
        objects: [...sandbox.objects],
        task: 'Уровень создан в конструкторе!',
        gridSize: sandbox.gridSize
    };
    
    switchTab('levels');
    game.level = 0;
    game.isRunning = false;
    game.hasBeenRun = false;
    
    // Временно переопределяем уровень
    levels[0] = levelData;
    game.level = 0;
    
    initGame();
    updateRunButton();
    document.getElementById('code-input').value = '';
    showMessage('✅ Уровень запущен!', 'Теперь напиши программу для тигрёнка и нажми "ЗАПУСТИТЬ".');
}

function downloadSandboxLevel() {
    const levelName = prompt('Назови свой уровень:', 'Мой уровень') || 'Мой уровень';
    const levelData = {
        name: levelName,
        start: sandbox.tigerPos,
        exit: sandbox.exitPos,
        objects: [...sandbox.objects],
        gridSize: sandbox.gridSize,
        isSandboxLevel: true,
        savedAt: new Date().toISOString()
    };
    
    try {
        // Сохранить в систему рейтинга
        const savedLevel = saveSandboxLevel(levelName, levelData);
        
        // Добавить в опубликованные уровни
        loadPublishedLevels();
        const publishedLevels = getPublishedLevels();
        const publishedLevel = {
            id: savedLevel.id,
            name: levelName,
            description: 'Уровень из песочницы',
            data: levelData,
            rating: 0,
            plays: 0,
            downloads: 0,
            publishedBy: 'Я',
            publishedAt: new Date().toLocaleString('ru-RU'),
            difficulty: 'Средняя'
        };
        publishedLevels.push(publishedLevel);
        savePublishedLevels();
        
        const blob = new Blob([JSON.stringify(levelData, null, 2)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `уровень_${levelName.replace(/\s+/g, '_')}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showMessage('✅ Уровень скачан!', `Файл "${a.download}" сохранен и добавлен в рейтинг!`);
        
        // Обновить отображение уровней пользователей
        displayUserLevelsInTab();
    } catch (e) {
        showMessage('❌ Ошибка', 'Не удалось скачать файл. Попробуй еще раз.');
    }
}

function uploadSandboxLevel() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const levelData = JSON.parse(event.target.result);
                
                if (!levelData.start || !levelData.exit || !levelData.objects || !levelData.gridSize) {
                    showMessage('❌ Ошибка', 'Неверный формат файла уровня!');
                    return;
                }
                
                sandbox.gridSize = levelData.gridSize;
                if (sandbox.gridSize <= 6) {
                    sandbox.cellSize = 70;
                } else if (sandbox.gridSize <= 10) {
                    sandbox.cellSize = 50;
                } else {
                    sandbox.cellSize = 40;
                }
                
                sandbox.tigerPos = levelData.start;
                sandbox.exitPos = levelData.exit;
                sandbox.objects = levelData.objects || [];
                
                // Если это опубликованный уровень, увеличить счетчик скачиваний
                if (levelData.id !== undefined) {
                    incrementDownloadCount(levelData.id);
                    displayUserLevelsInTab();
                }
                
                document.querySelectorAll('.size-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                document.querySelector(`.size-btn[onclick="setSandboxSize(${sandbox.gridSize})"]`).classList.add('active');
                
                initSandbox();
                showMessage('✅ Уровень загружен!', `Уровень "${levelData.name || 'Без названия'}" успешно загружен!`);
            } catch (e) {
                showMessage('❌ Ошибка при загрузке', `Не удалось загрузить файл:\n\n${e.message}`);
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

// Инициализация песочницы при загрузке
window.addEventListener('load', function() {
    initSandbox();
});


// TUTORIAL FUNCTIONS
let tutorialTigerPos = { x: 3, y: 4 };
let tutorialAnimationRunning = false;

function showTutorialDemo(command) {
    // Prevent multiple clicks
    if (tutorialAnimationRunning) return;
    tutorialAnimationRunning = true;
    
    const demoDiv = document.getElementById('tutorial-demo');
    const gridDiv = document.getElementById('tutorial-grid');
    const textDiv = document.getElementById('tutorial-text');
    const infoDiv = document.getElementById('tutorial-info');
    
    // Reset tiger position
    tutorialTigerPos = { x: 3, y: 4 };
    
    // Show demo
    demoDiv.style.display = 'block';
    gridDiv.innerHTML = '';
    textDiv.textContent = '';
    infoDiv.innerHTML = '';
    
    // Create grid based on command
    createTutorialGrid(command, gridDiv);
    
    // Animate based on command
    setTimeout(() => {
        animateTutorialCommand(command, gridDiv, textDiv);
    }, 300);
}

function createTutorialGrid(command, gridDiv) {
    // Determine which objects to show
    let objectsToShow = {};
    
    switch(command) {
        case 'right':
        case 'left':
        case 'up':
        case 'down':
        case 'number':
            // Movement - show only tiger, no exit
            break;
        case 'eat':
            objectsToShow.meat = true;
            break;
        case 'take':
            objectsToShow.key = true;
            break;
        case 'open':
            objectsToShow.door = true;
            break;
    }
    
    // Create grid
    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            const cell = document.createElement('div');
            cell.id = `tutorial-cell-${x}-${y}`;
            cell.style.cssText = `
                width: 50px;
                height: 50px;
                border-radius: 6px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 32px;
                background: #f0f0f0;
                border: 1px solid #ddd;
            `;
            
            if (x === tutorialTigerPos.x && y === tutorialTigerPos.y) {
                cell.textContent = '🐅';
                cell.style.background = '#ff9800';
                cell.style.fontSize = '40px';
            } else if (objectsToShow.meat && x === 3 && y === 4) {
                cell.textContent = '🍖';
                cell.style.background = '#ffb74d';
            } else if (objectsToShow.key && x === 3 && y === 4) {
                cell.textContent = '🔑';
                cell.style.background = '#ffd54f';
            } else if (objectsToShow.door && x === 4 && y === 4) {
                cell.textContent = '🚪';
                cell.style.background = '#ba68c8';
            }
            
            gridDiv.appendChild(cell);
        }
    }
}

function animateTutorialCommand(command, gridDiv, textDiv) {
    const infoDiv = document.getElementById('tutorial-info');
    
    switch(command) {
        case 'right':
            textDiv.textContent = '→ вправо() - Тигрёнок движется вправо на 1 клетку';
            infoDiv.innerHTML = '💡 Используй эту команду, чтобы двигать тигрёнка вправо. Можешь использовать несколько раз!';
            animateTigerMove(1, 0, gridDiv, () => { tutorialAnimationRunning = false; });
            break;
        case 'left':
            textDiv.textContent = '← влево() - Тигрёнок движется влево на 1 клетку';
            infoDiv.innerHTML = '💡 Используй эту команду, чтобы двигать тигрёнка влево. Помогает обходить препятствия!';
            animateTigerMove(-1, 0, gridDiv, () => { tutorialAnimationRunning = false; });
            break;
        case 'up':
            textDiv.textContent = '↑ вверх() - Тигрёнок движется вверх на 1 клетку';
            infoDiv.innerHTML = '💡 Используй эту команду, чтобы двигать тигрёнка вверх. Очень полезна для навигации!';
            animateTigerMove(0, -1, gridDiv, () => { tutorialAnimationRunning = false; });
            break;
        case 'down':
            textDiv.textContent = '↓ вниз() - Тигрёнок движется вниз на 1 клетку';
            infoDiv.innerHTML = '💡 Используй эту команду, чтобы двигать тигрёнка вниз. Комбинируй с другими командами!';
            animateTigerMove(0, 1, gridDiv, () => { tutorialAnimationRunning = false; });
            break;
        case 'eat':
            textDiv.textContent = '🍖 есть() - Тигрёнок съедает мясо! +10 очков';
            infoDiv.innerHTML = '⚠️ Важно: Тигрёнок должен СТОЯТЬ на мясе, чтобы его съесть! Сначала подойди к мясу, потом используй эту команду.';
            showTutorialEat(gridDiv, () => { tutorialAnimationRunning = false; });
            break;
        case 'take':
            textDiv.textContent = '🔑 взять() - Тигрёнок берёт ключ!';
            infoDiv.innerHTML = '⚠️ Важно: Тигрёнок должен СТОЯТЬ на ключе, чтобы его взять! Сначала подойди к ключу, потом используй эту команду.';
            showTutorialTake(gridDiv, () => { tutorialAnimationRunning = false; });
            break;
        case 'open':
            textDiv.textContent = '🚪 открыть() - Тигрёнок открывает дверь перед собой!';
            infoDiv.innerHTML = '💡 Тигрёнок открывает дверь, которая находится ПЕРЕД ним (в направлении, куда он смотрит). Нужен ключ!';
            showTutorialOpen(gridDiv, () => { tutorialAnimationRunning = false; });
            break;
        case 'number':
            textDiv.textContent = '3️⃣ вправо(3) - Тигрёнок движется вправо на 3 клетки';
            infoDiv.innerHTML = '💡 Используй число, чтобы повторить команду несколько раз! Например: вправо(3) = вправо() + вправо() + вправо()';
            animateTigerMove(3, 0, gridDiv, () => { tutorialAnimationRunning = false; });
            break;
    }
}

function animateTigerMove(dx, dy, gridDiv, callback) {
    const steps = Math.abs(dx) > 0 ? Math.abs(dx) : Math.abs(dy);
    let currentStep = 0;
    
    const moveInterval = setInterval(() => {
        if (currentStep >= steps) {
            clearInterval(moveInterval);
            callback();
            return;
        }
        
        // Clear previous tiger
        const prevCell = document.getElementById(`tutorial-cell-${tutorialTigerPos.x}-${tutorialTigerPos.y}`);
        if (prevCell && prevCell.textContent === '🐅') {
            prevCell.textContent = '';
            prevCell.style.background = '#f0f0f0';
        }
        
        // Move tiger
        tutorialTigerPos.x += Math.sign(dx);
        tutorialTigerPos.y += Math.sign(dy);
        
        // Draw tiger at new position
        const newCell = document.getElementById(`tutorial-cell-${tutorialTigerPos.x}-${tutorialTigerPos.y}`);
        if (newCell) {
            newCell.textContent = '🐅';
            newCell.style.background = '#ff9800';
            newCell.style.fontSize = '40px';
            newCell.classList.add('tutorial-tiger');
        }
        
        currentStep++;
    }, 400);
}

function showTutorialEat(gridDiv, callback) {
    // Tiger eats meat at his current position (3, 4)
    const meatX = 3;
    const meatY = 4;
    
    // Clear grid and redraw
    const cells = gridDiv.querySelectorAll('div');
    cells.forEach(cell => {
        cell.textContent = '';
        cell.style.background = '#f0f0f0';
    });
    
    // Redraw tiger and meat TOGETHER first
    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            const cell = document.getElementById(`tutorial-cell-${x}-${y}`);
            if (x === meatX && y === meatY) {
                // Show meat first
                cell.textContent = '🍖';
                cell.style.background = '#ffb74d';
                cell.style.fontSize = '32px';
            }
        }
    }
    
    // Animate eating - meat disappears, tiger appears
    setTimeout(() => {
        const meatCell = document.getElementById(`tutorial-cell-${meatX}-${meatY}`);
        if (meatCell) {
            meatCell.textContent = '🐅';
            meatCell.style.background = '#ff9800';
            meatCell.style.fontSize = '40px';
        }
        callback();
    }, 500);
}

function showTutorialTake(gridDiv, callback) {
    // Tiger takes key at his current position (3, 4)
    const keyX = 3;
    const keyY = 4;
    
    // Clear grid and redraw
    const cells = gridDiv.querySelectorAll('div');
    cells.forEach(cell => {
        cell.textContent = '';
        cell.style.background = '#f0f0f0';
    });
    
    // Redraw tiger and key TOGETHER first
    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            const cell = document.getElementById(`tutorial-cell-${x}-${y}`);
            if (x === keyX && y === keyY) {
                // Show key first
                cell.textContent = '🔑';
                cell.style.background = '#ffd54f';
                cell.style.fontSize = '32px';
            }
        }
    }
    
    // Animate taking key - key disappears, tiger appears
    setTimeout(() => {
        const keyCell = document.getElementById(`tutorial-cell-${keyX}-${keyY}`);
        if (keyCell) {
            keyCell.textContent = '🐅';
            keyCell.style.background = '#ff9800';
            keyCell.style.fontSize = '40px';
        }
        callback();
    }, 500);
}

function showTutorialOpen(gridDiv, callback) {
    // Tiger opens door - tiger is before door (at 3, 4), door is at (4, 4)
    const tigerX = 3;
    const tigerY = 4;
    const doorX = 4;
    const doorY = 4;
    
    // Clear grid and redraw
    const cells = gridDiv.querySelectorAll('div');
    cells.forEach(cell => {
        cell.textContent = '';
        cell.style.background = '#f0f0f0';
    });
    
    // Redraw tiger and door
    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            const cell = document.getElementById(`tutorial-cell-${x}-${y}`);
            if (x === tigerX && y === tigerY) {
                cell.textContent = '🐅';
                cell.style.background = '#ff9800';
                cell.style.fontSize = '40px';
            } else if (x === doorX && y === doorY) {
                cell.textContent = '🚪';
                cell.style.background = '#ba68c8';
            }
        }
    }
    
    // Animate opening door - door disappears, tiger stays
    setTimeout(() => {
        const doorCell = document.getElementById(`tutorial-cell-${doorX}-${doorY}`);
        if (doorCell) {
            doorCell.textContent = '';
            doorCell.style.background = '#f0f0f0';
        }
        callback();
    }, 500);
}

function closeTutorial() {
    document.getElementById('tutorial-modal').classList.remove('active');
    document.getElementById('tutorial-demo').style.display = 'none';
    tutorialAnimationRunning = false;
    
    // Start the game
    initGame();
    createLevelButtons();
}

// Story selection functions
function showStorySelection() {
    document.getElementById('story-selection-modal').classList.add('active');
    updateStoryButtonStates();
}

function closeStorySelection() {
    document.getElementById('story-selection-modal').classList.remove('active');
}

function updateStoryButtonStates() {
    // Get completed levels from localStorage
    const completedLevels = JSON.parse(localStorage.getItem('completedLevels') || '[]');
    
    // Intro is always available
    const introBtn = document.getElementById('story-btn-intro');
    if (introBtn) {
        introBtn.disabled = false;
        introBtn.style.opacity = '1';
        introBtn.style.cursor = 'pointer';
    }
    
    // Tutorial is always available
    const tutorialBtn = document.getElementById('story-btn-tutorial');
    if (tutorialBtn) {
        tutorialBtn.disabled = false;
        tutorialBtn.style.opacity = '1';
        tutorialBtn.style.cursor = 'pointer';
    }
    
    // Level buttons - unlock based on completed levels
    for (let i = 1; i <= 6; i++) {
        const btn = document.getElementById(`story-btn-level${i}`);
        if (btn) {
            // Level is available if previous level is completed (or if it's level 1 and intro is done)
            const isAvailable = i === 1 || completedLevels.includes(i - 1);
            btn.disabled = !isAvailable;
            btn.style.opacity = isAvailable ? '1' : '0.5';
            btn.style.cursor = isAvailable ? 'pointer' : 'not-allowed';
            
            if (!isAvailable) {
                btn.title = `Пройди уровень ${i - 1}, чтобы разблокировать`;
            }
        }
    }
    
    // Ending is available only if all levels are completed
    const endingBtn = document.getElementById('story-btn-ending');
    if (endingBtn) {
        const isAvailable = completedLevels.length === 6;
        endingBtn.disabled = !isAvailable;
        endingBtn.style.opacity = isAvailable ? '1' : '0.5';
        endingBtn.style.cursor = isAvailable ? 'pointer' : 'not-allowed';
        
        if (!isAvailable) {
            endingBtn.title = 'Пройди все 6 уровней, чтобы разблокировать';
        }
    }
}

function showStorySelectionDetail(storyKey) {
    // Check if story is available
    const completedLevels = JSON.parse(localStorage.getItem('completedLevels') || '[]');
    
    let isAvailable = false;
    if (storyKey === 'intro' || storyKey === 'tutorial') {
        isAvailable = true;
    } else if (storyKey.startsWith('level')) {
        const levelNum = parseInt(storyKey.replace('level', ''));
        isAvailable = levelNum === 1 || completedLevels.includes(levelNum - 1);
    } else if (storyKey === 'ending') {
        isAvailable = completedLevels.length === 6;
    }
    
    if (!isAvailable) {
        showMessage('🔒 Заблокировано', 'Эта история ещё не доступна. Продолжай играть!');
        return;
    }
    
    if (storyKey === 'tutorial') {
        closeStorySelection();
        document.getElementById('tutorial-modal').classList.add('active');
        return;
    }
    
    const storyMap = {
        'intro': { level: 'intro', name: playerName, tiger: tigerName },
        'level1': { level: 1, name: playerName, tiger: tigerName },
        'level2': { level: 2, name: playerName, tiger: tigerName },
        'level3': { level: 3, name: playerName, tiger: tigerName },
        'level4': { level: 4, name: playerName, tiger: tigerName },
        'level5': { level: 5, name: playerName, tiger: tigerName },
        'level6': { level: 6, name: playerName, tiger: tigerName },
        'ending': { level: 'ending', name: playerName, tiger: tigerName }
    };
    
    const story = storyMap[storyKey];
    if (story) {
        closeStorySelection();
        showStory(story.level, story.name, story.tiger);
    }
}


// Функции для рейтинга песочницы
let currentRatingLevelId = null;

function showRatingModal(levelId, levelName) {
    currentRatingLevelId = levelId;
    document.getElementById('rating-level-name').textContent = levelName;
    document.getElementById('rating-modal').classList.add('active');
}

function setRating(stars) {
    if (currentRatingLevelId) {
        rateSandboxLevel(currentRatingLevelId, stars);
        document.getElementById('rating-modal').classList.remove('active');
        showMessage('✅ Спасибо!', `Ты оценил уровень на ${stars} звёзд!`);
    }
}


// Load statistics on page load
document.addEventListener('DOMContentLoaded', function() {
    loadStats();
});


// Обработка клавиш на клавиатуре
document.addEventListener('keydown', function(event) {
    const codeInput = document.getElementById('code-input');
    
    // Проверяем, находится ли фокус в текстовом поле
    if (document.activeElement === codeInput) {
        return; // Если в текстовом поле, не обрабатываем стрелки
    }
    
    let command = null;
    
    switch(event.key) {
        case 'ArrowUp':
            command = 'вверх()';
            event.preventDefault();
            break;
        case 'ArrowDown':
            command = 'вниз()';
            event.preventDefault();
            break;
        case 'ArrowLeft':
            command = 'влево()';
            event.preventDefault();
            break;
        case 'ArrowRight':
            command = 'вправо()';
            event.preventDefault();
            break;
    }
    
    if (command) {
        addCommandFromKeyboard(command);
    }
});


// Обновить кнопки режимов в настройках
function updateGameModeButtons() {
    const tutorialBtn = document.getElementById('mode-tutorial');
    const advancedBtn = document.getElementById('mode-advanced');
    const description = document.getElementById('mode-description');
    
    if (gameMode.type === 'tutorial') {
        tutorialBtn.style.background = 'var(--primary-color)';
        tutorialBtn.style.color = 'white';
        advancedBtn.style.background = 'var(--bg-secondary)';
        advancedBtn.style.color = 'var(--text-primary)';
        description.textContent = '📚 Обучающий: бесконечные попытки';
    } else {
        tutorialBtn.style.background = 'var(--bg-secondary)';
        tutorialBtn.style.color = 'var(--text-primary)';
        advancedBtn.style.background = 'var(--primary-color)';
        advancedBtn.style.color = 'white';
        description.textContent = '🎯 Продвинутый: 3 жизни за уровень';
    }
}

// Инициализировать при загрузке
document.addEventListener('DOMContentLoaded', function() {
    initGameMode();
    updateGameModeButtons();
    updateLivesDisplay();
});


// Завершить игру и показать концовку
function finishGameAndShowEnding() {
    // Закрываем статистику
    document.getElementById('stats-modal').classList.remove('active');
    
    // Показываем концовку
    showStory('ending', playerName, tigerName);
    
    // После закрытия истории показываем фейерверк и эмодзи
    setTimeout(() => {
        showEndingCelebration();
    }, 3000);
}

// Показать праздничную концовку с фейерверком
function showEndingCelebration() {
    // Создаем контейнер для эмодзи
    const celebrationDiv = document.createElement('div');
    celebrationDiv.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.7);
        z-index: 5000;
        flex-direction: column;
        gap: 20px;
    `;
    
    // Большие эмодзи
    const emojisDiv = document.createElement('div');
    emojisDiv.style.cssText = `
        display: flex;
        gap: 20px;
        font-size: 80px;
        animation: bounce 1s infinite;
    `;
    emojisDiv.innerHTML = '🎉 🐯 🎉';
    
    // Текст
    const textDiv = document.createElement('div');
    textDiv.style.cssText = `
        color: white;
        font-size: 2em;
        font-weight: bold;
        text-align: center;
        animation: fadeIn 1s;
    `;
    textDiv.innerHTML = `${tigerName} вернулся домой! 🏠`;
    
    celebrationDiv.appendChild(emojisDiv);
    celebrationDiv.appendChild(textDiv);
    document.body.appendChild(celebrationDiv);
    
    // Запускаем фейерверк
    createFireworks();
    
    // Закрываем через 5 секунд
    setTimeout(() => {
        celebrationDiv.remove();
    }, 5000);
}


// Инициализировать систему администратора при загрузке
document.addEventListener('DOMContentLoaded', function() {
    initLevelsAdmin();
});


// ⚡ ФУНКЦИЯ АВТОПРОХОЖДЕНИЯ УРОВНЯ (для админа)
async function autoCompleteLevel(levelNum) {
    // Загружаем уровень
    const levelData = getEditedLevelData(levelNum) || levels[levelNum - 1];
    if (!levelData) {
        showMessage('❌ Ошибка', `Уровень ${levelNum} не найден!`);
        return;
    }
    
    // Закрываем админ панель
    closeAdminPanel();
    
    // Переходим на вкладку уровней
    switchTab('levels');
    
    // Устанавливаем уровень
    game.level = levelNum;
    game.tiger = { x: levelData.start.x, y: levelData.start.y };
    game.startPosition = { ...levelData.start };
    game.score = 0;
    game.steps = 0;
    game.meatCollected = 0;
    game.totalMeat = 0;
    game.keys = 0;
    game.objects = JSON.parse(JSON.stringify(levelData.objects || []));
    game.moveHistory = [];
    game.hasBeenRun = false;
    
    // Подсчитываем мясо
    game.totalMeat = game.objects.filter(obj => obj.type === 'meat').length;
    
    // Отрисовываем доску
    renderBoard();
    updateStats();
    
    // Показываем сообщение
    showMessage('⚡ Автопрохождение', `Начинаю прохождение уровня ${levelNum}...`);
    
    // Генерируем оптимальный путь
    const path = generateOptimalPath(levelData);
    
    // Выполняем путь с задержкой
    await executeAutoPath(path, levelData);
}

// Генерируем оптимальный путь для прохождения уровня
function generateOptimalPath(levelData) {
    const path = [];
    const start = levelData.start;
    const exit = levelData.exit;
    
    // Простой алгоритм: идем к мясу, потом к ключам, потом к выходу
    const meatPositions = levelData.objects
        .filter(obj => obj.type === 'meat')
        .map(obj => obj.pos);
    
    const keyPositions = levelData.objects
        .filter(obj => obj.type === 'key')
        .map(obj => obj.pos);
    
    const doorPositions = levelData.objects
        .filter(obj => obj.type === 'door')
        .map(obj => obj.pos);
    
    let currentPos = { ...start };
    
    // Идем к каждому мясу
    for (const meatPos of meatPositions) {
        const moves = findPath(currentPos, meatPos, levelData);
        path.push(...moves);
        path.push('есть()');
        currentPos = { ...meatPos };
    }
    
    // Идем к каждому ключу
    for (const keyPos of keyPositions) {
        const moves = findPath(currentPos, keyPos, levelData);
        path.push(...moves);
        path.push('взять()');
        currentPos = { ...keyPos };
    }
    
    // Открываем двери
    for (const doorPos of doorPositions) {
        const moves = findPath(currentPos, doorPos, levelData);
        path.push(...moves);
        path.push('открыть()');
        currentPos = { ...doorPos };
    }
    
    // Идем к выходу
    const finalMoves = findPath(currentPos, exit, levelData);
    path.push(...finalMoves);
    
    return path;
}

// Простой поиск пути (BFS)
function findPath(from, to, levelData) {
    const path = [];
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    
    // Идем вправо/влево
    if (dx > 0) {
        for (let i = 0; i < dx; i++) path.push('вправо()');
    } else if (dx < 0) {
        for (let i = 0; i < Math.abs(dx); i++) path.push('влево()');
    }
    
    // Идем вверх/вниз
    if (dy > 0) {
        for (let i = 0; i < dy; i++) path.push('вниз()');
    } else if (dy < 0) {
        for (let i = 0; i < Math.abs(dy); i++) path.push('вверх()');
    }
    
    return path;
}

// Выполняем автоматический путь
async function executeAutoPath(path, levelData) {
    for (const command of path) {
        // Выполняем команду
        if (command === 'вправо()') {
            moveRight();
        } else if (command === 'влево()') {
            moveLeft();
        } else if (command === 'вверх()') {
            moveUp();
        } else if (command === 'вниз()') {
            moveDown();
        } else if (command === 'есть()') {
            eatMeat();
        } else if (command === 'взять()') {
            takeKey();
        } else if (command === 'открыть()') {
            openDoor();
        }
        
        // Ждем перед следующей командой
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Проверяем, достигли ли выхода
        if (game.tiger.x === levelData.exit.x && game.tiger.y === levelData.exit.y) {
            break;
        }
    }
    
    // Проверяем победу
    if (game.tiger.x === levelData.exit.x && game.tiger.y === levelData.exit.y) {
        showMessage('✅ Уровень пройден!', `Уровень ${game.level} успешно пройден автоматически!`);
        playSound('victory');
        triggerFireworks();
        
        // Отмечаем уровень как пройденный
        game.completedLevels.add(game.level);
        saveGameProgress();
        
        // Переходим на следующий уровень через 2 секунды
        setTimeout(() => {
            if (game.level < levels.length) {
                game.level++;
                loadLevel(game.level);
            }
        }, 2000);
    }
}

// Вспомогательные функции движения
function moveRight() {
    if (game.tiger.x < 11) {
        game.tiger.x++;
        game.steps++;
        playSound('step');
        renderBoard();
        updateStats();
    }
}

function moveLeft() {
    if (game.tiger.x > 0) {
        game.tiger.x--;
        game.steps++;
        playSound('step');
        renderBoard();
        updateStats();
    }
}

function moveUp() {
    if (game.tiger.y > 0) {
        game.tiger.y--;
        game.steps++;
        playSound('step');
        renderBoard();
        updateStats();
    }
}

function moveDown() {
    if (game.tiger.y < 11) {
        game.tiger.y++;
        game.steps++;
        playSound('step');
        renderBoard();
        updateStats();
    }
}

function eatMeat() {
    const obj = game.objects.find(o => o.pos.x === game.tiger.x && o.pos.y === game.tiger.y && o.type === 'meat');
    if (obj) {
        game.objects = game.objects.filter(o => o !== obj);
        game.meatCollected++;
        game.score += 10;
        playSound('eat');
        renderBoard();
        updateStats();
    }
}

function takeKey() {
    const obj = game.objects.find(o => o.pos.x === game.tiger.x && o.pos.y === game.tiger.y && o.type === 'key');
    if (obj) {
        game.objects = game.objects.filter(o => o !== obj);
        game.keys++;
        game.score += 20;
        playSound('key');
        renderBoard();
        updateStats();
    }
}

function openDoor() {
    const obj = game.objects.find(o => o.pos.x === game.tiger.x && o.pos.y === game.tiger.y && o.type === 'door');
    if (obj && game.keys > 0) {
        game.objects = game.objects.filter(o => o !== obj);
        game.keys--;
        game.score += 15;
        playSound('door');
        renderBoard();
        updateStats();
    }
}
