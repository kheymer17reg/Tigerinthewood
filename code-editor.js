// 📝 CODE EDITOR — Command input, parsing, and execution

function addCommand(cmd) {
    const input = document.getElementById('code-input');
    if (!input || game.isRunning) return;
    if (input.value && !input.value.endsWith('\n')) {
        input.value += '\n';
    }
    input.value += cmd;
    input.scrollTop = input.scrollHeight;
    game.codeHistory.push(cmd);
    updateRunButton();
}

function addNumber(num) {
    const input = document.getElementById('code-input');
    if (!input || game.isRunning) return;
    const val = input.value;
    // Insert number before last closing parenthesis
    const lastParen = val.lastIndexOf(')');
    if (lastParen !== -1) {
        const before = val.substring(0, lastParen);
        const after = val.substring(lastParen);
        // Check if there's already a number
        const match = before.match(/\((\d*)$/);
        if (match) {
            input.value = before + num + after;
        } else {
            input.value = val;
        }
    }
    updateRunButton();
}

function addCommandFromKeyboard(cmd) {
    addCommand(cmd);
}

function undoLastCommand() {
    const input = document.getElementById('code-input');
    if (!input || game.isRunning) return;
    const lines = input.value.split('\n').filter(function(l) { return l.trim(); });
    if (lines.length > 0) {
        lines.pop();
        input.value = lines.join('\n');
        game.codeHistory.pop();
    }
    updateRunButton();
}

function clearCode() {
    const input = document.getElementById('code-input');
    if (!input) return;
    input.value = '';
    input.classList.remove('error');
    game.codeHistory = [];
    updateRunButton();
}

async function runCode() {
    if (game.isRunning || game.hasBeenRun) return;
    game.isRunning = true;
    game.hasBeenRun = true;
    updateRunButton();

    const code = document.getElementById('code-input').value;
    const lines = code.split('\n').filter(function(l) { return l.trim(); });
    const stepIndicator = document.getElementById('step-indicator');

    if (typeof startLevelStats === 'function') {
        startLevelStats(game.level);
    }

    for (let i = 0; i < lines.length; i++) {
        if (!game.isRunning) break;
        const line = lines[i].trim();
        if (stepIndicator) stepIndicator.textContent = 'Шаг ' + (i + 1) + '/' + lines.length;

        try {
            const result = await executeCommand(line);
            if (result === false) {
                game.isRunning = false;
                if (typeof loseLive === 'function') loseLive();
                break;
            }
        } catch (e) {
            document.getElementById('code-input').classList.add('error');
            showMessage('❌ Ошибка', 'Неизвестная команда: ' + line);
            playSound('error');
            game.isRunning = false;
            if (typeof loseLive === 'function') loseLive();
            break;
        }
    }

    game.isRunning = false;
    if (stepIndicator) stepIndicator.textContent = '';
    updateRunButton();
}

async function executeCommand(line) {
    // Parse command
    const match = line.match(/^([а-яА-ЯёЁa-zA-Z]+)\((\d*)\)$/);
    if (!match) {
        throw new Error('Invalid command: ' + line);
    }

    const cmd = match[1];
    const count = match[2] ? parseInt(match[2]) : 1;

    switch (cmd) {
        case 'вправо': return await move(1, 0, count);
        case 'влево': return await move(-1, 0, count);
        case 'вверх': return await move(0, -1, count);
        case 'вниз': return await move(0, 1, count);
        case 'есть': await eatMeat(); return true;
        case 'взять': await takeKey(); return true;
        case 'открыть': await openDoor(); return true;
        default:
            throw new Error('Unknown command: ' + cmd);
    }
}
