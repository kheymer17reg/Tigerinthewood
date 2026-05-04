// 🔐 ADMIN PANEL — Administration interface

const ADMIN_PASSWORD = "yjdsqujl2015";
const ADMIN_KEY = "tiger_admin_logged_in";

function openAdminPanel() {
    var isLoggedIn = sessionStorage.getItem(ADMIN_KEY);
    if (!isLoggedIn) {
        showAdminLoginModal();
        return;
    }
    showAdminPanelContent();
}

function showAdminLoginModal() {
    var password = prompt('🔐 Введи пароль админ-панели:', '');
    if (password === null) return;
    if (password === ADMIN_PASSWORD) {
        show2FAModal();
    } else {
        showMessage('❌ Ошибка', 'Неверный пароль!');
    }
}

function show2FAModal() {
    var answer = prompt('🔐 Второй этап проверки:\n\nКак звали кота из "Короля Льва"?', '');
    if (answer === null) return;
    if (answer.toLowerCase().trim() === 'симба') {
        sessionStorage.setItem(ADMIN_KEY, 'true');
        showAdminPanelContent();
    } else {
        showMessage('❌ Ошибка', 'Неверный ответ! Попробуй ещё раз.');
    }
}

function showAdminPanelContent() {
    var modal = document.getElementById('admin-modal');
    if (modal) modal.classList.add('active');
    loadAdminData();
}

function closeAdminPanel() {
    closeModal('admin-modal');
}

function switchAdminTab(tabName) {
    document.querySelectorAll('.admin-tab-content').forEach(function(tab) {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.admin-tab-btn').forEach(function(btn) {
        btn.classList.remove('active');
    });
    var tabEl = document.getElementById('admin-' + tabName + '-tab');
    if (tabEl) tabEl.classList.add('active');
    if (event && event.target) event.target.classList.add('active');
}

function loadAdminData() {
    loadAdminUserLevels();
    loadAdminUsers();
    loadAdminModeration();
    loadAdminStats();
    loadAdminSettings();
}

function loadAdminUserLevels() {
    var userLevels = JSON.parse(localStorage.getItem('user_levels') || '[]');
    var list = document.getElementById('admin-user-levels-list');
    if (!list) return;
    if (userLevels.length === 0) {
        list.innerHTML = '<p style="color:var(--text-secondary);text-align:center;padding:20px;">Нет загруженных уровней</p>';
        return;
    }
    list.innerHTML = userLevels.map(function(level, index) {
        return '<div style="padding:12px;background:var(--bg-glass);border:1px solid var(--border-color);border-radius:var(--radius);margin-bottom:8px;">' +
            '<strong>' + (level.name || 'Уровень ' + (index + 1)) + '</strong>' +
            '<p style="font-size:12px;color:var(--text-secondary);">Автор: ' + (level.author || 'Неизвестно') + ' | Размер: ' + (level.gridSize || 8) + 'x' + (level.gridSize || 8) + '</p>' +
            '<div style="display:flex;gap:6px;margin-top:8px;">' +
            '<button class="btn-secondary" style="font-size:11px;padding:4px 10px;" onclick="adminDeleteLevel(' + index + ')">🗑 Удалить</button>' +
            '<button class="btn-secondary" style="font-size:11px;padding:4px 10px;" onclick="adminDownloadLevel(' + index + ')">💾 Скачать</button>' +
            '</div></div>';
    }).join('');
}

function loadAdminUsers() {
    var users = JSON.parse(localStorage.getItem('users_list') || '[]');
    var list = document.getElementById('admin-users-list');
    if (!list) return;
    if (users.length === 0) {
        list.innerHTML = '<p style="color:var(--text-secondary);text-align:center;padding:20px;">Нет активных пользователей</p>';
        return;
    }
    list.innerHTML = users.map(function(user, index) {
        return '<div style="padding:12px;background:var(--bg-glass);border:1px solid var(--border-color);border-radius:var(--radius);margin-bottom:8px;">' +
            '<strong>' + user.name + '</strong>' +
            '<p style="font-size:12px;color:var(--text-secondary);">Уровень: ' + (user.level || 1) + ' | Очки: ' + (user.score || 0) + '</p>' +
            '<button class="btn-secondary" style="font-size:11px;padding:4px 10px;margin-top:6px;" onclick="adminDeleteUser(' + index + ')">🗑 Удалить</button>' +
            '</div>';
    }).join('');
}

