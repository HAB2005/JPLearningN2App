const userId = 1; // TODO: Lấy từ session

document.addEventListener('DOMContentLoaded', function() {
    loadHistory();
});

async function loadHistory() {
    try {
        const response = await fetch(`/api/quiz-attempts/history/${userId}`);
        if (!response.ok) throw new Error('Failed to load history');
        
        const history = await response.json();
        
        document.getElementById('loadingState').style.display = 'none';
        
        if (history.length === 0) {
            document.getElementById('emptyState').style.display = 'block';
        } else {
            document.getElementById('historyList').style.display = 'block';
            displayHistory(history);
        }
    } catch (error) {
        console.error('Error loading history:', error);
        document.getElementById('loadingState').innerHTML = `
            <div class="error-icon">❌</div>
            <p style="color: #e74c3c;">Không thể tải lịch sử. Vui lòng thử lại.</p>
        `;
    }
}

function displayHistory(history) {
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = '';
    
    history.forEach(attempt => {
        const card = createHistoryCard(attempt);
        historyList.appendChild(card);
    });
}

function createHistoryCard(attempt) {
    const card = document.createElement('div');
    card.className = 'history-card';
    
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
    
    const lessonName = attempt.lesson ? attempt.lesson.name : 
                      (attempt.chapter ? attempt.chapter.name : 'Unknown');
    
    const minutes = Math.floor(attempt.timeSpent / 60);
    const seconds = attempt.timeSpent % 60;
    
    card.innerHTML = `
        <div class="history-card-header">
            <div class="history-info">
                <h3>${lessonName}</h3>
                <p class="history-date">${dateStr}</p>
            </div>
            <div class="history-score ${scoreClass}">
                <span class="score-value">${score}%</span>
                <span class="score-label">${attempt.correctAnswers}/${attempt.totalQuestions}</span>
            </div>
        </div>
        <div class="history-card-footer">
            <div class="history-stats">
                <span class="stat-item">⏱️ ${minutes}:${seconds.toString().padStart(2, '0')}</span>
                <span class="stat-item">✓ ${attempt.correctAnswers} đúng</span>
                <span class="stat-item">✗ ${attempt.totalQuestions - attempt.correctAnswers} sai</span>
            </div>
            <button class="btn-view-detail" onclick="viewDetail(${attempt.id})">
                Xem chi tiết →
            </button>
        </div>
    `;
    
    return card;
}

function viewDetail(attemptId) {
    window.location.href = `/quiz-history/${attemptId}`;
}
