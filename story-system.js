// 📖 STORY SYSTEM — Narrative scenes with character dialogue

const STORY_DATA = {
    intro: {
        title: 'Начало пути',
        scenes: [
            { character: 'narrator', text: 'Далеко-далеко, в самом сердце дремучего леса, жил-был маленький тигрёнок.' },
            { character: 'narrator', text: 'Этот лес был необычным — он был создан из кода, и чтобы пройти через него, нужно было научиться программировать!' },
            { character: 'tiger', text: 'Привет! Я {tiger}! Мне нужна твоя помощь, чтобы найти дорогу домой!' },
            { character: 'tiger', text: '{name}, ты будешь моим программистом? Пиши команды, а я буду их выполнять!' },
            { character: 'narrator', text: 'Так начинается ваше совместное приключение в волшебном лесу кода...' }
        ]
    },
    1: {
        title: 'Первый рассвет',
        scenes: [
            { character: 'narrator', text: '{tiger} проснулся ранним утром. Солнце только начинало пробиваться сквозь кроны деревьев.' },
            { character: 'tiger', text: 'Ой, где я? Мне надо найти еду... Я так голоден!' },
            { character: 'narrator', text: '{name}, помоги {tiger} сделать первые шаги! Используй стрелку → или команду вправо().' }
        ]
    },
    2: {
        title: 'Густой лес',
        scenes: [
            { character: 'narrator', text: 'Лес становится гуще. Деревья растут так плотно, что иногда не пройти напрямую.' },
            { character: 'tiger', text: 'Ого, тут столько деревьев! Надо найти обход...' },
            { character: 'narrator', text: '{name}, научи {tiger} обходить препятствия! Используй вверх() и вниз().' }
        ]
    },
    3: {
        title: 'Лесная тропа',
        scenes: [
            { character: 'narrator', text: '{tiger} нашёл старую тропу в лесу. Она вьётся между деревьями.' },
            { character: 'tiger', text: 'Смотри, {name}! Тут целая тропинка! И еда по пути!' },
            { character: 'narrator', text: 'Попробуй использовать числа в командах: вправо(3) = три шага вправо!' }
        ]
    },
    4: {
        title: 'Охотник',
        scenes: [
            { character: 'narrator', text: '{tiger} становится настоящим охотником! Он учится находить и есть мясо в лесу.' },
            { character: 'tiger', text: 'Я чувствую запах мяса! Надо его найти и съесть!' },
            { character: 'narrator', text: '{name}, используй команду есть() когда {tiger} стоит на мясе.' }
        ]
    },
    5: {
        title: 'Загадка леса',
        scenes: [
            { character: 'narrator', text: 'На пути {tiger} встретились загадочные двери. Они заперты волшебным замком!' },
            { character: 'tiger', text: 'Ой, дверь заперта! Где-то здесь должен быть ключ...' },
            { character: 'narrator', text: 'Подбери ключ командой взять() и открой дверь командой открыть()!' }
        ]
    },
    6: {
        title: 'Путь домой',
        scenes: [
            { character: 'narrator', text: 'Это последнее испытание! Впереди — дом {tiger}.' },
            { character: 'tiger', text: '{name}, мы почти дома! Это самый сложный путь, но мы справимся вместе!' },
            { character: 'narrator', text: 'Собери все мясо, найди ключи, открой двери и приведи {tiger} домой! 🏠' }
        ]
    },
    ending: {
        title: 'Домой!',
        scenes: [
            { character: 'tiger', text: 'Мы сделали это, {name}! Я дома! 🏠' },
            { character: 'tiger', text: 'Спасибо тебе за всё! Ты настоящий программист!' },
            { character: 'narrator', text: '{tiger} вернулся домой благодаря {name}. Приключение закончилось, но путь программиста только начинается!' },
            { character: 'narrator', text: 'Попробуй пройти все уровни с максимальным счётом или создай свои уровни в песочнице!' }
        ]
    }
};

let storyState = {
    currentStory: null,
    currentScene: 0,
    isPlaying: false
};

