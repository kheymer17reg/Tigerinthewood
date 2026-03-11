// 📖 СИСТЕМА ИСТОРИЙ ДЛЯ ИГРЫ

console.log('✅ test_story.js загружен');

const STORY_DATA = {
    intro: {
        title: "🐯 Добро пожаловать в лес!",
        scenes: [
            {
                character: "Рассказчик",
                text: "Привет, {playerName}! 👋\n\nДобро пожаловать в волшебный лес, где живет маленький тигрёнок по имени {tigerName}! 🐯"
            },
            {
                character: "Тигра",
                text: "Привет! Я {tigerName}! 🐯\n\nЯ люблю исследовать лес и искать приключения. Я очень быстрый и ловкий! ⚡"
            },
            {
                character: "Рассказчик",
                text: "Но сегодня случилась беда... {tigerName} заблудился в густом лесу и не может найти дорогу домой! 😟\n\nЕму нужна твоя помощь!"
            },
            {
                character: "Тигра",
                text: "Помоги мне, пожалуйста! 🙏\n\nЯ вижу выход из леса, но там много препятствий. Помоги мне их преодолеть!"
            },
            {
                character: "Рассказчик",
                text: "Ты должен помочь {tigerName} найти выход из леса, избегая препятствий и собирая еду по пути.\n\nГотов? 🎮"
            }
        ]
    },
    level1: {
        title: "🌱 Уровень 1: Первые шаги",
        scenes: [
            {
                character: "Тигра",
                text: "Спасибо, что помогаешь мне, {playerName}! 😊\n\nЯ вижу выход из этой части леса. Помоги мне туда добраться!"
            },
            {
                character: "Рассказчик",
                text: "Это легкий уровень для разминки. Просто используй команду вправо() чтобы дойти до выхода! 🎯"
            }
        ]
    },
    level2: {
        title: "🍃 Уровень 2: Обход дерева",
        scenes: [
            {
                character: "Тигра",
                text: "Хорошо! Я прошел первую часть! 🎉\n\nНо лес становится все гуще... Здесь больше деревьев и препятствий."
            },
            {
                character: "Рассказчик",
                text: "{tigerName} становится все смелее! Используй стрелки ↑ или ↓ чтобы обойти деревья. Ты справишься! 💪"
            }
        ]
    },
    level3: {
        title: "🌿 Уровень 3: Лесная тропа",
        scenes: [
            {
                character: "Тигра",
                text: "Ух ты! Я вижу золотой ключ! ✨\n\nИ там впереди какая-то дверь... Может быть, это ведет к выходу?"
            },
            {
                character: "Рассказчик",
                text: "Интересно! Собери ключ, открой дверь и найди выход. Но будь осторожен - препятствий становится больше! ⚠️"
            }
        ]
    },
    level4: {
        title: "🌳 Уровень 4: Вкусное мясо",
        scenes: [
            {
                character: "Тигра",
                text: "Ммм! Я чувствую запах мяса! 🍖\n\nМне очень хочется есть. Помоги мне собрать все мясо!"
            },
            {
                character: "Рассказчик",
                text: "Используй команду есть() чтобы съесть мясо. Это даст {tigerName} бонусные очки! 🎯"
            }
        ]
    },
    level5: {
        title: "🔑 Уровень 5: Волшебный ключ",
        scenes: [
            {
                character: "Тигра",
                text: "Я вижу ключ! 🔑\n\nИ там впереди дверь... Может быть, это ведет к выходу?"
            },
            {
                character: "Рассказчик",
                text: "Возьми ключ командой взять(), а потом открой дверь командой открыть()! 🚪"
            }
        ]
    },
    level6: {
        title: "🏆 Уровень 6: Большое приключение",
        scenes: [
            {
                character: "Тигра",
                text: "Я почти дома! Я чувствую запах дома! 🏠\n\nЭто последний уровень... Здесь очень сложно, но я верю в себя!"
            },
            {
                character: "Рассказчик",
                text: "Последний рывок, {tigerName}! Собери все мясо, возьми ключ, открой дверь и найди выход! Ты почти герой! 🦸"
            }
        ]
    },
    ending: {
        title: "🎉 Поздравляем!",
        scenes: [
            {
                character: "Тигра",
                text: "Я ДОМА! 🏠🎉\n\nСпасибо тебе, {playerName}! Ты помог мне найти дорогу домой!"
            },
            {
                character: "Рассказчик",
                text: "Ты прошел все уровни! {tigerName} благодарен тебе! 🐯❤️"
            },
            {
                character: "Тигра",
                text: "Теперь я могу спокойно спать в своей норе, зная, что у меня есть такой верный друг! 😴✨"
            },
            {
                character: "Рассказчик",
                text: "Спасибо за игру! Приходи еще! 👋\n\nТы был отличным помощником для {tigerName}! 🌟"
            }
        ]
    }
};

