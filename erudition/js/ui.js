/* ============================================
   UI Controller — Screen management, rendering
   ============================================ */

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const screen = document.getElementById(screenId);
    if (screen) screen.classList.add('active');

    document.querySelectorAll('.bottom-nav .nav-btn').forEach(btn => btn.classList.remove('active'));

    if (screenId === 'stats-screen') renderStats();
    if (screenId === 'wiki-screen') renderWiki();
    if (screenId === 'home-screen') updateHomeStats();
}

function renderCategories() {
    const grid = document.getElementById('categories-grid');
    if (!grid) return;

    const stats = loadStats();

    grid.innerHTML = QuizEngine.categories.map(cat => {
        const count = QuizEngine.getCategoryCount(cat.id);
        const catStats = stats.categoryStats[cat.id] || { correct: 0, wrong: 0 };
        const total = catStats.correct + catStats.wrong;
        const progressPct = count > 0 ? Math.min((total / count) * 100, 100) : 0;

        return `
            <div class="category-card" style="--cat-color: ${cat.color}" onclick="startCategory('${cat.id}')">
                <div class="cat-icon">${cat.icon}</div>
                <div class="cat-name">${cat.name}</div>
                <div class="cat-count">${count} вопросов</div>
                <div class="cat-progress">
                    <div class="cat-progress-fill" style="width: ${progressPct}%; background: ${cat.color}"></div>
                </div>
            </div>
        `;
    }).join('');
}

function updateHomeStats() {
    const stats = loadStats();
    const totalEl = document.getElementById('total-questions-stat');
    const scoreEl = document.getElementById('user-score-stat');
    if (totalEl) totalEl.textContent = QuizEngine.getTotalCount().toLocaleString('ru-RU');
    if (scoreEl) scoreEl.textContent = stats.totalScore.toLocaleString('ru-RU');
}

/* Quiz UI */

function startMode(mode) {
    const hasQuestions = QuizEngine.startQuiz(mode, null);
    if (!hasQuestions) return;
    showQuizScreen(mode);
}

function startCategory(catId) {
    const hasQuestions = QuizEngine.startQuiz('category', catId);
    if (!hasQuestions) return;
    showQuizScreen('category', catId);
}

function showQuizScreen(mode, catId) {
    showScreen('quiz-screen');

    const catLabel = document.getElementById('quiz-category-label');
    const modeLabel = document.getElementById('quiz-mode-label');
    const timerBar = document.getElementById('quiz-timer-bar');

    if (catId) {
        const cat = QuizEngine.categories.find(c => c.id === catId);
        catLabel.textContent = cat ? cat.name : 'Смешанные';
    } else {
        catLabel.textContent = 'Смешанные';
    }

    const modeNames = {
        classic: 'Классика',
        marathon: 'Марафон',
        timed: 'На время',
        expert: 'Эксперт',
        category: 'По категории'
    };
    modeLabel.textContent = modeNames[mode] || '';

    timerBar.style.display = mode === 'timed' ? 'block' : 'none';

    if (mode === 'timed') {
        QuizEngine.startTimer(
            (timeLeft) => updateTimer(timeLeft),
            () => finishQuiz()
        );
    }

    document.getElementById('correct-count').textContent = '0';
    document.getElementById('wrong-count').textContent = '0';
    document.getElementById('streak-count').textContent = '0';

    renderQuestion();
}

function renderQuestion() {
    const question = QuizEngine.getCurrentQuestion();
    if (!question) {
        finishQuiz();
        return;
    }

    const qText = document.getElementById('question-text');
    const optContainer = document.getElementById('options-container');
    const counter = document.getElementById('quiz-counter');
    const progressFill = document.getElementById('quiz-progress-fill');
    const diffBadge = document.getElementById('difficulty-badge');

    qText.textContent = question.q;

    const total = QuizEngine.getTotalQuestions();
    const current = QuizEngine.currentIndex + 1;
    counter.textContent = `${current}/${total}`;

    if (total !== '∞') {
        progressFill.style.width = `${(current / total) * 100}%`;
    } else {
        progressFill.style.width = `0%`;
    }

    const diffNames = { 1: 'Лёгкий', 2: 'Средний', 3: 'Сложный' };
    const diffClasses = { 1: '', 2: 'medium', 3: 'hard' };
    diffBadge.textContent = diffNames[question.difficulty] || 'Лёгкий';
    diffBadge.className = 'difficulty-badge ' + (diffClasses[question.difficulty] || '');

    const letters = ['A', 'B', 'C', 'D'];
    optContainer.innerHTML = question.options.map((opt, i) => `
        <button class="option-btn" onclick="selectAnswer(${i})">
            <span class="option-letter">${letters[i]}</span>
            <span>${opt}</span>
        </button>
    `).join('');

    const card = document.getElementById('question-card');
    card.style.animation = 'none';
    card.offsetHeight;
    card.style.animation = 'scaleIn 0.3s ease';
}

