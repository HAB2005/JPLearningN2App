let attemptData = null;
let currentQuestionIndex = 0;
const attemptId = window.location.pathname.split('/').pop();

document.addEventListener('DOMContentLoaded', function() {
    loadAttemptDetail();
});

async function loadAttemptDetail() {
    try {
        const response = await fetch(`/api/quiz-attempts/${attemptId}/details`);
        if (!response.ok) throw new Error('Failed to load attempt detail');
        
        attemptData = await response.json();
        
        document.getElementById('loadingState').style.display = 'none';
        document.getElementById('reviewContent').style.display = 'flex';
        
        displayAttemptInfo();
        createReviewGrid();
        displayQuestion();
    } catch (error) {
        console.error('Error loading attempt detail:', error);
        document.getElementById('loadingState').innerHTML = `
            <div class="error-icon">❌</div>
            <p style="color: #e74c3c;">Không thể tải chi tiết bài làm. Vui lòng thử lại.</p>
            <button class="btn-back" onclick="goBackToHistory()">← Quay lại</button>
        `;
    }
}

function displayAttemptInfo() {
    const attempt = attemptData.attempt;
    const lessonName = attempt.lesson ? attempt.lesson.name : 
                      (attempt.chapter ? attempt.chapter.name : 'Bài tập');
    
    const date = new Date(attempt.completedAt);
    const dateStr = date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    document.getElementById('attemptTitle').textContent = `${lessonName} - ${dateStr}`;
    document.getElementById('totalQuestions').textContent = attemptData.details.length;
    document.getElementById('currentQuestion').textContent = 1;
    
    const score = parseFloat(attempt.scorePercentage);
    let scoreClass = 'score-low';
    if (score >= 80) scoreClass = 'score-high';
    else if (score >= 60) scoreClass = 'score-medium';
    
    document.getElementById('attemptScore').innerHTML = `
        <span class="${scoreClass}">${score}%</span>
        <span class="score-detail">${attempt.correctAnswers}/${attempt.totalQuestions}</span>
    `;
}

function createReviewGrid() {
    const reviewGrid = document.getElementById('reviewGrid');
    reviewGrid.innerHTML = '';
    
    attemptData.details.forEach((detail, index) => {
        const btn = document.createElement('button');
        btn.className = 'question-btn';
        btn.textContent = index + 1;
        btn.dataset.index = index;
        btn.onclick = () => goToQuestion(index);
        
        if (detail.selectedOptionId === null) {
            btn.classList.add('skipped');
        } else if (detail.isCorrect) {
            btn.classList.add('correct');
        } else {
            btn.classList.add('wrong');
        }
        
        reviewGrid.appendChild(btn);
    });
    
    updateCurrentQuestion();
}

function displayQuestion() {
    const detail = attemptData.details[currentQuestionIndex];
    const question = detail.quizQuestion;
    const flashcard = question.flashcard;
    
    document.getElementById('currentQuestion').textContent = currentQuestionIndex + 1;
    
    // Ẩn phần word
    document.getElementById('reviewQuestionWord').textContent = '';
    
    const reviewPrompt = document.getElementById('reviewQuestionPrompt');
    if (detail.selectedOptionId === null) {
        reviewPrompt.innerHTML = '<span style="color: #95a5a6;">⊘ Bạn đã bỏ qua câu này</span>';
    } else {
        // Hiển thị câu hỏi từ database
        if (question.questionText && question.questionText.trim() !== '') {
            reviewPrompt.textContent = question.questionText;
        } else {
            reviewPrompt.textContent = 'Chọn đáp án đúng:';
        }
    }
    
    displayOptions(question, detail);
    updateNavigationButtons();
    updateCurrentQuestion();
}

function displayOptions(question, detail) {
    const optionsContainer = document.getElementById('reviewOptionsContainer');
    optionsContainer.innerHTML = '';
    
    const correctOption = question.quizOptions.find(opt => opt.isCorrect);
    
    question.quizOptions.forEach((option, index) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'review-option-item';
        
        let statusIcon = '';
        
        if (option.id === correctOption.id) {
            optionDiv.classList.add('correct-answer');
            statusIcon = '<span class="status-icon correct-icon">✓</span>';
        }
        
        if (option.id === detail.selectedOptionId && !detail.isCorrect) {
            optionDiv.classList.add('wrong-answer');
            statusIcon = '<span class="status-icon wrong-icon">✗</span>';
        }
        
        if (option.id === detail.selectedOptionId && detail.isCorrect) {
            optionDiv.classList.add('correct-selected');
        }
        
        optionDiv.innerHTML = `
            <div class="option-label">${String.fromCharCode(65 + index)}</div>
            <div class="option-text">${option.optionText}</div>
            ${statusIcon}
        `;
        
        optionsContainer.appendChild(optionDiv);
    });
}

function updateCurrentQuestion() {
    const buttons = document.querySelectorAll('#reviewGrid .question-btn');
    buttons.forEach((btn, index) => {
        btn.classList.remove('current');
        if (index === currentQuestionIndex) {
            btn.classList.add('current');
        }
    });
}

function updateNavigationButtons() {
    document.getElementById('btnPrevious').disabled = currentQuestionIndex === 0;
    document.getElementById('btnNext').disabled = currentQuestionIndex === attemptData.details.length - 1;
}

function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayQuestion();
    }
}

function nextQuestion() {
    if (currentQuestionIndex < attemptData.details.length - 1) {
        currentQuestionIndex++;
        displayQuestion();
    }
}

function goToQuestion(index) {
    currentQuestionIndex = index;
    displayQuestion();
}

function goBackToHistory() {
    const attempt = attemptData.attempt;
    if (attempt.lesson) {
        window.location.href = `/quiz-preview?type=lesson&id=${attempt.lesson.id}`;
    } else if (attempt.chapter) {
        window.location.href = `/quiz-preview?type=chapter&id=${attempt.chapter.id}`;
    } else {
        window.location.href = '/quiz';
    }
}
