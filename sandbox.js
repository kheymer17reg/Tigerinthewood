// 🏗️ SANDBOX — Level Constructor

let sandbox = {
    gridSize: 8,
    selectedObject: 'tiger',
    tigerPos: null,
    exitPos: null,
    objects: [],
    isDrawing: false,
    initialized: false
};

// Published / moderation data
let moderation = {
    pendingLevels: [],
    approvedLevels: [],
    rejectedLevels: []
};

function loadModerationData() {
    var saved = localStorage.getItem('moderation');
    if (saved) {
        moderation = JSON.parse(saved);
    }
}

function saveModerationData() {
    localStorage.setItem('moderation', JSON.stringify(moderation));
}

function initSandbox() {
    if (!sandbox.initialized) {
        sandbox.initialized = true;
        loadModerationData();
    }
    renderSandboxGrid();
}

function setSandboxSize(size) {
    sandbox.gridSize = size;
    sandbox.tigerPos = null;
    sandbox.exitPos = null;
    sandbox.objects = [];
    document.querySelectorAll('.sandbox-grid-btn').forEach(function(btn) {
        btn.classList.toggle('active', btn.textContent === size + 'x' + size);
    });
    renderSandboxGrid();
}

function selectSandboxObject(obj) {
    sandbox.selectedObject = obj;
    document.querySelectorAll('.sandbox-obj-btn').forEach(function(btn) {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
}

function renderSandboxGrid() {
    var grid = document.getElementById('sandbox-grid');
    if (!grid) return;
    grid.innerHTML = '';
    grid.style.gridTemplateColumns = 'repeat(' + sandbox.gridSize + ', 1fr)';
    grid.style.maxWidth = Math.min(sandbox.gridSize * 50 + 10, 500) + 'px';

    for (var y = 0; y < sandbox.gridSize; y++) {
        for (var x = 0; x < sandbox.gridSize; x++) {
            var cell = document.createElement('div');
            cell.className = 'sandbox-cell';
            cell.dataset.x = x;
            cell.dataset.y = y;
            cell.style.fontSize = Math.max(12, 24 - sandbox.gridSize) + 'px';

            // Place objects
            if (sandbox.tigerPos && sandbox.tigerPos.x === x && sandbox.tigerPos.y === y) {
                cell.textContent = '🐅';
            } else if (sandbox.exitPos && sandbox.exitPos.x === x && sandbox.exitPos.y === y) {
                cell.textContent = '🟢';
            } else {
                var obj = sandbox.objects.find(function(o) { return o.x === x && o.y === y; });
                if (obj) {
                    switch (obj.type) {
                        case 'tree': cell.textContent = '🌳'; break;
                        case 'meat': cell.textContent = '🍖'; break;
                        case 'key': cell.textContent = '🔑'; break;
                        case 'door': cell.textContent = '🚪'; break;
                        case 'wall': cell.textContent = '🧱'; break;
                    }
                }
            }

            cell.addEventListener('click', handleSandboxClick);
            cell.addEventListener('mousedown', function() { sandbox.isDrawing = true; });
            cell.addEventListener('mouseenter', function(e) {
                if (sandbox.isDrawing) handleSandboxClick(e);
            });
            grid.appendChild(cell);
        }
    }

    document.addEventListener('mouseup', function() { sandbox.isDrawing = false; });
}

function handleSandboxClick(e) {
    var x = parseInt(e.target.dataset.x);
    var y = parseInt(e.target.dataset.y);
    if (isNaN(x) || isNaN(y)) return;

    switch (sandbox.selectedObject) {
        case 'tiger':
            sandbox.tigerPos = { x: x, y: y };
            // Remove any object at this pos
            sandbox.objects = sandbox.objects.filter(function(o) { return !(o.x === x && o.y === y); });
            if (sandbox.exitPos && sandbox.exitPos.x === x && sandbox.exitPos.y === y) sandbox.exitPos = null;
            break;
        case 'exit':
            sandbox.exitPos = { x: x, y: y };
            sandbox.objects = sandbox.objects.filter(function(o) { return !(o.x === x && o.y === y); });
            if (sandbox.tigerPos && sandbox.tigerPos.x === x && sandbox.tigerPos.y === y) sandbox.tigerPos = null;
            break;
        case 'erase':
            sandbox.objects = sandbox.objects.filter(function(o) { return !(o.x === x && o.y === y); });
            if (sandbox.tigerPos && sandbox.tigerPos.x === x && sandbox.tigerPos.y === y) sandbox.tigerPos = null;
            if (sandbox.exitPos && sandbox.exitPos.x === x && sandbox.exitPos.y === y) sandbox.exitPos = null;
            break;
        default:
            // Place object
            sandbox.objects = sandbox.objects.filter(function(o) { return !(o.x === x && o.y === y); });
            if (sandbox.tigerPos && sandbox.tigerPos.x === x && sandbox.tigerPos.y === y) sandbox.tigerPos = null;
            if (sandbox.exitPos && sandbox.exitPos.x === x && sandbox.exitPos.y === y) sandbox.exitPos = null;
            sandbox.objects.push({ type: sandbox.selectedObject, x: x, y: y, locked: sandbox.selectedObject === 'door' });
            break;
    }

    renderSandboxGrid();
}

function clearSandbox() {
    sandbox.tigerPos = null;
    sandbox.exitPos = null;
    sandbox.objects = [];
    renderSandboxGrid();
}

function playSandboxLevel() {
    if (!sandbox.tigerPos) {
        showMessage('⚠️ Нужен тигр!', 'Поставь тигра на поле');
        return;
    }
    if (!sandbox.exitPos) {
        showMessage('⚠️ Нужен выход!', 'Поставь выход на поле');
        return;
    }

    // Create temporary level
    var sandboxLevel = {
        name: '🏗️ Песочница',
        start: { ...sandbox.tigerPos },
        exit: { ...sandbox.exitPos },
        objects: sandbox.objects.map(function(o) { return Object.assign({}, o); }),
        task: '🏗️ Это твой уровень! Доведи тигра до выхода.'
    };

    // Inject as level 99
    levels[99] = sandboxLevel;
    switchTab('levels');
    game.level = 99;
    initGame(true);
}

function downloadSandboxLevel() {
    if (!sandbox.tigerPos || !sandbox.exitPos) {
        showMessage('⚠️ Ошибка', 'Нужен тигр и выход для сохранения');
        return;
    }
    var data = {
        name: 'Мой уровень',
        author: playerName,
        gridSize: sandbox.gridSize,
        start: sandbox.tigerPos,
        exit: sandbox.exitPos,
        objects: sandbox.objects,
        createdAt: new Date().toISOString()
    };
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'tiger-level.json';
    a.click();
}

function uploadSandboxLevel() {
    var input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = function(e) {
        var file = e.target.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function(ev) {
            try {
                var data = JSON.parse(ev.target.result);
                if (!data.start || !data.exit) {
                    showMessage('❌ Ошибка', 'В файле нет стартовой позиции или выхода');
                    return;
                }
                sandbox.tigerPos = data.start;
                sandbox.exitPos = data.exit;
                sandbox.objects = data.objects || [];
                sandbox.gridSize = data.gridSize || 8;
                renderSandboxGrid();
                showMessage('✅ Загружен!', 'Уровень "' + (data.name || 'Без имени') + '" загружен!');
            } catch (err) {
                showMessage('❌ Ошибка', 'Не удалось прочитать файл');
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

function publishSandboxLevel() {
    if (!sandbox.tigerPos || !sandbox.exitPos) {
        showMessage('⚠️ Ошибка', 'Нужен тигр и выход для публикации');
        return;
    }

    var name = prompt('Название уровня:', 'Уровень ' + (moderation.pendingLevels.length + 1));
    if (!name) return;
    var description = prompt('Описание уровня:', '');

    var level = {
        id: Date.now(),
        levelName: name,
        description: description,
        playerName: playerName,
        gridSize: sandbox.gridSize,
        start: { ...sandbox.tigerPos },
        exit: { ...sandbox.exitPos },
        objects: sandbox.objects.map(function(o) { return Object.assign({}, o); }),
        status: 'pending',
        rating: 0,
        ratingCount: 0,
        createdAt: new Date().toISOString()
    };

    moderation.pendingLevels.push(level);
    saveModerationData();
    showMessage('✅ Отправлено!', 'Уровень "' + name + '" отправлен на модерацию');
}

function rateSandboxLevel(levelId, stars) {
    var allLevels = moderation.approvedLevels;
    var level = allLevels.find(function(l) { return l.id === levelId; });
    if (level) {
        level.ratingCount = (level.ratingCount || 0) + 1;
        level.rating = ((level.rating || 0) * (level.ratingCount - 1) + stars) / level.ratingCount;
        saveModerationData();
    }
}

function showPublishedLevelsModal() {
    loadModerationData();
    var levels = moderation.approvedLevels || [];
    if (levels.length === 0) {
        showMessage('🚀 Новые уровни', 'Пока нет опубликованных уровней. Создай свой в песочнице и отправь на модерацию!');
        return;
    }

    var html = '<h3 style="text-align:center;margin-bottom:16px;">🚀 Опубликованные уровни</h3>';
    html += '<div class="published-levels-list">';
    levels.sort(function(a, b) { return (b.rating || 0) - (a.rating || 0); });
    levels.forEach(function(level) {
        html += '<div class="published-level-card">' +
            '<div><strong>' + level.levelName + '</strong><br><span style="font-size:12px;color:var(--text-secondary);">Автор: ' + level.playerName + '</span></div>' +
            '<div style="display:flex;gap:8px;align-items:center;">' +
            '<span style="color:var(--primary);">⭐ ' + (level.rating ? level.rating.toFixed(1) : '—') + '</span>' +
            '<button class="btn-secondary" onclick="playSandboxLevelById(' + level.id + ')" style="padding:6px 12px;font-size:12px;">▶</button>' +
            '<button class="btn-secondary" onclick="showRatingModal(' + level.id + ', \'' + level.levelName.replace("'", "\\'") + '\')" style="padding:6px 12px;font-size:12px;">⭐</button>' +
            '</div></div>';
    });
    html += '</div>';
    showMessage('', '');
    var textEl = document.getElementById('msg-text');
    if (textEl) textEl.innerHTML = html;
    var titleEl = document.getElementById('msg-title');
    if (titleEl) titleEl.textContent = '';
}

function playSandboxLevelById(levelId) {
    var level = moderation.approvedLevels.find(function(l) { return l.id === levelId; });
    if (!level) {
        showMessage('❌ Ошибка', 'Уровень не найден');
        return;
    }
    closeMessage();
    levels[99] = {
        name: level.levelName,
        start: level.start,
        exit: level.exit,
        objects: level.objects,
        task: level.description || 'Доведи тигра до выхода!'
    };
    switchTab('levels');
    game.level = 99;
    initGame(true);
}
