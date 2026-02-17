// АДМИН-ПАНЕЛЬ
const ADMIN_PASSWORD = "yjdsqujl2015";
const ADMIN_KEY = "tiger_admin_logged_in";

function openAdminPanel() {
    const isLoggedIn = sessionStorage.getItem(ADMIN_KEY);
    if (!isLoggedIn) {
        showAdminLoginModal();
        return;
    }
    showAdminPanelContent();
}

function showAdminLoginModal() {
    const password = prompt('🔐 Введи пароль админ-панели:', '');
    if (password === null) return;
    
    if (password === ADMIN_PASSWORD) {
        // Второй этап - 2FA вопрос
        show2FAModal();
    } else {
        alert('❌ Неверный пароль!');
    }
}

function show2FAModal() {
    const answer = prompt('🔐 Второй этап проверки:\n\nКак звали кота из "Короля Льва"?', '');
    if (answer === null) return;
    
    if (answer.toLowerCase().trim() === 'симба') {
        sessionStorage.setItem(ADMIN_KEY, 'true');
        
        // Пропускаем историю и туториал для админа
        skipStoryAndTutorial();
        
        showAdminPanelContent();
    } else {
        alert('❌ Неверный ответ! Попробуй ещё раз.');
    }
}

function showAdminPanelContent() {
    const modal = document.getElementById('admin-modal');
    modal.classList.add('active');
    loadAdminData();
}

function closeAdminPanel() {
    const modal = document.getElementById('admin-modal');
    modal.classList.remove('active');
}

