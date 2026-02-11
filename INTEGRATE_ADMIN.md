# 🔧 Как интегрировать админ-панель в игру

## Быстрая интеграция (5 минут)

### Шаг 1: Скопируй файлы

Убедись, что у тебя есть:
- `tiger_game_improved.html` - основная игра
- `admin_panel.js` - JavaScript для админ-панели
- `admin_panel.css` - стили для админ-панели

Все файлы должны быть в одной папке!

### Шаг 2: Добавь CSS в HTML

Открой `tiger_game_improved.html` и найди строку:
```html
</head>
```

Добавь перед ней:
```html
<link rel="stylesheet" href="admin_panel.css">
```

### Шаг 3: Добавь кнопку админ-панели

Найди в HTML строку:
```html
<button class="theme-btn" onclick="toggleTheme()">☀️ Свет / 🌙 Темно</button>
```

Добавь после нее:
```html
<button class="admin-btn" onclick="openAdminPanel()">🔐 Админ</button>
```

### Шаг 4: Добавь JavaScript

Найди строку:
```html
</body>
</html>
```

Добавь перед ней:
```html
<script src="admin_panel.js"></script>
```

### Шаг 5: Инициализируй админ-панель

Найди функцию `window.onload` и добавь в конец:
```javascript
// Инициализация админ-панели
initAdminPanel();
```

### Шаг 6: Отслеживай пользователей

Найди функцию `startGame()` и добавь в конец:
```javascript
// Отслеживание пользователя
trackUser(playerName, 1, 0);
```

Найди функцию `checkWin()` и добавь перед `showMessage()`:
```javascript
// Отслеживание завершенного уровня
trackCompletedLevel(playerName, game.level);
```

## Полная интеграция (пошагово)

### 1. Добавь CSS

В секции `<head>`:
```html
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🐯 Тигрёнок в лесу</title>
    <style>
        /* Существующие стили */
    </style>
    <!-- ДОБАВЬ ЭТО -->
    <link rel="stylesheet" href="admin_panel.css">
</head>
```

### 2. Добавь кнопку

В header (после других кнопок):
```html
<header>
    <h1>🐯 Тигрёнок в лесу</h1>
    <div class="header-controls">
        <button class="theme-btn" onclick="toggleTheme()">☀️ Свет / 🌙 Темно</button>
        <div class="player-info" id="player-info">Игрок: Гость</div>
        <!-- ДОБАВЬ ЭТО -->
        <button class="admin-btn" onclick="openAdminPanel()">🔐 Админ</button>
    </div>
</header>
```

### 3. Добавь JavaScript

Перед закрывающим тегом `</body>`:
```html
    <script src="admin_panel.js"></script>
</body>
</html>
```

### 4. Инициализируй админ-панель

В функции `window.onload`:
```javascript
window.onload = function() {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
    }

    const nameInput = document.getElementById('player-name');
    nameInput.focus();
    nameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') startGame();
    });

    initSandbox();
    
    // ДОБАВЬ ЭТО
    initAdminPanel();
};
```

### 5. Отслеживай пользователей

В функции `startGame()`:
```javascript
function startGame() {
    const nameInput = document.getElementById('player-name').value.trim();
    if (nameInput) playerName = nameInput;
    document.getElementById('welcome-modal').classList.remove('active');
    document.getElementById('player-info').textContent = `Игрок: ${playerName}`;
    initGame();
    createLevelButtons();
    
    // ДОБАВЬ ЭТО
    trackUser(playerName, 1, 0);
}
```

В функции `checkWin()`:
```javascript
function checkWin() {
    const level = game.isSandboxMode && game.sandboxLevelData ? 
        game.sandboxLevelData : 
        levels[game.level];
    
    if (!game.isSandboxMode) {
        game.completedLevels.add(game.level);
    }

    const meatBonus = (game.meatCollected === game.totalMeat) ? 50 : 0;
    const stepBonus = Math.max(0, 100 - game.steps * 2);
    const totalBonus = meatBonus + stepBonus;

    game.score += totalBonus;
    updateStats();

    // ДОБАВЬ ЭТО
    trackCompletedLevel(playerName, game.level);

    setTimeout(() => {
        showMessage(
            `Молодец, ${playerName}! 🎉`,
            `Тигрёнок прошёл уровень!<br><br>🍖 Мяса: ${game.meatCollected}/${game.totalMeat}<br>🐾 Шагов: ${game.steps}<br>⭐ Бонусы: +${totalBonus}<br>🏆 Всего: ${game.score}`
        );
    }, 500);

    if (!game.isSandboxMode) {
        document.querySelectorAll('.level-btn').forEach((btn, i) => {
            const levelIndex = i + 1;
            if (game.completedLevels.has(levelIndex)) {
                btn.classList.add('completed');
            }
        });
    }
}
```

## Проверка интеграции

После интеграции:

1. Открой игру в браузере
2. Должна появиться кнопка "🔐 Админ" в header
3. Нажми на кнопку
4. Введи пароль `admin123`
5. Должна открыться админ-панель

## Если что-то не работает

### Проблема: Кнопка админ-панели не видна
**Решение:**
1. Проверь, что `admin_panel.css` в одной папке
2. Проверь, что ссылка на CSS правильная
3. Открой F12 и посмотри на ошибки

### Проблема: Админ-панель не открывается
**Решение:**
1. Проверь, что `admin_panel.js` в одной папке
2. Проверь, что ссылка на JS правильная
3. Открой F12 и посмотри на ошибки

### Проблема: Пароль не работает
**Решение:**
1. Проверь, что вводишь `admin123`
2. Проверь, что нет пробелов
3. Проверь, что раскладка клавиатуры правильная

### Проблема: Данные не сохраняются
**Решение:**
1. Проверь, что `localStorage` включен в браузере
2. Проверь, что браузер не в приватном режиме
3. Открой F12 → Application → Local Storage

## Дополнительные настройки

### Изменить пароль

Открой `admin_panel.js` и найди:
```javascript
const ADMIN_PASSWORD = "admin123";
```

Измени на:
```javascript
const ADMIN_PASSWORD = "твой_новый_пароль";
```

### Изменить цвет кнопки

Открой `admin_panel.css` и найди:
```css
.admin-btn {
    background: #d32f2f;
}
```

Измени на нужный цвет:
```css
.admin-btn {
    background: #ff6f00;
}
```

### Скрыть кнопку админ-панели

Открой `admin_panel.css` и найди:
```css
.admin-btn {
    display: none;
}
```

Измени на:
```css
.admin-btn {
    display: block;
}
```

## Готово! 🎉

Админ-панель интегрирована в игру!

Теперь ты можешь:
- 📋 Управлять уровнями
- 👥 Отслеживать пользователей
- 📊 Смотреть статистику
- ⚙️ Менять настройки

## Дальше

Прочитай `ADMIN_PANEL.md` для полной документации по админ-панели.

Удачи! 🐯🎮
