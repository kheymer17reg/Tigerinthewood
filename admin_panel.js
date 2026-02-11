// Админ-панель для управления уровнями и пользователями
// Требует пароль для доступа

const ADMIN_PASSWORD = "admin123"; // Измени на свой пароль!
const ADMIN_KEY = "tiger_admin_logged_in";

// Инициализация админ-панели
function initAdminPanel() {
    // Проверяем, авторизован ли админ
    const isLoggedIn = sessionStorage.getItem(ADMIN_KEY);
    
    if (!isLoggedIn) {
        showAdminLoginModal();
    } else {
        showAdminPanel();
    }
}

// Показать модальное окно входа
function showAdminLoginModal() {
    const modal = document.createElement('div');
    modal.id = 'admin-login-modal';
    modal.className = 'admin-modal active';
    modal.innerHTML = `
        <div class="admin-modal-content">
            <h2>🔐 Админ-панель</h2>
            <p>Введи пароль для доступа</p>
            <input type="password" id="admin-password" placeholder="Пароль" />
            <button onclick="adminLogin()">Войти</button>
            <button onclick="closeAdminLogin()" style="background: #999;">Отмена</button>
        </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('admin-password').focus();
}

// Вход в админ-панель
function adminLogin() {
    const password = document.getElementById('admin-password').value;
    
    if (password === ADMIN_PASSWORD) {
        sessionStorage.setItem(ADMIN_KEY, 'true');
        const modal = document.getElementById('admin-login-modal');
        if (modal) modal.remove();
        showAdminPanel();
    } else {
        alert('❌ Неверный пароль!');
        document.getElementById('admin-password').value = '';
    }
}

// Закрыть окно входа
function closeAdminLogin() {
    const modal = document.getElementById('admin-login-modal');
    if (modal) modal.remove();
}

// Показать админ-панель
function showAdminPanel() {
    const adminBtn = document.querySelector('.admin-btn');
    if (adminBtn) {
        adminBtn.style.display = 'block';
    }
}

// Открыть админ-панель
function openAdminPanel() {
    const isLoggedIn = sessionStorage.getItem(ADMIN_KEY);
    
    if (!isLoggedIn) {
        showAdminLoginModal();
        return;
    }
    
    const panel = document.createElement('div');
    panel.id = 'admin-panel-modal';
    panel.className = 'admin-modal active';
    panel.innerHTML = `
        <div class="admin-panel-content">
            <div class="admin-panel-header">
                <h2>⚙️ Админ-панель</h2>
                <button onclick="closeAdminPanel()" class="close-btn">✕</button>
            </div>
            
            <div class="admin-tabs">
                <button class="admin-tab-btn active" onclick="switchAdminTab('levels')">📋 Уровни</button>
                <button class="admin-tab-btn" onclick="switchAdminTab('users')">👥 Пользователи</button>
                <button class="admin-tab-btn" onclick="switchAdminTab('stats')">📊 Статистика</button>
                <button class="admin-tab-btn" onclick="switchAdminTab('settings')">⚙️ Настройки</button>
            </div>
            
            <div id="admin-levels-tab" class="admin-tab-content active">
                <h3>📋 Управление уровнями</h3>
                <div class="admin-section">
                    <h4>Загрузить уровень</h4>
                    <input type="file" id="admin-level-upload" accept=".json" />
                    <button onclick="adminUploadLevel()">Загрузить</button>
                </div>
                <div class="admin-section">
                    <h4>Уровни пользователей</h4>
                    <div id="admin-user-levels-list"></div>
                </div>
            </div>
            
            <div id="admin-users-tab" class="admin-tab-content">
                <h3>👥 Управление пользователями</h3>
                <div class="admin-section">
                    <h4>Активные пользователи</h4>
                    <div id="admin-users-list"></div>
                </div>
            </div>
            
            <div id="admin-stats-tab" class="admin-tab-content">
                <h3>📊 Статистика</h3>
                <div class="admin-section">
                    <p>Всего пользователей: <strong id="admin-total-users">0</strong></p>
                    <p>Всего уровней: <strong id="admin-total-levels">0</strong></p>
                    <p>Пройдено уровней: <strong id="admin-completed-levels">0</strong></p>
                </div>
            </div>
            
            <div id="admin-settings-tab" class="admin-tab-content">
                <h3>⚙️ Настройки</h3>
                <div class="admin-section">
                    <label>
                        <input type="checkbox" id="admin-enable-uploads" checked />
                        Разрешить загрузку уровней
                    </label>
                </div>
                <div class="admin-section">
                    <button onclick="adminLogout()">Выход</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(panel);
    loadAdminData();
}

