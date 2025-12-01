let currentQuestionIndex = 0;
let questions = [];
let score = 0;
let selectedAnswer = null;

async function loadLessons() {
    try {
        const lessons = [
            { id: 1, name: 'Bài 1: Từ vựng cơ bản' },
            { id: 2, name: 'Bài 2: Động từ thường dùng' }
        ];
        
        const select = document.getElementById('lessonSelect');
        lessons.forEach(lesson => {
            const option = document.createElement('option');
            option.value = lesson.id;
            option.textContent = lesson.name;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Lỗi khi load bài học:', error);
    }
}

async function loadQuestions(lessonId) {
    try {
        questions = [
            {
                word: '言葉',
                options: ['Từ ngữ', 'Câu chuyện', 'Tiếng nói', 'Ngôn ngữ'],
                correctAnswer: 0
            }
        ];
        return questions;
    } catch (error) {
        console.error('Lỗi khi load câu hỏi:', error);
        return [];
    }
}

function startQuiz() {
    const lessonId = document.getElementById('lessonSelect').value;
    if (!lessonId) {
        alert('Vui lòng chọn bài học!');
        return;
    }
    
    loadQuestions(lessonId).then(() => {
        if (questions.length === 0) {
            alert('Không có câu hỏi nào!');
            return;
        }
        
        document.querySelector('.lesson-selector').style.display = 'none';
        document.getElementById('quizContent').style.display = 'block';
        currentQuestionIndex = 0;
        score = 0;
        displayQuestion();
    });
}

function displayQuestion() {
    if (currentQuestionIndex >= questions.length) {
        showResult();
        return;
    }
    
    const question = questions[currentQuestionIndex];
    selectedAnswer = null;
    
    document.getElementById('questionText').textContent = question.word;
    document.getElementById('currentQuestion').textContent = currentQuestionIndex + 1;
    document.getElementById('totalQuestions').textContent = questions.length;
    document.getElementById('currentScore').textContent = score;
    
    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = '';
    
    question.options.forEach((option, index) => {
        const div = document.createElement('div');
        div.className = 'option';
        div.textContent = String.fromCharCode(65 + index) + '. ' + option;
        div.onclick = () => selectOption(index);
        optionsContainer.appendChild(div);
    });
    
    updateProgress();
}

function selectOption(index) {
    if (selectedAnswer !== null) return;
    
    selectedAnswer = index;
    const options = document.querySelectorAll('.option');
    options.forEach((opt, i) => {
        if (i === index) {
            opt.classList.add('selected');
        } else {
            opt.classList.remove('selected');
        }
    });
}

function submitAnswer() {
    if (selectedAnswer === null) {
        alert('Vui lòng chọn đáp án!');
        return;
    }
    
    const question = questions[currentQuestionIndex];
    const options = document.querySelectorAll('.option');
    
    options.forEach((opt, i) => {
        opt.classList.add('disabled');
        if (i === question.correctAnswer) {
            opt.classList.add('correct');
        } else if (i === selectedAnswer) {
            opt.classList.add('incorrect');
        }
    });
    
    if (selectedAnswer === question.correctAnswer) {
        score++;
        document.getElementById('currentScore').textContent = score;
    }
    
    setTimeout(() => {
        currentQuestionIndex++;
        displayQuestion();
    }, 1500);
}

function updateProgress() {
    const progress = ((currentQuestionIndex) / questions.length) * 100;
    document.getElementById('progressFill').style.width = progress + '%';
}

function showResult() {
    document.getElementById('quizContent').style.display = 'none';
    document.getElementById('resultContent').style.display = 'block';
    
    const percentage = Math.round((score / questions.length) * 100);
    document.getElementById('finalScore').textContent = percentage;
    document.getElementById('totalQuestionsResult').textContent = questions.length;
    document.getElementById('correctAnswers').textContent = score;
    document.getElementById('wrongAnswers').textContent = questions.length - score;
    
    let message = '';
    if (percentage >= 90) message = 'Xuất sắc! 🌟';
    else if (percentage >= 70) message = 'Tốt lắm! 👍';
    else if (percentage >= 50) message = 'Khá đấy! 💪';
    else message = 'Cố gắng thêm nhé! 📚';
    
    document.getElementById('resultMessage').textContent = message;
}

function restartQuiz() {
    document.getElementById('resultContent').style.display = 'none';
    document.querySelector('.lesson-selector').style.display = 'block';
    document.getElementById('lessonSelect').value = '';
}

loadLessons();
