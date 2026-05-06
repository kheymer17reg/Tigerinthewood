// 🎮 LEVELS — All game level definitions
const levels = {
    1: {
        name: "🌱 Первые шаги в лесу",
        start: { x: 1, y: 4 },
        exit: { x: 7, y: 4 },
        objects: [
            { type: 'tree', x: 0, y: 2 }, { type: 'tree', x: 0, y: 3 },
            { type: 'tree', x: 0, y: 5 }, { type: 'tree', x: 0, y: 6 },
            { type: 'tree', x: 7, y: 1 }, { type: 'tree', x: 7, y: 2 },
            { type: 'tree', x: 7, y: 5 }, { type: 'tree', x: 7, y: 6 },
            { type: 'meat', x: 4, y: 4 }
        ],
        task: "🐯 Тигрёнок проснулся в лесу! Помоги ему найти первое мясо 🍖 и выход из леса. Используй команду <code>вправо()</code> или стрелку →"
    },
    2: {
        name: "🍃 Обход препятствий",
        start: { x: 0, y: 4 },
        exit: { x: 7, y: 4 },
        objects: [
            { type: 'tree', x: 3, y: 2 }, { type: 'tree', x: 3, y: 3 },
            { type: 'tree', x: 3, y: 4 }, { type: 'tree', x: 3, y: 5 },
            { type: 'tree', x: 3, y: 6 },
            { type: 'tree', x: 1, y: 0 }, { type: 'tree', x: 1, y: 7 },
            { type: 'tree', x: 5, y: 0 }, { type: 'tree', x: 5, y: 7 },
            { type: 'meat', x: 3, y: 1 }
        ],
        task: "🌳 Лес становится гуще! Деревья преграждают путь. Обойди их через верхний проход ↑ и собери мясо 🍖. Используй команды <code>вверх()</code> и <code>вправо()</code>"
    },
    3: {
        name: "🌿 Лесная тропа",
        start: { x: 0, y: 7 },
        exit: { x: 7, y: 0 },
        objects: [
            { type: 'tree', x: 1, y: 6 }, { type: 'tree', x: 2, y: 5 },
            { type: 'tree', x: 2, y: 6 }, { type: 'tree', x: 3, y: 4 },
            { type: 'tree', x: 3, y: 5 }, { type: 'tree', x: 4, y: 3 },
            { type: 'tree', x: 4, y: 4 }, { type: 'tree', x: 5, y: 2 },
            { type: 'tree', x: 5, y: 3 }, { type: 'tree', x: 6, y: 1 },
            { type: 'meat', x: 2, y: 7 },
            { type: 'meat', x: 4, y: 5 },
            { type: 'meat', x: 6, y: 3 }
        ],
        task: "🐾 Тропа вьётся через лес! Собери все 3 куска мяса 🍖 и найди выход. Используй команды с числами: <code>вправо(2)</code>, <code>вверх(3)</code> для быстрого движения"
    },
    4: {
        name: "🌳 Охота в лесу",
        start: { x: 0, y: 4 },
        exit: { x: 7, y: 4 },
        objects: [
            { type: 'tree', x: 0, y: 0 }, { type: 'tree', x: 0, y: 1 },
            { type: 'tree', x: 0, y: 6 }, { type: 'tree', x: 0, y: 7 },
            { type: 'tree', x: 7, y: 0 }, { type: 'tree', x: 7, y: 1 },
            { type: 'tree', x: 7, y: 6 }, { type: 'tree', x: 7, y: 7 },
            { type: 'tree', x: 2, y: 3 }, { type: 'tree', x: 2, y: 5 },
            { type: 'tree', x: 4, y: 2 }, { type: 'tree', x: 4, y: 6 },
            { type: 'tree', x: 6, y: 3 }, { type: 'tree', x: 6, y: 5 },
            { type: 'meat', x: 1, y: 4 }, { type: 'meat', x: 3, y: 4 },
            { type: 'meat', x: 5, y: 4 }, { type: 'meat', x: 7, y: 4 }
        ],
        task: "🍖 Охота! Собери все 4 куска мяса 🍖 в лесу. Используй команду <code>есть()</code> чтобы съесть мясо. Комбинируй движение и еду: <code>вправо()</code> → <code>есть()</code>"
    },
    5: {
        name: "🔑 Волшебный ключ",
        start: { x: 0, y: 4 },
        exit: { x: 7, y: 4 },
        objects: [
            { type: 'tree', x: 0, y: 0 }, { type: 'tree', x: 0, y: 1 },
            { type: 'tree', x: 0, y: 6 }, { type: 'tree', x: 0, y: 7 },
            { type: 'tree', x: 7, y: 0 }, { type: 'tree', x: 7, y: 1 },
            { type: 'tree', x: 7, y: 6 }, { type: 'tree', x: 7, y: 7 },
            { type: 'tree', x: 2, y: 2 }, { type: 'tree', x: 2, y: 3 },
            { type: 'tree', x: 2, y: 5 }, { type: 'tree', x: 2, y: 6 },
            { type: 'tree', x: 4, y: 1 }, { type: 'tree', x: 4, y: 7 },
            { type: 'tree', x: 6, y: 3 }, { type: 'tree', x: 6, y: 5 },
            { type: 'key', x: 1, y: 4 },
            { type: 'door', x: 3, y: 4, locked: true },
            { type: 'door', x: 5, y: 4, locked: true },
            { type: 'meat', x: 4, y: 4 },
            { type: 'meat', x: 6, y: 4 }
        ],
        task: "🔑 Найди ключ и открой двери! Используй <code>взять()</code> для ключа и <code>открыть()</code> для дверей. Один ключ открывает все двери!"
    },
    6: {
        name: "🏆 Путь домой",
        start: { x: 0, y: 7 },
        exit: { x: 7, y: 0 },
        isHome: true,
        objects: [
            { type: 'tree', x: 1, y: 5 }, { type: 'tree', x: 1, y: 6 },
            { type: 'tree', x: 3, y: 3 }, { type: 'tree', x: 3, y: 4 },
            { type: 'tree', x: 5, y: 1 }, { type: 'tree', x: 5, y: 2 },
            { type: 'tree', x: 5, y: 5 }, { type: 'tree', x: 5, y: 6 },
            { type: 'tree', x: 7, y: 3 }, { type: 'tree', x: 7, y: 4 },
            { type: 'meat', x: 1, y: 7 }, { type: 'meat', x: 3, y: 5 },
            { type: 'meat', x: 5, y: 3 }, { type: 'meat', x: 7, y: 1 },
            { type: 'key', x: 2, y: 6 },
            { type: 'door', x: 4, y: 4, locked: true },
            { type: 'door', x: 6, y: 2, locked: true }
        ],
        task: "🏠 Последний рывок! Собери все мясо, возьми ключ, открой двери и найди путь домой! Ты почти герой!"
    },
    7: {
        name: "🌲 Двойной путь",
        start: { x: 0, y: 4 },
        exit: { x: 7, y: 4 },
        objects: [
            { type: 'tree', x: 3, y: 0 }, { type: 'tree', x: 3, y: 1 },
            { type: 'tree', x: 3, y: 3 }, { type: 'tree', x: 3, y: 4 },
            { type: 'tree', x: 3, y: 5 }, { type: 'tree', x: 3, y: 6 }, { type: 'tree', x: 3, y: 7 },
            { type: 'tree', x: 5, y: 0 }, { type: 'tree', x: 5, y: 1 }, { type: 'tree', x: 5, y: 2 },
            { type: 'tree', x: 5, y: 3 }, { type: 'tree', x: 5, y: 4 },
            { type: 'tree', x: 5, y: 6 }, { type: 'tree', x: 5, y: 7 },
            { type: 'meat', x: 1, y: 2 }, { type: 'meat', x: 4, y: 2 },
            { type: 'meat', x: 6, y: 5 }
        ],
        task: "🌲 Две стены деревьев преграждают путь! Найди проходы через каждую стену. В одной проход сверху, в другой — снизу. Используй <code>вверх()</code> и <code>вниз()</code> чтобы маневрировать!"
    },
    8: {
        name: "⚡ Зигзаг",
        start: { x: 0, y: 0 },
        exit: { x: 7, y: 7 },
        objects: [
            { type: 'tree', x: 0, y: 1 }, { type: 'tree', x: 1, y: 1 }, { type: 'tree', x: 2, y: 1 },
            { type: 'tree', x: 3, y: 1 }, { type: 'tree', x: 4, y: 1 }, { type: 'tree', x: 5, y: 1 },
            { type: 'tree', x: 2, y: 3 }, { type: 'tree', x: 3, y: 3 }, { type: 'tree', x: 4, y: 3 },
            { type: 'tree', x: 5, y: 3 }, { type: 'tree', x: 6, y: 3 }, { type: 'tree', x: 7, y: 3 },
            { type: 'tree', x: 0, y: 5 }, { type: 'tree', x: 1, y: 5 }, { type: 'tree', x: 2, y: 5 },
            { type: 'tree', x: 3, y: 5 }, { type: 'tree', x: 4, y: 5 }, { type: 'tree', x: 5, y: 5 },
            { type: 'meat', x: 6, y: 0 }, { type: 'meat', x: 1, y: 2 },
            { type: 'meat', x: 0, y: 4 }, { type: 'meat', x: 6, y: 6 }
        ],
        task: "⚡ Зигзаг! Горизонтальные стены деревьев с узкими проходами. Двигайся зигзагом: вправо, вниз, влево, вниз... Собери все мясо 🍖 по пути!"
    },
    9: {
        name: "🔄 Кольцо",
        start: { x: 0, y: 0 },
        exit: { x: 7, y: 7 },
        objects: [
            { type: 'tree', x: 2, y: 2 }, { type: 'tree', x: 3, y: 2 }, { type: 'tree', x: 4, y: 2 }, { type: 'tree', x: 5, y: 2 },
            { type: 'tree', x: 2, y: 5 }, { type: 'tree', x: 3, y: 5 }, { type: 'tree', x: 4, y: 5 }, { type: 'tree', x: 5, y: 5 },
            { type: 'tree', x: 2, y: 3 }, { type: 'tree', x: 2, y: 4 },
            { type: 'tree', x: 5, y: 3 }, { type: 'tree', x: 5, y: 4 },
            { type: 'meat', x: 3, y: 0 }, { type: 'meat', x: 7, y: 3 },
            { type: 'meat', x: 4, y: 7 }, { type: 'meat', x: 0, y: 4 },
            { type: 'key', x: 1, y: 1 },
            { type: 'door', x: 6, y: 6, locked: true }
        ],
        task: "🔄 Каменное кольцо в центре леса! Обойди его вокруг, собери мясо 🍖 по углам, подбери ключ 🔑 и открой дверь к выходу!"
    },
    10: {
        name: "🏗️ Коридоры",
        start: { x: 0, y: 0 },
        exit: { x: 7, y: 7 },
        objects: [
            { type: 'tree', x: 1, y: 0 }, { type: 'tree', x: 1, y: 1 }, { type: 'tree', x: 1, y: 2 },
            { type: 'tree', x: 1, y: 3 }, { type: 'tree', x: 1, y: 4 }, { type: 'tree', x: 1, y: 5 },
            { type: 'tree', x: 3, y: 2 }, { type: 'tree', x: 3, y: 3 }, { type: 'tree', x: 3, y: 4 },
            { type: 'tree', x: 3, y: 5 }, { type: 'tree', x: 3, y: 6 }, { type: 'tree', x: 3, y: 7 },
            { type: 'tree', x: 5, y: 0 }, { type: 'tree', x: 5, y: 1 }, { type: 'tree', x: 5, y: 2 },
            { type: 'tree', x: 5, y: 3 }, { type: 'tree', x: 5, y: 4 }, { type: 'tree', x: 5, y: 5 },
            { type: 'meat', x: 0, y: 6 }, { type: 'meat', x: 2, y: 1 },
            { type: 'meat', x: 4, y: 6 }, { type: 'meat', x: 6, y: 1 },
            { type: 'meat', x: 7, y: 6 },
            { type: 'key', x: 0, y: 7 },
            { type: 'door', x: 6, y: 7, locked: true }
        ],
        task: "🏗️ Три стены делят лес на коридоры! В каждой стене только один проход. Найди ключ 🔑 в углу, собери мясо 🍖 и открой дверь к выходу!"
    },
    11: {
        name: "🗝️ Три ключа",
        start: { x: 0, y: 4 },
        exit: { x: 7, y: 4 },
        objects: [
            { type: 'tree', x: 0, y: 0 }, { type: 'tree', x: 0, y: 1 },
            { type: 'tree', x: 0, y: 6 }, { type: 'tree', x: 0, y: 7 },
            { type: 'tree', x: 7, y: 0 }, { type: 'tree', x: 7, y: 1 },
            { type: 'tree', x: 7, y: 6 }, { type: 'tree', x: 7, y: 7 },
            { type: 'tree', x: 2, y: 2 }, { type: 'tree', x: 2, y: 3 },
            { type: 'tree', x: 2, y: 5 }, { type: 'tree', x: 2, y: 6 },
            { type: 'tree', x: 4, y: 1 }, { type: 'tree', x: 4, y: 2 },
            { type: 'tree', x: 4, y: 6 }, { type: 'tree', x: 4, y: 7 },
            { type: 'tree', x: 6, y: 2 }, { type: 'tree', x: 6, y: 3 },
            { type: 'tree', x: 6, y: 5 }, { type: 'tree', x: 6, y: 6 },
            { type: 'key', x: 1, y: 4 },
            { type: 'key', x: 3, y: 4 },
            { type: 'key', x: 5, y: 4 },
            { type: 'door', x: 2, y: 4, locked: true },
            { type: 'door', x: 4, y: 4, locked: true },
            { type: 'door', x: 6, y: 4, locked: true },
            { type: 'meat', x: 1, y: 2 }, { type: 'meat', x: 3, y: 3 },
            { type: 'meat', x: 5, y: 2 }, { type: 'meat', x: 7, y: 4 }
        ],
        task: "🗝️ Три ключа — три двери! Каждую дверь нужно открыть своим ключом. Подбирай ключ <code>взять()</code> и открывай <code>открыть()</code> каждую дверь по очереди!"
    },
    12: {
        name: "🌀 Лабиринт",
        start: { x: 0, y: 7 },
        exit: { x: 7, y: 0 },
        objects: [
            { type: 'tree', x: 0, y: 5 }, { type: 'tree', x: 1, y: 5 },
            { type: 'tree', x: 2, y: 7 }, { type: 'tree', x: 2, y: 6 }, { type: 'tree', x: 2, y: 5 },
            { type: 'tree', x: 2, y: 3 }, { type: 'tree', x: 2, y: 2 }, { type: 'tree', x: 2, y: 1 },
            { type: 'tree', x: 3, y: 3 }, { type: 'tree', x: 4, y: 3 },
            { type: 'tree', x: 4, y: 4 }, { type: 'tree', x: 4, y: 5 },
            { type: 'tree', x: 4, y: 6 }, { type: 'tree', x: 4, y: 7 },
            { type: 'tree', x: 5, y: 1 }, { type: 'tree', x: 6, y: 1 },
            { type: 'tree', x: 6, y: 2 }, { type: 'tree', x: 6, y: 3 },
            { type: 'tree', x: 6, y: 5 }, { type: 'tree', x: 6, y: 6 },
            { type: 'meat', x: 1, y: 7 }, { type: 'meat', x: 1, y: 4 },
            { type: 'meat', x: 3, y: 2 }, { type: 'meat', x: 5, y: 5 },
            { type: 'meat', x: 7, y: 2 }
        ],
        task: "🌀 Настоящий лабиринт! Множество стен и тупиков. Планируй маршрут заранее и используй числа в командах: <code>вправо(3)</code>, <code>вверх(2)</code> для экономии шагов!"
    },
    13: {
        name: "🏰 Крепость",
        start: { x: 0, y: 4 },
        exit: { x: 4, y: 4 },
        objects: [
            { type: 'tree', x: 2, y: 2 }, { type: 'tree', x: 3, y: 2 }, { type: 'tree', x: 4, y: 2 }, { type: 'tree', x: 5, y: 2 }, { type: 'tree', x: 6, y: 2 },
            { type: 'tree', x: 2, y: 6 }, { type: 'tree', x: 3, y: 6 }, { type: 'tree', x: 4, y: 6 }, { type: 'tree', x: 5, y: 6 }, { type: 'tree', x: 6, y: 6 },
            { type: 'tree', x: 2, y: 3 }, { type: 'tree', x: 6, y: 3 },
            { type: 'tree', x: 2, y: 5 }, { type: 'tree', x: 6, y: 5 },
            { type: 'tree', x: 6, y: 4 },
            { type: 'key', x: 7, y: 0 },
            { type: 'key', x: 7, y: 7 },
            { type: 'door', x: 2, y: 4, locked: true },
            { type: 'door', x: 4, y: 3, locked: true },
            { type: 'meat', x: 3, y: 4 }, { type: 'meat', x: 5, y: 4 },
            { type: 'meat', x: 4, y: 5 }, { type: 'meat', x: 4, y: 3 }
        ],
        task: "🏰 Крепость! Деревья образуют стены замка. Ключи спрятаны в дальних углах. Найди их, открой ворота и проникни внутрь за мясом 🍖!"
    },
    14: {
        name: "🌑 Тёмный лес",
        start: { x: 0, y: 0 },
        exit: { x: 7, y: 7 },
        objects: [
            { type: 'tree', x: 1, y: 0 }, { type: 'tree', x: 1, y: 1 },
            { type: 'tree', x: 0, y: 2 }, { type: 'tree', x: 1, y: 3 },
            { type: 'tree', x: 2, y: 1 }, { type: 'tree', x: 2, y: 2 }, { type: 'tree', x: 2, y: 4 },
            { type: 'tree', x: 3, y: 0 }, { type: 'tree', x: 3, y: 2 }, { type: 'tree', x: 3, y: 4 }, { type: 'tree', x: 3, y: 6 },
            { type: 'tree', x: 4, y: 1 }, { type: 'tree', x: 4, y: 3 }, { type: 'tree', x: 4, y: 5 }, { type: 'tree', x: 4, y: 7 },
            { type: 'tree', x: 5, y: 0 }, { type: 'tree', x: 5, y: 2 }, { type: 'tree', x: 5, y: 4 }, { type: 'tree', x: 5, y: 6 },
            { type: 'tree', x: 6, y: 1 }, { type: 'tree', x: 6, y: 3 }, { type: 'tree', x: 6, y: 5 },
            { type: 'tree', x: 7, y: 2 }, { type: 'tree', x: 7, y: 4 },
            { type: 'meat', x: 0, y: 1 }, { type: 'meat', x: 2, y: 3 },
            { type: 'meat', x: 4, y: 4 }, { type: 'meat', x: 6, y: 6 },
            { type: 'meat', x: 7, y: 5 },
            { type: 'key', x: 3, y: 5 },
            { type: 'door', x: 7, y: 6, locked: true }
        ],
        task: "🌑 Тёмный лес! Деревья растут повсюду, оставляя лишь узкие тропы. Каждый шаг на счету — планируй маршрут и не заблудись! Ключ 🔑 спрятан глубоко в чаще."
    },
    15: {
        name: "🏠 Великий побег",
        start: { x: 0, y: 7 },
        exit: { x: 7, y: 0 },
        isHome: true,
        objects: [
            { type: 'tree', x: 0, y: 5 }, { type: 'tree', x: 0, y: 3 },
            { type: 'tree', x: 1, y: 6 }, { type: 'tree', x: 1, y: 4 }, { type: 'tree', x: 1, y: 2 },
            { type: 'tree', x: 2, y: 5 }, { type: 'tree', x: 2, y: 3 },
            { type: 'tree', x: 3, y: 7 }, { type: 'tree', x: 3, y: 6 }, { type: 'tree', x: 3, y: 4 },
            { type: 'tree', x: 4, y: 5 }, { type: 'tree', x: 4, y: 3 }, { type: 'tree', x: 4, y: 1 },
            { type: 'tree', x: 5, y: 6 }, { type: 'tree', x: 5, y: 4 }, { type: 'tree', x: 5, y: 2 },
            { type: 'tree', x: 6, y: 5 }, { type: 'tree', x: 6, y: 3 }, { type: 'tree', x: 6, y: 1 },
            { type: 'tree', x: 7, y: 4 }, { type: 'tree', x: 7, y: 2 },
            { type: 'key', x: 0, y: 6 },
            { type: 'key', x: 2, y: 4 },
            { type: 'door', x: 3, y: 3, locked: true },
            { type: 'door', x: 5, y: 1, locked: true },
            { type: 'door', x: 7, y: 1, locked: true },
            { type: 'meat', x: 1, y: 7 }, { type: 'meat', x: 2, y: 6 },
            { type: 'meat', x: 3, y: 5 }, { type: 'meat', x: 4, y: 4 },
            { type: 'meat', x: 5, y: 3 }, { type: 'meat', x: 6, y: 2 },
            { type: 'meat', x: 7, y: 0 }
        ],
        task: "🏠 Великий побег! Это финальное испытание — самый сложный путь через весь лес. Собери все мясо 🍖, найди ключи 🔑, открой двери 🚪 и приведи тигрёнка ДОМОЙ! 🎊"
    }
};
