class TestEngine {
    constructor(appElementId) {
        this.appElement = document.getElementById(appElementId);
        this.state = this.loadState() || {
            currentTestId: null,
            currentQuestionIndex: 0,
            score: 0,
            title: ''
        };
        this.tests = {
            'first-aid': {
                title: 'Оказание первой помощи',
                getQuestions: () => typeof questionsFirstAid !== 'undefined' ? questionsFirstAid : null
            },
            'general-safety': {
                title: 'Общая охрана труда',
                getQuestions: () => typeof appQuestions !== 'undefined' ? appQuestions : null
            },
            'fire-module-org': {
                title: 'Пожарная безопасность: Организационные вопросы',
                getQuestions: () => typeof questionsFireOrg !== 'undefined' ? questionsFireOrg : null
            },
            'fire-module-buildings': {
                title: 'Пожарная безопасность: Здания и водоснабжение',
                getQuestions: () => typeof questionsFireBuildings !== 'undefined' ? questionsFireBuildings : null
            },
            'fire-module-ventilation': {
                title: 'Пожарная безопасность: Вентиляция, отопление, газ',
                getQuestions: () => typeof questionsFireVentilation !== 'undefined' ? questionsFireVentilation : null
            },
            'fire-module-electro': {
                title: 'Пожарная безопасность: Электробезопасность',
                getQuestions: () => typeof questionsFireElectro !== 'undefined' ? questionsFireElectro : null
            },
            'fire-module-territories': {
                title: 'Пожарная безопасность: Территории и дороги',
                getQuestions: () => typeof questionsFireTerritories !== 'undefined' ? questionsFireTerritories : null
            },
            'fire-module-furnace': {
                title: 'Пожарная безопасность: Печное отопление и котельные',
                getQuestions: () => typeof questionsFireFurnace !== 'undefined' ? questionsFireFurnace : null
            },
            'fire-module-public_res': {
                title: 'Пожарная безопасность: Общественные и жилые здания',
                getQuestions: () => typeof questionsFirePublicRes !== 'undefined' ? questionsFirePublicRes : null
            },
            'fire-module-science': {
                title: 'Пожарная безопасность: Научные и учебные заведения',
                getQuestions: () => typeof questionsFireScience !== 'undefined' ? questionsFireScience : null
            },
            'fire-module-entertain': {
                title: 'Пожарная безопасность: Зрелищные и спортивные объекты',
                getQuestions: () => typeof questionsFireEntertain !== 'undefined' ? questionsFireEntertain : null
            },
            'fire-module-trade': {
                title: 'Пожарная безопасность: Торговля и ЛВЖ',
                getQuestions: () => typeof questionsFireTrade !== 'undefined' ? questionsFireTrade : null
            },
            'fire-module-railway': {
                title: 'Пожарная безопасность: Железнодорожный транспорт',
                getQuestions: () => typeof questionsFireRailway !== 'undefined' ? questionsFireRailway : null
            },
            'fire-module-production': {
                title: 'Пожарная безопасность: Производство и взрывоопасные работы',
                getQuestions: () => typeof questionsFireProduction !== 'undefined' ? questionsFireProduction : null
            },
            'fire-module-matches': {
                title: 'Пожарная безопасность: Производство спичек',
                getQuestions: () => typeof questionsFireMatches !== 'undefined' ? questionsFireMatches : null
            },
            'fire-module-powerplants': {
                title: 'Пожарная безопасность: Электростанции и электроустановки',
                getQuestions: () => typeof questionsFirePowerPlants !== 'undefined' ? questionsFirePowerPlants : null
            },
            'fire-module-agriculture': {
                title: 'Пожарная безопасность: Сельское хозяйство и деревообработка',
                getQuestions: () => typeof questionsFireAgriculture !== 'undefined' ? questionsFireAgriculture : null
            }
        };

        this.initDelegation();
        
        if (this.state.currentTestId) {
            this.resumeOrStart();
        } else {
            this.renderStartScreen();
        }

        const logoElement = document.querySelector('.logo');
        if (logoElement) {
            logoElement.addEventListener('click', () => this.returnToMainMenu(true));
        }
        const globalBackBtn = document.getElementById('global-back-btn');
        if (globalBackBtn) {
            globalBackBtn.addEventListener('click', () => this.goBack());
        }
    }

