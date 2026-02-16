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

const levels = {
    1: {
        name: "Первые шаги",
        start: { x: 0, y: 4 },
        exit: { x: 7, y: 4 },
        objects: [],
        task: "Используй стрелку → или команду <code>вправо()</code> чтобы дойти до выхода."
    },
    2: {
        name: "Обход дерева",
        start: { x: 0, y: 4 },
        exit: { x: 7, y: 4 },
        objects: [
            { type: 'tree', x: 3, y: 4 },
            { type: 'tree', x: 4, y: 4 }
        ],
        task: "Используй стрелки ↑ или ↓ чтобы обойти деревья."
    },
    3: {
        name: "Лесная тропа",
        start: { x: 0, y: 7 },
        exit: { x: 7, y: 0 },
        objects: [
            { type: 'tree', x: 2, y: 5 },
            { type: 'tree', x: 2, y: 6 },
            { type: 'tree', x: 5, y: 1 },
            { type: 'tree', x: 5, y: 2 }
        ],
        task: "Используй команды с числами: <code>вправо(2)</code>"
    },
    4: {
        name: "Вкусное мясо",
        start: { x: 0, y: 4 },
        exit: { x: 7, y: 4 },
        objects: [
            { type: 'meat', x: 2, y: 4 },
            { type: 'meat', x: 5, y: 4 },
            { type: 'tree', x: 3, y: 4 },
            { type: 'tree', x: 4, y: 4 }
        ],
        task: "Съешь мясо 🍖 командой <code>есть()</code>"
    },
    5: {
        name: "Волшебный ключ",
        start: { x: 0, y: 4 },
        exit: { x: 7, y: 4 },
        objects: [
            { type: 'key', x: 1, y: 4 },
            { type: 'door', x: 4, y: 4, locked: true },
            { type: 'meat', x: 6, y: 4 }
        ],
        task: "Возьми ключ 🔑 <code>взять()</code> и открой дверь 🚪 <code>открыть()</code>"
    },
    6: {
        name: "Большое приключение",
        start: { x: 0, y: 7 },
        exit: { x: 7, y: 0 },
        objects: [
            { type: 'meat', x: 1, y: 6 },
            { type: 'meat', x: 3, y: 4 },
            { type: 'meat', x: 5, y: 2 },
            { type: 'key', x: 2, y: 5 },
            { type: 'door', x: 4, y: 3, locked: true },
            { type: 'tree', x: 3, y: 2 },
            { type: 'tree', x: 5, y: 5 }
        ],
        task: "Собери мясо, возьми ключ и открой дверь!"
    }
};

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
    localStorage.removeItem('currentPlayer');
    localStorage.removeItem('tigerName');
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
    
    // Показываем вводную историю
    showStory('intro', playerName, tigerName);
    
    initGame();
    createLevelButtons();
}

function createLevelButtons() {
    const container = document.getElementById('level-buttons');
    container.innerHTML = '';
    const icons = ['🌱', '🍃', '🌿', '🌳', '🔑', '🏆'];
    for (let i = 1; i <= 6; i++) {
        const btn = document.createElement('button');
        btn.className = 'level-btn' + (i === 1 ? ' active' : '');
        if (game.completedLevels.has(i)) btn.classList.add('completed');
        
        // Проверяем доступность уровня
        const isAvailable = i === 1 || game.completedLevels.has(i - 1);
        if (!isAvailable) {
            btn.style.opacity = '0.5';
            btn.style.pointerEvents = 'none';
            btn.style.cursor = 'not-allowed';
        }
        
        btn.innerHTML = `<span class="level-icon">${icons[i - 1]}</span><span>Уровень ${i}</span>`;
        btn.onclick = () => loadLevel(i);
        container.appendChild(btn);
    }
}