function switchAdminTab(tabName) {
    // Скрываем все вкладки
    document.querySelectorAll('.admin-tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Убираем активный класс со всех кнопок
    document.querySelectorAll('.admin-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Показываем нужную вкладку
    const tabElement = document.getElementById('admin-' + tabName + '-tab');
    if (tabElement) {
        tabElement.classList.add('active');
    }
    
    // Делаем кнопку активной по data-атрибуту
    const activeBtn = document.querySelector(`.admin-tab-btn[data-tab="${tabName}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
}

function loadAdminData() {
    loadUserLevels();
    loadUsersList();
    loadNotifications();
    loadStats();
    loadSettings();
    loadAdminLevelsTab();
}

function loadUserLevels() {
    const userLevels = JSON.parse(localStorage.getItem('user_levels') || '[]');
    const list = document.getElementById('admin-user-levels-list');
    if (userLevels.length === 0) {
        list.innerHTML = '<p>Нет загруженных уровней</p>';
        return;
    }
    list.innerHTML = userLevels.map((level, index) => `
        <div class="admin-level-item">
            <strong>${level.name}</strong>
            <p>Автор: ${level.author || 'Неизвестно'}</p>
            <p>Размер: ${level.gridSize || 8}x${level.gridSize || 8}</p>
            <button onclick="adminDeleteLevel(${index})">Удалить</button>
            <button onclick="adminDownloadLevel(${index})">Скачать</button>
        </div>
    `).join('');
}

function loadUsersList() {
    const users = JSON.parse(localStorage.getItem('users_list') || '[]');
    const list = document.getElementById('admin-users-list');
    if (users.length === 0) {
        list.innerHTML = '<p>Нет активных пользователей</p>';
        return;
    }
    list.innerHTML = users.map((user, index) => `
        <div class="admin-user-item">
            <strong>${user.name}</strong>
            <p>Уровень: ${user.level || 1}</p>
            <p>Очки: ${user.score || 0}</p>
            <p>Время: ${user.lastActive || 'Неизвестно'}</p>
            <button onclick="adminDeleteUser(${index})">Удалить</button>
        </div>
    `).join('');
}

function loadStats() {
    const users = JSON.parse(localStorage.getItem('users_list') || '[]');
    const userLevels = JSON.parse(localStorage.getItem('user_levels') || '[]');
    document.getElementById('admin-total-users').textContent = users.length;
    document.getElementById('admin-total-levels').textContent = userLevels.length;
    let completedCount = 0;
    users.forEach(user => {
        if (user.completedLevels) {
            completedCount += user.completedLevels.length;
        }
    });
    document.getElementById('admin-completed-levels').textContent = completedCount;
}

function loadSettings() {
    const aiEnabled = localStorage.getItem('ai_chat_enabled') === 'true';
    document.getElementById('ai-enabled-checkbox').checked = aiEnabled;
}

function adminUploadLevel() {
    const fileInput = document.getElementById('admin-level-upload');
    if (!fileInput.files || fileInput.files.length === 0) {
        fileInput.click();
        return;
    }
    
    const file = fileInput.files[0];
    if (!file) {
        alert('Выбери файл!');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const levelData = JSON.parse(e.target.result);
            
            if (!levelData.start || !levelData.exit) {
                alert('❌ Ошибка: в файле должны быть поля "start" и "exit"!');
                return;
            }
            
            if (!levelData.objects) {
                levelData.objects = [];
            }
            if (!levelData.gridSize) {
                levelData.gridSize = 8;
            }
            if (!levelData.name) {
                levelData.name = file.name.replace('.json', '');
            }
            
            levelData.author = playerName || 'Неизвестно';
            levelData.uploadedAt = new Date().toISOString();
            
            const userLevels = JSON.parse(localStorage.getItem('user_levels') || '[]');
            userLevels.push(levelData);
            localStorage.setItem('user_levels', JSON.stringify(userLevels));
            
            alert('✅ Уровень "' + levelData.name + '" загружен успешно!');
            fileInput.value = '';
            loadUserLevels();
            loadStats();
        } catch (error) {
            alert('❌ Ошибка при загрузке файла:\n\n' + error.message);
        }
    };
    reader.onerror = function(error) {
        alert('❌ Ошибка при чтении файла!');
    };
    reader.readAsText(file);
}

function adminDeleteLevel(index) {
    if (confirm('Удалить этот уровень?')) {
        const userLevels = JSON.parse(localStorage.getItem('user_levels') || '[]');
        userLevels.splice(index, 1);
        localStorage.setItem('user_levels', JSON.stringify(userLevels));
        loadUserLevels();
        loadStats();
    }
}

function adminDownloadLevel(index) {
    const userLevels = JSON.parse(localStorage.getItem('user_levels') || '[]');
    const level = userLevels[index];
    const blob = new Blob([JSON.stringify(level, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `level_${level.name}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function adminDeleteUser(index) {
    if (confirm('Удалить этого пользователя?')) {
        const users = JSON.parse(localStorage.getItem('users_list') || '[]');
        users.splice(index, 1);
        localStorage.setItem('users_list', JSON.stringify(users));
        loadUsersList();
        loadStats();
    }
}

function toggleAIChat(enabled) {
    localStorage.setItem('ai_chat_enabled', enabled ? 'true' : 'false');
    if (enabled) {
        alert('✅ ИИ помощник включен для пользователей!');
    } else {
        alert('❌ ИИ помощник выключен!');
    }
}

function trackUser(name, level, score) {
    const users = JSON.parse(localStorage.getItem('users_list') || '[]');
    let user = users.find(u => u.name === name);
    if (!user) {
        user = {
            name: name,
            level: level,
            score: score,
            completedLevels: [],
            lastActive: new Date().toLocaleString('ru-RU')
        };
        users.push(user);
    } else {
        user.level = level;
        user.score = score;
        user.lastActive = new Date().toLocaleString('ru-RU');
    }
    localStorage.setItem('users_list', JSON.stringify(users));
}

function trackCompletedLevel(playerName, levelNumber) {
    const users = JSON.parse(localStorage.getItem('users_list') || '[]');
    let user = users.find(u => u.name === playerName);
    if (user) {
        if (!user.completedLevels) {
            user.completedLevels = [];
        }
        if (!user.completedLevels.includes(levelNumber)) {
            user.completedLevels.push(levelNumber);
        }
        localStorage.setItem('users_list', JSON.stringify(users));
    }
}

// Инициализация при загрузке
window.addEventListener('load', function() {
    console.log('✅ Админ-панель инициализирована');
});

// УВЕДОМЛЕНИЯ
function loadNotifications() {
    const notifications = JSON.parse(localStorage.getItem('admin_notifications') || '[]');
    const list = document.getElementById('admin-notifications-list');
    if (notifications.length === 0) {
        list.innerHTML = '<p>Нет отправленных уведомлений</p>';
        return;
    }
    list.innerHTML = notifications.map((notif, index) => `
        <div class="admin-notification-item">
            <strong>${notif.title}</strong>
            <p>${notif.text}</p>
            <small>Отправлено: ${notif.timestamp}</small>
            <button onclick="deleteNotification(${index})" style="background: #f44336 !important; margin-top: 8px;">Удалить</button>
        </div>
    `).join('');
}

function sendNotificationToAll() {
    const title = document.getElementById('notification-title').value.trim();
    const text = document.getElementById('notification-text').value.trim();
    
    if (!title || !text) {
        alert('❌ Заполни заголовок и текст уведомления!');
        return;
    }
    
    const notification = {
        title: title,
        text: text,
        timestamp: new Date().toLocaleString('ru-RU')
    };
    
    const notifications = JSON.parse(localStorage.getItem('admin_notifications') || '[]');
    notifications.unshift(notification);
    localStorage.setItem('admin_notifications', JSON.stringify(notifications));
    
    // Показываем уведомление всем пользователям
    showNotificationPopup(title, text);
    
    // Очищаем форму
    document.getElementById('notification-title').value = '';
    document.getElementById('notification-text').value = '';
    
    alert('✅ Уведомление отправлено всем пользователям!');
    loadNotifications();
}

function deleteNotification(index) {
    if (confirm('Удалить это уведомление?')) {
        const notifications = JSON.parse(localStorage.getItem('admin_notifications') || '[]');
        notifications.splice(index, 1);
        localStorage.setItem('admin_notifications', JSON.stringify(notifications));
        loadNotifications();
    }
}

function showNotificationPopup(title, text) {
    const popup = document.createElement('div');
    popup.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        max-width: 400px;
        animation: slideInRight 0.5s ease-out;
    `;
    popup.innerHTML = `
        <h3 style="margin: 0 0 10px 0; font-size: 18px;">${title}</h3>
        <p style="margin: 0; font-size: 14px; line-height: 1.5;">${text}</p>
        <small style="opacity: 0.8; font-size: 12px;">Нажми, чтобы закрыть</small>
    `;
    popup.onclick = function() {
        popup.style.animation = 'slideOutRight 0.5s ease-out';
        setTimeout(() => popup.remove(), 500);
    };
    document.body.appendChild(popup);
    
    setTimeout(() => {
        if (popup.parentElement) {
            popup.style.animation = 'slideOutRight 0.5s ease-out';
            setTimeout(() => popup.remove(), 500);
        }
    }, 10000);
}


// РЕДАКТИРОВАНИЕ ВСТРОЕННЫХ УРОВНЕЙ
let currentEditingLevel = null;
let editLevelObjects = [];
let selectedEditObject = 'tiger';

function editLevelFull(levelNum) {
    currentEditingLevel = levelNum;
    editLevelObjects = [];
    selectedEditObject = 'tiger';
    
    // Получаем текущие данные уровня
    const edits = JSON.parse(localStorage.getItem('level_edits') || '{}');
    const level = levels[levelNum];
    
    // Если есть отредактированные данные, используем их, иначе используем стандартные
    let levelData;
    if (edits[levelNum]) {
        levelData = edits[levelNum];
    } else {
        levelData = {
            name: level.name,
            task: level.task,
            objects: [...level.objects],
            difficulty: levelNum
        };
    }
    
    // Копируем объекты
    editLevelObjects = levelData.objects ? [...levelData.objects] : [];
    
    // Заполняем форму
    document.getElementById('edit-level-title').textContent = `Редактирование уровня ${levelNum}`;
    document.getElementById('edit-level-name').value = levelData.name || level.name;
    document.getElementById('edit-level-task').value = levelData.task || level.task;
    document.getElementById('edit-level-difficulty').value = levelData.difficulty || levelNum;
    
    // Рисуем сетку
    renderEditGrid();
    
    // Показываем форму
    document.getElementById('level-edit-form').style.display = 'block';
}

function selectEditObject(objType) {
    selectedEditObject = objType;
    // Обновляем визуальное выделение
    document.querySelectorAll('.obj-btn').forEach(btn => {
        btn.style.borderColor = 'var(--border-color)';
        btn.style.background = 'var(--bg-primary)';
    });
    event.target.closest('.obj-btn').style.borderColor = '#2196f3';
    event.target.closest('.obj-btn').style.background = '#e3f2fd';
}

function renderEditGrid() {
    const grid = document.getElementById('edit-level-grid');
    grid.innerHTML = '';
    grid.style.gridTemplateColumns = 'repeat(8, 50px)';
    
    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            const cell = document.createElement('div');
            cell.style.cssText = 'width: 50px; height: 50px; border: 2px solid var(--border-color); border-radius: 6px; background: var(--bg-secondary); display: flex; align-items: center; justify-content: center; font-size: 28px; cursor: pointer; transition: all 0.2s;';
            
            // Проверяем, есть ли объект на этой позиции
            const obj = editLevelObjects.find(o => o.x === x && o.y === y);
            if (obj) {
                const icons = { tiger: '🐯', exit: '🟢', meat: '🍖', key: '🔑', tree: '🌳', wall: '🧱', door: '🚪' };
                cell.textContent = icons[obj.type] || '';
                cell.style.background = '#e3f2fd';
                cell.style.borderColor = '#2196f3';
            }
            
            cell.onmouseover = function() {
                this.style.transform = 'scale(1.1)';
                this.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
            };
            cell.onmouseout = function() {
                this.style.transform = 'scale(1)';
                this.style.boxShadow = 'none';
            };
            
            cell.onclick = () => placeEditObject(x, y);
            grid.appendChild(cell);
        }
    }
}

function placeEditObject(x, y) {
    if (selectedEditObject === 'empty') {
        editLevelObjects = editLevelObjects.filter(o => !(o.x === x && o.y === y));
    } else {
        // Удаляем объект если он уже есть
        editLevelObjects = editLevelObjects.filter(o => !(o.x === x && o.y === y));
        // Добавляем новый
        editLevelObjects.push({ type: selectedEditObject, x, y });
    }
    renderEditGrid();
    autoSaveLevelEdit(); // Автосохранение
}

function autoSaveLevelEdit() {
    if (currentEditingLevel === null) return;
    
    const levelData = {
        name: document.getElementById('edit-level-name').value,
        task: document.getElementById('edit-level-task').value,
        objects: editLevelObjects,
        difficulty: parseInt(document.getElementById('edit-level-difficulty').value) || 1
    };
    
    const edits = JSON.parse(localStorage.getItem('level_edits') || '{}');
    edits[currentEditingLevel] = levelData;
    localStorage.setItem('level_edits', JSON.stringify(edits));
    
    // Показываем уведомление об автосохранении
    showAutoSaveNotification();
}

function showAutoSaveNotification() {
    const existing = document.getElementById('autosave-notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.id = 'autosave-notification';
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #4caf50;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-size: 14px;
        z-index: 10000;
        animation: slideInUp 0.3s ease-out;
    `;
    notification.textContent = '✅ Уровень автосохранён';
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutDown 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

function saveLevelEditFull() {
    if (currentEditingLevel === null) return;
    
    const levelData = {
        name: document.getElementById('edit-level-name').value,
        task: document.getElementById('edit-level-task').value,
        objects: editLevelObjects,
        difficulty: parseInt(document.getElementById('edit-level-difficulty').value) || 1
    };
    
    const edits = JSON.parse(localStorage.getItem('level_edits') || '{}');
    edits[currentEditingLevel] = levelData;
    localStorage.setItem('level_edits', JSON.stringify(edits));
    
    alert(`✅ Уровень ${currentEditingLevel} успешно сохранён!`);
    cancelLevelEditFull();
}

function resetLevelEditFull() {
    if (currentEditingLevel === null) return;
    
    if (confirm('Сбросить все изменения для этого уровня?')) {
        const edits = JSON.parse(localStorage.getItem('level_edits') || '{}');
        delete edits[currentEditingLevel];
        localStorage.setItem('level_edits', JSON.stringify(edits));
        
        alert(`✅ Уровень ${currentEditingLevel} сброшен к стандартным значениям!`);
        editLevelFull(currentEditingLevel);
    }
}

function cancelLevelEditFull() {
    currentEditingLevel = null;
    editLevelObjects = [];
    selectedEditObject = 'tiger';
    document.getElementById('level-edit-form').style.display = 'none';
}

function downloadEditedLevel() {
    if (currentEditingLevel === null) return;
    
    const levelData = {
        name: document.getElementById('edit-level-name').value,
        task: document.getElementById('edit-level-task').value,
        objects: editLevelObjects,
        difficulty: parseInt(document.getElementById('edit-level-difficulty').value) || 1,
        levelNumber: currentEditingLevel,
        editedAt: new Date().toISOString()
    };
    
    try {
        const blob = new Blob([JSON.stringify(levelData, null, 2)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `level_${currentEditingLevel}_${levelData.name.replace(/\s+/g, '_')}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        alert(`✅ Уровень "${levelData.name}" скачан!`);
    } catch (e) {
        alert('❌ Ошибка при скачивании: ' + e.message);
    }
}

// Функция для получения отредактированных данных уровня
function getEditedLevelData(levelNum) {
    const edits = JSON.parse(localStorage.getItem('level_edits') || '{}');
    return edits[levelNum] || null;
}


// ===== УПРАВЛЕНИЕ УРОВНЯМИ АДМИНИСТРАТОРА =====

function loadAdminLevelsTab() {
    const content = document.getElementById('admin-edit-levels-tab');
    if (!content) return;
    
    let html = `
        <div style="padding: 20px;">
            <h3 style="color: var(--primary-color); margin-bottom: 20px;">🏗️ Управление уровнями администратора</h3>
            
            <div style="display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap;">
                <button onclick="showAdminLevelCreator()" style="flex: 1; min-width: 150px; padding: 12px; background: var(--primary-color); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">➕ Создать уровень</button>
                <button onclick="adminUploadLevelFile()" style="flex: 1; min-width: 150px; padding: 12px; background: var(--success-color); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">📤 Загрузить уровень</button>
            </div>
            
            <h4 style="color: var(--text-primary); margin-bottom: 15px;">📋 Список уровней администратора:</h4>
            <div id="admin-levels-list" style="display: grid; gap: 10px;"></div>
        </div>
    `;
    
    content.innerHTML = html;
    loadAdminLevelsList();
}

function loadAdminLevelsList() {
    const list = document.getElementById('admin-levels-list');
    if (!list) return;
    
    if (!levelsAdmin || !levelsAdmin.levels || levelsAdmin.levels.length === 0) {
        list.innerHTML = '<p style="color: var(--text-secondary);">Нет уровней администратора</p>';
        return;
    }
    
    list.innerHTML = levelsAdmin.levels.map((level, index) => {
        const isPublished = isLevelPublished(level.id || Date.now());
        return `
        <div style="background: var(--bg-primary); padding: 15px; border-radius: 8px; border-left: 4px solid ${isPublished ? '#4caf50' : 'var(--primary-color)'};">
            <div style="display: flex; justify-content: space-between; align-items: start;">
                <div style="flex: 1;">
                    <div style="font-weight: 600; color: var(--text-primary); font-size: 1.1em;">
                        ${level.name}
                        ${isPublished ? '<span style="color: #4caf50; margin-left: 10px;">✅ Опубликован</span>' : ''}
                    </div>
                    <div style="font-size: 0.85em; color: var(--text-secondary); margin-top: 5px;">📝 ${level.description || 'Нет описания'}</div>
                    <div style="font-size: 0.85em; color: var(--text-secondary); margin-top: 3px;">📅 ${level.createdAt || 'Неизвестно'}</div>
                    <div style="font-size: 0.85em; color: var(--text-secondary); margin-top: 3px;">⭐ Сложность: ${level.difficulty || 'Средняя'}</div>
                </div>
                <div style="display: flex; gap: 5px; flex-direction: column;">
                    ${isPublished ? `
                        <button onclick="unpublishAdminLevel(${index})" style="padding: 8px 12px; background: #ff9800; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.9em;">📤 Отменить публикацию</button>
                    ` : `
                        <button onclick="publishAdminLevel(${index})" style="padding: 8px 12px; background: #4caf50; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.9em;">🚀 Опубликовать</button>
                    `}
                    <button onclick="editAdminLevelFromPanel(${index})" style="padding: 8px 12px; background: var(--primary-color); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.9em;">✏️ Редактировать</button>
                    <button onclick="deleteAdminLevelFromPanel(${index})" style="padding: 8px 12px; background: #f44336; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.9em;">🗑️ Удалить</button>
                    <button onclick="downloadAdminLevelFromPanel(${index})" style="padding: 8px 12px; background: var(--success-color); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.9em;">📥 Скачать</button>
                </div>
            </div>
        </div>
    `;
    }).join('');
}

function showAdminLevelCreator() {
    // Инициализировать редактор
    adminEditor.gridSize = 6;
    adminEditor.tigerPos = {x: 0, y: 0};
    adminEditor.exitPos = {x: 5, y: 5};
    adminEditor.objects = [];
    adminEditor.selectedObject = 'meat';
    
    let html = `
        <div style="padding: 20px; max-width: 900px;">
            <h3 style="color: var(--primary-color); margin-bottom: 20px;">➕ Создать новый уровень</h3>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <!-- Левая колонка: информация -->
                <div style="display: grid; gap: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Название уровня:</label>
                        <input type="text" id="admin-level-name" placeholder="Введи название" style="width: 100%; padding: 10px; border: 2px solid var(--primary-color); border-radius: 8px; background: var(--bg-primary); color: var(--text-primary); box-sizing: border-box;">
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Описание:</label>
                        <textarea id="admin-level-description" placeholder="Введи описание уровня" style="width: 100%; padding: 10px; border: 2px solid var(--primary-color); border-radius: 8px; background: var(--bg-primary); color: var(--text-primary); box-sizing: border-box; min-height: 80px; resize: vertical;"></textarea>
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Сложность:</label>
                        <select id="admin-level-difficulty" style="width: 100%; padding: 10px; border: 2px solid var(--primary-color); border-radius: 8px; background: var(--bg-primary); color: var(--text-primary);">
                            <option value="Легкая">Легкая</option>
                            <option value="Средняя" selected>Средняя</option>
                            <option value="Сложная">Сложная</option>
                        </select>
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Размер сетки:</label>
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
                            <button class="admin-size-btn" onclick="setAdminEditorSize(4)" style="padding: 8px; background: var(--bg-primary); border: 2px solid var(--primary-color); border-radius: 6px; cursor: pointer; font-weight: 600;">4x4</button>
                            <button class="admin-size-btn" onclick="setAdminEditorSize(6)" style="padding: 8px; background: var(--primary-color); color: white; border: 2px solid var(--primary-color); border-radius: 6px; cursor: pointer; font-weight: 600;">6x6</button>
                            <button class="admin-size-btn" onclick="setAdminEditorSize(8)" style="padding: 8px; background: var(--bg-primary); border: 2px solid var(--primary-color); border-radius: 6px; cursor: pointer; font-weight: 600;">8x8</button>
                            <button class="admin-size-btn" onclick="setAdminEditorSize(10)" style="padding: 8px; background: var(--bg-primary); border: 2px solid var(--primary-color); border-radius: 6px; cursor: pointer; font-weight: 600;">10x10</button>
                            <button class="admin-size-btn" onclick="setAdminEditorSize(12)" style="padding: 8px; background: var(--bg-primary); border: 2px solid var(--primary-color); border-radius: 6px; cursor: pointer; font-weight: 600;">12x12</button>
                        </div>
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Выбери объект:</label>
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
                    <label style="display: block; margin-bottom: 10px; font-weight: 600;">Редактор уровня:</label>
                    <div id="admin-editor-grid" style="display: inline-grid; gap: 2px; padding: 10px; background: var(--bg-primary); border-radius: 8px; border: 2px solid var(--primary-color);"></div>
                    <div style="margin-top: 15px; font-size: 0.9em; color: var(--text-secondary);">
                        <p>💡 Нажми на клетку, чтобы разместить объект</p>
                    </div>
                </div>
            </div>
            
            <div style="display: flex; gap: 10px; margin-top: 20px; flex-wrap: wrap;">
                <button onclick="saveAdminLevelFromPanel()" style="flex: 1; min-width: 120px; padding: 12px; background: var(--success-color); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">💾 Сохранить</button>
                <button onclick="loadAdminLevelsTab()" style="flex: 1; min-width: 120px; padding: 12px; background: var(--text-secondary); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">❌ Отмена</button>
            </div>
        </div>
    `;
    
    const content = document.getElementById('admin-edit-levels-tab');
    if (content) {
        content.innerHTML = html;
        updateAdminEditorGrid();
    }
}

function saveAdminLevelFromPanel() {
    const name = document.getElementById('admin-level-name').value.trim();
    const description = document.getElementById('admin-level-description').value.trim();
    const difficulty = document.getElementById('admin-level-difficulty').value;
    
    if (!name) {
        alert('❌ Введи название уровня!');
        return;
    }
    
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
    
    levelsAdmin.levels.push(adminLevel);
    saveAdminLevels();
    alert('✅ Уровень сохранен!');
    loadAdminLevelsTab();
}

function editAdminLevelFromPanel(index) {
    const level = levelsAdmin.levels[index];
    
    // Инициализировать редактор с данными уровня
    if (level && level.data) {
        adminEditor.gridSize = level.data.gridSize || 6;
        adminEditor.tigerPos = level.data.start || {x: 0, y: 0};
        adminEditor.exitPos = level.data.exit || {x: adminEditor.gridSize - 1, y: adminEditor.gridSize - 1};
        adminEditor.objects = level.data.objects ? [...level.data.objects] : [];
    }
    
    let html = `
        <div style="padding: 20px; max-width: 900px;">
            <h3 style="color: var(--primary-color); margin-bottom: 20px;">✏️ Редактировать уровень</h3>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <!-- Левая колонка: информация -->
                <div style="display: grid; gap: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Название уровня:</label>
                        <input type="text" id="admin-level-name" value="${level.name}" style="width: 100%; padding: 10px; border: 2px solid var(--primary-color); border-radius: 8px; background: var(--bg-primary); color: var(--text-primary); box-sizing: border-box;">
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Описание:</label>
                        <textarea id="admin-level-description" style="width: 100%; padding: 10px; border: 2px solid var(--primary-color); border-radius: 8px; background: var(--bg-primary); color: var(--text-primary); box-sizing: border-box; min-height: 80px; resize: vertical;">${level.description || ''}</textarea>
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Сложность:</label>
                        <select id="admin-level-difficulty" style="width: 100%; padding: 10px; border: 2px solid var(--primary-color); border-radius: 8px; background: var(--bg-primary); color: var(--text-primary);">
                            <option value="Легкая" ${level.difficulty === 'Легкая' ? 'selected' : ''}>Легкая</option>
                            <option value="Средняя" ${level.difficulty === 'Средняя' ? 'selected' : ''}>Средняя</option>
                            <option value="Сложная" ${level.difficulty === 'Сложная' ? 'selected' : ''}>Сложная</option>
                        </select>
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Размер сетки:</label>
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
                            <button class="admin-size-btn" onclick="setAdminEditorSize(4)" style="padding: 8px; background: var(--bg-primary); border: 2px solid var(--primary-color); border-radius: 6px; cursor: pointer; font-weight: 600;">4x4</button>
                            <button class="admin-size-btn" onclick="setAdminEditorSize(6)" style="padding: 8px; background: var(--bg-primary); border: 2px solid var(--primary-color); border-radius: 6px; cursor: pointer; font-weight: 600;">6x6</button>
                            <button class="admin-size-btn" onclick="setAdminEditorSize(8)" style="padding: 8px; background: var(--bg-primary); border: 2px solid var(--primary-color); border-radius: 6px; cursor: pointer; font-weight: 600;">8x8</button>
                            <button class="admin-size-btn" onclick="setAdminEditorSize(10)" style="padding: 8px; background: var(--bg-primary); border: 2px solid var(--primary-color); border-radius: 6px; cursor: pointer; font-weight: 600;">10x10</button>
                            <button class="admin-size-btn" onclick="setAdminEditorSize(12)" style="padding: 8px; background: var(--bg-primary); border: 2px solid var(--primary-color); border-radius: 6px; cursor: pointer; font-weight: 600;">12x12</button>
                        </div>
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Выбери объект:</label>
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
                    <label style="display: block; margin-bottom: 10px; font-weight: 600;">Редактор уровня:</label>
                    <div id="admin-editor-grid" style="display: inline-grid; gap: 2px; padding: 10px; background: var(--bg-primary); border-radius: 8px; border: 2px solid var(--primary-color);"></div>
                </div>
            </div>
            
            <div style="display: flex; gap: 10px; margin-top: 20px; flex-wrap: wrap;">
                <button onclick="updateAdminLevelFromPanel(${index})" style="flex: 1; min-width: 120px; padding: 12px; background: var(--success-color); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">💾 Сохранить</button>
                <button onclick="loadAdminLevelsTab()" style="flex: 1; min-width: 120px; padding: 12px; background: var(--text-secondary); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">❌ Отмена</button>
            </div>
        </div>
    `;
    
    const content = document.getElementById('admin-edit-levels-tab');
    if (content) {
        content.innerHTML = html;
        updateAdminEditorGrid();
    }
}

function updateAdminLevelFromPanel(index) {
    const name = document.getElementById('admin-level-name').value.trim();
    const description = document.getElementById('admin-level-description').value.trim();
    const difficulty = document.getElementById('admin-level-difficulty').value;
    
    if (!name) {
        alert('❌ Введи название уровня!');
        return;
    }
    
    const levelData = {
        name: name,
        start: adminEditor.tigerPos,
        exit: adminEditor.exitPos,
        objects: [...adminEditor.objects],
        gridSize: adminEditor.gridSize,
        isSandboxLevel: true,
        savedAt: new Date().toISOString()
    };
    
    levelsAdmin.levels[index] = {
        name: name,
        description: description,
        difficulty: difficulty,
        data: levelData,
        createdAt: levelsAdmin.levels[index].createdAt,
        rating: levelsAdmin.levels[index].rating,
        plays: levelsAdmin.levels[index].plays
    };
    
    saveAdminLevels();
    alert('✅ Уровень обновлен!');
    loadAdminLevelsTab();
}

function deleteAdminLevelFromPanel(index) {
    if (confirm('Ты уверен? Это действие нельзя отменить!')) {
        levelsAdmin.levels.splice(index, 1);
        saveAdminLevels();
        alert('✅ Уровень удален!');
        loadAdminLevelsTab();
    }
}

function downloadAdminLevelFromPanel(index) {
    const level = levelsAdmin.levels[index];
    if (!level || !level.data) {
        alert('❌ Ошибка: уровень не содержит данных!');
        return;
    }
    
    const blob = new Blob([JSON.stringify(level.data, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `уровень_${level.name.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function adminUploadLevelFile() {
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
                    alert('❌ Ошибка: неверный формат файла уровня!');
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
                alert('✅ Уровень загружен!');
                loadAdminLevelsTab();
            } catch (e) {
                alert('❌ Ошибка при загрузке:\n\n' + e.message);
            }
        };
        reader.readAsText(file);
    };
    input.click();
}


// ⚡ ФУНКЦИЯ ПРОПУСКА ИСТОРИИ И ТУТОРИАЛА ДЛЯ АДМИНА
function skipStoryAndTutorial() {
    // Устанавливаем флаги, чтобы пропустить историю и туториал
    sessionStorage.setItem('story_skipped', 'true');
    sessionStorage.setItem('tutorial_skipped', 'true');
    
    // Устанавливаем имя игрока и тигра
    playerName = 'Админ';
    tigerName = 'Тигра';
    
    // Сохраняем в localStorage
    localStorage.setItem('playerName', playerName);
    localStorage.setItem('tigerName', tigerName);
    
    // Закрываем модальные окна истории и туториала, если они открыты
    const storyModal = document.getElementById('story-modal');
    const tutorialModal = document.getElementById('tutorial-modal');
    
    if (storyModal) storyModal.classList.remove('active');
    if (tutorialModal) tutorialModal.classList.remove('active');
    
    // Загружаем первый уровень
    game.level = 1;
    loadLevel(1);
    
    // Показываем сообщение
    showMessage('⚡ Админ режим', 'История и туториал пропущены. Добро пожаловать, админ!');
}


// ⚡ ОБРАБОТЧИК КЛИКА НА ФОН АДМИН ПАНЕЛИ
document.addEventListener('DOMContentLoaded', function() {
    const adminModal = document.getElementById('admin-modal');
    
    if (adminModal) {
        // Закрываем админ панель при клике на фон (но не на саму панель)
        adminModal.addEventListener('click', function(e) {
            // Если клик был на самом модальном окне (фон), а не на содержимом
            if (e.target === adminModal) {
                closeAdminPanel();
            }
        });
    }
});


// ⚡ ФУНКЦИИ ДЛЯ БЫСТРОЙ ПРОВЕРКИ ИСТОРИЙ И УРОВНЕЙ

// Показать историю из админ панели БЕЗ закрытия панели
function adminViewStory(storyKey) {
    // Получаем данные истории из STORY_DATA
    const storyMap = {
        'intro': 'intro',
        'level1': 'level1',
        'level2': 'level2',
        'level3': 'level3',
        'level4': 'level4',
        'level5': 'level5',
        'level6': 'level6',
        'ending': 'ending'
    };
    
    const key = storyMap[storyKey];
    if (!key || !STORY_DATA[key]) {
        console.error('История не найдена:', storyKey);
        return;
    }
    
    const story = STORY_DATA[key];
    
    // Показываем историю в модальном окне (используем существующую функцию showStoryModal)
    showStoryModal(story.title, story.scenes, false, key);
}

// Показать историю из админ панели (старая версия - закрывает панель)
function adminShowStory(storyKey) {
    // Закрываем админ панель
    closeAdminPanel();
    
    // Показываем историю
    if (storyKey === 'intro') {
        showStory('intro', 'Админ', 'Тигра');
    } else if (storyKey === 'tutorial') {
        document.getElementById('tutorial-modal').classList.add('active');
    } else if (storyKey === 'ending') {
        showStory('ending', 'Админ', 'Тигра');
    }
    
    showMessage('📚 История', `Показываю историю: ${storyKey}`);
}

// Играть в уровень из админ панели
function adminPlayLevel(levelNum) {
    // Закрываем админ панель
    closeAdminPanel();
    
    // Переходим на вкладку уровней
    switchTab('levels');
    
    // Загружаем уровень
    game.level = levelNum;
    loadLevel(levelNum);
    
    showMessage('🎮 Уровень', `Загружаю уровень ${levelNum}...`);
}
