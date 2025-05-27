
let currentCardValue = 0;
let score = 0;
let streak = 0;
let bestStreak = 0;
let gameActive = false;


const cardNames = ['', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const redCards = [1, 13]; // A and K are red for visual variety

function drawCard() {
    return Math.floor(Math.random() * 13) + 1;
}

function getCardDisplay(value) {
    return cardNames[value];
}

function isRedCard(value) {
    return redCards.includes(value) || (value >= 1 && value <= 6 && Math.random() > 0.5);
}

function updateStats() {
    document.getElementById('score').textContent = score;
    document.getElementById('streak').textContent = streak;
    document.getElementById('best').textContent = bestStreak;
}

function updateMessage(text, type = 'info') {
    const messageEl = document.getElementById('message');
    messageEl.textContent = text;
    messageEl.className = `message ${type}`;
}

function animateCard(cardId) {
    document.getElementById(cardId).classList.add('bounce');
    setTimeout(() => {
        document.getElementById(cardId).classList.remove('bounce');
    }, 600);
}

function setButtonsEnabled(enabled) {
    document.getElementById('highBtn').disabled = !enabled;
    document.getElementById('lowBtn').disabled = !enabled;
}

function newGame() {
    currentCardValue = drawCard();
    score = 0;
    streak = 0;
    gameActive = true;

    const currentCardEl = document.getElementById('currentCard');
    const currentValueEl = document.getElementById('currentValue');
    const nextCardEl = document.getElementById('nextCard');

    currentValueEl.textContent = getCardDisplay(currentCardValue);
    currentCardEl.className = isRedCard(currentCardValue) ? 'card red' : 'card';

    nextCardEl.className = 'card card-back';
    nextCardEl.querySelector('.card-content').textContent = '?';

    updateStats();
    updateMessage('次のカードは現在より高い？低い？');
    setButtonsEnabled(true);

    animateCard('currentCard');
}



function makeGuess(guess) {
    if (!gameActive) return;

    const nextCardValue = drawCard();
    const nextCardEl = document.getElementById('nextCard');
    const nextContentEl = nextCardEl.querySelector('.card-content');

    // Reveal next card
    nextCardEl.className = isRedCard(nextCardValue) ? 'card red' : 'card';
    nextContentEl.textContent = getCardDisplay(nextCardValue);
    animateCard('nextCard');

    setButtonsEnabled(false);

    setTimeout(() => {
        let isCorrect = false;
        let message = '';

        if (nextCardValue > currentCardValue && guess === 'high') {
            isCorrect = true;
        } else if (nextCardValue < currentCardValue && guess === 'low') {
            isCorrect = true;
        } else if (nextCardValue === currentCardValue) {
            updateMessage('同じ値！引き分けです。', 'info');
            setTimeout(continueGame, 1500);
            return;
        }

        if (isCorrect) {
            score += 10;
            streak++;
            if (streak > bestStreak) {
                bestStreak = streak;
            }

            let bonus = 0;
            if (streak >= 5) {
                bonus = streak * 2;
                score += bonus;
                message = `正解！ +10pt (連続ボーナス +${bonus}pt)`;
            } else {
                message = '正解！ +10pt';
            }
            updateMessage(message, 'correct');
        } else {
            if (streak >= 3) {
                message = `不正解... (連続${streak}回正解でした！)`;
            } else {
                message = '不正解...';
            }
            streak = 0;
            updateMessage(message, 'wrong');
        }

        updateStats();
        setTimeout(continueGame, 2000);
    }, 1000);
}

function continueGame() {
    // Move next card to current position
    const nextCardEl = document.getElementById('nextCard');
    const currentCardEl = document.getElementById('currentCard');
    const currentValueEl = document.getElementById('currentValue');

    currentCardValue = parseInt(nextCardEl.querySelector('.card-content').textContent === 'A' ? 1 :
        nextCardEl.querySelector('.card-content').textContent === 'J' ? 11 :
            nextCardEl.querySelector('.card-content').textContent === 'Q' ? 12 :
                nextCardEl.querySelector('.card-content').textContent === 'K' ? 13 :
                    nextCardEl.querySelector('.card-content').textContent);

    // Find actual card value from display
    for (let i = 1; i <= 13; i++) {
        if (getCardDisplay(i) === nextCardEl.querySelector('.card-content').textContent) {
            currentCardValue = i;
            break;
        }
    }

    currentValueEl.textContent = nextCardEl.querySelector('.card-content').textContent;
    currentCardEl.className = nextCardEl.className;

    // Reset next card
    nextCardEl.className = 'card card-back';
    nextCardEl.querySelector('.card-content').textContent = '?';

    updateMessage('次のカードは現在より高い？低い？');
    setButtonsEnabled(true);
}



function checkForNewRecord() {
    const accuracy = Math.round((correctCount / (correctCount + incorrectCount)) * 100);
    let isNewRecord = false;

    // 各カテゴリで新記録をチェック
    if (maxStreak > rankings.streak[rankings.streak.length - 1]?.score) {
        isNewRecord = true;
    }
    // ... 他のカテゴリも同様
}



function saveScore() {
    const scoreData = {
        name: name,
        date: new Date().toLocaleDateString('ja-JP'),
        accuracy: accuracy + '%'
    };

    // 各ランキングに追加してソート
    rankings.streak.push({ ...scoreData, score: maxStreak });
    rankings.streak.sort((a, b) => b.score - a.score);
    rankings.streak = rankings.streak.slice(0, 10); // トップ10のみ保持
}

function switchTab(tab) {
    currentRankingTab = tab;
    // タブのアクティブ状態を更新
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    updateRankingDisplay();
}

function updateRankingDisplay() {
    // 順位、名前、スコア、日付、正解率を表示
    rankingList.innerHTML = currentRanking.map((record, index) => `
        <li class="ranking-item">
            <div class="rank-number">${index + 1}位</div>
            <div class="rank-info">${record.name}</div>
            <div class="rank-score">${record.score}${unit}</div>
        </li>
    `).join('');

    
}

// Initialize game
newGame();