    saveState() {
        if (this.state.currentTestId) {
            localStorage.setItem('testEngineState', JSON.stringify(this.state));
        } else {
            localStorage.removeItem('testEngineState');
        }
    }

    loadState() {
        try {
            const data = localStorage.getItem('testEngineState');
            return data ? JSON.parse(data) : null;
        } catch (e) {
            return null;
        }
    }

    clearState() {
        this.state = { currentTestId: null, currentQuestionIndex: 0, score: 0, title: '' };
        this.saveState();
    }

    initDelegation() {
        this.appElement.addEventListener('click', (e) => {
            const target = e.target;
            
            const card = target.closest('.module-card');
            if (card) {
                const id = card.id.replace('btn-', '');
                if (this.tests[id]) {
                    this.startTest(id);
                } else if (id === 'fire-safety') {
                    this.renderFireSafetyMenu();
                }
            }



            if (target.classList.contains('option-btn') && !target.disabled) {
                const index = parseInt(target.dataset.index, 10);
                this.handleAnswer(index, target);
            }

            if (target.id === 'nextBtn') {
                this.nextQuestion();
            }
            if (target.id === 'restartBtn') {
                const testId = this.state.currentTestId;
                this.clearState();
                this.startTest(testId);
            }
        });

        this.appElement.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                const card = e.target.closest('.module-card');
                if (card) {
                    e.preventDefault();
                    const id = card.id.replace('btn-', '');
                    if (this.tests[id]) {
                        this.startTest(id);
                    } else if (id === 'fire-safety') {
                        this.renderFireSafetyMenu();
                    }
                }


            }
        });
    }

    resumeOrStart() {
        if (confirm(`У вас есть незаконченный тест "${this.state.title}". Продолжить?`)) {
            const backBtn = document.getElementById('global-back-btn');
            if (backBtn) backBtn.style.display = 'block';
            this.renderQuestion();
        } else {
            this.clearState();
            this.renderStartScreen();
        }
    }

    returnToMainMenu() {
        this.clearState();
        this.renderStartScreen();
    }

    goBack() {
        if (this.state.currentTestId && this.state.currentTestId.startsWith('fire-module-')) {
            this.clearState();
            this.renderFireSafetyMenu();
        } else {
            this.clearState();
            this.renderStartScreen();
        }
    }

    startTest(testId) {
        const testConfig = this.tests[testId];
        const questionsArray = testConfig.getQuestions();
        
        if (!questionsArray || questionsArray.length === 0) {
            alert(`Модуль "${testConfig.title}" недоступен. Проверьте загрузку вопросов.`);
            return;
        }

        this.state = {
            currentTestId: testId,
            currentQuestionIndex: 0,
            score: 0,
            title: testConfig.title
        };
        this.saveState();
        
        const backBtn = document.getElementById('global-back-btn');
        if (backBtn) backBtn.style.display = 'block';

        this.renderQuestion();
    }

    renderFireSafetyMenu() {
        const backBtn = document.getElementById('global-back-btn');
        if (backBtn) backBtn.style.display = 'block';

        const fireTopics = [
            { id: 'org', title: 'Организационные вопросы' },
            { id: 'buildings', title: 'Здания и водоснабжение' },
            { id: 'ventilation', title: 'Вентиляция, отопление, газ' },
            { id: 'electro', title: 'Электробезопасность' },
            { id: 'territories', title: 'Территории и дороги' },
            { id: 'furnace', title: 'Печное отопление и котельные' },
            { id: 'public_res', title: 'Общественные и жилые здания' },
            { id: 'science', title: 'Научные и учебные заведения' },
            { id: 'entertain', title: 'Зрелищные и спортивные объекты' },
            { id: 'trade', title: 'Торговля и ЛВЖ' },
            { id: 'railway', title: 'Железнодорожный транспорт' },
            { id: 'production', title: 'Производство и взрывоопасные работы' },
            { id: 'matches', title: 'Производство спичек' },
            { id: 'powerplants', title: 'Электростанции и электроустановки' },
            { id: 'agriculture', title: 'Сельское хозяйство и деревообработка' }
        ];

        let cardsHtml = fireTopics.map(topic => `
            <div class="module-card" id="btn-fire-module-${topic.id}" role="button" tabindex="0">
                <div class="module-icon">🔥</div>
                <div class="module-info">
                    <div class="module-title">${topic.title}</div>
                    <div class="module-desc">Тестирование по теме</div>
                </div>
            </div>
        `).join('');

        this.appElement.innerHTML = `
            <div class="start-screen-header">
                <h1 class="start-screen-title">Пожарная безопасность</h1>
                <div style="font-size: 0.85em; color: #9ca3af; margin-bottom: 15px;">Постановление Правительства РФ от 16.09.2020 N 1479 (ред. от 23.05.2026) «Об утверждении Правил противопожарного режима в Российской Федерации»</div>
                <p class="start-screen-desc">Выберите тему для прохождения тестирования</p>
            </div>
            
            <div class="modules-grid">
                ${cardsHtml}
            </div>
        `;
    }

    renderStartScreen() {
        const backBtn = document.getElementById('global-back-btn');
        if (backBtn) backBtn.style.display = 'none';
        
        this.appElement.innerHTML = `
            <div class="start-screen-header">
                <h1 class="start-screen-title">Выберите программу</h1>
                <p class="start-screen-desc">Система инструктажа и проверки знаний</p>
            </div>
            
            <div class="modules-grid">
                <div class="module-card" id="btn-first-aid" role="button" tabindex="0">
                    <div class="module-icon">
                        <svg viewBox="0 0 100 100" width="56" height="56" xmlns="http://www.w3.org/2000/svg">
                            <path d="M35 30 V20 C35 15, 39 10, 45 10 H55 C61 10, 65 15, 65 20 V30" fill="none" stroke="#e2e8f0" stroke-width="8" stroke-linecap="round"/>
                            <rect x="15" y="30" width="70" height="55" rx="12" fill="#f97316" />
                            <rect x="15" y="30" width="70" height="15" rx="12" fill="#ffffff" opacity="0.2" />
                            <circle cx="50" cy="57" r="16" fill="#ffffff" />
                            <path d="M46 47 H54 V53 H60 V61 H54 V67 H46 V61 H40 V53 H46 Z" fill="#f97316" />
                        </svg>
                    </div>
                    <div class="module-info">
                        <div class="module-title">Оказание первой помощи</div>
                        <div class="module-desc">Основы оказания доврачебной помощи пострадавшим на производстве</div>
                    </div>
                </div>

                <div class="module-card" id="btn-general-safety" role="button" tabindex="0">
                    <div class="module-icon">🛡️</div>
                    <div class="module-info">
                        <div class="module-title">Инструктаж и Тестирование</div>
                        <div class="module-desc">Базовые правила охраны труда и техники безопасности на рабочем месте</div>
                    </div>
                </div>

                <div class="module-card" id="btn-fire-safety" role="button" tabindex="0">
                    <div class="module-icon">
                        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <defs>
                                <linearGradient id="cylGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stop-color="#C62828" />
                                    <stop offset="20%" stop-color="#E53935" />
                                    <stop offset="60%" stop-color="#EF5350" />
                                    <stop offset="90%" stop-color="#D32F2F" />
                                    <stop offset="100%" stop-color="#B71C1C" />
                                </linearGradient>
                                <linearGradient id="metalGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stop-color="#757575" />
                                    <stop offset="50%" stop-color="#BDBDBD" />
                                    <stop offset="100%" stop-color="#616161" />
                                </linearGradient>
                            </defs>
                            <rect x="35" y="30" width="30" height="55" rx="6" fill="url(#cylGrad)" />
                            <rect x="39" y="32" width="3" height="51" rx="1.5" fill="#FFFFFF" opacity="0.4" />
                            <rect x="35" y="45" width="30" height="18" fill="#EEEEEE" />
                            <rect x="35" y="47" width="30" height="2" fill="#FFC107" />
                            <rect x="35" y="59" width="30" height="2" fill="#FFC107" />
                            <path d="M 47 55 Q 50 48 53 55 Q 50 58 47 55 Z" fill="#E53935" />
                            <path d="M 49 55 Q 50 52 51 55 Q 50 56 49 55 Z" fill="#FFC107" />
                            <path d="M 55 51 L 62 51 M 55 54 L 60 54 M 55 57 L 61 57" stroke="#9E9E9E" stroke-width="1" stroke-linecap="round" />
                            <path d="M33 80 L67 80 L65 85 Q 50 88 35 85 Z" fill="#B71C1C" />
                            <path d="M44 30 L56 30 L60 35 L40 35 Z" fill="url(#cylGrad)" />
                            <rect x="44" y="25" width="12" height="5" fill="url(#metalGrad)" />
                            <rect x="43" y="26" width="14" height="1.5" fill="#757575" />
                            <rect x="43" y="28.5" width="14" height="1.5" fill="#757575" />
                            <rect x="42" y="15" width="16" height="10" rx="2" fill="url(#metalGrad)" />
                            <rect x="44" y="15" width="12" height="2" fill="#EEEEEE" opacity="0.5" />
                            <path d="M42 22 L26 25 L26 28 L42 26 Z" fill="#424242" />
                            <path d="M42 17 L25 10 L25 14 L42 20 Z" fill="#616161" />
                            <circle cx="53" cy="20" r="1.5" fill="#FDD835" />
                            <circle cx="58" cy="20" r="3" fill="none" stroke="#FDD835" stroke-width="1.5" />
                            <circle cx="43" cy="19" r="4.5" fill="#EEEEEE" stroke="#424242" stroke-width="1" />
                            <path d="M 41.5 17.5 A 2 2 0 0 1 44.5 17.5" fill="none" stroke="#4CAF50" stroke-width="1.5" /> 
                            <path d="M43 19 L44 16" stroke="#E53935" stroke-width="1" stroke-linecap="round" /> 
                            <circle cx="43" cy="19" r="1" fill="#424242" />
                            <path d="M58 22 C 88 20, 92 60, 65 60" fill="none" stroke="#64748b" stroke-width="5" stroke-linecap="round" />
                            <polygon points="63,58 67,62 55,78 47,70" fill="#64748b" />
                            <line x1="60" y1="62" x2="64" y2="66" stroke="#424242" stroke-width="1.5" />
                            <line x1="56" y1="67" x2="60" y2="71" stroke="#424242" stroke-width="1.5" />
                            <line x1="52" y1="72" x2="56" y2="76" stroke="#424242" stroke-width="1.5" />
                            <ellipse cx="51" cy="74" rx="5.65" ry="2" fill="#000000" transform="rotate(45 51 74)" />
                        </svg>
                    </div>
                    <div class="module-info">
                        <div class="module-title">Пожарная безопасность</div>
                        <div class="module-desc">Правила поведения при пожаре и использование средств пожаротушения</div>
                    </div>
                </div>
            </div>
        `;
    }

    renderQuestion() {
        const questionsArray = this.tests[this.state.currentTestId].getQuestions();
        if (!questionsArray) return;
        
        const q = questionsArray[this.state.currentQuestionIndex];
        
        this.appElement.textContent = ''; 
        
        setTimeout(() => {
            window.scrollTo(0, 0);
            document.body.scrollTop = 0;
            document.documentElement.scrollTop = 0;
            if (this.appElement) this.appElement.scrollTop = 0;
        }, 0);

        const card = document.createElement('div');
        card.className = 'card';
        card.id = 'question-card';

        const progress = document.createElement('div');
        progress.className = 'progress';
        progress.textContent = `${this.state.title}: Вопрос ${this.state.currentQuestionIndex + 1} из ${questionsArray.length}`;
        card.appendChild(progress);

        const h2 = document.createElement('h2');
        h2.textContent = q.question;
        card.appendChild(h2);

        const optionsContainer = document.createElement('div');
        optionsContainer.className = 'options-container';

        q.options.forEach((opt, idx) => {
            const btn = document.createElement('button');
            btn.className = 'btn option-btn';
            btn.dataset.index = idx;
            btn.textContent = opt;
            optionsContainer.appendChild(btn);
        });
        card.appendChild(optionsContainer);

        const nextBtn = document.createElement('button');
        nextBtn.id = 'nextBtn';
        nextBtn.className = 'btn primary';
        nextBtn.style.display = 'none';
        nextBtn.style.animation = 'fadeIn 0.3s';
        nextBtn.textContent = 'Следующий вопрос';
        card.appendChild(nextBtn);

        this.appElement.appendChild(card);
    }

    handleAnswer(selectedIndex, btnElement) {
        const questionsArray = this.tests[this.state.currentTestId].getQuestions();
        const q = questionsArray[this.state.currentQuestionIndex];
        
        const optionsContainer = this.appElement.querySelector('.options-container');
        const buttons = optionsContainer.querySelectorAll('.option-btn');
        
        buttons.forEach(btn => btn.disabled = true);

        if (selectedIndex === q.correctIndex) {
            btnElement.classList.add('correct');
            this.state.score++;
        } else {
            btnElement.classList.add('wrong');
            if (buttons[q.correctIndex]) {
                buttons[q.correctIndex].classList.add('correct');
            }
        }

        this.saveState();

        const nextBtn = this.appElement.querySelector('#nextBtn');
        if (nextBtn) nextBtn.style.display = 'block';
    }

    nextQuestion() {
        const questionsArray = this.tests[this.state.currentTestId].getQuestions();
        this.state.currentQuestionIndex++;
        this.saveState();

        if (this.state.currentQuestionIndex >= questionsArray.length) {
            this.renderResult();
        } else {
            this.renderQuestion();
        }
    }

    renderResult() {
        const questionsArray = this.tests[this.state.currentTestId].getQuestions();
        const percent = Math.round((this.state.score / questionsArray.length) * 100);
        
        let message = '';
        if (percent >= 80) message = 'Отличный результат! Вы хорошо знаете правила безопасности.';
        else if (percent >= 50) message = 'Неплохо, но некоторые правила стоит повторить.';
        else message = 'Инструктаж не пройден. Обязательно повторите правила!';
        
        this.appElement.textContent = '';
        
        const card = document.createElement('div');
        card.className = 'card';
        card.style.textAlign = 'center';

        const h2 = document.createElement('h2');
        h2.textContent = 'Тестирование завершено';
        card.appendChild(h2);

        const resScore = document.createElement('div');
        resScore.className = 'result-score';
        resScore.textContent = `${percent}%`;
        card.appendChild(resScore);

        const p = document.createElement('p');
        p.style.color = 'var(--text-muted)';
        p.style.marginBottom = '24px';
        p.style.lineHeight = '1.5';
        
        const strong = document.createElement('strong');
        strong.textContent = `Правильных ответов: ${this.state.score} из ${questionsArray.length}`;
        
        p.appendChild(strong);
        p.appendChild(document.createElement('br'));
        p.appendChild(document.createElement('br'));
        p.appendChild(document.createTextNode(message));
        
        card.appendChild(p);

        const restartBtn = document.createElement('button');
        restartBtn.className = 'btn primary';
        restartBtn.id = 'restartBtn';
        restartBtn.textContent = 'Пройти заново';
        card.appendChild(restartBtn);

        this.appElement.appendChild(card);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.testEngine = new TestEngine('app');
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('SW зарегистрирован: ', reg.scope))
            .catch(err => console.log('Ошибка регистрации SW: ', err));
    });
}
