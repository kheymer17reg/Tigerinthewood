/* ============================================
   Quiz Engine — Core game logic
   ============================================ */

const QuizEngine = {
    allQuestions: [],
    currentQuestions: [],
    currentIndex: 0,
    correctCount: 0,
    wrongCount: 0,
    streak: 0,
    bestStreak: 0,
    score: 0,
    mode: 'classic',
    category: null,
    difficulty: 'all',
    timerInterval: null,
    timeLeft: 0,
    answered: false,
    lastConfig: null,

    categories: [
        { id: 'history', name: 'История', icon: '🏛️', color: '#c9a44c' },
        { id: 'geography', name: 'География', icon: '🌍', color: '#2ecc71' },
        { id: 'personalities', name: 'Личности', icon: '👤', color: '#9b59b6' },
        { id: 'culture', name: 'Культура', icon: '🎭', color: '#e74c3c' },
        { id: 'biology', name: 'Биология', icon: '🧬', color: '#1abc9c' },
        { id: 'chemistry', name: 'Химия', icon: '⚗️', color: '#f39c12' },
        { id: 'physics', name: 'Физика', icon: '⚡', color: '#3498db' },
        { id: 'math', name: 'Математика', icon: '📐', color: '#e67e22' },
        { id: 'everyday', name: 'Жизнь', icon: '💡', color: '#16a085' },
        { id: 'sports', name: 'Спорт', icon: '⚽', color: '#27ae60' },
        { id: 'technology', name: 'Технологии', icon: '💻', color: '#8e44ad' }
    ],

    init() {
        this.allQuestions = [];
        const dataSources = [
            typeof historyQuestions !== 'undefined' ? historyQuestions : [],
            typeof geographyQuestions !== 'undefined' ? geographyQuestions : [],
            typeof personalitiesQuestions !== 'undefined' ? personalitiesQuestions : [],
            typeof cultureQuestions !== 'undefined' ? cultureQuestions : [],
            typeof biologyQuestions !== 'undefined' ? biologyQuestions : [],
            typeof chemistryQuestions !== 'undefined' ? chemistryQuestions : [],
            typeof physicsQuestions !== 'undefined' ? physicsQuestions : [],
            typeof mathQuestions !== 'undefined' ? mathQuestions : [],
            typeof everydayQuestions !== 'undefined' ? everydayQuestions : [],
            typeof sportsQuestions !== 'undefined' ? sportsQuestions : [],
            typeof technologyQuestions !== 'undefined' ? technologyQuestions : []
        ];
        dataSources.forEach(src => {
            this.allQuestions = this.allQuestions.concat(src);
        });
        console.log(`Loaded ${this.allQuestions.length} questions`);
    },

    getQuestionsByCategory(catId) {
        return this.allQuestions.filter(q => q.category === catId);
    },

    getCategoryCount(catId) {
        return this.getQuestionsByCategory(catId).length;
    },

    getTotalCount() {
        return this.allQuestions.length;
    },

    shuffle(arr) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    },

    startQuiz(mode, category) {
        this.mode = mode;
        this.category = category;
        this.currentIndex = 0;
        this.correctCount = 0;
        this.wrongCount = 0;
        this.streak = 0;
        this.bestStreak = 0;
        this.score = 0;
        this.answered = false;
        this.lastConfig = { mode, category };

        const settings = loadSettings();
        this.difficulty = settings.difficulty || 'all';

        let pool = category
            ? this.getQuestionsByCategory(category)
            : [...this.allQuestions];

        if (this.difficulty !== 'all') {
            pool = pool.filter(q => q.difficulty === parseInt(this.difficulty));
        }

        if (mode === 'expert') {
            pool = pool.filter(q => q.difficulty === 3);
        }

        pool = this.shuffle(pool);

        switch (mode) {
            case 'classic':
                this.currentQuestions = pool.slice(0, 20);
                break;
            case 'marathon':
                this.currentQuestions = pool;
                break;
            case 'timed':
                this.currentQuestions = pool;
                this.timeLeft = 180;
                break;
            case 'expert':
                this.currentQuestions = pool.slice(0, 30);
                break;
            case 'category':
                this.currentQuestions = pool.slice(0, Math.min(25, pool.length));
                break;
            default:
                this.currentQuestions = pool.slice(0, 20);
        }

        return this.currentQuestions.length > 0;
    },

    getCurrentQuestion() {
        if (this.currentIndex >= this.currentQuestions.length) return null;
        return this.currentQuestions[this.currentIndex];
    },

    getTotalQuestions() {
        if (this.mode === 'marathon') return '∞';
        if (this.mode === 'timed') return '∞';
        return this.currentQuestions.length;
    },

    answer(selectedIndex) {
        if (this.answered) return null;
        this.answered = true;

        const question = this.getCurrentQuestion();
        if (!question) return null;

        const isCorrect = selectedIndex === question.answer;

        if (isCorrect) {
            this.correctCount++;
            this.streak++;
            if (this.streak > this.bestStreak) this.bestStreak = this.streak;

            let points = 10;
            if (question.difficulty === 2) points = 20;
            if (question.difficulty === 3) points = 30;
            points += Math.min(this.streak * 2, 20);
            this.score += points;
        } else {
            this.wrongCount++;
            this.streak = 0;
        }

        saveQuestionResult(question, isCorrect);

        return {
            isCorrect,
            correctIndex: question.answer,
            explanation: question.explanation,
            correctAnswer: question.options[question.answer],
            score: this.score,
            streak: this.streak
        };
    },

    moveNext() {
        this.answered = false;
        this.currentIndex++;
    },

    isFinished() {
        if (this.mode === 'marathon' && this.wrongCount > 0) return true;
        if (this.mode === 'timed' && this.timeLeft <= 0) return true;
        return this.currentIndex >= this.currentQuestions.length;
    },

    getResults() {
        const total = this.correctCount + this.wrongCount;
        const percent = total > 0 ? Math.round((this.correctCount / total) * 100) : 0;

        let title, icon;
        if (percent >= 90) { title = 'Блестяще!'; icon = '🏆'; }
        else if (percent >= 70) { title = 'Отличный результат!'; icon = '🌟'; }
        else if (percent >= 50) { title = 'Хороший результат!'; icon = '👍'; }
        else if (percent >= 30) { title = 'Неплохо!'; icon = '💪'; }
        else { title = 'Попробуй ещё раз!'; icon = '📚'; }

        return {
            title,
            icon,
            correct: this.correctCount,
            wrong: this.wrongCount,
            total,
            percent,
            score: this.score,
            bestStreak: this.bestStreak,
            mode: this.mode,
            category: this.category
        };
    },

    startTimer(onTick, onEnd) {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            if (onTick) onTick(this.timeLeft);
            if (this.timeLeft <= 0) {
                clearInterval(this.timerInterval);
                this.timerInterval = null;
                if (onEnd) onEnd();
            }
        }, 1000);
    },

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
};

