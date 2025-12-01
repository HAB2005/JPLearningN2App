const userId = 1; // TODO: Get from session

document.addEventListener('DOMContentLoaded', function() {
    loadQuizInfo();
    loadQuizHistory();
});

async function loadQuizInfo() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const quizType = urlParams.get('type');
        const quizId = urlParams.get('id');
        
        const response = await fetch(`/api/quiz/${quizType}/${quizId}`);
        if (!response.ok) throw new Error('Failed to load quiz info');
        
        const data = await response.json();
        
        document.getElementById('loadingState').style.display = 'none';
        document.getElementById('quizInfo').style.display = 'block';
        
        const title = quizType === 'lesson' ? data.lessonName : data.chapterName;
        document.getElementById('quizTitle').textContent = title;
        document.getElementById('totalQuestions').textContent = data.totalQuestions;
        
        // Estimate time: questions * 0.8, rounded to nearest multiple of 5
        const rawMinutes = data.totalQuestions * 0.8;
        const estimatedMinutes = Math.round(rawMinutes / 5) * 5;
        document.getElementById('estimatedTime').textContent = estimatedMinutes;
        
    } catch (error) {
        console.error('Error loading quiz info:', error);
        document.getElementById('loadingState').innerHTML = `
            <div class="error-icon">❌</div>
            <p style="color: #e74c3c;">Không thể tải thông tin bài tập. Vui lòng thử lại.</p>
            <button class="btn-back" onclick="goBack()">← Quay lại</button>
        `;
    }
}

async function loadQuizHistory() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const quizType = urlParams.get('type');
        const quizId = parseInt(urlParams.get('id'));
        
        const response = await fetch(`/api/quiz-attempts/history/${userId}`);
        if (!response.ok) throw new Error('Failed to load history');
        
        const allHistory = await response.json();
        
        // Filter history for this specific quiz
        const filteredHistory = allHistory.filter(attempt => {
            if (quizType === 'lesson') {
                return attempt.lessonId === quizId;
            } else {
                return attempt.chapterId === quizId;
            }
        });
        
        document.getElementById('historyLoading').style.display = 'none';
        
        if (filteredHistory.length === 0) {
            document.getElementById('historyEmpty').style.display = 'block';
        } else {
            document.getElementById('historyList').style.display = 'block';
            displayHistory(filteredHistory);
        }
    } catch (error) {
        console.error('Error loading history:', error);
        document.getElementById('historyLoading').style.display = 'none';
        document.getElementById('historyEmpty').style.display = 'block';
    }
}

function displayHistory(history) {
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = '';
    
    // Show only last 5 attempts
    const recentHistory = history.slice(0, 5);
    
    recentHistory.forEach(attempt => {
        const card = createHistoryCard(attempt);
        historyList.appendChild(card);
    });
}

function createHistoryCard(attempt) {
    const card = document.createElement('div');
    card.className = 'history-card-mini';
    
    const date = new Date(attempt.completedAt);
    const dateStr = date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    const score = parseFloat(attempt.scorePercentage);
    let scoreClass = 'score-low';
    if (score >= 80) scoreClass = 'score-high';
    else if (score >= 60) scoreClass = 'score-medium';
    
    const minutes = Math.floor(attempt.timeSpent / 60);
    const seconds = attempt.timeSpent % 60;
    
    card.innerHTML = `
        <div class="history-mini-header">
            <span class="history-date">${dateStr}</span>
            <span class="history-score ${scoreClass}">${score}%</span>
        </div>
        <div class="history-mini-stats">
            <span>✓ ${attempt.correctAnswers}/${attempt.totalQuestions}</span>
            <span>⏱️ ${minutes}:${seconds.toString().padStart(2, '0')}</span>
            <button class="btn-view-mini" onclick="viewDetail(${attempt.id})">Xem chi tiết</button>
        </div>
    `;
    
    return card;
}

function viewDetail(attemptId) {
    window.location.href = `/quiz-history/${attemptId}`;
}

function startQuiz() {
    const urlParams = new URLSearchParams(window.location.search);
    const quizType = urlParams.get('type');
    const quizId = urlParams.get('id');
    window.location.href = `/quiz-practice?type=${quizType}&id=${quizId}`;
}

function goBack() {
    window.location.href = '/quiz';
}