// Показать историю перед уровнем
function showStory(levelNumber, playerName, tigerName = 'Тигра', onComplete = null) {
    let storyKey = 'intro';
    let isIntroStory = false;
    
    if (levelNumber === 'intro') {
        storyKey = 'intro';
        isIntroStory = true;
    } else if (levelNumber === 1) storyKey = 'level1';
    else if (levelNumber === 2) storyKey = 'level2';
    else if (levelNumber === 3) storyKey = 'level3';
    else if (levelNumber === 4) storyKey = 'level4';
    else if (levelNumber === 5) storyKey = 'level5';
    else if (levelNumber === 6) storyKey = 'level6';
    else if (levelNumber === 'ending') storyKey = 'ending';
    
    console.log('📖 showStory вызвана, storyKey:', storyKey);
    
    // Проверяем, была ли эта история уже просмотрена
    const viewedStories = JSON.parse(localStorage.getItem('viewedStories') || '[]');
    if (viewedStories.includes(storyKey)) {
        // История уже просмотрена, вызываем callback сразу
        console.log('📖 История уже просмотрена, вызываем callback');
        if (onComplete) {
            setTimeout(onComplete, 0);
        }
        return;
    }
    
    const story = STORY_DATA[storyKey];
    if (!story) {
        console.log('❌ История не найдена в STORY_DATA');
        if (onComplete) {
            setTimeout(onComplete, 0);
        }
        return;
    }
    
    console.log('📖 Показываем историю:', storyKey);
    
    // Заменяем {playerName} и {tigerName} на имена
    const processedScenes = story.scenes.map(scene => ({
        ...scene,
        text: scene.text.replace('{playerName}', playerName).replace('{tigerName}', tigerName)
    }));
    
    showStoryModal(story.title, processedScenes, isIntroStory, storyKey, onComplete);
}