/* ============================================
   Persistence — localStorage helpers
   ============================================ */

function loadStats() {
    try {
        return JSON.parse(localStorage.getItem('erudit_stats')) || {
            totalPlayed: 0,
            totalCorrect: 0,
            totalWrong: 0,
            bestStreak: 0,
            totalScore: 0,
            categoryStats: {},
            questionHistory: {}
        };
    } catch { return { totalPlayed: 0, totalCorrect: 0, totalWrong: 0, bestStreak: 0, totalScore: 0, categoryStats: {}, questionHistory: {} }; }
}

function saveStats(stats) {
    localStorage.setItem('erudit_stats', JSON.stringify(stats));
}

function saveQuestionResult(question, isCorrect) {
    const stats = loadStats();
    const key = question.category + '_' + question.id;
    stats.questionHistory[key] = {
        question: question.q,
        category: question.category,
        correct: isCorrect,
        explanation: question.explanation,
        timestamp: Date.now()
    };
    saveStats(stats);
}

function saveGameResult(results) {
    const stats = loadStats();
    stats.totalPlayed++;
    stats.totalCorrect += results.correct;
    stats.totalWrong += results.wrong;
    stats.totalScore += results.score;
    if (results.bestStreak > stats.bestStreak) stats.bestStreak = results.bestStreak;

    const catId = results.category || 'mixed';
    if (!stats.categoryStats[catId]) {
        stats.categoryStats[catId] = { played: 0, correct: 0, wrong: 0 };
    }
    stats.categoryStats[catId].played++;
    stats.categoryStats[catId].correct += results.correct;
    stats.categoryStats[catId].wrong += results.wrong;

    saveStats(stats);
}

function loadSettings() {
    try {
        return JSON.parse(localStorage.getItem('erudit_settings')) || {
            showExplanations: true,
            sounds: true,
            vibration: true,
            difficulty: 'all'
        };
    } catch { return { showExplanations: true, sounds: true, vibration: true, difficulty: 'all' }; }
}

function saveSetting(key, value) {
    const settings = loadSettings();
    settings[key] = value;
    localStorage.setItem('erudit_settings', JSON.stringify(settings));
}
