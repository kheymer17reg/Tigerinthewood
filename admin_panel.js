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
    document.querySelectorAll('.admin-tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.admin-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById('admin-' + tabName + '-tab').classList.add('active');
    event.target.classList.add('active');
}

function loadAdminData() {
    loadUserLevels();
    loadUsersList();
    loadNotifications();
    loadStats();
    loadSettings();
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
