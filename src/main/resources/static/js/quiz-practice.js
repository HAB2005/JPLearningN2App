let quizData = null;
let currentQuestionIndex = 0;
let userAnswers = [];
let quizType = null; // 'lesson' or 'chapter'
let quizId = null;
let startTime = null;
let questionStartTimes = [];
let timerInterval = null;
let timeLimit = 0; // in seconds
let timeRemaining = 0;

// Load quiz on page load
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    quizType = urlParams.get('type');
    quizId = urlParams.get('id');

    if (quizType && quizId) {
        loadQuiz(quizType, quizId);
    } else {
        showErrorAndGoBack('Không tìm thấy thông tin bài tập');
    }
});

async function loadQuiz(type, id) {
    try {
        const response = await fetch(`/api/quiz/${type}/${id}`);
        if (!response.ok) throw new Error('Failed to load quiz');
        
        quizData = await response.json();
        
        if (!quizData.questions || quizData.questions.length === 0) {
            showErrorAndGoBack('Chương này chưa có câu hỏi');
            return;
        }
        
        initializeQuiz();
    } catch (error) {
        console.error('Error loading quiz:', error);
        showErrorAndGoBack('Không thể tải câu hỏi. Vui lòng thử lại.');
    }
}

function showErrorAndGoBack(message) {
    document.getElementById('loadingState').innerHTML = `
        <div class="error-icon">❌</div>
        <p style="color: #e74c3c; font-size: 18px; margin-bottom: 20px;">${message}</p>
        <button class="btn-back" onclick="goBack()">← Quay lại</button>
    `;
}

function initializeQuiz() {
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('quizContent').style.display = 'flex';
    document.getElementById('btnSubmitHeader').style.display = 'inline-block';
    
    const title = quizType === 'lesson' ? quizData.lessonName : quizData.chapterName;
    document.getElementById('quizTitle').textContent = title;
    document.getElementById('totalQuestions').textContent = quizData.questions.length;
    
    userAnswers = new Array(quizData.questions.length).fill(null);
    questionStartTimes = new Array(quizData.questions.length).fill(0);
    currentQuestionIndex = 0;
    
    // Bắt đầu đếm thời gian
    startTime = Date.now();
    questionStartTimes[0] = Date.now();
    
    // Calculate time limit: questions * 0.8, rounded to nearest multiple of 5
    const rawMinutes = quizData.questions.length * 0.8;
    const estimatedMinutes = Math.round(rawMinutes / 5) * 5;
    timeLimit = estimatedMinutes * 60; // convert to seconds
    timeRemaining = timeLimit;
    
    // Show and start timer
    document.getElementById('timerDisplay').style.display = 'flex';
    startTimer();
    
    createQuestionGrid();
    displayQuestion();
}

