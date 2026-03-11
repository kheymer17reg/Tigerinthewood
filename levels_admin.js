// Система управления уровнями администратора
// Позволяет администратору загружать, редактировать и управлять уровнями

const levelsAdmin = {
    levels: [],
    currentEditingLevel: null,
    isAdmin: false,
    publishedLevels: []  // Опубликованные уровни для всех
};

// Состояние редактора уровней администратора
const adminEditor = {
    gridSize: 6,
    cellSize: 50,
    tigerPos: {x: 0, y: 0},
    exitPos: {x: 5, y: 5},
    objects: [],
    selectedObject: 'meat',
    isDrawing: false,
    lastCell: null
};

// Инициализировать систему администратора
function initLevelsAdmin() {
    loadAdminLevels();
    checkAdminAccess();
}

// Проверить доступ администратора
function checkAdminAccess() {
    const adminPassword = localStorage.getItem('adminPassword');
    levelsAdmin.isAdmin = adminPassword === 'admin123';
}

// Загрузить уровни администратора с сервера
async function loadAdminLevels() {
    try {
        // Сначала пытаемся загрузить из localStorage
        const savedLevels = localStorage.getItem('adminLevels');
        if (savedLevels) {
            levelsAdmin.levels = JSON.parse(savedLevels);
            // Мигрируем старые уровни, добавляя поля завершения если их нет
            levelsAdmin.levels = levelsAdmin.levels.map(level => {
                if (!level.hasOwnProperty('completed')) {
                    level.completed = false;
                    level.completions = 0;
                    level.bestScore = 0;
                    level.bestSteps = Infinity;
                    level.lastCompletionTime = null;
                }
                return level;
            });
            // Сохраняем мигрированные уровни
            localStorage.setItem('adminLevels', JSON.stringify(levelsAdmin.levels));
            return;
        }
        
        // Если в localStorage нет, загружаем с сервера
        const response = await fetch('levels/admin_levels.json');
        if (response.ok) {
            const data = await response.json();
            levelsAdmin.levels = data.levels || [];
            // Инициализируем поля завершения для новых уровней
            levelsAdmin.levels = levelsAdmin.levels.map(level => {
                if (!level.hasOwnProperty('completed')) {
                    level.completed = false;
                    level.completions = 0;
                    level.bestScore = 0;
                    level.bestSteps = Infinity;
                    level.lastCompletionTime = null;
                }
                return level;
            });
            // Сохраняем в localStorage
            localStorage.setItem('adminLevels', JSON.stringify(levelsAdmin.levels));
        } else {
            levelsAdmin.levels = [];
        }
    } catch (e) {
        console.log('Уровни администратора не найдены, используется пустой список');
        // Пытаемся загрузить из localStorage как резервный вариант
        const savedLevels = localStorage.getItem('adminLevels');
        levelsAdmin.levels = savedLevels ? JSON.parse(savedLevels) : [];
    }
}

// Получить уровни администратора отсортированные по рейтингу
function getAdminLevelsByRating() {
    return [...levelsAdmin.levels].sort((a, b) => {
        const ratingA = a.rating || 0;
        const ratingB = b.rating || 0;
        return ratingB - ratingA;
    });
}