function initGame() {
    const level = levels[game.level];
    game.tiger = { ...level.start };
    game.startPosition = { ...level.start };
    game.score = 0;
    game.steps = 0;
    game.meatCollected = 0;
    game.keys = 0;
    game.hasBeenRun = false;
    game.moveHistory = [];
    
    // Apply edited level data if available
    const editedData = getEditedLevelData(game.level);
    if (editedData) {
        // Use edited objects if available
        game.objects = [...editedData.objects];
    } else {
        // Use default level objects
        game.objects = [...level.objects];
    }
    
    game.totalMeat = game.objects.filter(obj => obj.type === 'meat').length;
    
    renderBoard();
    updateStats();
    updateRunButton();
    updateTask();
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
            
            const obj = game.objects.find(o => o.x === x && o.y === y);
            const exit = level.exit;
            
            if (x === exit.x && y === exit.y) {
                cell.className = 'cell exit';
                cell.textContent = '🟢';
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
            } else if (x === game.tiger.x && y === game.tiger.y) {
                cell.className = 'cell tiger';
                cell.textContent = '🐅';
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
    document.querySelectorAll('.level-btn').forEach((btn, i) => {
        const levelIndex = i + 1;
        btn.classList.toggle('active', levelIndex === levelNum);
        btn.classList.toggle('completed', game.completedLevels.has(levelIndex));
    });
    game.level = levelNum;
    game.isRunning = false;
    game.hasBeenRun = false;
    game.levelAttempts = 0;
    game.levelStartTime = Date.now();
    initGame();
    updateRunButton();
    document.getElementById('code-input').value = '';
    document.getElementById('code-input').classList.remove('error');
    
    // Показываем историю перед уровнем
    showStory(levelNum, playerName, tigerName);
}

function canMove(dx, dy) {
    const newX = game.tiger.x + dx;
    const newY = game.tiger.y + dy;
    if (newX < 0 || newX >= 8 || newY < 0 || newY >= 8) return false;
    const wall = game.objects.find(o => (o.type === 'wall' || o.type === 'tree') && o.x === newX && o.y === newY);
    if (wall) return false;
    const door = game.objects.find(o => o.type === 'door' && o.x === newX && o.y === newY);
    if (door && door.locked) return false;
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
            setTimeout(checkWin, 500);
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

async function runCode() {
    if (game.isRunning || game.hasBeenRun) return;
    game.isRunning = true;
    game.hasBeenRun = true;
    updateRunButton();
    const code = document.getElementById('code-input').value;
    const codeInput = document.getElementById('code-input');
    codeInput.classList.remove('error');
    
    const lines = code.split('\n');
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        if (line === '' || line.startsWith('#')) continue;
        const success = await executeCommand(line);
        if (!success) {
            game.isRunning = false;
            game.hasBeenRun = true;
            codeInput.classList.add('error');
            updateRunButton();
            return;
        }
        await sleep(500);
    }
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
    editor.value = editor.value.slice(0, -1);
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
    initGame();
    document.getElementById('code-input').classList.remove('error');
    updateRunButton();
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
    playSound('levelComplete');
    const meatBonus = (game.meatCollected === game.totalMeat) ? 50 : 0;
    const stepBonus = Math.max(0, 100 - game.steps * 2);
    const totalBonus = meatBonus + stepBonus;
    game.score += totalBonus;
    updateStats();
    
    // Сохраняем статистику уровня
    if (typeof saveLevelStats === 'function') {
        saveLevelStats(game.level);
    }
    
    const tigerCell = document.getElementById(`cell-${game.tiger.x}-${game.tiger.y}`);
    if (tigerCell) {
        tigerCell.classList.add('dance');
    }
    
    // Фейерверк при победе
    createFireworks();
    
    setTimeout(() => {
        showMessage(`Молодец, ${playerName}! 🎉`,
            `Тигрёнок прошёл уровень!<br><br>🍖 Мяса: ${game.meatCollected}/${game.totalMeat}<br>🐾 Шагов: ${game.steps}<br>⭐ Бонусы: +${totalBonus}<br>🏆 Всего: ${game.score}`);
    }, 500);
    
    // Обновляем кнопки уровней
    document.querySelectorAll('.level-btn').forEach((btn, i) => {
        const levelIndex = i + 1;
        if (game.completedLevels.has(levelIndex)) {
            btn.classList.add('completed');
        }
    });
    
    // Открываем следующий уровень если он существует
    if (game.level < 6) {
        const nextLevelBtn = document.querySelector(`.level-btn:nth-child(${game.level + 1})`);
        if (nextLevelBtn) {
            nextLevelBtn.style.opacity = '1';
            nextLevelBtn.style.pointerEvents = 'auto';
        }
    }
    
    // Проверяем, прошел ли все уровни
    if (game.completedLevels.size === 6) {
        setTimeout(() => {
            showEndingStory(playerName, tigerName);
            // Показываем статистику после истории
            setTimeout(() => {
                if (typeof showGameStats === 'function') {
                    showGameStats();
                }
            }, 3000);
        }, 2000);
    }
}

function showMessage(title, text) {
    document.getElementById('msg-title').textContent = title;
    document.getElementById('msg-text').innerHTML = text.replace(/\n/g, '<br>');
    document.getElementById('message-modal').classList.add('active');
}

function closeMessage() {
    document.getElementById('message-modal').classList.remove('active');
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
        const blob = new Blob([JSON.stringify(levelData, null, 2)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `уровень_${levelName.replace(/\s+/g, '_')}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showMessage('✅ Уровень скачан!', `Файл "${a.download}" сохранен на компьютер.`);
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