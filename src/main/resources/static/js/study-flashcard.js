let currentIndex = 0;
const totalCards = document.querySelectorAll('.flashcard-container').length;
let currentMode = 'list';

// Switch between modes
function switchMode(mode) {
    currentMode = mode;
    
    // Update buttons
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    
    // Move slider
    const slider = document.querySelector('.mode-slider');
    
    if (mode === 'flashcard') {
        document.getElementById('flashcardModeBtn').classList.add('active');
        document.getElementById('flashcardMode').classList.add('active');
        document.getElementById('listMode').classList.remove('active');
        document.getElementById('progressInfo').style.display = 'block';
        slider.style.transform = 'translateX(0)';
    } else {
        document.getElementById('listModeBtn').classList.add('active');
        document.getElementById('listMode').classList.add('active');
        document.getElementById('flashcardMode').classList.remove('active');
        document.getElementById('progressInfo').style.display = 'none';
        slider.style.transform = 'translateX(100%)';
    }
}

// Filter list
function filterList() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const items = document.querySelectorAll('.vocab-item');
    let visibleCount = 0;
    
    items.forEach(item => {
        const word = item.getAttribute('data-word').toLowerCase();
        const reading = item.getAttribute('data-reading').toLowerCase();
        const meaning = item.getAttribute('data-meaning').toLowerCase();
        
        if (word.includes(searchTerm) || reading.includes(searchTerm) || meaning.includes(searchTerm)) {
            item.style.display = 'flex';
            visibleCount++;
        } else {
            item.style.display = 'none';
        }
    });
    
    document.getElementById('listCount').textContent = visibleCount;
}

// Toggle vocab detail
function toggleVocabDetail(button) {
    const vocabItem = button.closest('.vocab-item');
    const detail = vocabItem.querySelector('.vocab-detail');
    const icon = button.querySelector('.expand-icon');
    
    if (detail.style.display === 'none') {
        detail.style.display = 'block';
        icon.textContent = '▲';
        button.classList.add('expanded');
    } else {
        detail.style.display = 'none';
        icon.textContent = '▼';
        button.classList.remove('expanded');
    }
}

function showCard(index) {
    // Hide all cards
    document.querySelectorAll('.flashcard-container').forEach(card => {
        card.style.display = 'none';
        card.classList.remove('active');
    });
    
    // Show current card
    const cards = document.querySelectorAll('.flashcard-container');
    if (cards[index]) {
        cards[index].style.display = 'block';
        cards[index].classList.add('active');
        
        // Reset flip
        const cardInner = cards[index].querySelector('.card-inner');
        if (cardInner) {
            cardInner.classList.remove('flipped');
        }
    }
    
    // Update progress
    document.getElementById('currentCard').textContent = index + 1;
    document.getElementById('progressBar').style.width = ((index + 1) / totalCards * 100) + '%';
    
    // Update buttons
    document.getElementById('prevBtn').disabled = index === 0;
    document.getElementById('nextBtn').disabled = index === totalCards - 1;
}

function flipCard() {
    const activeCard = document.querySelector('.flashcard-container.active');
    if (activeCard) {
        const cardInner = activeCard.querySelector('.card-inner');
        if (cardInner) {
            cardInner.classList.toggle('flipped');
        }
    }
}

function nextCard() {
    if (currentIndex < totalCards - 1) {
        currentIndex++;
        showCard(currentIndex);
    }
}

function previousCard() {
    if (currentIndex > 0) {
        currentIndex--;
        showCard(currentIndex);
    }
}

function markLearned() {
    alert('Đã đánh dấu là đã học!');
    nextCard();
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Hide progress info on load (list mode is default)
    document.getElementById('progressInfo').style.display = 'none';
    
    // Show first card
    showCard(0);
    
    // Click to flip
    document.querySelectorAll('.flashcard').forEach(card => {
        card.addEventListener('click', flipCard);
    });
    
    // Button events
    document.getElementById('prevBtn').addEventListener('click', previousCard);
    document.getElementById('nextBtn').addEventListener('click', nextCard);
    document.getElementById('markLearnedBtn').addEventListener('click', markLearned);
    document.getElementById('flipBtn').addEventListener('click', flipCard);
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft') previousCard();
        if (e.key === 'ArrowRight') nextCard();
        if (e.key === ' ') {
            e.preventDefault();
            flipCard();
        }
    });
});