// Показать модальное окно истории
function showStoryModal(title, scenes, isIntroStory = false, storyKey = null, onComplete = null) {
    const modal = document.createElement('div');
    modal.id = 'story-modal';
    modal.style.cssText = `
        display: flex;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        z-index: 4000;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(5px);
    `;
    
    modal.innerHTML = `
        <div style="
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 20px;
            box-shadow: 0 10px 50px rgba(0, 0, 0, 0.3);
            max-width: 700px;
            width: 90%;
            max-height: 80vh;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            animation: slideUp 0.5s ease-out;
        ">
            <div style="
                background: rgba(0, 0, 0, 0.2);
                padding: 20px;
                border-bottom: 2px solid rgba(255, 255, 255, 0.2);
                display: flex;
                justify-content: space-between;
                align-items: center;
            ">
                <h2 style="
                    color: white;
                    font-size: 1.8em;
                    margin: 0;
                    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
                ">${title}</h2>
                <button onclick="skipStory()" style="
                    background: rgba(255, 255, 255, 0.2);
                    border: none;
                    color: white;
                    font-size: 1.5em;
                    cursor: pointer;
                    padding: 5px 10px;
                    border-radius: 8px;
                    transition: all 0.3s;
                " onmouseover="this.style.background='rgba(255, 255, 255, 0.4)'" onmouseout="this.style.background='rgba(255, 255, 255, 0.2)'">✕</button>
            </div>
            
            <div style="
                flex: 1;
                padding: 30px;
                overflow-y: auto;
                display: flex;
                align-items: center;
                justify-content: center;
            ">
                <div id="story-scene" style="width: 100%;">
                    <div id="story-character" style="
                        color: #ffd700;
                        font-size: 1.3em;
                        font-weight: bold;
                        margin-bottom: 15px;
                        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
                    "></div>
                    <div id="story-text" style="
                        color: white;
                        font-size: 1.1em;
                        line-height: 1.8;
                        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
                        white-space: pre-wrap;
                        word-wrap: break-word;
                    "></div>
                </div>
            </div>
            
            <div style="
                background: rgba(0, 0, 0, 0.2);
                padding: 20px;
                border-top: 2px solid rgba(255, 255, 255, 0.2);
                display: flex;
                gap: 10px;
                flex-wrap: wrap;
            ">
                <button onclick="nextStoryScene()" style="
                    flex: 1;
                    min-width: 150px;
                    padding: 12px 20px;
                    background: rgba(255, 255, 255, 0.2);
                    border: 2px solid rgba(255, 255, 255, 0.5);
                    color: white;
                    font-size: 1em;
                    font-weight: bold;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.3s;
                " onmouseover="this.style.background='rgba(255, 255, 255, 0.3)'; this.style.borderColor='white'; this.style.transform='translateY(-2px)'" onmouseout="this.style.background='rgba(255, 255, 255, 0.2)'; this.style.borderColor='rgba(255, 255, 255, 0.5)'; this.style.transform='translateY(0)'">Далее →</button>
                <button onclick="skipStory()" style="
                    flex: 1;
                    min-width: 150px;
                    padding: 12px 20px;
                    background: rgba(255, 100, 100, 0.3);
                    border: 2px solid rgba(255, 100, 100, 0.7);
                    color: white;
                    font-size: 1em;
                    font-weight: bold;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.3s;
                " onmouseover="this.style.background='rgba(255, 100, 100, 0.5)'; this.style.borderColor='#ff6464'; this.style.transform='translateY(-2px)'" onmouseout="this.style.background='rgba(255, 100, 100, 0.3)'; this.style.borderColor='rgba(255, 100, 100, 0.7)'; this.style.transform='translateY(0)'">Пропустить историю</button>
            </div>
            
            <div style="
                background: rgba(0, 0, 0, 0.3);
                padding: 10px 20px;
                text-align: center;
                color: rgba(255, 255, 255, 0.7);
                font-size: 0.9em;
            ">
                <span id="story-progress-text">Сцена 1 из 1</span>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Сохраняем сцены в глобальную переменную
    window.currentStory = {
        scenes: scenes,
        currentScene: 0,
        modal: modal,
        isIntroStory: isIntroStory,
        storyKey: storyKey,
        onComplete: onComplete
    };
    
    // Показываем первую сцену
    showCurrentStoryScene();
}

// Показать текущую сцену
function showCurrentStoryScene() {
    if (!window.currentStory) return;
    
    const story = window.currentStory;
    const scene = story.scenes[story.currentScene];
    
    if (!scene) {
        closeStory();
        return;
    }
    
    const characterDiv = document.getElementById('story-character');
    const textDiv = document.getElementById('story-text');
    const progressDiv = document.getElementById('story-progress-text');
    
    // Показываем эмодзи и имя рассказчика если нужно
    let characterDisplay = '🐅';
    
    if (scene.character === 'Рассказчик') {
        characterDisplay = '📖 Рассказчик';
    } else if (scene.character === 'Тигра') {
        characterDisplay = '🐅';
    }
    
    characterDiv.innerHTML = characterDisplay;
    textDiv.innerHTML = scene.text;
    progressDiv.textContent = `Сцена ${story.currentScene + 1} из ${story.scenes.length}`;
    
    // Анимация появления
    characterDiv.style.animation = 'none';
    textDiv.style.animation = 'none';
    setTimeout(() => {
        characterDiv.style.animation = 'fadeIn 0.5s ease-in';
        textDiv.style.animation = 'fadeIn 0.5s ease-in';
    }, 10);
}

// Следующая сцена
function nextStoryScene() {
    if (!window.currentStory) return;
    
    window.currentStory.currentScene++;
    
    if (window.currentStory.currentScene >= window.currentStory.scenes.length) {
        closeStory();
    } else {
        showCurrentStoryScene();
    }
}

// Пропустить историю
function skipStory() {
    closeStory();
}

// Закрыть историю
function closeStory() {
    console.log('📖 closeStory вызвана');
    const modal = document.getElementById('story-modal');
    if (modal) {
        modal.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => {
            if (modal.parentElement) modal.remove();
            
            // Отмечаем историю как просмотренную
            if (window.currentStory && window.currentStory.storyKey) {
                const viewedStories = JSON.parse(localStorage.getItem('viewedStories') || '[]');
                if (!viewedStories.includes(window.currentStory.storyKey)) {
                    viewedStories.push(window.currentStory.storyKey);
                    localStorage.setItem('viewedStories', JSON.stringify(viewedStories));
                    console.log('📖 История отмечена как просмотренная:', window.currentStory.storyKey);
                }
            }
            
            // Вызываем callback если он есть
            if (window.currentStory && window.currentStory.onComplete) {
                console.log('📖 Вызываем callback');
                window.currentStory.onComplete();
            }
            
            // Start level statistics tracking after story closes
            if (game.level && game.level >= 1 && game.level <= 6) {
                startLevelStats(game.level);
            }
        }, 300);
    }
    window.currentStory = null;
}

// Показать историю завершения
function showEndingStory(playerName, tigerName = 'Тигра') {
    showStory('ending', playerName, tigerName);
}

// Добавляем стили для анимаций
const style = document.createElement('style');
style.textContent = `
    @keyframes slideUp {
        from {
            transform: translateY(50px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }
    
    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
    
    @keyframes fadeOut {
        from {
            opacity: 1;
        }
        to {
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

console.log('✅ Система историй загружена');