function selectAnswer(index) {
    const result = QuizEngine.answer(index);
    if (!result) return;

    const buttons = document.querySelectorAll('.option-btn');
    buttons.forEach((btn, i) => {
        btn.classList.add('disabled');
        if (i === result.correctIndex) btn.classList.add('correct');
        if (i === index && !result.isCorrect) btn.classList.add('wrong');
    });

    document.getElementById('correct-count').textContent = QuizEngine.correctCount;
    document.getElementById('wrong-count').textContent = QuizEngine.wrongCount;
    document.getElementById('streak-count').textContent = QuizEngine.streak;

    const settings = loadSettings();

    if (settings.vibration && navigator.vibrate) {
        navigator.vibrate(result.isCorrect ? 50 : [50, 30, 50]);
    }

    if (settings.showExplanations) {
        setTimeout(() => showWikiPopup(result), 600);
    } else {
        if (QuizEngine.mode === 'marathon' && !result.isCorrect) {
            setTimeout(() => finishQuiz(), 800);
        } else {
            setTimeout(() => {
                QuizEngine.moveNext();
                if (QuizEngine.isFinished()) {
                    finishQuiz();
                } else {
                    renderQuestion();
                }
            }, 800);
        }
    }
}

function showWikiPopup(result) {
    const overlay = document.getElementById('wiki-overlay');
    const icon = document.getElementById('wiki-result-icon');
    const text = document.getElementById('wiki-result-text');
    const correctAnswer = document.getElementById('wiki-correct-answer');
    const explanation = document.getElementById('wiki-explanation');
    const nextBtn = document.getElementById('wiki-next-btn');

    icon.textContent = result.isCorrect ? '✅' : '❌';
    text.textContent = result.isCorrect ? 'Правильно!' : 'Неправильно';
    correctAnswer.textContent = `Правильный ответ: ${result.correctAnswer}`;
    explanation.textContent = result.explanation || 'Интересный факт скоро появится!';

    if (QuizEngine.mode === 'marathon' && !result.isCorrect) {
        nextBtn.textContent = 'Результаты';
    } else {
        nextBtn.textContent = 'Далее →';
    }

    overlay.classList.add('active');
}

function nextQuestion() {
    const overlay = document.getElementById('wiki-overlay');
    overlay.classList.remove('active');

    if (QuizEngine.mode === 'marathon' && QuizEngine.wrongCount > 0) {
        finishQuiz();
        return;
    }

    QuizEngine.moveNext();

    if (QuizEngine.isFinished()) {
        finishQuiz();
    } else {
        renderQuestion();
    }
}

function exitQuiz() {
    QuizEngine.stopTimer();
    showScreen('home-screen');
}

function finishQuiz() {
    QuizEngine.stopTimer();
    const results = QuizEngine.getResults();
    saveGameResult(results);
    showResults(results);
}

function showResults(results) {
    showScreen('results-screen');

    document.getElementById('results-icon').textContent = results.icon;
    document.getElementById('results-title').textContent = results.title;

    const modeNames = {
        classic: 'Классика',
        marathon: 'Марафон',
        timed: 'На время',
        expert: 'Эксперт',
        category: 'По категории'
    };
    document.getElementById('results-subtitle').textContent = `Режим: ${modeNames[results.mode] || results.mode}`;
    document.getElementById('result-correct').textContent = results.correct;
    document.getElementById('result-wrong').textContent = results.wrong;
    document.getElementById('result-streak').textContent = results.bestStreak;
    document.getElementById('result-score').textContent = results.score;
    document.getElementById('result-percent').textContent = results.percent + '%';

    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (results.percent / 100) * circumference;
    const circle = document.getElementById('result-circle-fill');
    setTimeout(() => {
        circle.style.strokeDashoffset = offset;
    }, 100);
}

function retryQuiz() {
    if (QuizEngine.lastConfig) {
        const { mode, category } = QuizEngine.lastConfig;
        const hasQuestions = QuizEngine.startQuiz(mode, category);
        if (hasQuestions) {
            showQuizScreen(mode, category);
        }
    } else {
        showScreen('home-screen');
    }
}

