let currentCardIndex = 0;
let vocabularyList = [];
let isFlipped = false;

// Load danh sách bài học
async function loadLessons() {
    try {
        // TODO: Gọi API để lấy danh sách bài học
        // const response = await fetch('/api/lessons');
        // const lessons = await response.json();
        
        // Mock data tạm
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

// Load từ vựng theo bài học
async function loadVocabulary(lessonId) {
    try {
        // TODO: Gọi API để lấy từ vựng
        // const response = await fetch(`/api/vocabulary/lesson/${lessonId}`);
        // vocabularyList = await response.json();
        
        // Mock data tạm
        vocabularyList = [
            {
                word: '言葉',
                reading: 'ことば',
                meaning: 'Từ ngữ, ngôn từ',
                example: '日本語の言葉を覚える。',
                exampleMeaning: 'Ghi nhớ từ vựng tiếng Nhật.'
            }
        ];
        
        currentCardIndex = 0;
        displayCard();
        updateProgress();
    } catch (error) {
        console.error('Lỗi khi load từ vựng:', error);
    }
}

function displayCard() {
    if (vocabularyList.length === 0) return;
    
    const vocab = vocabularyList[currentCardIndex];
    const flashcard = document.getElementById('flashcard');
    flashcard.classList.remove('flipped');
    isFlipped = false;
    
    // Front side
    document.getElementById('vocabWord').textContent = vocab.word;
    document.getElementById('vocabReading').textContent = vocab.reading;
    
    // Back side
    document.getElementById('vocabWordBack').textContent = vocab.word;
    document.getElementById('vocabReadingBack').textContent = vocab.reading;
    document.getElementById('vocabMeaning').textContent = vocab.meaning;
    document.getElementById('vocabExample').innerHTML = `
        <strong>Ví dụ:</strong><br>
        ${vocab.example}<br>
        <em>${vocab.exampleMeaning}</em>
    `;
}

function flipCard() {
    const flashcard = document.getElementById('flashcard');
    flashcard.classList.toggle('flipped');
    isFlipped = !isFlipped;
}

function nextCard() {
    if (currentCardIndex < vocabularyList.length - 1) {
        currentCardIndex++;
        displayCard();
        updateProgress();
    }
}

function previousCard() {
    if (currentCardIndex > 0) {
        currentCardIndex--;
        displayCard();
        updateProgress();
    }
}

function updateProgress() {
    document.getElementById('currentCard').textContent = currentCardIndex + 1;
    document.getElementById('totalCards').textContent = vocabularyList.length;
}

// Event listeners
document.getElementById('lessonSelect').addEventListener('change', function() {
    const lessonId = this.value;
    if (lessonId) {
        loadVocabulary(lessonId);
    }
});

// Keyboard navigation
document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowLeft') previousCard();
    if (e.key === 'ArrowRight') nextCard();
    if (e.key === ' ') {
        e.preventDefault();
        flipCard();
    }
});

// Load lessons on page load
loadLessons();