function startTimer() {
    updateTimerDisplay();
    timerInterval = setInterval(() => {
        timeRemaining--;
        updateTimerDisplay();
        
        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            autoSubmitQuiz();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    const timerText = document.getElementById('timerText');
    timerText.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Change color when time is running out
    const timerDisplay = document.getElementById('timerDisplay');
    if (timeRemaining <= 60) {
        timerDisplay.classList.add('timer-warning');
    } else if (timeRemaining <= 300) {
        timerDisplay.classList.add('timer-alert');
    }
}

function autoSubmitQuiz() {
    alert('Hết thời gian! Bài làm của bạn sẽ được tự động nộp.');
    confirmSubmit();
}

function createQuestionGrid() {
    const questionGrid = document.getElementById('questionGrid');
    questionGrid.innerHTML = '';
    
    for (let i = 0; i < quizData.questions.length; i++) {
        const btn = document.createElement('button');
        btn.className = 'question-btn';
        btn.textContent = i + 1;
        btn.dataset.index = i;
        btn.onclick = () => goToQuestion(i);
        questionGrid.appendChild(btn);
    }
    
    updateQuestionGrid();
}

function updateQuestionGrid() {
    const buttons = document.querySelectorAll('.question-btn');
    buttons.forEach((btn, index) => {
        btn.classList.remove('current', 'answered');
        
        // Ưu tiên: câu đã làm -> xanh, câu hiện tại -> tím (override xanh nếu trùng)
        if (userAnswers[index] !== null) {
            btn.classList.add('answered');
        }
        
        if (index === currentQuestionIndex) {
            btn.classList.add('current');
        }
    });
}

function goToQuestion(index) {
    if (index >= 0 && index < quizData.questions.length) {
        currentQuestionIndex = index;
        // Bắt đầu đếm thời gian cho câu mới
        if (questionStartTimes[index] === 0) {
            questionStartTimes[index] = Date.now();
        }
        displayQuestion();
    }
}

function displayQuestion() {
    const question = quizData.questions[currentQuestionIndex];
    
    document.getElementById('questionNumber').textContent = currentQuestionIndex + 1;
    document.getElementById('currentQuestion').textContent = currentQuestionIndex + 1;
    
    // Hiển thị câu hỏi dựa trên loại
    displayQuestionContent(question);
    
    // Display options
    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = '';
    
    question.options.forEach((option, index) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'option-item';
        optionDiv.dataset.optionId = option.id;
        
        if (userAnswers[currentQuestionIndex] === option.id) {
            optionDiv.classList.add('selected');
        }
        
        optionDiv.innerHTML = `
            <div class="option-label">${String.fromCharCode(65 + index)}</div>
            <div class="option-text">${option.text}</div>
        `;
        
        optionDiv.onclick = () => selectOption(option.id);
        optionsContainer.appendChild(optionDiv);
    });
    
    updateNavigationButtons();
    updateQuestionGrid();
}

function displayQuestionContent(question) {
    const questionWord = document.getElementById('questionWord');
    const questionPrompt = document.getElementById('questionPrompt');
    
    // Ẩn phần word, chỉ hiển thị câu hỏi
    questionWord.textContent = '';
    
    // Hiển thị câu hỏi từ database
    if (question.questionText && question.questionText.trim() !== '') {
        questionPrompt.textContent = question.questionText;
    } else {
        // Fallback nếu không có questionText
        questionPrompt.textContent = 'Chọn đáp án đúng:';
    }
}

function selectOption(optionId) {
    userAnswers[currentQuestionIndex] = optionId;
    
    // Update UI
    document.querySelectorAll('.option-item').forEach(item => {
        item.classList.remove('selected');
        if (parseInt(item.dataset.optionId) === optionId) {
            item.classList.add('selected');
        }
    });
    
    // Update question grid
    updateQuestionGrid();
}

function updateNavigationButtons() {
    const btnPrevious = document.getElementById('btnPrevious');
    const btnNext = document.getElementById('btnNext');
    
    btnPrevious.disabled = currentQuestionIndex === 0;
    btnNext.disabled = currentQuestionIndex === quizData.questions.length - 1;
}

function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        if (questionStartTimes[currentQuestionIndex] === 0) {
            questionStartTimes[currentQuestionIndex] = Date.now();
        }
        displayQuestion();
    }
}

function nextQuestion() {
    if (currentQuestionIndex < quizData.questions.length - 1) {
        currentQuestionIndex++;
        if (questionStartTimes[currentQuestionIndex] === 0) {
            questionStartTimes[currentQuestionIndex] = Date.now();
        }
        displayQuestion();
    }
}

function submitQuiz() {
    const unanswered = userAnswers.filter(a => a === null).length;
    if (unanswered > 0) {
        showModal(`Bạn còn ${unanswered} câu chưa trả lời. Bạn có chắc muốn nộp bài?`);
    } else {
        showModal('Bạn đã hoàn thành tất cả câu hỏi. Bạn có chắc muốn nộp bài?');
    }
}

