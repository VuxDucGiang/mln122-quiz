/**
 * MLN122 Quiz Application
 * Handles Exam selection, Practice & Exam modes, Instant feedback, Timer, and Search
 */

(function () {
    'use strict';

    // State
    const state = {
        theme: localStorage.getItem('mln122_theme') || 'dark',
        mode: localStorage.getItem('mln122_mode') || 'practice',
        currentExam: null,
        activeQuestions: [],
        currentIndex: 0,
        userAnswers: {}, // { [questionId]: ['A'] }
        flagged: new Set(),
        timeRemaining: 60 * 60, // 60 mins for exam mode
        timerInterval: null,
        timeSpentSeconds: 0,
        scores: JSON.parse(localStorage.getItem('mln122_scores') || '{}'),
        isSubmitted: false
    };

    // DOM Elements
    const elements = {
        app: document.getElementById('app'),
        btnHome: document.getElementById('btn-home'),
        btnThemeToggle: document.getElementById('btn-theme-toggle'),
        themeSun: document.getElementById('theme-sun'),
        themeMoon: document.getElementById('theme-moon'),
        examHeaderInfo: document.getElementById('exam-header-info'),
        currentExamTitle: document.getElementById('current-exam-title'),
        timerDisplay: document.getElementById('timer-display'),
        timerText: document.getElementById('timer-text'),

        // Views
        viewHome: document.getElementById('view-home'),
        viewQuiz: document.getElementById('view-quiz'),
        viewResult: document.getElementById('view-result'),

        // Home View
        modeTabs: document.querySelectorAll('.mode-tab'),
        examsGrid: document.getElementById('exams-grid'),
        btnAllQuestions: document.getElementById('btn-all-questions'),

        // Quiz View
        qProgressText: document.getElementById('question-progress-text'),
        answeredCountText: document.getElementById('answered-count-text'),
        progressBarFill: document.getElementById('quiz-progress-bar'),
        btnFlagToggle: document.getElementById('btn-flag-toggle'),
        btnTogglePalette: document.getElementById('btn-toggle-palette'),
        paletteDrawer: document.getElementById('palette-drawer'),
        btnClosePalette: document.getElementById('btn-close-palette'),
        paletteGrid: document.getElementById('palette-grid'),

        qBadge: document.getElementById('q-badge'),
        qTypeBadge: document.getElementById('q-type-badge'),
        qText: document.getElementById('q-text'),
        qOptions: document.getElementById('q-options'),
        qFeedback: document.getElementById('q-feedback'),
        feedbackIcon: document.getElementById('feedback-icon'),
        feedbackTitle: document.getElementById('feedback-title'),
        feedbackDesc: document.getElementById('feedback-desc'),

        btnPrevQ: document.getElementById('btn-prev-q'),
        btnNextQ: document.getElementById('btn-next-q'),
        btnClearChoice: document.getElementById('btn-clear-choice'),
        btnSubmitExam: document.getElementById('btn-submit-exam'),

        // Results View
        resScorePct: document.getElementById('res-score-pct'),
        resEvalTitle: document.getElementById('res-eval-title'),
        resEvalDesc: document.getElementById('res-eval-desc'),
        resCorrectCount: document.getElementById('res-correct-count'),
        resWrongCount: document.getElementById('res-wrong-count'),
        resSkippedCount: document.getElementById('res-skipped-count'),
        resTimeSpent: document.getElementById('res-time-spent'),
        btnRetryExam: document.getElementById('btn-retry-exam'),
        btnBackHomeRes: document.getElementById('btn-back-home-res'),
        reviewList: document.getElementById('review-list'),
        reviewFilters: document.querySelectorAll('.filter-btn'),
        countAll: document.getElementById('count-all'),
        countWrong: document.getElementById('count-wrong'),
        countFlagged: document.getElementById('count-flagged'),

        // Search Modal
        btnOpenSearch: document.getElementById('btn-open-search'),
        searchModal: document.getElementById('search-modal'),
        btnCloseSearch: document.getElementById('btn-close-search'),
        searchInput: document.getElementById('search-input'),
        searchCountText: document.getElementById('search-count-text'),
        searchResultsList: document.getElementById('search-results-list'),

        // Confirm Modal
        confirmModal: document.getElementById('confirm-modal'),
        unansweredCount: document.getElementById('unanswered-count'),
        btnCancelSubmit: document.getElementById('btn-cancel-submit'),
        btnDoSubmit: document.getElementById('btn-do-submit')
    };

    // --- INITIALIZATION ---
    function init() {
        applyTheme(state.theme);
        bindEvents();
        renderExamGrid();
    }

    // --- THEME ---
    function applyTheme(theme) {
        state.theme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('mln122_theme', theme);
        if (theme === 'dark') {
            elements.themeSun.style.display = 'block';
            elements.themeMoon.style.display = 'none';
        } else {
            elements.themeSun.style.display = 'none';
            elements.themeMoon.style.display = 'block';
        }
    }

    // --- NAVIGATION ---
    function showView(viewId) {
        elements.viewHome.classList.remove('active');
        elements.viewHome.style.display = 'none';
        elements.viewQuiz.classList.remove('active');
        elements.viewQuiz.style.display = 'none';
        elements.viewResult.classList.remove('active');
        elements.viewResult.style.display = 'none';

        if (viewId === 'home') {
            elements.viewHome.style.display = 'block';
            elements.viewHome.classList.add('active');
            elements.examHeaderInfo.style.display = 'none';
            stopTimer();
            renderExamGrid();
        } else if (viewId === 'quiz') {
            elements.viewQuiz.style.display = 'block';
            elements.viewQuiz.classList.add('active');
            elements.examHeaderInfo.style.display = 'flex';
        } else if (viewId === 'result') {
            elements.viewResult.style.display = 'block';
            elements.viewResult.classList.add('active');
            elements.examHeaderInfo.style.display = 'none';
            stopTimer();
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // --- EVENT BINDINGS ---
    function bindEvents() {
        // Theme toggle
        elements.btnThemeToggle.addEventListener('click', () => {
            applyTheme(state.theme === 'dark' ? 'light' : 'dark');
        });

        // Home button
        elements.btnHome.addEventListener('click', () => {
            if (state.currentExam && !state.isSubmitted && Object.keys(state.userAnswers).length > 0) {
                if (confirm('Bạn có chắc muốn thoát ra trang chủ? Tiến độ làm bài hiện tại đã được lưu tạm.')) {
                    showView('home');
                }
            } else {
                showView('home');
            }
        });

        // Mode switch tabs
        elements.modeTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                elements.modeTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                state.mode = tab.dataset.mode;
                localStorage.setItem('mln122_mode', state.mode);
            });
        });

        // "Tất cả câu hỏi"
        elements.btnAllQuestions.addEventListener('click', () => {
            startExam('all');
        });

        // Prev / Next question
        elements.btnPrevQ.addEventListener('click', () => {
            if (state.currentIndex > 0) {
                state.currentIndex--;
                renderCurrentQuestion();
            }
        });

        elements.btnNextQ.addEventListener('click', () => {
            if (state.currentIndex < state.activeQuestions.length - 1) {
                state.currentIndex++;
                renderCurrentQuestion();
            }
        });

        // Clear choice
        elements.btnClearChoice.addEventListener('click', () => {
            const currentQ = state.activeQuestions[state.currentIndex];
            delete state.userAnswers[currentQ.id];
            renderCurrentQuestion();
            updateQuizProgress();
            renderPaletteGrid();
        });

        // Flag toggle
        elements.btnFlagToggle.addEventListener('click', () => {
            const currentQ = state.activeQuestions[state.currentIndex];
            if (state.flagged.has(currentQ.id)) {
                state.flagged.delete(currentQ.id);
                elements.btnFlagToggle.classList.remove('active');
            } else {
                state.flagged.add(currentQ.id);
                elements.btnFlagToggle.classList.add('active');
            }
            renderPaletteGrid();
        });

        // Palette toggle
        elements.btnTogglePalette.addEventListener('click', () => {
            elements.paletteDrawer.classList.toggle('open');
        });
        elements.btnClosePalette.addEventListener('click', () => {
            elements.paletteDrawer.classList.remove('open');
        });

        // Submit button
        elements.btnSubmitExam.addEventListener('click', () => {
            const total = state.activeQuestions.length;
            const answered = Object.keys(state.userAnswers).length;
            const unanswered = total - answered;

            elements.unansweredCount.textContent = unanswered;
            elements.confirmModal.style.display = 'flex';
        });

        elements.btnCancelSubmit.addEventListener('click', () => {
            elements.confirmModal.style.display = 'none';
        });

        elements.btnDoSubmit.addEventListener('click', () => {
            elements.confirmModal.style.display = 'none';
            finishExam();
        });

        // Results actions
        elements.btnRetryExam.addEventListener('click', () => {
            if (state.currentExam) {
                startExam(state.currentExam.id);
            }
        });
        elements.btnBackHomeRes.addEventListener('click', () => {
            showView('home');
        });

        // Review filter tabs
        elements.reviewFilters.forEach(btn => {
            btn.addEventListener('click', () => {
                elements.reviewFilters.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                renderReviewList(btn.dataset.filter);
            });
        });

        // Search Modal events
        elements.btnOpenSearch.addEventListener('click', () => {
            elements.searchModal.style.display = 'flex';
            elements.searchInput.value = '';
            elements.searchInput.focus();
            renderSearchResults('');
        });

        elements.btnCloseSearch.addEventListener('click', () => {
            elements.searchModal.style.display = 'none';
        });

        elements.searchModal.addEventListener('click', (e) => {
            if (e.target === elements.searchModal) {
                elements.searchModal.style.display = 'none';
            }
        });

        elements.searchInput.addEventListener('input', (e) => {
            renderSearchResults(e.target.value.trim());
        });

        // Keyboard Shortcuts
        document.addEventListener('keydown', handleKeyboardShortcuts);
    }

    // --- KEYBOARD SHORTCUTS ---
    function handleKeyboardShortcuts(e) {
        // Do not trigger if search modal or inputs are focused
        if (elements.searchModal.style.display === 'flex' || document.activeElement.tagName === 'INPUT') {
            if (e.key === 'Escape') elements.searchModal.style.display = 'none';
            return;
        }

        if (elements.confirmModal.style.display === 'flex') {
            if (e.key === 'Escape') elements.confirmModal.style.display = 'none';
            return;
        }

        // Only active inside quiz view
        if (!elements.viewQuiz.classList.contains('active')) return;

        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            elements.btnPrevQ.click();
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            elements.btnNextQ.click();
        } else if (e.key === 'f' || e.key === 'F') {
            elements.btnFlagToggle.click();
        } else {
            // Options selection: 1..5 or A..E
            const keyMap = { '1': 'A', '2': 'B', '3': 'C', '4': 'D', '5': 'E', 'a': 'A', 'b': 'B', 'c': 'C', 'd': 'D', 'e': 'E' };
            const lowerKey = e.key.toLowerCase();
            if (keyMap[lowerKey]) {
                const optLetter = keyMap[lowerKey];
                const optEl = document.querySelector(`.option-item[data-letter="${optLetter}"]`);
                if (optEl) optEl.click();
            }
        }
    }

    // --- EXAM SELECTION & RENDERING ---
    function renderExamGrid() {
        const exams = window.QUIZ_DATA.exams;
        let html = '';

        exams.forEach(exam => {
            const bestScore = state.scores[exam.id];
            let scoreText = 'Chưa làm';
            let dotClass = '';

            if (bestScore) {
                scoreText = `Điểm cao nhất: ${bestScore.score}/${bestScore.total} (${bestScore.pct}%)`;
                dotClass = bestScore.pct >= 80 ? 'completed' : 'in-progress';
            }

            html += `
                <div class="exam-card" data-exam-id="${exam.id}">
                    <div>
                        <div class="exam-card-top">
                            <span class="exam-num-tag">ĐỀ SỐ ${exam.id}</span>
                            <span class="exam-status-dot ${dotClass}" title="${scoreText}"></span>
                        </div>
                        <h4 class="exam-card-title">${exam.title}</h4>
                        <p class="exam-card-desc">${exam.description}</p>
                    </div>
                    <div class="exam-card-footer">
                        <span class="exam-score-badge ${bestScore ? 'has-score' : ''}">${scoreText}</span>
                        <span class="btn-start-exam">Bắt đầu →</span>
                    </div>
                </div>
            `;
        });

        elements.examsGrid.innerHTML = html;

        // Card clicks
        elements.examsGrid.querySelectorAll('.exam-card').forEach(card => {
            card.addEventListener('click', () => {
                const examId = parseInt(card.dataset.examId, 10);
                startExam(examId);
            });
        });
    }

    // --- START EXAM ---
    function startExam(examId) {
        state.userAnswers = {};
        state.flagged.clear();
        state.currentIndex = 0;
        state.isSubmitted = false;
        state.timeSpentSeconds = 0;

        if (examId === 'all') {
            state.currentExam = {
                id: 'all',
                title: 'Tất Cả 718 Câu Hỏi',
                totalQuestions: window.QUIZ_DATA.questions.length
            };
            state.activeQuestions = window.QUIZ_DATA.questions;
        } else {
            const exam = window.QUIZ_DATA.exams.find(e => e.id === examId);
            if (!exam) return;
            state.currentExam = exam;
            state.activeQuestions = window.QUIZ_DATA.questions.slice(exam.startQ - 1, exam.endQ);
        }

        elements.currentExamTitle.textContent = state.currentExam.title;

        // Mode specific setup
        if (state.mode === 'exam') {
            state.timeRemaining = 60 * 60; // 60 minutes
            elements.timerDisplay.style.display = 'flex';
            elements.btnSubmitExam.style.display = 'inline-block';
            startTimer();
        } else {
            elements.timerDisplay.style.display = 'none';
            elements.btnSubmitExam.style.display = 'inline-block';
            stopTimer();
        }

        showView('quiz');
        renderCurrentQuestion();
        updateQuizProgress();
        renderPaletteGrid();
    }

    // --- TIMER ---
    function startTimer() {
        stopTimer();
        updateTimerDisplay();
        state.timerInterval = setInterval(() => {
            state.timeRemaining--;
            state.timeSpentSeconds++;
            updateTimerDisplay();

            if (state.timeRemaining <= 0) {
                stopTimer();
                alert('Đã hết giờ làm bài! Hệ thống sẽ tự động nộp bài.');
                finishExam();
            }
        }, 1000);
    }

    function stopTimer() {
        if (state.timerInterval) {
            clearInterval(state.timerInterval);
            state.timerInterval = null;
        }
    }

    function updateTimerDisplay() {
        const mins = Math.floor(state.timeRemaining / 60);
        const secs = state.timeRemaining % 60;
        elements.timerText.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        if (state.timeRemaining <= 300) {
            elements.timerDisplay.style.color = 'var(--danger)';
        } else {
            elements.timerDisplay.style.color = 'var(--warning)';
        }
    }

    // --- RENDER CURRENT QUESTION ---
    function renderCurrentQuestion() {
        const q = state.activeQuestions[state.currentIndex];
        if (!q) return;

        const isMulti = q.answer.length > 1;

        elements.qBadge.textContent = `CÂU ${q.id}`;
        elements.qTypeBadge.textContent = isMulti ? `Chọn nhiều đáp án (${q.answer.length} đáp án)` : '1 đáp án đúng';
        elements.qText.textContent = q.question;

        // Flag button state
        if (state.flagged.has(q.id)) {
            elements.btnFlagToggle.classList.add('active');
        } else {
            elements.btnFlagToggle.classList.remove('active');
        }

        // Render Options
        const userChoice = state.userAnswers[q.id] || [];
        let optionsHtml = '';

        q.options.forEach(opt => {
            const letter = opt.trim().charAt(0).toUpperCase();
            const text = opt.replace(/^[A-Z]\.\s*/, '');
            const isSelected = userChoice.includes(letter);

            let extraClass = isSelected ? 'selected' : '';

            // In Practice Mode: reveal immediate styling
            if (state.mode === 'practice' && userChoice.length > 0) {
                const isCorrect = q.answer.includes(letter);
                if (isCorrect) {
                    extraClass += ' is-correct';
                } else if (isSelected && !isCorrect) {
                    extraClass += ' is-wrong';
                }
            }

            optionsHtml += `
                <div class="option-item ${extraClass}" data-letter="${letter}">
                    <div class="option-letter">${letter}</div>
                    <div class="option-text">${text}</div>
                </div>
            `;
        });

        elements.qOptions.innerHTML = optionsHtml;

        // Feedback in Practice mode
        if (state.mode === 'practice' && userChoice.length > 0) {
            elements.qFeedback.style.display = 'block';
            const userStr = [...userChoice].sort().join('');
            const correctStr = [...q.answer].sort().join('');
            const isFullCorrect = userStr === correctStr;

            if (isFullCorrect) {
                elements.qFeedback.className = 'feedback-box correct';
                elements.feedbackTitle.textContent = 'Chính xác! 🎉';
                elements.feedbackTitle.style.color = 'var(--success)';
                elements.feedbackDesc.innerHTML = `Đáp án đúng là: <strong>${q.answer}</strong>. Bạn đã chọn đúng!`;
            } else {
                elements.qFeedback.className = 'feedback-box wrong';
                elements.feedbackTitle.textContent = 'Chưa chính xác!';
                elements.feedbackTitle.style.color = 'var(--danger)';
                elements.feedbackDesc.innerHTML = `Đáp án đúng là: <strong>${q.answer}</strong> (Bạn đã chọn: <em>${userChoice.join(', ') || 'Chưa chọn'}</em>).`;
            }
        } else {
            elements.qFeedback.style.display = 'none';
        }

        // Bind Option Clicks
        elements.qOptions.querySelectorAll('.option-item').forEach(item => {
            item.addEventListener('click', () => {
                const letter = item.dataset.letter;
                handleOptionSelect(q, letter);
            });
        });

        // Navigation buttons state
        elements.btnPrevQ.disabled = state.currentIndex === 0;
        elements.btnNextQ.disabled = state.currentIndex === state.activeQuestions.length - 1;

        updateQuizProgress();
    }

    // --- OPTION SELECT HANDLER ---
    function handleOptionSelect(question, letter) {
        const isMulti = question.answer.length > 1;
        let currentChoice = state.userAnswers[question.id] || [];

        if (isMulti) {
            // Toggle
            if (currentChoice.includes(letter)) {
                currentChoice = currentChoice.filter(l => l !== letter);
            } else {
                currentChoice.push(letter);
            }
        } else {
            // Single choice
            currentChoice = [letter];
        }

        if (currentChoice.length > 0) {
            state.userAnswers[question.id] = currentChoice;
        } else {
            delete state.userAnswers[question.id];
        }

        renderCurrentQuestion();
        renderPaletteGrid();
    }

    // --- UPDATE QUIZ PROGRESS ---
    function updateQuizProgress() {
        const total = state.activeQuestions.length;
        const currentNum = state.currentIndex + 1;
        const answered = Object.keys(state.userAnswers).length;

        elements.qProgressText.textContent = `Câu ${currentNum} / ${total}`;
        elements.answeredCountText.textContent = `Đã làm: ${answered}/${total}`;

        const pct = (currentNum / total) * 100;
        elements.progressBarFill.style.width = `${pct}%`;
    }

    // --- QUESTION PALETTE GRID ---
    function renderPaletteGrid() {
        let html = '';
        state.activeQuestions.forEach((q, idx) => {
            const isCurrent = idx === state.currentIndex;
            const isAnswered = !!state.userAnswers[q.id];
            const isFlagged = state.flagged.has(q.id);

            let classes = ['palette-btn'];
            if (isCurrent) classes.push('current');
            if (isAnswered) classes.push('answered');
            if (isFlagged) classes.push('flagged');

            html += `<button class="${classes.join(' ')}" data-index="${idx}">${idx + 1}</button>`;
        });

        elements.paletteGrid.innerHTML = html;

        elements.paletteGrid.querySelectorAll('.palette-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                state.currentIndex = parseInt(btn.dataset.index, 10);
                renderCurrentQuestion();
                elements.paletteDrawer.classList.remove('open');
            });
        });
    }

    // --- FINISH EXAM & EVALUATION ---
    function finishExam() {
        stopTimer();
        state.isSubmitted = true;

        let correct = 0;
        let wrong = 0;
        let skipped = 0;

        state.activeQuestions.forEach(q => {
            const userChoice = state.userAnswers[q.id];
            if (!userChoice || userChoice.length === 0) {
                skipped++;
            } else {
                const userStr = [...userChoice].sort().join('');
                const correctStr = [...q.answer].sort().join('');
                if (userStr === correctStr) {
                    correct++;
                } else {
                    wrong++;
                }
            }
        });

        const total = state.activeQuestions.length;
        const pct = Math.round((correct / total) * 100);

        // Save Score
        if (state.currentExam && state.currentExam.id !== 'all') {
            const prev = state.scores[state.currentExam.id];
            if (!prev || pct > prev.pct) {
                state.scores[state.currentExam.id] = { score: correct, total, pct, date: new Date().toLocaleDateString() };
                localStorage.setItem('mln122_scores', JSON.stringify(state.scores));
            }
        }

        // Render Results Screen
        elements.resScorePct.textContent = `${pct}%`;
        document.querySelector('.score-circle').style.setProperty('--pct', pct);

        if (pct >= 85) {
            elements.resEvalTitle.textContent = 'Xuất Sắc! 🎉';
            elements.resEvalDesc.textContent = 'Bạn đã nắm rất vững kiến thức phần này!';
        } else if (pct >= 70) {
            elements.resEvalTitle.textContent = 'Đạt Yêu Cầu! 👍';
            elements.resEvalDesc.textContent = 'Kết quả khá tốt, hãy xem lại các câu sai để ghi nhớ sâu hơn.';
        } else {
            elements.resEvalTitle.textContent = 'Cần Cố Gắng Thêm! 💪';
            elements.resEvalDesc.textContent = 'Hãy ôn lại các câu chưa đúng và làm lại đề nhé.';
        }

        elements.resCorrectCount.textContent = correct;
        elements.resWrongCount.textContent = wrong;
        elements.resSkippedCount.textContent = skipped;

        const timeSec = state.timeSpentSeconds;
        const timeMin = Math.floor(timeSec / 60);
        const timeRemSec = timeSec % 60;
        elements.resTimeSpent.textContent = `${timeMin}:${String(timeRemSec).padStart(2, '0')}`;

        // Counters for review tabs
        elements.countAll.textContent = total;
        elements.countWrong.textContent = wrong + skipped;
        elements.countFlagged.textContent = state.flagged.size;

        renderReviewList('all');
        showView('result');
    }

    // --- RENDER REVIEW LIST ---
    function renderReviewList(filter) {
        let list = state.activeQuestions;

        if (filter === 'wrong') {
            list = list.filter(q => {
                const userChoice = state.userAnswers[q.id];
                if (!userChoice) return true;
                return [...userChoice].sort().join('') !== [...q.answer].sort().join('');
            });
        } else if (filter === 'flagged') {
            list = list.filter(q => state.flagged.has(q.id));
        }

        if (list.length === 0) {
            elements.reviewList.innerHTML = `<div style="text-align: center; padding: 32px; color: var(--text-muted);">Không có câu hỏi nào trong mục này.</div>`;
            return;
        }

        let html = '';
        list.forEach(q => {
            const userChoice = state.userAnswers[q.id] || [];
            const userStr = [...userChoice].sort().join('');
            const correctStr = [...q.answer].sort().join('');
            const isCorrect = userStr === correctStr;

            let cardClass = isCorrect ? 'review-card correct' : 'review-card wrong';

            html += `
                <div class="${cardClass}">
                    <div class="review-card-header">
                        <span class="q-number-badge">CÂU ${q.id}</span>
                        <span style="font-weight: 700; color: ${isCorrect ? 'var(--success)' : 'var(--danger)'}">
                            ${isCorrect ? 'ĐÚNG ✅' : (userChoice.length === 0 ? 'CHƯA LÀM ⚠️' : 'SAI ❌')}
                        </span>
                    </div>
                    <div class="review-q-title">${q.question}</div>
                    <div class="review-options">
            `;

            q.options.forEach(opt => {
                const letter = opt.trim().charAt(0).toUpperCase();
                const isUserPick = userChoice.includes(letter);
                const isCorrectLetter = q.answer.includes(letter);

                let optClass = 'review-opt';
                let tag = '';

                if (isCorrectLetter) {
                    optClass += ' correct-pick';
                    tag = '<span style="color: var(--success); font-weight: 700;">(Đáp án đúng)</span>';
                } else if (isUserPick) {
                    optClass += ' user-pick';
                    tag = '<span style="color: var(--danger); font-weight: 700;">(Bạn chọn)</span>';
                }

                html += `
                    <div class="${optClass}">
                        <span>${opt}</span>
                        ${tag}
                    </div>
                `;
            });

            html += `
                    </div>
                    <div style="font-size: 0.85rem; color: var(--text-secondary);">
                        Đáp án chuẩn: <strong style="color: var(--success);">${q.answer}</strong>
                    </div>
                </div>
            `;
        });

        elements.reviewList.innerHTML = html;
    }

    // --- SEARCH MODAL ---
    function renderSearchResults(query) {
        if (!query) {
            elements.searchCountText.textContent = 'Gõ từ khóa để tra cứu trong toàn bộ 718 câu hỏi';
            elements.searchResultsList.innerHTML = '';
            return;
        }

        const lowerQ = query.toLowerCase();
        const matches = window.QUIZ_DATA.questions.filter(q => {
            return q.question.toLowerCase().includes(lowerQ) ||
                   q.options.some(opt => opt.toLowerCase().includes(lowerQ));
        });

        elements.searchCountText.textContent = `Tìm thấy ${matches.length} câu hỏi phù hợp với "${query}":`;

        if (matches.length === 0) {
            elements.searchResultsList.innerHTML = `<div style="text-align: center; padding: 24px; color: var(--text-muted);">Không tìm thấy câu hỏi phù hợp.</div>`;
            return;
        }

        let html = '';
        matches.slice(0, 50).forEach(q => {
            html += `
                <div class="review-card" style="padding: 16px; cursor: pointer;" data-qid="${q.id}">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                        <span class="q-number-badge">CÂU ${q.id}</span>
                        <span style="font-size: 0.85rem; color: var(--primary); font-weight: 600;">Đáp án: ${q.answer}</span>
                    </div>
                    <div style="font-size: 0.95rem; font-weight: 600; line-height: 1.5;">${highlightKeyword(q.question, query)}</div>
                </div>
            `;
        });

        if (matches.length > 50) {
            html += `<div style="text-align: center; color: var(--text-muted); font-size: 0.8rem; padding: 8px;">Hiển thị 50 kết quả đầu tiên...</div>`;
        }

        elements.searchResultsList.innerHTML = html;

        // Jump to question
        elements.searchResultsList.querySelectorAll('.review-card').forEach(card => {
            card.addEventListener('click', () => {
                const qid = parseInt(card.dataset.qid, 10);
                elements.searchModal.style.display = 'none';
                jumpToQuestion(qid);
            });
        });
    }

    function highlightKeyword(text, keyword) {
        if (!keyword) return text;
        const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        return text.replace(regex, '<mark style="background: rgba(99, 102, 241, 0.3); color: inherit; padding: 1px 4px; border-radius: 3px;">$1</mark>');
    }

    function jumpToQuestion(qid) {
        // Open in practice mode with all questions
        state.mode = 'practice';
        startExam('all');
        const targetIdx = state.activeQuestions.findIndex(q => q.id === qid);
        if (targetIdx !== -1) {
            state.currentIndex = targetIdx;
            renderCurrentQuestion();
        }
    }

    // Run app
    init();

})();