function showStory(levelKey, name, tiger) {
    var data = STORY_DATA[levelKey];
    if (!data) {
        if (typeof startLevelStats === 'function') startLevelStats(levelKey);
        return;
    }

    var viewedStories = JSON.parse(localStorage.getItem('viewedStories') || '[]');
    var storyId = 'story-' + levelKey;
    if (viewedStories.includes(storyId)) {
        if (typeof startLevelStats === 'function') startLevelStats(levelKey);
        return;
    }

    storyState.currentStory = levelKey;
    storyState.currentScene = 0;
    storyState.isPlaying = true;

    var storyModal = document.getElementById('story-modal');
    if (!storyModal) return;

    function renderScene(index) {
        if (index >= data.scenes.length) {
            storyModal.innerHTML = '';
            storyModal.style.display = 'none';
            storyState.isPlaying = false;

            viewedStories.push(storyId);
            localStorage.setItem('viewedStories', JSON.stringify(viewedStories));

            if (typeof startLevelStats === 'function') startLevelStats(levelKey);
            return;
        }

        var scene = data.scenes[index];
        var text = scene.text.replace(/{name}/g, name).replace(/{tiger}/g, tiger);
        var isNarrator = scene.character === 'narrator';

        storyModal.style.display = 'flex';
        storyModal.style.cssText = 'position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.85);z-index:3500;padding:20px;backdrop-filter:blur(8px);';

        var charIcon = isNarrator ? '📖' : '🐯';
        var charName = isNarrator ? 'Рассказчик' : tiger;
        var bgGradient = isNarrator ?
            'linear-gradient(135deg, rgba(59,130,246,.15), rgba(139,92,246,.15))' :
            'linear-gradient(135deg, rgba(245,158,11,.15), rgba(239,68,68,.15))';

        storyModal.innerHTML =
            '<div style="max-width:560px;width:100%;background:var(--bg-secondary);border-radius:var(--radius-2xl);padding:32px;box-shadow:var(--shadow-lg);border:1px solid var(--border-color);animation:modalIn .3s ease;">' +
            '<div style="text-align:center;margin-bottom:20px;">' +
            '<div style="font-size:48px;margin-bottom:8px;">' + charIcon + '</div>' +
            '<div style="font-weight:700;color:var(--primary);font-size:14px;">' + charName + '</div>' +
            '</div>' +
            '<div style="padding:20px;background:' + bgGradient + ';border-radius:var(--radius);border:1px solid var(--border-color);margin-bottom:20px;">' +
            '<p style="font-size:16px;line-height:1.7;color:var(--text-primary);text-align:center;">' + text + '</p>' +
            '</div>' +
            '<div style="text-align:center;display:flex;gap:10px;justify-content:center;">' +
            (index > 0 ? '<button class="btn-secondary" id="story-prev-btn">← Назад</button>' : '') +
            '<button class="btn-primary" id="story-next-btn" style="max-width:200px;">' + (index === data.scenes.length - 1 ? 'Начать!' : 'Далее →') + '</button>' +
            '<button class="btn-secondary" id="story-skip-btn">Пропустить</button>' +
            '</div>' +
            '<div style="text-align:center;margin-top:12px;color:var(--text-muted);font-size:12px;">' + (index + 1) + ' / ' + data.scenes.length + '</div>' +
            '</div>';

        document.getElementById('story-next-btn').onclick = function() {
            renderScene(index + 1);
        };

        var skipBtn = document.getElementById('story-skip-btn');
        if (skipBtn) {
            skipBtn.onclick = function() {
                storyModal.innerHTML = '';
                storyModal.style.display = 'none';
                storyState.isPlaying = false;
                viewedStories.push(storyId);
                localStorage.setItem('viewedStories', JSON.stringify(viewedStories));
                if (typeof startLevelStats === 'function') startLevelStats(levelKey);
            };
        }

        var prevBtn = document.getElementById('story-prev-btn');
        if (prevBtn) {
            prevBtn.onclick = function() { renderScene(index - 1); };
        }
    }

    renderScene(0);
}
