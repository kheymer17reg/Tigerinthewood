// API URL (измени на свой адрес сервера)
const API_URL = 'http://45.90.219.13:5000/api';

console.log('✅ auth.js загружен');

// Вход в игру
async function loginGame() {
    const login = document.getElementById('player-login').value.trim();
    const password = document.getElementById('player-password').value.trim();
    const errorDiv = document.getElementById('login-error');
    
    if (!login || !password) {
        errorDiv.textContent = '❌ Введи логин и пароль';
        errorDiv.style.display = 'block';
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ login, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Сохраняем логин
            playerName = data.login;
            localStorage.setItem('currentPlayer', playerName);
            localStorage.setItem('playerLogin', login);
            
            // Закрываем модальное окно
            document.getElementById('welcome-modal').classList.remove('active');
            document.getElementById('player-info').textContent = `Игрок: ${playerName}`;
            
            // Показываем модаль для выбора имени тигрёнка
            console.log('✅ Вход успешен, показываем модаль выбора имени тигрёнка');
            document.getElementById('tiger-name-modal').classList.add('active');
            document.getElementById('tiger-name').focus();
            
            errorDiv.style.display = 'none';
        } else {
            errorDiv.textContent = `❌ ${data.message}`;
            errorDiv.style.display = 'block';
        }
    } catch (error) {
        errorDiv.textContent = '❌ Ошибка подключения к серверу. Убедись, что API сервер запущен.';
        errorDiv.style.display = 'block';
        console.error('Login error:', error);
    }
}

// Показать модальное окно смены пароля
function showChangePasswordModal() {
    document.getElementById('change-password-modal').classList.add('active');
    document.getElementById('old-password').value = '';
    document.getElementById('new-password').value = '';
    document.getElementById('confirm-password').value = '';
    document.getElementById('change-password-error').style.display = 'none';
}

// Смена пароля
async function changePassword() {
    const oldPassword = document.getElementById('old-password').value.trim();
    const newPassword = document.getElementById('new-password').value.trim();
    const confirmPassword = document.getElementById('confirm-password').value.trim();
    const errorDiv = document.getElementById('change-password-error');
    const login = localStorage.getItem('playerLogin');
    
    if (!login) {
        errorDiv.textContent = '❌ Ты не авторизован';
        errorDiv.style.display = 'block';
        return;
    }
    
    if (!oldPassword || !newPassword || !confirmPassword) {
        errorDiv.textContent = '❌ Заполни все поля';
        errorDiv.style.display = 'block';
        return;
    }
    
    if (newPassword !== confirmPassword) {
        errorDiv.textContent = '❌ Новые пароли не совпадают';
        errorDiv.style.display = 'block';
        return;
    }
    
    if (newPassword.length < 6) {
        errorDiv.textContent = '❌ Пароль должен содержать минимум 6 символов';
        errorDiv.style.display = 'block';
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/change-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                login: login,
                oldPassword: oldPassword,
                newPassword: newPassword
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('✅ Пароль успешно изменён!');
            document.getElementById('change-password-modal').classList.remove('active');
            errorDiv.style.display = 'none';
        } else {
            errorDiv.textContent = `❌ ${data.message}`;
            errorDiv.style.display = 'block';
        }
    } catch (error) {
        errorDiv.textContent = '❌ Ошибка подключения к серверу';
        errorDiv.style.display = 'block';
        console.error('Change password error:', error);
    }
}

// Обработка Enter в полях логина
document.addEventListener('DOMContentLoaded', function() {
    const loginInput = document.getElementById('player-login');
    const passwordInput = document.getElementById('player-password');
    
    if (loginInput) {
        loginInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                passwordInput.focus();
            }
        });
    }
    
    if (passwordInput) {
        passwordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                loginGame();
            }
        });
    }
});
