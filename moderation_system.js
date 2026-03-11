// Система модерации уровней пользователей

const moderation = {
    pendingLevels: [],      // Уровни на модерации
    approvedLevels: [],     // Одобренные уровни
    rejectedLevels: []      // Отклоненные уровни
};

// Инициализировать систему модерации
function initModeration() {
    loadModerationData();
}

// Загрузить данные модерации
function loadModerationData() {
    const pending = localStorage.getItem('pendingLevels');
    const approved = localStorage.getItem('approvedLevels');
    const rejected = localStorage.getItem('rejectedLevels');
    
    moderation.pendingLevels = pending ? JSON.parse(pending) : [];
    moderation.approvedLevels = approved ? JSON.parse(approved) : [];
    moderation.rejectedLevels = rejected ? JSON.parse(rejected) : [];
}

// Сохранить данные модерации
function saveModerationData() {
    localStorage.setItem('pendingLevels', JSON.stringify(moderation.pendingLevels));
    localStorage.setItem('approvedLevels', JSON.stringify(moderation.approvedLevels));
    localStorage.setItem('rejectedLevels', JSON.stringify(moderation.rejectedLevels));
}

// Отправить уровень на модерацию
function submitLevelForModeration(levelData) {
    const submission = {
        id: Date.now(),
        playerName: playerName,
        levelName: levelData.name,
        description: levelData.description,
        difficulty: levelData.difficulty,
        data: levelData.data,
        submittedAt: new Date().toISOString(),
        status: 'pending',
        reason: ''
    };
    
    moderation.pendingLevels.push(submission);
    saveModerationData();
    return submission.id;
}

// Одобрить уровень
function approveLevelForModeration(levelId) {
    const index = moderation.pendingLevels.findIndex(l => l.id === levelId);
    if (index !== -1) {
        const level = moderation.pendingLevels[index];
        level.status = 'approved';
        level.approvedAt = new Date().toISOString();
        moderation.approvedLevels.push(level);
        moderation.pendingLevels.splice(index, 1);
        saveModerationData();
        return true;
    }
    return false;
}

// Отклонить уровень
function rejectLevelForModeration(levelId, reason) {
    const index = moderation.pendingLevels.findIndex(l => l.id === levelId);
    if (index !== -1) {
        const level = moderation.pendingLevels[index];
        level.status = 'rejected';
        level.reason = reason;
        level.rejectedAt = new Date().toISOString();
        moderation.rejectedLevels.push(level);
        moderation.pendingLevels.splice(index, 1);
        saveModerationData();
        return true;
    }
    return false;
}