// Закрыть админ-панель
function closeAdminPanel() {
    const panel = document.getElementById('admin-panel-modal');
    if (panel) panel.remove();
}

// Переключить вкладку админ-панели
function switchAdminTab(tabName) {
    // Скрыть все вкладки
    document.querySelectorAll('.admin-tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.admin-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Показать выбранную вкладку
    document.getElementById('admin-' + tabName + '-tab').classList.add('active');
    event.target.classList.add('active');
}

// Загрузить данные админ-панели
function loadAdminData() {
    loadUserLevels();
    loadUsersList();
    loadStats();
}

// Загрузить уровни пользователей
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
            <p>Размер: ${level.gridSize}x${level.gridSize}</p>
            <button onclick="adminDeleteLevel(${index})">Удалить</button>
            <button onclick="adminDownloadLevel(${index})">Скачать</button>
        </div>
    `).join('');
}

// Загрузить список пользователей
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
            <p>Уровень: ${user.level}</p>
            <p>Очки: ${user.score}</p>
            <p>Время: ${user.lastActive}</p>
            <button onclick="adminDeleteUser(${index})">Удалить</button>
        </div>
    `).join('');
}

// Загрузить статистику
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

// Загрузить уровень
function adminUploadLevel() {
    const fileInput = document.getElementById('admin-level-upload');
    const file = fileInput.files[0];
    
    if (!file) {
        alert('Выбери файл!');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const levelData = JSON.parse(e.target.result);
            
            // Проверяем структуру
            if (!levelData.start || !levelData.exit || !levelData.objects) {
                alert('❌ Неверный формат файла!');
                return;
            }
            
            // Добавляем метаданные
            levelData.author = playerName || 'Неизвестно';
            levelData.uploadedAt = new Date().toISOString();
            
            // Сохраняем уровень
            const userLevels = JSON.parse(localStorage.getItem('user_levels') || '[]');
            userLevels.push(levelData);
            localStorage.setItem('user_levels', JSON.stringify(userLevels));
            
            alert('✅ Уровень загружен успешно!');
            fileInput.value = '';
            loadUserLevels();
        } catch (error) {
            alert('❌ Ошибка при загрузке: ' + error.message);
        }
    };
    reader.readAsText(file);
}

// Удалить уровень
function adminDeleteLevel(index) {
    if (confirm('Удалить этот уровень?')) {
        const userLevels = JSON.parse(localStorage.getItem('user_levels') || '[]');
        userLevels.splice(index, 1);
        localStorage.setItem('user_levels', JSON.stringify(userLevels));
        loadUserLevels();
    }
}

// Скачать уровень
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

// Удалить пользователя
function adminDeleteUser(index) {
    if (confirm('Удалить этого пользователя?')) {
        const users = JSON.parse(localStorage.getItem('users_list') || '[]');
        users.splice(index, 1);
        localStorage.setItem('users_list', JSON.stringify(users));
        loadUsersList();
    }
}

// Выход из админ-панели
function adminLogout() {
    sessionStorage.removeItem(ADMIN_KEY);
    closeAdminPanel();
    alert('Вы вышли из админ-панели');
}

// Отслеживание пользователей
function trackUser(name, level, score) {
    const users = JSON.parse(localStorage.getItem('users_list') || '[]');
    
    // Проверяем, есть ли уже такой пользователь
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

// Отслеживание завершенных уровней
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