function showModal(message) {
    document.getElementById('modalMessage').textContent = message;
    document.getElementById('confirmModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('confirmModal').style.display = 'none';
}

function confirmSubmit() {
    closeModal();
    calculateAndShowResults();
}

async function calculateAndShowResults() {
    let correctCount = 0;
    const endTime = Date.now();
    const totalTimeSpent = Math.floor((endTime - startTime) / 1000); // seconds
    
    // Chuẩn bị dữ liệu để lưu
    const answers = [];
    
    quizData.questions.forEach((question, index) => {
        const userAnswer = userAnswers[index];
        const correctOption = question.options.find(opt => opt.isCorrect);
        const isCorrect = userAnswer === correctOption.id;
        
        if (isCorrect) {
            correctCount++;
        }
        
        // Tính thời gian làm câu này
        const timeSpent = questionStartTimes[index] > 0 
            ? Math.floor((Date.now() - questionStartTimes[index]) / 1000) 
            : 0;
        
        answers.push({
            questionId: question.id,
            selectedOptionId: userAnswer,
            isCorrect: isCorrect,
            timeSpent: timeSpent
        });
    });
    
    const percentage = Math.round((correctCount / quizData.questions.length) * 100);
    
    // Lưu kết quả vào database
    try {
        const saveData = {
            userId: 1,
            lessonId: quizType === 'lesson' ? parseInt(quizId) : null,
            chapterId: quizType === 'chapter' ? parseInt(quizId) : null,
            totalTimeSpent: totalTimeSpent,
            answers: answers
        };
        
        console.log('Đang lưu kết quả:', saveData);
        
        const response = await fetch('/api/quiz-attempts/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(saveData)
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('✅ Đã lưu kết quả thành công:', result);
        } else {
            const errorData = await response.json();
            console.error('❌ Lỗi khi lưu kết quả:', errorData);
        }
    } catch (error) {
        console.error('❌ Lỗi khi gọi API:', error);
    }
    
    // Ẩn nút nộp bài và quiz content
    document.getElementById('btnSubmitHeader').style.display = 'none';
    document.getElementById('quizContent').style.display = 'none';
    document.getElementById('resultScreen').style.display = 'flex';
    
    // Cập nhật kết quả
    document.getElementById('scorePercentage').textContent = percentage;
    document.getElementById('correctCount').textContent = correctCount;
    document.getElementById('totalCount').textContent = quizData.questions.length;
    
    // Thay đổi icon và màu sắc dựa trên điểm số
    const resultIcon = document.getElementById('resultIcon');
    const scoreCircle = document.querySelector('.score-circle');
    
    if (percentage >= 80) {
        resultIcon.textContent = '🎉';
        scoreCircle.style.background = 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)';
    } else if (percentage >= 60) {
        resultIcon.textContent = '😊';
        scoreCircle.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    } else if (percentage >= 40) {
        resultIcon.textContent = '😐';
        scoreCircle.style.background = 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
    } else {
        resultIcon.textContent = '😢';
        scoreCircle.style.background = 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)';
    }
}

function reviewAnswers() {
    // Ẩn result screen, hiện review screen
    document.getElementById('resultScreen').style.display = 'none';
    document.getElementById('reviewScreen').style.display = 'block';
    
    // Cập nhật header
    document.getElementById('quizTitle').textContent = 'Xem lại đáp án';
    document.getElementById('btnSubmitHeader').style.display = 'none';
    document.getElementById('btnRetakeHeader').style.display = 'inline-block';
    
    // Ẩn timer khi xem lại đáp án
    document.getElementById('timerDisplay').style.display = 'none';
    
    currentQuestionIndex = 0;
    createReviewGrid();
    displayReviewQuestion();
}

function createReviewGrid() {
    const reviewGrid = document.getElementById('reviewGrid');
    reviewGrid.innerHTML = '';
    
    for (let i = 0; i < quizData.questions.length; i++) {
        const btn = document.createElement('button');
        btn.className = 'question-btn';
        btn.textContent = i + 1;
        btn.dataset.index = i;
        btn.onclick = () => goToReviewQuestion(i);
        reviewGrid.appendChild(btn);
    }
    
    updateReviewGrid();
}

function updateReviewGrid() {
    const buttons = document.querySelectorAll('#reviewGrid .question-btn');
    buttons.forEach((btn, index) => {
        btn.classList.remove('current', 'correct', 'wrong', 'skipped');
        
        const question = quizData.questions[index];
        const userAnswer = userAnswers[index];
        const correctOption = question.options.find(opt => opt.isCorrect);
        
        // Đánh dấu trạng thái
        if (userAnswer === null) {
            btn.classList.add('skipped');
        } else if (userAnswer === correctOption.id) {
            btn.classList.add('correct');
        } else {
            btn.classList.add('wrong');
        }
        
        // Đánh dấu câu hiện tại
        if (index === currentQuestionIndex) {
            btn.classList.add('current');
        }
    });
}

function goToReviewQuestion(index) {
    if (index >= 0 && index < quizData.questions.length) {
        currentQuestionIndex = index;
        displayReviewQuestion();
    }
}