function updateTimer(timeLeft) {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const timerText = document.getElementById('quiz-timer-text');
    const timerFill = document.getElementById('quiz-timer-fill');

    if (timerText) timerText.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    if (timerFill) timerFill.style.width = `${(timeLeft / 180) * 100}%`;
}

/* Stats Screen */
function renderStats() {
    const stats = loadStats();

    document.getElementById('stats-total-played').textContent = stats.totalPlayed;
    document.getElementById('stats-total-correct').textContent = stats.totalCorrect;

    const totalAnswered = stats.totalCorrect + stats.totalWrong;
    const accuracy = totalAnswered > 0 ? Math.round((stats.totalCorrect / totalAnswered) * 100) : 0;
    document.getElementById('stats-accuracy').textContent = accuracy + '%';
    document.getElementById('stats-best-streak').textContent = stats.bestStreak;

    const catStatsEl = document.getElementById('category-stats');
    catStatsEl.innerHTML = QuizEngine.categories.map(cat => {
        const cs = stats.categoryStats[cat.id] || { correct: 0, wrong: 0 };
        const total = cs.correct + cs.wrong;
        const pct = total > 0 ? Math.round((cs.correct / total) * 100) : 0;

        return `
            <div class="cat-stat-row">
                <span class="cat-stat-icon">${cat.icon}</span>
                <div class="cat-stat-info">
                    <div class="cat-stat-name">${cat.name}</div>
                    <div class="cat-stat-bar">
                        <div class="cat-stat-bar-fill" style="width: ${pct}%; background: ${cat.color}"></div>
                    </div>
                </div>
                <span class="cat-stat-percent">${total > 0 ? pct + '%' : '—'}</span>
            </div>
        `;
    }).join('');
}

function resetStats() {
    if (confirm('Вы уверены? Вся статистика будет удалена.')) {
        localStorage.removeItem('erudit_stats');
        renderStats();
        updateHomeStats();
    }
}

/* Wiki / Knowledge Screen */

let wikiFilter = 'all';
let wikiSearch = '';

function renderWiki() {
    const stats = loadStats();
    const history = stats.questionHistory || {};
    const list = document.getElementById('wiki-list');

    let entries = Object.values(history);

    if (wikiFilter === 'learned') {
        entries = entries.filter(e => e.correct);
    } else if (wikiFilter === 'wrong') {
        entries = entries.filter(e => !e.correct);
    }

    if (wikiSearch) {
        const search = wikiSearch.toLowerCase();
        entries = entries.filter(e =>
            e.question.toLowerCase().includes(search) ||
            (e.explanation && e.explanation.toLowerCase().includes(search))
        );
    }

    entries.sort((a, b) => b.timestamp - a.timestamp);

    if (entries.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📚</div>
                <p>Пока пусто. Играй в квиз, чтобы<br>пополнить базу знаний!</p>
            </div>
        `;
        return;
    }

    list.innerHTML = entries.slice(0, 100).map((entry, i) => {
        const cat = QuizEngine.categories.find(c => c.id === entry.category);
        const catName = cat ? cat.name : entry.category;

        return `
            <div class="wiki-item" onclick="this.classList.toggle('expanded')">
                <div class="wiki-item-q">${entry.question}</div>
                <div class="wiki-item-meta">
                    <span class="wiki-item-cat">${catName}</span>
                    <span class="wiki-item-result ${entry.correct ? 'correct' : 'wrong'}">
                        ${entry.correct ? '✓ Правильно' : '✗ Неправильно'}
                    </span>
                </div>
                <div class="wiki-item-explanation">${entry.explanation || 'Объяснение скоро появится.'}</div>
            </div>
        `;
    }).join('');
}

function filterWiki(filter, btn) {
    wikiFilter = filter;
    document.querySelectorAll('.wiki-filter').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    renderWiki();
}

function searchWiki(value) {
    wikiSearch = value;
    renderWiki();
}

/* Settings */
function setDifficulty(diff, btn) {
    document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    saveSetting('difficulty', diff);
}

function loadSettingsUI() {
    const settings = loadSettings();
    document.getElementById('setting-explanations').checked = settings.showExplanations !== false;
    document.getElementById('setting-sounds').checked = settings.sounds !== false;
    document.getElementById('setting-vibration').checked = settings.vibration !== false;

    const diffBtns = document.querySelectorAll('.diff-btn');
    diffBtns.forEach(b => {
        b.classList.toggle('active', b.dataset.diff === (settings.difficulty || 'all'));
    });
}