// Показать вкладку "Создать уровень пользователя"
function showUserLevelCreator() {
    const html = `
        <div style="padding: 20px;">
            <h3 style="color: var(--primary-color); margin-bottom: 20px;">➕ Создать уровень</h3>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div style="display: grid; gap: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Название:</label>
                        <input type="text" id="user-level-name" placeholder="Введи название" style="width: 100%; padding: 10px; border: 2px solid var(--primary-color); border-radius: 8px; background: var(--bg-primary); color: var(--text-primary); box-sizing: border-box;">
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Описание:</label>
                        <textarea id="user-level-description" placeholder="Введи описание" style="width: 100%; padding: 10px; border: 2px solid var(--primary-color); border-radius: 8px; background: var(--bg-primary); color: var(--text-primary); box-sizing: border-box; min-height: 80px; resize: vertical;"></textarea>
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Сложность:</label>
                        <select id="user-level-difficulty" style="width: 100%; padding: 10px; border: 2px solid var(--primary-color); border-radius: 8px; background: var(--bg-primary); color: var(--text-primary);">
                            <option value="Легкая">Легкая</option>
                            <option value="Средняя" selected>Средняя</option>
                            <option value="Сложная">Сложная</option>
                        </select>
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Размер:</label>
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
                            <button onclick="setUserEditorSize(6)" style="padding: 8px; background: var(--primary-color); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">6x6</button>
                            <button onclick="setUserEditorSize(8)" style="padding: 8px; background: var(--bg-primary); border: 2px solid var(--primary-color); border-radius: 6px; cursor: pointer; font-weight: 600;">8x8</button>
                            <button onclick="setUserEditorSize(10)" style="padding: 8px; background: var(--bg-primary); border: 2px solid var(--primary-color); border-radius: 6px; cursor: pointer; font-weight: 600;">10x10</button>
                        </div>
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Объект:</label>
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
                            <button onclick="selectUserObject('tiger')" style="padding: 10px; background: var(--bg-primary); border: 2px solid var(--primary-color); border-radius: 6px; cursor: pointer; font-size: 1.2em;">🐅</button>
                            <button onclick="selectUserObject('exit')" style="padding: 10px; background: var(--bg-primary); border: 2px solid var(--primary-color); border-radius: 6px; cursor: pointer; font-size: 1.2em;">🟢</button>
                            <button onclick="selectUserObject('meat')" style="padding: 10px; background: var(--bg-primary); border: 2px solid var(--primary-color); border-radius: 6px; cursor: pointer; font-size: 1.2em;">🍖</button>
                            <button onclick="selectUserObject('key')" style="padding: 10px; background: var(--bg-primary); border: 2px solid var(--primary-color); border-radius: 6px; cursor: pointer; font-size: 1.2em;">🔑</button>
                            <button onclick="selectUserObject('door')" style="padding: 10px; background: var(--bg-primary); border: 2px solid var(--primary-color); border-radius: 6px; cursor: pointer; font-size: 1.2em;">🚪</button>
                            <button onclick="selectUserObject('tree')" style="padding: 10px; background: var(--bg-primary); border: 2px solid var(--primary-color); border-radius: 6px; cursor: pointer; font-size: 1.2em;">🌳</button>
                            <button onclick="selectUserObject('wall')" style="padding: 10px; background: var(--bg-primary); border: 2px solid var(--primary-color); border-radius: 6px; cursor: pointer; font-size: 1.2em;">🧱</button>
                            <button onclick="selectUserObject('paw')" style="padding: 10px; background: var(--bg-primary); border: 2px solid var(--primary-color); border-radius: 6px; cursor: pointer; font-size: 1.2em;">🐾</button>
                            <button onclick="selectUserObject('empty')" style="padding: 10px; background: var(--bg-primary); border: 2px solid var(--primary-color); border-radius: 6px; cursor: pointer; font-size: 1.2em;">🗑️</button>
                        </div>
                    </div>
                </div>
                
                <div>
                    <label style="display: block; margin-bottom: 10px; font-weight: 600;">Редактор:</label>
                    <div id="user-editor-grid" style="display: inline-grid; gap: 2px; padding: 10px; background: var(--bg-primary); border-radius: 8px; border: 2px solid var(--primary-color);"></div>
                </div>
            </div>
            
            <div style="display: flex; gap: 10px; margin-top: 20px; flex-wrap: wrap;">
                <button onclick="submitUserLevel()" style="flex: 1; min-width: 120px; padding: 12px; background: var(--success-color); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">📤 Отправить на модерацию</button>
                <button onclick="switchTab('levels')" style="flex: 1; min-width: 120px; padding: 12px; background: var(--text-secondary); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">❌ Отмена</button>
            </div>
        </div>
    `;
    
    const content = document.getElementById('user-levels-content');
    if (content) {
        content.innerHTML = html;
        userEditor.gridSize = 6;
        userEditor.tigerPos = {x: 0, y: 0};
        userEditor.exitPos = {x: 5, y: 5};
        userEditor.objects = [];
        userEditor.selectedObject = 'meat';
        setTimeout(() => updateUserEditorGrid(), 100);
    }
}

// Переменные редактора пользователя
const userEditor = {
    gridSize: 6,
    tigerPos: {x: 0, y: 0},
    exitPos: {x: 5, y: 5},
    objects: [],
    selectedObject: 'meat'
};

// Установить размер редактора
function setUserEditorSize(size) {
    userEditor.gridSize = size;
    userEditor.tigerPos = {x: 0, y: 0};
    userEditor.exitPos = {x: size - 1, y: size - 1};
    userEditor.objects = [];
    updateUserEditorGrid();
}

// Выбрать объект
function selectUserObject(type) {
    userEditor.selectedObject = type;
}