function loadAdminModeration() {
    var container = document.getElementById('admin-moderation-content');
    if (!container) return;
    loadModerationData();

    var pending = moderation.pendingLevels || [];
    if (pending.length === 0) {
        container.innerHTML = '<p style="color:var(--text-secondary);text-align:center;padding:20px;">Нет уровней на модерации</p>';
        return;
    }

    container.innerHTML = pending.map(function(level, index) {
        return '<div style="padding:12px;background:var(--bg-glass);border:1px solid var(--border-color);border-radius:var(--radius);margin-bottom:8px;border-left:3px solid var(--primary);">' +
            '<strong>' + level.levelName + '</strong>' +
            '<p style="font-size:12px;color:var(--text-secondary);">Автор: ' + level.playerName + ' | ' + new Date(level.createdAt).toLocaleDateString() + '</p>' +
            '<p style="font-size:12px;color:var(--text-secondary);margin-top:4px;">' + (level.description || 'Нет описания') + '</p>' +
            '<div style="display:flex;gap:6px;margin-top:8px;">' +
            '<button class="btn-primary" style="font-size:11px;padding:4px 12px;max-width:120px;" onclick="approveLevel(' + index + ')">✅ Одобрить</button>' +
            '<button class="btn-secondary" style="font-size:11px;padding:4px 12px;color:var(--error);" onclick="rejectLevel(' + index + ')">❌ Отклонить</button>' +
            '</div></div>';
    }).join('');
}

function loadAdminStats() {
    var users = JSON.parse(localStorage.getItem('users_list') || '[]');
    var userLevels = JSON.parse(localStorage.getItem('user_levels') || '[]');
    var el1 = document.getElementById('admin-total-users');
    var el2 = document.getElementById('admin-total-levels');
    var el3 = document.getElementById('admin-completed-levels');
    if (el1) el1.textContent = users.length;
    if (el2) el2.textContent = userLevels.length;
    var count = 0;
    users.forEach(function(u) { if (u.completedLevels) count += u.completedLevels.length; });
    if (el3) el3.textContent = count;
}

function loadAdminSettings() {
    var checkbox = document.getElementById('ai-enabled-checkbox');
    if (checkbox) {
        checkbox.checked = localStorage.getItem('ai_chat_enabled') !== 'false';
    }
}

function approveLevel(index) {
    if (!moderation.pendingLevels[index]) return;
    var level = moderation.pendingLevels.splice(index, 1)[0];
    level.status = 'approved';
    moderation.approvedLevels.push(level);
    saveModerationData();
    loadAdminModeration();
    showMessage('✅ Одобрено', 'Уровень "' + level.levelName + '" опубликован!');
}

function rejectLevel(index) {
    if (!moderation.pendingLevels[index]) return;
    var level = moderation.pendingLevels.splice(index, 1)[0];
    level.status = 'rejected';
    moderation.rejectedLevels.push(level);
    saveModerationData();
    loadAdminModeration();
    showMessage('❌ Отклонено', 'Уровень "' + level.levelName + '" отклонён.');
}

function adminDeleteLevel(index) {
    var userLevels = JSON.parse(localStorage.getItem('user_levels') || '[]');
    if (index >= 0 && index < userLevels.length) {
        var name = userLevels[index].name || 'Уровень';
        userLevels.splice(index, 1);
        localStorage.setItem('user_levels', JSON.stringify(userLevels));
        loadAdminUserLevels();
        showMessage('🗑 Удалено', 'Уровень "' + name + '" удалён.');
    }
}

function adminDownloadLevel(index) {
    var userLevels = JSON.parse(localStorage.getItem('user_levels') || '[]');
    if (index >= 0 && index < userLevels.length) {
        var data = userLevels[index];
        var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = (data.name || 'level') + '.json';
        a.click();
    }
}

function adminDeleteUser(index) {
    var users = JSON.parse(localStorage.getItem('users_list') || '[]');
    if (index >= 0 && index < users.length) {
        var name = users[index].name;
        users.splice(index, 1);
        localStorage.setItem('users_list', JSON.stringify(users));
        loadAdminUsers();
        showMessage('🗑 Удалено', 'Пользователь "' + name + '" удалён.');
    }
}

function adminUploadLevel() {
    var fileInput = document.getElementById('admin-level-upload');
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) return;

    var file = fileInput.files[0];
    var reader = new FileReader();
    reader.onload = function(e) {
        try {
            var levelData = JSON.parse(e.target.result);
            if (!levelData.start || !levelData.exit) {
                showMessage('❌ Ошибка', 'В файле должны быть поля "start" и "exit"!');
                return;
            }
            levelData.author = playerName || 'Неизвестно';
            if (!levelData.name) levelData.name = file.name.replace('.json', '');
            if (!levelData.gridSize) levelData.gridSize = 8;
            if (!levelData.objects) levelData.objects = [];

            var userLevels = JSON.parse(localStorage.getItem('user_levels') || '[]');
            userLevels.push(levelData);
            localStorage.setItem('user_levels', JSON.stringify(userLevels));
            loadAdminUserLevels();
            showMessage('✅ Загружен', 'Уровень "' + levelData.name + '" загружен!');
        } catch (err) {
            showMessage('❌ Ошибка', 'Не удалось прочитать файл');
        }
    };
    reader.readAsText(file);
    fileInput.value = '';
}
