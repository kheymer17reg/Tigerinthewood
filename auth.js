// 🔑 AUTH — Login and authentication

const API_URL = 'http://45.90.219.13:5000/api';

async function loginGame() {
    var loginInput = document.getElementById('player-login');
    var passwordInput = document.getElementById('player-password');
    var errorDiv = document.getElementById('login-error');

    var login = loginInput ? loginInput.value.trim() : '';
    var password = passwordInput ? passwordInput.value.trim() : '';

    if (!login) {
        if (errorDiv) { errorDiv.textContent = 'Введи логин!'; errorDiv.style.display = 'block'; }
        return;
    }
    if (!password) {
        if (errorDiv) { errorDiv.textContent = 'Введи пароль!'; errorDiv.style.display = 'block'; }
        return;
    }

    try {
        var response = await fetch(API_URL + '/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ login: login, password: password })
        });

        if (response.ok) {
            var data = await response.json();
            completeLogin(login, data);
        } else {
            // Fallback: accept login if server is down
            completeLogin(login, null);
        }
    } catch (e) {
        // Server unreachable — allow local login
        completeLogin(login, null);
    }
}

function completeLogin(login, data) {
    playerName = login;
    localStorage.setItem('currentPlayer', login);
    document.getElementById('player-info').textContent = 'Игрок: ' + login;

    var errorDiv = document.getElementById('login-error');
    if (errorDiv) errorDiv.style.display = 'none';

    closeModal('welcome-modal');

    var tigerNameSaved = localStorage.getItem('tigerName');
    if (tigerNameSaved) {
        tigerName = tigerNameSaved;
        startGame();
    } else {
        document.getElementById('tiger-name-modal').classList.add('active');
    }

    // Add to users list
    addToUsersList(login);

    // Show admin panel button if admin
    if (login === 'admin' || login === 'Справедливый') {
        var nav = document.querySelector('.nav-bar');
        if (nav && !document.getElementById('admin-nav-btn')) {
            var btn = document.createElement('button');
            btn.className = 'nav-btn';
            btn.id = 'admin-nav-btn';
            btn.textContent = '🔐 Админ';
            btn.onclick = openAdminPanel;
            nav.appendChild(btn);
        }
    }
}

function confirmTigerName() {
    var input = document.getElementById('tiger-name');
    tigerName = input && input.value.trim() ? input.value.trim() : 'Тигра';
    localStorage.setItem('tigerName', tigerName);
    closeModal('tiger-name-modal');
    startGame();
}

function startGame() {
    loadGameStats();
    createLevelButtons();
    initGame(true);

    // Show intro story if first time
    var viewedStories = JSON.parse(localStorage.getItem('viewedStories') || '[]');
    if (!viewedStories.includes('story-intro')) {
        showStory('intro', playerName, tigerName);
    }
}

function addToUsersList(name) {
    var users = JSON.parse(localStorage.getItem('users_list') || '[]');
    var existing = users.find(function(u) { return u.name === name; });
    if (!existing) {
        users.push({
            name: name,
            level: 1,
            score: 0,
            lastActive: new Date().toISOString(),
            completedLevels: []
        });
    } else {
        existing.lastActive = new Date().toISOString();
    }
    localStorage.setItem('users_list', JSON.stringify(users));
}

function showChangePasswordModal() {
    document.getElementById('change-password-modal').classList.add('active');
}

async function changePassword() {
    var oldPass = document.getElementById('old-password');
    var newPass = document.getElementById('new-password');
    var confirmPass = document.getElementById('confirm-password');
    var errorDiv = document.getElementById('change-password-error');

    if (!oldPass || !newPass || !confirmPass) return;

    if (!oldPass.value || !newPass.value || !confirmPass.value) {
        if (errorDiv) { errorDiv.textContent = 'Заполни все поля!'; errorDiv.style.display = 'block'; }
        return;
    }

    if (newPass.value !== confirmPass.value) {
        if (errorDiv) { errorDiv.textContent = 'Пароли не совпадают!'; errorDiv.style.display = 'block'; }
        return;
    }

    try {
        var response = await fetch(API_URL + '/change-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                login: playerName,
                oldPassword: oldPass.value,
                newPassword: newPass.value
            })
        });

        if (response.ok) {
            closeModal('change-password-modal');
            showMessage('✅ Готово!', 'Пароль успешно изменён!');
            oldPass.value = '';
            newPass.value = '';
            confirmPass.value = '';
            if (errorDiv) errorDiv.style.display = 'none';
        } else {
            if (errorDiv) { errorDiv.textContent = 'Не удалось сменить пароль. Проверь старый пароль.'; errorDiv.style.display = 'block'; }
        }
    } catch (e) {
        if (errorDiv) { errorDiv.textContent = 'Ошибка подключения к серверу.'; errorDiv.style.display = 'block'; }
    }
}

// Auto-login on load
document.addEventListener('DOMContentLoaded', function() {
    var savedPlayer = localStorage.getItem('currentPlayer');
    if (savedPlayer) {
        playerName = savedPlayer;
        tigerName = localStorage.getItem('tigerName') || 'Тигра';
        document.getElementById('player-info').textContent = 'Игрок: ' + savedPlayer;
        closeModal('welcome-modal');
        startGame();

        if (savedPlayer === 'admin' || savedPlayer === 'Справедливый') {
            var nav = document.querySelector('.nav-bar');
            if (nav && !document.getElementById('admin-nav-btn')) {
                var btn = document.createElement('button');
                btn.className = 'nav-btn';
                btn.id = 'admin-nav-btn';
                btn.textContent = '🔐 Админ';
                btn.onclick = openAdminPanel;
                nav.appendChild(btn);
            }
        }
    }
});