function displayReviewQuestion() {
    const question = quizData.questions[currentQuestionIndex];
    const userAnswer = userAnswers[currentQuestionIndex];
    const correctOption = question.options.find(opt => opt.isCorrect);
    
    // Update header progress
    document.getElementById('currentQuestion').textContent = currentQuestionIndex + 1;
    document.getElementById('totalQuestions').textContent = quizData.questions.length;
    
    // Ẩn phần word
    document.getElementById('reviewQuestionWord').textContent = '';
    
    // Display prompt - luôn hiển thị câu hỏi
    const reviewPrompt = document.getElementById('reviewQuestionPrompt');
    
    // Hiển thị câu hỏi từ database
    if (question.questionText && question.questionText.trim() !== '') {
        reviewPrompt.textContent = question.questionText;
    } else {
        reviewPrompt.textContent = 'Chọn đáp án đúng:';
    }
    
    // Thêm thông báo nếu bỏ qua (dưới câu hỏi)
    if (userAnswer === null) {
        reviewPrompt.innerHTML += '<br><span style="color: #95a5a6; font-size: 14px;">⊘ Bạn đã bỏ qua câu này</span>';
    }
    
    // Display options with color highlights only
    const reviewOptionsContainer = document.getElementById('reviewOptionsContainer');
    reviewOptionsContainer.innerHTML = '';
    
    question.options.forEach((option, index) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'review-option-item';
        
        let statusIcon = '';
        
        // Đáp án đúng
        if (option.id === correctOption.id) {
            optionDiv.classList.add('correct-answer');
            statusIcon = '<span class="status-icon correct-icon">✓</span>';
        }
        
        // Đáp án sai mà user đã chọn
        if (option.id === userAnswer && option.id !== correctOption.id) {
            optionDiv.classList.add('wrong-answer');
            statusIcon = '<span class="status-icon wrong-icon">✗</span>';
        }
        
        // Đáp án user chọn đúng
        if (option.id === userAnswer && option.id === correctOption.id) {
            optionDiv.classList.add('correct-selected');
        }
        
        optionDiv.innerHTML = `
            <div class="option-label">${String.fromCharCode(65 + index)}</div>
            <div class="option-text">${option.text}</div>
            ${statusIcon}
        `;
        
        reviewOptionsContainer.appendChild(optionDiv);
    });
    
    // Update navigation buttons
    document.getElementById('btnReviewPrevious').disabled = currentQuestionIndex === 0;
    document.getElementById('btnReviewNext').disabled = currentQuestionIndex === quizData.questions.length - 1;
    
    // Update review grid
    updateReviewGrid();
}

function previousReviewQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayReviewQuestion();
    }
}

function nextReviewQuestion() {
    if (currentQuestionIndex < quizData.questions.length - 1) {
        currentQuestionIndex++;
        displayReviewQuestion();
    }
}

function backToResult() {
    document.getElementById('reviewScreen').style.display = 'none';
    document.getElementById('resultScreen').style.display = 'flex';
}

function retakeQuiz() {
    userAnswers = new Array(quizData.questions.length).fill(null);
    questionStartTimes = new Array(quizData.questions.length).fill(0);
    currentQuestionIndex = 0;
    
    // Reset thời gian
    startTime = Date.now();
    questionStartTimes[0] = Date.now();
    timeRemaining = timeLimit;
    
    // Cập nhật header
    const title = quizType === 'lesson' ? quizData.lessonName : quizData.chapterName;
    document.getElementById('quizTitle').textContent = title;
    document.getElementById('btnSubmitHeader').style.display = 'inline-block';
    document.getElementById('btnRetakeHeader').style.display = 'none';
    
    // Hiện lại timer và reset
    document.getElementById('timerDisplay').style.display = 'flex';
    document.getElementById('timerDisplay').classList.remove('timer-warning', 'timer-alert');
    if (timerInterval) clearInterval(timerInterval);
    startTimer();
    
    // Ẩn result và review, hiện quiz
    document.getElementById('resultScreen').style.display = 'none';
    document.getElementById('reviewScreen').style.display = 'none';
    document.getElementById('quizContent').style.display = 'flex';
    
    displayQuestion();
}

function goBack() {
    window.location.href = '/quiz';
}