// Обновить сетку редактора
function updateUserEditorGrid() {
    const grid = document.getElementById('user-editor-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    grid.style.gridTemplateColumns = `repeat(${userEditor.gridSize}, 40px)`;
    
    for (let y = 0; y < userEditor.gridSize; y++) {
        for (let x = 0; x < userEditor.gridSize; x++) {
            const cell = document.createElement('div');
            cell.style.width = '40px';
            cell.style.height = '40px';
            cell.style.border = '2px solid var(--border-color)';
            cell.style.borderRadius = '4px';
            cell.style.display = 'flex';
            cell.style.alignItems = 'center';
            cell.style.justifyContent = 'center';
            cell.style.cursor = 'pointer';
            cell.style.fontSize = '20px';
            cell.style.backgroundColor = 'var(--bg-secondary)';
            
            if (x === userEditor.tigerPos.x && y === userEditor.tigerPos.y) {
                cell.textContent = '🐅';
            } else if (x === userEditor.exitPos.x && y === userEditor.exitPos.y) {
                cell.textContent = '🟢';
            } else {
                const obj = userEditor.objects.find(o => o.x === x && o.y === y);
                if (obj) {
                    switch (obj.type) {
                        case 'meat': cell.textContent = '🍖'; break;
                        case 'key': cell.textContent = '🔑'; break;
                        case 'door': cell.textContent = '🚪'; break;
                        case 'tree': cell.textContent = '🌳'; break;
                        case 'wall': cell.textContent = '🧱'; break;
                        case 'paw': cell.textContent = '🐾'; break;
                    }
                }
            }
            
            cell.onclick = () => placeUserObject(x, y);
            grid.appendChild(cell);
        }
    }
}

// Разместить объект
function placeUserObject(x, y) {
    if (userEditor.selectedObject === 'tiger') {
        userEditor.tigerPos = {x, y};
    } else if (userEditor.selectedObject === 'exit') {
        userEditor.exitPos = {x, y};
    } else if (userEditor.selectedObject === 'empty') {
        userEditor.objects = userEditor.objects.filter(o => !(o.x === x && o.y === y));
    } else {
        const existing = userEditor.objects.findIndex(o => o.x === x && o.y === y);
        if (existing !== -1) {
            userEditor.objects.splice(existing, 1);
        } else {
            userEditor.objects.push({x, y, type: userEditor.selectedObject});
        }
    }
    updateUserEditorGrid();
}

// Отправить уровень на модерацию
function submitUserLevel() {
    const name = document.getElementById('user-level-name').value.trim();
    const description = document.getElementById('user-level-description').value.trim();
    const difficulty = document.getElementById('user-level-difficulty').value;
    
    if (!name) {
        alert('❌ Введи название уровня!');
        return;
    }
    
    const levelData = {
        name: name,
        start: userEditor.tigerPos,
        exit: userEditor.exitPos,
        objects: [...userEditor.objects],
        gridSize: userEditor.gridSize,
        task: description
    };
    
    const levelId = submitLevelForModeration({
        name: name,
        description: description,
        difficulty: difficulty,
        data: levelData
    });
    
    alert('✅ Уровень отправлен на модерацию!');
    showUserLevelsTab();
}

// Показать вкладку "Уровни пользователей"
function showUserLevelsTab() {
    const html = `
        <div style="padding: 20px;">
            <h3 style="color: var(--primary-color); margin-bottom: 20px;">📋 Мои уровни</h3>
            
            <button onclick="showUserLevelCreator()" style="width: 100%; padding: 12px; background: var(--primary-color); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; margin-bottom: 20px;">➕ Создать уровень</button>
            
            <div id="user-levels-list"></div>
        </div>
    `;
    
    const content = document.getElementById('user-levels-content');
    if (content) {
        content.innerHTML = html;
        loadUserLevelsList();
    }
}

// Загрузить список одобренных уровней для игры
function loadApprovedLevelsForPlay() {
    const content = document.getElementById('user-levels-content');
    if (!content) return;
    
    const approvedLevels = moderation.approvedLevels;
    
    if (approvedLevels.length === 0) {
        content.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 20px;">Нет одобренных уровней</p>';
        return;
    }
    
    let html = '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 15px;">';
    
    approvedLevels.forEach((level, index) => {
        html += `
            <div style="background: var(--bg-secondary); padding: 15px; border-radius: 12px; border: 2px solid #4caf50; text-align: center; cursor: pointer; transition: all 0.3s;" onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 4px 12px rgba(76, 175, 80, 0.3)'" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='none'">
                <div style="font-size: 2em; margin-bottom: 10px;">🎮</div>
                <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 5px; font-size: 0.95em;">${level.levelName}</div>
                <div style="font-size: 0.8em; color: var(--text-secondary); margin-bottom: 3px;">👤 ${level.playerName}</div>
                <div style="font-size: 0.8em; color: var(--text-secondary); margin-bottom: 8px;">⭐ ${level.difficulty}</div>
                <button onclick="playApprovedLevel(${level.id})" style="width: 100%; padding: 8px; background: var(--success-color); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.9em; font-weight: 600;">▶ Играть</button>
            </div>
        `;
    });
    
    html += '</div>';
    content.innerHTML = html;
}

// Загрузить список уровней пользователя
function loadUserLevelsList() {
    const list = document.getElementById('user-levels-list');
    if (!list) return;
    
    const userLevels = moderation.pendingLevels.filter(l => l.playerName === playerName)
        .concat(moderation.approvedLevels.filter(l => l.playerName === playerName))
        .concat(moderation.rejectedLevels.filter(l => l.playerName === playerName));
    
    if (userLevels.length === 0) {
        list.innerHTML = '<p style="color: var(--text-secondary);">У вас нет уровней</p>';
        return;
    }
    
    list.innerHTML = userLevels.map(level => {
        const statusColor = level.status === 'approved' ? '#4caf50' : level.status === 'rejected' ? '#f44336' : '#ff9800';
        const statusText = level.status === 'approved' ? '✅ Одобрен' : level.status === 'rejected' ? '❌ Отклонен' : '⏳ На модерации';
        
        let buttons = '';
        if (level.status === 'approved') {
            buttons = `<button onclick="playApprovedLevel(${level.id})" style="flex: 1; padding: 8px; background: var(--success-color); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; margin-right: 5px;">▶ Играть</button>`;
        }
        
        return `
            <div style="background: var(--bg-primary); padding: 15px; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid ${statusColor};">
                <div style="font-weight: 600; color: var(--text-primary); font-size: 1.1em;">${level.levelName}</div>
                <div style="font-size: 0.85em; color: var(--text-secondary); margin-top: 5px;">📝 ${level.description}</div>
                <div style="font-size: 0.85em; color: var(--text-secondary); margin-top: 3px;">⭐ ${level.difficulty}</div>
                <div style="font-size: 0.85em; color: ${statusColor}; margin-top: 3px; font-weight: 600;">${statusText}</div>
                ${level.reason ? `<div style="font-size: 0.85em; color: #f44336; margin-top: 3px;">📌 Причина: ${level.reason}</div>` : ''}
                <div style="display: flex; gap: 5px; margin-top: 10px;">
                    ${buttons}
                    <button onclick="previewLevel(${level.id})" style="flex: 1; padding: 8px; background: var(--primary-color); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">👁️ Просмотр</button>
                </div>
            </div>
        `;
    }).join('');
}

// Показать вкладку модерации в админ-панели
function showModerationTab() {
    const html = `
        <div style="padding: 20px;">
            <h3 style="color: var(--primary-color); margin-bottom: 20px;">📋 Модерация уровней</h3>
            
            <div style="margin-bottom: 20px;">
                <h4 style="color: var(--text-primary); margin-bottom: 15px;">⏳ На модерации (${moderation.pendingLevels.length}):</h4>
                <div id="pending-levels-list" style="display: grid; gap: 10px;"></div>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h4 style="color: var(--text-primary); margin-bottom: 15px;">✅ Одобренные (${moderation.approvedLevels.length}):</h4>
                <div id="approved-levels-list" style="display: grid; gap: 10px;"></div>
            </div>
            
            <div>
                <h4 style="color: var(--text-primary); margin-bottom: 15px;">❌ Отклоненные (${moderation.rejectedLevels.length}):</h4>
                <div id="rejected-levels-list" style="display: grid; gap: 10px;"></div>
            </div>
        </div>
    `;
    
    const content = document.getElementById('admin-moderation-tab');
    if (content) {
        content.innerHTML = html;
        loadModerationLists();
    }
}

// Загрузить списки модерации
function loadModerationLists() {
    // Уровни на модерации
    const pendingList = document.getElementById('admin-pending-levels');
    if (pendingList) {
        if (moderation.pendingLevels.length === 0) {
            pendingList.innerHTML = '<p style="color: var(--text-secondary);">Нет уровней на модерации</p>';
        } else {
            pendingList.innerHTML = moderation.pendingLevels.map(level => `
                <div style="background: var(--bg-primary); padding: 15px; border-radius: 8px; border-left: 4px solid #ff9800;">
                    <div style="font-weight: 600; color: var(--text-primary); font-size: 1.1em;">${level.levelName}</div>
                    <div style="font-size: 0.85em; color: var(--text-secondary); margin-top: 5px;">👤 ${level.playerName}</div>
                    <div style="font-size: 0.85em; color: var(--text-secondary); margin-top: 3px;">📝 ${level.description}</div>
                    <div style="font-size: 0.85em; color: var(--text-secondary); margin-top: 3px;">⭐ ${level.difficulty}</div>
                    <div style="display: flex; gap: 10px; margin-top: 10px;">
                        <button onclick="approveLevelAdmin(${level.id})" style="flex: 1; padding: 8px; background: #4caf50; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">✅ Одобрить</button>
                        <button onclick="showRejectReason(${level.id})" style="flex: 1; padding: 8px; background: #f44336; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">❌ Отклонить</button>
                        <button onclick="previewLevel(${level.id})" style="flex: 1; padding: 8px; background: var(--primary-color); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">👁️ Просмотр</button>
                    </div>
                </div>
            `).join('');
        }
    }
    
    // Одобренные уровни
    const approvedList = document.getElementById('admin-approved-levels');
    if (approvedList) {
        if (moderation.approvedLevels.length === 0) {
            approvedList.innerHTML = '<p style="color: var(--text-secondary);">Нет одобренных уровней</p>';
        } else {
            approvedList.innerHTML = moderation.approvedLevels.map(level => `
                <div style="background: var(--bg-primary); padding: 15px; border-radius: 8px; border-left: 4px solid #4caf50;">
                    <div style="font-weight: 600; color: var(--text-primary); font-size: 1.1em;">${level.levelName}</div>
                    <div style="font-size: 0.85em; color: var(--text-secondary); margin-top: 5px;">👤 ${level.playerName}</div>
                    <div style="font-size: 0.85em; color: var(--text-secondary); margin-top: 3px;">⭐ ${level.difficulty}</div>
                    <div style="display: flex; gap: 10px; margin-top: 10px;">
                        <button onclick="playApprovedLevel(${level.id})" style="flex: 1; padding: 8px; background: var(--success-color); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">▶ Играть</button>
                        <button onclick="previewLevel(${level.id})" style="flex: 1; padding: 8px; background: var(--primary-color); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">👁️ Просмотр</button>
                    </div>
                </div>
            `).join('');
        }
    }
    
    // Отклоненные уровни
    const rejectedList = document.getElementById('admin-rejected-levels');
    if (rejectedList) {
        if (moderation.rejectedLevels.length === 0) {
            rejectedList.innerHTML = '<p style="color: var(--text-secondary);">Нет отклоненных уровней</p>';
        } else {
            rejectedList.innerHTML = moderation.rejectedLevels.map(level => `
                <div style="background: var(--bg-primary); padding: 15px; border-radius: 8px; border-left: 4px solid #f44336;">
                    <div style="font-weight: 600; color: var(--text-primary); font-size: 1.1em;">${level.levelName}</div>
                    <div style="font-size: 0.85em; color: var(--text-secondary); margin-top: 5px;">👤 ${level.playerName}</div>
                    <div style="font-size: 0.85em; color: #f44336; margin-top: 3px;">📌 ${level.reason}</div>
                </div>
            `).join('');
        }
    }
}

// Одобрить уровень (админ)
function approveLevelAdmin(levelId) {
    if (approveLevelForModeration(levelId)) {
        alert('✅ Уровень одобрен!');
        loadModerationLists();
    }
}

// Показать форму отклонения
function showRejectReason(levelId) {
    const reason = prompt('Введи причину отклонения:');
    if (reason !== null) {
        if (rejectLevelForModeration(levelId, reason)) {
            alert('❌ Уровень отклонен!');
            loadModerationLists();
        }
    }
}

// Просмотр уровня
function previewLevel(levelId) {
    const level = moderation.pendingLevels.find(l => l.id === levelId) || 
                  moderation.approvedLevels.find(l => l.id === levelId) ||
                  moderation.rejectedLevels.find(l => l.id === levelId);
    
    if (!level) return;
    
    const levelData = level.data;
    const gridSize = levelData.gridSize || 8;
    
    // Создаём сетку для превью
    let gridHTML = '<div style="display: inline-grid; gap: 2px; padding: 15px; background: var(--bg-primary); border-radius: 8px; border: 2px solid var(--primary-color);">';
    gridHTML += `<div style="grid-template-columns: repeat(${gridSize}, 40px); display: grid; gap: 2px;">`;
    
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            let emoji = '⬜';
            
            if (x === levelData.start.x && y === levelData.start.y) {
                emoji = '🐅';
            } else if (x === levelData.exit.x && y === levelData.exit.y) {
                emoji = '🟢';
            } else {
                const obj = levelData.objects.find(o => o.x === x && o.y === y);
                if (obj) {
                    switch (obj.type) {
                        case 'meat': emoji = '🍖'; break;
                        case 'key': emoji = '🔑'; break;
                        case 'door': emoji = '🚪'; break;
                        case 'tree': emoji = '🌳'; break;
                        case 'wall': emoji = '🧱'; break;
                        case 'paw': emoji = '🐾'; break;
                    }
                }
            }
            
            gridHTML += `<div style="width: 40px; height: 40px; border: 2px solid var(--border-color); border-radius: 4px; display: flex; align-items: center; justify-content: center; background: var(--bg-secondary); font-size: 20px;">${emoji}</div>`;
        }
    }
    
    gridHTML += '</div></div>';
    
    const modal = document.createElement('div');
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 5000; display: flex; align-items: center; justify-content: center;';
    modal.innerHTML = `
        <div style="background: var(--bg-secondary); padding: 30px; border-radius: 15px; max-width: 600px; max-height: 80vh; overflow-y: auto; box-shadow: 0 10px 40px rgba(0,0,0,0.3);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 style="color: var(--primary-color); margin: 0; font-size: 1.5em;">${level.levelName}</h2>
                <button onclick="this.parentElement.parentElement.parentElement.remove()" style="background: none; border: none; font-size: 1.5em; cursor: pointer; color: var(--text-primary);">✕</button>
            </div>
            
            <div style="margin-bottom: 20px;">
                <p style="color: var(--text-secondary); margin: 5px 0;"><strong>Автор:</strong> ${level.playerName}</p>
                <p style="color: var(--text-secondary); margin: 5px 0;"><strong>Описание:</strong> ${level.description}</p>
                <p style="color: var(--text-secondary); margin: 5px 0;"><strong>Сложность:</strong> ${level.difficulty}</p>
                <p style="color: var(--text-secondary); margin: 5px 0;"><strong>Размер:</strong> ${gridSize}x${gridSize}</p>
            </div>
            
            <div style="text-align: center; margin-bottom: 20px;">
                <p style="color: var(--text-primary); font-weight: 600; margin-bottom: 10px;">Сетка уровня:</p>
                ${gridHTML}
            </div>
            
            <div style="text-align: center;">
                <button onclick="this.parentElement.parentElement.parentElement.remove()" style="padding: 10px 30px; background: var(--primary-color); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">Закрыть</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Играть в одобренный уровень
function playApprovedLevel(levelId) {
    const level = moderation.approvedLevels.find(l => l.id === levelId);
    if (!level) return;
    
    // Сохраняем уровень как текущий
    window.currentApprovedLevel = level.data;
    window.currentApprovedLevelName = level.levelName;
    
    // Закрываем админ-панель
    const adminModal = document.getElementById('admin-modal');
    if (adminModal) {
        adminModal.classList.remove('active');
    }
    
    // Загружаем уровень
    loadApprovedLevel();
}

// Загрузить одобренный уровень
function loadApprovedLevel() {
    if (!window.currentApprovedLevel) return;
    
    const levelData = window.currentApprovedLevel;
    
    // Добавляем уровень в объект levels с временным ID
    const tempLevelId = 999;
    levels[tempLevelId] = {
        name: window.currentApprovedLevelName,
        start: levelData.start,
        exit: levelData.exit,
        objects: levelData.objects || [],
        gridSize: levelData.gridSize || 8,
        task: levelData.task || 'Помоги тигрёнку найти выход!'
    };
    
    // Устанавливаем текущий уровень
    game.level = tempLevelId;
    game.isRunning = false;
    game.hasBeenRun = false;
    game.levelAttempts = 0;
    game.levelStartTime = Date.now();
    
    // Инициализируем игру
    initGame();
    updateRunButton();
    document.getElementById('code-input').value = '';
    document.getElementById('code-input').classList.remove('error');
    
    // Переключаемся на вкладку уровней
    switchTab('levels');
}
