# Исправление: Динамическая сетка для уровней разных размеров

## Проблема
- Уровни размером 12x12 не отображались правильно в игре
- Сетка была жестко установлена на 8x8
- Админ-уровни с другими размерами не работали

## Решение

### 1. **game.js** - Обновлена функция `renderBoard()` (v26) ✅
Сетка теперь динамическая и зависит от размера уровня:

```javascript
function renderBoard() {
    const grid = document.getElementById('game-grid');
    grid.innerHTML = '';
    const level = levels[game.level];
    
    // Получаем размер сетки из уровня или используем 8 по умолчанию
    const gridSize = level.gridSize || 8;
    
    // Обновляем CSS сетки динамически
    grid.style.gridTemplateColumns = `repeat(${gridSize}, 60px)`;
    grid.style.gridTemplateRows = `repeat(${gridSize}, 60px)`;
    
    // Рисуем сетку нужного размера
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            // ... остальной код
        }
    }
}
```

### 2. **index.html** - Обновлен CSS для #game-grid ✅
CSS теперь более гибкий:

```css
#game-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, 60px);
    grid-template-rows: auto;
    gap: 4px;
    margin: 20px auto;
    background: var(--bg-primary);
    padding: 15px;
    border-radius: 12px;
    border: 2px solid var(--border-color);
    width: fit-content;
}
```

## Как это работает

1. При загрузке уровня функция `initGame()` вызывает `renderBoard()`
2. `renderBoard()` получает размер сетки из `level.gridSize`
3. Динамически устанавливает CSS для сетки:
   - `grid-template-columns: repeat(gridSize, 60px)`
   - `grid-template-rows: repeat(gridSize, 60px)`
4. Рисует сетку нужного размера (4x4, 6x6, 8x8, 10x10, 12x12 и т.д.)

## Поддерживаемые размеры

- ✅ 4x4 - маленькие уровни
- ✅ 6x6 - средние уровни
- ✅ 8x8 - стандартные уровни (встроенные)
- ✅ 10x10 - большие уровни
- ✅ 12x12 - очень большие уровни
- ✅ Любые другие размеры

## Тестирование

1. Создайте админ-уровень размером 12x12
2. Нажмите "▶️ Играть"
3. Проверьте, что сетка отображается правильно ✅
4. Проверьте, что все объекты видны ✅
5. Попробуйте пройти уровень ✅

## Файлы, которые были изменены

- **game.js** (v26) - Обновлена функция renderBoard() для динамической сетки
- **index.html** - Обновлен CSS для #game-grid