// Показать уровни администратора
function showAdminLevels() {
    const sortedLevels = getAdminLevelsByRating();
    
    let adminHTML = `
        <div style="padding: 20px;">
            <h2 style="color: var(--primary-color); text-align: center; font-size: 1.8em; margin-bottom: 20px;">🏗️ Уровни администратора</h2>
            
            ${levelsAdmin.isAdmin ? `
                <div style="display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap;">
                    <button onclick="showAdminLevelEditor()" style="flex: 1; min-width: 150px; padding: 10px; background: var(--primary-color); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">➕ Создать уровень</button>
                    <button onclick="uploadAdminLevel()" style="flex: 1; min-width: 150px; padding: 10px; background: var(--success-color); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">📤 Загрузить уровень</button>
                </div>
            ` : ''}
            
            ${sortedLevels.length === 0 ? `
                <div style="color: var(--text-secondary); text-align: center; padding: 40px;">
                    <p style="font-size: 1.1em;">Уровни администратора не найдены</p>
                </div>
            ` : `
                <div style="display: grid; gap: 15px;">
                    ${sortedLevels.map((level, index) => `
                        <div style="background: var(--bg-primary); padding: 15px; border-radius: 10px; border-left: 4px solid var(--primary-color);">
                            <div style="display: flex; justify-content: space-between; align-items: start;">
                                <div style="flex: 1;">
                                    <div style="font-weight: 600; color: var(--text-primary); font-size: 1.1em;">
                                        ${level.name}
                                    </div>
                                    <div style="font-size: 0.85em; color: var(--text-secondary); margin-top: 5px;">
                                        📅 ${level.createdAt || 'Неизвестно'}
                                    </div>
                                    <div style="font-size: 0.85em; color: var(--text-secondary); margin-top: 3px;">
                                        📝 ${level.description || 'Нет описания'}
                                    </div>
                                </div>
                                <div style="text-align: right;">
                                    <div style="font-size: 1.3em; margin-bottom: 5px;">
                                        ${getStarsDisplay(level.rating || 0)}
                                    </div>
                                    <div style="font-size: 0.85em; color: var(--text-secondary); margin-bottom: 10px;">
                                        🎮 ${level.plays || 0} игр
                                    </div>
                                    <div style="display: flex; gap: 5px;">
                                        <button onclick="playAdminLevel(${index})" style="flex: 1; padding: 6px; background: var(--success-color); color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 0.8em;">▶️ Играть</button>
                                        ${levelsAdmin.isAdmin ? `
                                            <button onclick="editAdminLevel(${index})" style="flex: 1; padding: 6px; background: var(--primary-color); color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 0.8em;">✏️ Редактировать</button>
                                            <button onclick="deleteAdminLevel(${index})" style="flex: 1; padding: 6px; background: #f44336; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 0.8em;">🗑️ Удалить</button>
                                        ` : ''}
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `}
        </div>
    `;
    
    document.getElementById('stats-content').innerHTML = adminHTML;
    document.getElementById('stats-modal').classList.add('active');
}

// Показать редактор уровня администратора
function showAdminLevelEditor(levelIndex = null) {
    const level = levelIndex !== null ? levelsAdmin.levels[levelIndex] : null;
    
    let editorHTML = `
        <div style="padding: 20px; max-width: 900px;">
            <h2 style="color: var(--primary-color); text-align: center; font-size: 1.8em; margin-bottom: 20px;">
                ${level ? '✏️ Редактировать уровень' : '➕ Создать новый уровень'}
            </h2>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <!-- Левая колонка: информация -->
                <div style="display: grid; gap: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 600; color: var(--text-primary);">Название уровня:</label>
                        <input type="text" id="admin-level-name" value="${level ? level.name : ''}" placeholder="Введи название" style="width: 100%; padding: 10px; border: 2px solid var(--primary-color); border-radius: 8px; background: var(--bg-primary); color: var(--text-primary); box-sizing: border-box;">
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 600; color: var(--text-primary);">Описание:</label>
                        <textarea id="admin-level-description" placeholder="Введи описание уровня" style="width: 100%; padding: 10px; border: 2px solid var(--primary-color); border-radius: 8px; background: var(--bg-primary); color: var(--text-primary); box-sizing: border-box; min-height: 80px; resize: vertical;">${level ? level.description || '' : ''}</textarea>
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 600; color: var(--text-primary);">Сложность:</label>
                        <select id="admin-level-difficulty" style="width: 100%; padding: 10px; border: 2px solid var(--primary-color); border-radius: 8px; background: var(--bg-primary); color: var(--text-primary);">
                            <option value="Легкая" ${level && level.difficulty === 'Легкая' ? 'selected' : ''}>Легкая</option>
                            <option value="Средняя" ${level && level.difficulty === 'Средняя' ? 'selected' : ''}>Средняя</option>
                            <option value="Сложная" ${level && level.difficulty === 'Сложная' ? 'selected' : ''}>Сложная</option>
                        </select>
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 600; color: var(--text-primary);">Размер сетки:</label>
                        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;">
                            <button class="size-btn admin-size-btn" onclick="setAdminEditorSize(4)" style="padding: 8px; background: var(--bg-primary); border: 2px solid var(--primary-color); border-radius: 6px; cursor: pointer; font-weight: 600;">4x4</button>
                            <button class="size-btn admin-size-btn" onclick="setAdminEditorSize(6)" style="padding: 8px; background: var(--bg-primary); border: 2px solid var(--primary-color); border-radius: 6px; cursor: pointer; font-weight: 600;">6x6</button>
                            <button class="size-btn admin-size-btn" onclick="setAdminEditorSize(8)" style="padding: 8px; background: var(--bg-primary); border: 2px solid var(--primary-color); border-radius: 6px; cursor: pointer; font-weight: 600;">8x8</button>
                            <button class="size-btn admin-size-btn" onclick="setAdminEditorSize(10)" style="padding: 8px; background: var(--bg-primary); border: 2px solid var(--primary-color); border-radius: 6px; cursor: pointer; font-weight: 600;">10x10</button>
                            <button class="size-btn admin-size-btn" onclick="setAdminEditorSize(12)" style="padding: 8px; background: var(--bg-primary); border: 2px solid var(--primary-color); border-radius: 6px; cursor: pointer; font-weight: 600;">12x12</button>
                        </div>
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 600; color: var(--text-primary);">Выбери объект:</label>
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
                            <button class="admin-obj-btn" onclick="selectAdminObject('tiger')" style="padding: 10px; background: var(--bg-primary); border: 2px solid var(--primary-color); border-radius: 6px; cursor: pointer; font-size: 1.2em;">🐅 Тигр</button>
                            <button class="admin-obj-btn" onclick="selectAdminObject('exit')" style="padding: 10px; background: var(--bg-primary); border: 2px solid var(--primary-color); border-radius: 6px; cursor: pointer; font-size: 1.2em;">🟢 Выход</button>
                            <button class="admin-obj-btn" onclick="selectAdminObject('meat')" style="padding: 10px; background: var(--bg-primary); border: 2px solid var(--primary-color); border-radius: 6px; cursor: pointer; font-size: 1.2em;">🍖 Мясо</button>
                            <button class="admin-obj-btn" onclick="selectAdminObject('key')" style="padding: 10px; background: var(--bg-primary); border: 2px solid var(--primary-color); border-radius: 6px; cursor: pointer; font-size: 1.2em;">🔑 Ключ</button>
                            <button class="admin-obj-btn" onclick="selectAdminObject('door')" style="padding: 10px; background: var(--bg-primary); border: 2px solid var(--primary-color); border-radius: 6px; cursor: pointer; font-size: 1.2em;">🚪 Дверь</button>
                            <button class="admin-obj-btn" onclick="selectAdminObject('empty')" style="padding: 10px; background: var(--bg-primary); border: 2px solid var(--primary-color); border-radius: 6px; cursor: pointer; font-size: 1.2em;">🗑️ Удалить</button>
                        </div>
                    </div>
                </div>
                
                <!-- Правая колонка: редактор сетки -->
                <div>
                    <label style="display: block; margin-bottom: 10px; font-weight: 600; color: var(--text-primary);">Редактор уровня:</label>
                    <div id="admin-editor-grid" style="display: inline-grid; gap: 2px; padding: 10px; background: var(--bg-primary); border-radius: 8px; border: 2px solid var(--primary-color);"></div>
                    <div style="margin-top: 15px; font-size: 0.9em; color: var(--text-secondary);">
                        <p>💡 Нажми на клетку, чтобы разместить объект</p>
                        <p>🐅 Тигр: начальная позиция</p>
                        <p>🟢 Выход: конечная позиция</p>
                    </div>
                </div>
            </div>
            
            <div style="display: flex; gap: 10px; margin-top: 20px; flex-wrap: wrap;">
                <button onclick="saveAdminLevel(${levelIndex !== null ? levelIndex : 'null'})" style="flex: 1; min-width: 120px; padding: 12px; background: var(--success-color); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 1em;">💾 Сохранить</button>
                <button onclick="closeAdminEditor()" style="flex: 1; min-width: 120px; padding: 12px; background: var(--text-secondary); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 1em;">❌ Отмена</button>
            </div>
        </div>
    `;
    
    document.getElementById('stats-content').innerHTML = editorHTML;
    document.getElementById('stats-modal').classList.add('active');
    
    // Инициализировать редактор
    initAdminEditor(level);
}

// Сохранить уровень администратора
function saveAdminLevel(levelIndex) {
    const name = document.getElementById('admin-level-name').value.trim();
    const description = document.getElementById('admin-level-description').value.trim();
    const difficulty = document.getElementById('admin-level-difficulty').value;
    
    if (!name) {
        showMessage('❌ Ошибка', 'Введи название уровня!');
        return;
    }
    
    // Получить данные уровня из редактора
    const levelData = {
        name: name,
        start: adminEditor.tigerPos,
        exit: adminEditor.exitPos,
        objects: [...adminEditor.objects],
        gridSize: adminEditor.gridSize,
        isSandboxLevel: true,
        savedAt: new Date().toISOString()
    };
    
    const adminLevel = {
        name: name,
        description: description,
        difficulty: difficulty,
        data: levelData,
        createdAt: new Date().toLocaleString('ru-RU'),
        rating: 0,
        plays: 0
    };
    
    if (levelIndex !== null) {
        levelsAdmin.levels[levelIndex] = adminLevel;
    } else {
        levelsAdmin.levels.push(adminLevel);
    }
    
    saveAdminLevels();
    showMessage('✅ Успешно', 'Уровень сохранен!');
    showAdminLevels();
}

// Удалить уровень администратора
function deleteAdminLevel(levelIndex) {
    if (confirm('Ты уверен? Это действие нельзя отменить!')) {
        levelsAdmin.levels.splice(levelIndex, 1);
        saveAdminLevels();
        showMessage('✅ Удалено', 'Уровень удален!');
        showAdminLevels();
    }
}

// Закрыть редактор
function closeAdminEditor() {
    showAdminLevels();
}

// Сохранить уровни администратора на сервер
function saveAdminLevels() {
    // В реальном приложении это отправляло бы на сервер
    // Пока сохраняем в localStorage
    localStorage.setItem('adminLevels', JSON.stringify(levelsAdmin.levels));
}

// Загрузить уровень администратора
function uploadAdminLevel() {
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
                
                const adminLevel = {
                    name: levelData.name || 'Загруженный уровень',
                    description: levelData.description || '',
                    difficulty: levelData.difficulty || 'Средняя',
                    data: levelData,
                    createdAt: new Date().toLocaleString('ru-RU'),
                    rating: 0,
                    plays: 0
                };
                
                levelsAdmin.levels.push(adminLevel);
                saveAdminLevels();
                showMessage('✅ Уровень загружен!', `Уровень "${adminLevel.name}" добавлен в систему!`);
                showAdminLevels();
            } catch (e) {
                showMessage('❌ Ошибка при загрузке', `Не удалось загрузить файл:\n\n${e.message}`);
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

// Играть в уровень администратора
function playAdminLevel(levelIndex) {
    const level = levelsAdmin.levels[levelIndex];
    if (!level || !level.data) {
        showMessage('❌ Ошибка', 'Уровень не содержит данных!');
        return;
    }
    
    // Загрузить уровень в песочницу и начать игру
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
    
    // Сохранить информацию о текущем админ-уровне
    window.currentAdminLevel = {
        index: levelIndex,
        name: level.name,
        levelData: level
    };
    
    // Увеличить счетчик игр
    level.plays = (level.plays || 0) + 1;
    saveAdminLevels();
    
    // Закрыть модальное окно и начать игру
    document.getElementById('stats-modal').classList.remove('active');
    playSandboxLevel();
}


// Инициализировать редактор уровня
function initAdminEditor(level) {
    // Установить размер сетки
    if (level && level.data) {
        adminEditor.gridSize = level.data.gridSize || 6;
        adminEditor.tigerPos = level.data.start || {x: 0, y: 0};
        adminEditor.exitPos = level.data.exit || {x: adminEditor.gridSize - 1, y: adminEditor.gridSize - 1};
        adminEditor.objects = level.data.objects ? [...level.data.objects] : [];
    } else {
        adminEditor.gridSize = 6;
        adminEditor.tigerPos = {x: 0, y: 0};
        adminEditor.exitPos = {x: 5, y: 5};
        adminEditor.objects = [];
    }
    
    // Установить размер ячейки в зависимости от размера сетки
    if (adminEditor.gridSize <= 6) {
        adminEditor.cellSize = 50;
    } else if (adminEditor.gridSize <= 10) {
        adminEditor.cellSize = 40;
    } else {
        adminEditor.cellSize = 30;
    }
    
    // Обновить кнопки размера
    document.querySelectorAll('.admin-size-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.includes(adminEditor.gridSize)) {
            btn.classList.add('active');
            btn.style.background = 'var(--primary-color)';
            btn.style.color = 'white';
        }
    });
    
    // Обновить кнопки объектов
    document.querySelectorAll('.admin-obj-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Нарисовать сетку
    updateAdminEditorGrid();
}

// Установить размер сетки редактора
function setAdminEditorSize(size) {
    adminEditor.gridSize = size;
    
    // Установить размер ячейки
    if (size <= 6) {
        adminEditor.cellSize = 50;
    } else if (size <= 10) {
        adminEditor.cellSize = 40;
    } else {
        adminEditor.cellSize = 30;
    }
    
    // Обновить позиции выхода
    adminEditor.exitPos = {x: size - 1, y: size - 1};
    
    // Обновить кнопки
    document.querySelectorAll('.admin-size-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.style.background = 'var(--bg-primary)';
        btn.style.color = 'var(--text-primary)';
        if (btn.textContent.includes(size)) {
            btn.classList.add('active');
            btn.style.background = 'var(--primary-color)';
            btn.style.color = 'white';
        }
    });
    
    // Перерисовать сетку
    updateAdminEditorGrid();
}

// Выбрать объект для размещения
function selectAdminObject(objectType) {
    adminEditor.selectedObject = objectType;
    
    // Обновить кнопки
    document.querySelectorAll('.admin-obj-btn').forEach(btn => {
        btn.style.background = 'var(--bg-primary)';
        btn.style.borderColor = 'var(--primary-color)';
    });
    
    // Найти и выделить выбранную кнопку
    const buttons = document.querySelectorAll('.admin-obj-btn');
    buttons.forEach(btn => {
        if (btn.textContent.includes(objectType === 'tiger' ? 'Тигр' : 
                                     objectType === 'exit' ? 'Выход' :
                                     objectType === 'meat' ? 'Мясо' :
                                     objectType === 'key' ? 'Ключ' :
                                     objectType === 'door' ? 'Дверь' : 'Удалить')) {
            btn.style.background = 'var(--primary-color)';
            btn.style.color = 'white';
        }
    });
}

// Обновить сетку редактора
function updateAdminEditorGrid() {
    const grid = document.getElementById('admin-editor-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    grid.style.gridTemplateColumns = `repeat(${adminEditor.gridSize}, ${adminEditor.cellSize}px)`;
    grid.style.gridTemplateRows = `repeat(${adminEditor.gridSize}, ${adminEditor.cellSize}px)`;
    
    let isMouseDown = false;
    grid.addEventListener('mousedown', function(e) {
        isMouseDown = true;
        adminEditor.isDrawing = true;
        const cell = e.target.closest('.admin-editor-cell');
        if (cell) handleAdminEditorClick(cell);
    });
    grid.addEventListener('mousemove', function(e) {
        if (isMouseDown && adminEditor.isDrawing) {
            const cell = e.target.closest('.admin-editor-cell');
            if (cell) handleAdminEditorClick(cell);
        }
    });
    document.addEventListener('mouseup', function() {
        isMouseDown = false;
        adminEditor.isDrawing = false;
        adminEditor.lastCell = null;
    });
    
    for (let y = 0; y < adminEditor.gridSize; y++) {
        for (let x = 0; x < adminEditor.gridSize; x++) {
            const cell = document.createElement('div');
            cell.className = 'admin-editor-cell';
            cell.dataset.x = x;
            cell.dataset.y = y;
            cell.style.width = `${adminEditor.cellSize}px`;
            cell.style.height = `${adminEditor.cellSize}px`;
            cell.style.border = '2px solid var(--border-color)';
            cell.style.display = 'flex';
            cell.style.alignItems = 'center';
            cell.style.justifyContent = 'center';
            cell.style.fontSize = `${adminEditor.cellSize * 0.6}px`;
            cell.style.cursor = 'pointer';
            cell.style.background = 'var(--bg-secondary)';
            cell.style.borderRadius = '4px';
            
            cell.addEventListener('click', function(e) {
                if (!adminEditor.isDrawing) {
                    const x = parseInt(this.dataset.x);
                    const y = parseInt(this.dataset.y);
                    placeAdminObject(x, y);
                }
            });
            
            grid.appendChild(cell);
        }
    }
    
    renderAdminEditorGrid();
}

// Обработать клик по ячейке редактора
function handleAdminEditorClick(cell) {
    const x = parseInt(cell.dataset.x);
    const y = parseInt(cell.dataset.y);
    placeAdminObject(x, y);
}

// Разместить объект в редакторе
function placeAdminObject(x, y) {
    if (adminEditor.selectedObject === 'tiger') {
        adminEditor.tigerPos = {x, y};
    } else if (adminEditor.selectedObject === 'exit') {
        adminEditor.exitPos = {x, y};
    } else if (adminEditor.selectedObject === 'empty') {
        adminEditor.objects = adminEditor.objects.filter(obj => !(obj.x === x && obj.y === y));
        if (adminEditor.tigerPos.x === x && adminEditor.tigerPos.y === y) {
            adminEditor.tigerPos = {x: 0, y: 0};
        }
        if (adminEditor.exitPos.x === x && adminEditor.exitPos.y === y) {
            adminEditor.exitPos = {x: adminEditor.gridSize - 1, y: adminEditor.gridSize - 1};
        }
    } else if (adminEditor.selectedObject !== 'tiger' && adminEditor.selectedObject !== 'exit') {
        if ((adminEditor.tigerPos.x === x && adminEditor.tigerPos.y === y) || 
            (adminEditor.exitPos.x === x && adminEditor.exitPos.y === y)) {
            return;
        }
        const existingIndex = adminEditor.objects.findIndex(obj => obj.x === x && obj.y === y);
        if (existingIndex !== -1) {
            adminEditor.objects[existingIndex].type = adminEditor.selectedObject;
        } else {
            adminEditor.objects.push({type: adminEditor.selectedObject, x: x, y: y});
        }
    }
    renderAdminEditorGrid();
}

// Отрисовать сетку редактора
function renderAdminEditorGrid() {
    const cells = document.querySelectorAll('.admin-editor-cell');
    cells.forEach(cell => {
        const x = parseInt(cell.dataset.x);
        const y = parseInt(cell.dataset.y);
        cell.textContent = '';
        cell.style.background = 'var(--bg-secondary)';
        cell.style.borderColor = 'var(--border-color)';
        
        if (adminEditor.tigerPos.x === x && adminEditor.tigerPos.y === y) {
            cell.textContent = '🐅';
            cell.style.background = '#ff9800';
            cell.style.borderColor = '#f57c00';
        } else if (adminEditor.exitPos.x === x && adminEditor.exitPos.y === y) {
            cell.textContent = '🟢';
            cell.style.background = '#4caf50';
            cell.style.borderColor = '#388e3c';
        } else {
            const obj = adminEditor.objects.find(o => o.x === x && o.y === y);
            if (obj) {
                switch(obj.type) {
                    case 'meat': cell.textContent = '🍖'; cell.style.background = '#ffb74d'; cell.style.borderColor = '#ffa726'; break;
                    case 'key': cell.textContent = '🔑'; cell.style.background = '#ffd54f'; cell.style.borderColor = '#ffca28'; break;
                    case 'door': cell.textContent = '🚪'; cell.style.background = '#ba68c8'; cell.style.borderColor = '#ab47bc'; break;
                }
            }
        }
    });
}


// ===== ПУБЛИКАЦИЯ УРОВНЕЙ =====

// Загрузить опубликованные уровни
function loadPublishedLevels() {
    const published = localStorage.getItem('publishedLevels');
    if (published) {
        levelsAdmin.publishedLevels = JSON.parse(published);
    } else {
        levelsAdmin.publishedLevels = [];
    }
}

// Сохранить опубликованные уровни
function savePublishedLevels() {
    localStorage.setItem('publishedLevels', JSON.stringify(levelsAdmin.publishedLevels));
}

// Опубликовать уровень
function publishAdminLevel(index) {
    const level = levelsAdmin.levels[index];
    if (!level || !level.data) {
        alert('❌ Ошибка: уровень не содержит данных!');
        return;
    }
    
    // Проверить, не опубликован ли уже
    const alreadyPublished = levelsAdmin.publishedLevels.find(l => l.id === level.id);
    if (alreadyPublished) {
        alert('⚠️ Этот уровень уже опубликован!');
        return;
    }
    
    // Создать опубликованный уровень
    const publishedLevel = {
        id: level.id || Date.now(),
        name: level.name,
        description: level.description,
        difficulty: level.difficulty,
        data: level.data,
        publishedAt: new Date().toLocaleString('ru-RU'),
        publishedBy: playerName || 'Администратор',
        rating: 0,
        plays: 0,
        votes: 0
    };
    
    levelsAdmin.publishedLevels.push(publishedLevel);
    savePublishedLevels();
    
    // Показать уведомление всем
    const notification = {
        title: '🎉 Новый уровень опубликован!',
        text: `Администратор опубликовал новый уровень: "${level.name}"\n\nСложность: ${level.difficulty}\n\nПроверь его в главной панели!`,
        timestamp: new Date().toLocaleString('ru-RU')
    };
    
    const notifications = JSON.parse(localStorage.getItem('admin_notifications') || '[]');
    notifications.unshift(notification);
    localStorage.setItem('admin_notifications', JSON.stringify(notifications));
    
    alert('✅ Уровень опубликован для всех!');
    
    // Обновить список
    loadAdminLevelsTab();
}

// Отменить публикацию уровня
function unpublishAdminLevel(index) {
    const level = levelsAdmin.levels[index];
    if (!level) return;
    
    const publishedIndex = levelsAdmin.publishedLevels.findIndex(l => l.id === level.id);
    if (publishedIndex === -1) {
        alert('⚠️ Этот уровень не опубликован!');
        return;
    }
    
    if (confirm('Отменить публикацию этого уровня?')) {
        levelsAdmin.publishedLevels.splice(publishedIndex, 1);
        savePublishedLevels();
        alert('✅ Публикация отменена!');
        loadAdminLevelsTab();
    }
}

// Получить опубликованные уровни
function getPublishedLevels() {
    loadPublishedLevels();
    return levelsAdmin.publishedLevels;
}

// Проверить, опубликован ли уровень
function isLevelPublished(levelId) {
    loadPublishedLevels();
    return levelsAdmin.publishedLevels.some(l => l.id === levelId);
}
