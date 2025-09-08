// Game state
const state = {
    balance: 10000,
    currentPot: 0,
    currentStake: 10,
    bets: {},
    isSpinning: false
};

const winningNumbers = {
    0: { color: 'green' },
    1: { color: 'red', parity: 'odd', range: 'low', dozen: '1st-12' },
    2: { color: 'black', parity: 'even', range: 'low', dozen: '1st-12' },
    3: { color: 'red', parity: 'odd', range: 'low', dozen: '1st-12' },
    4: { color: 'black', parity: 'even', range: 'low', dozen: '1st-12' },
    5: { color: 'red', parity: 'odd', range: 'low', dozen: '1st-12' },
    6: { color: 'black', parity: 'even', range: 'low', dozen: '1st-12' },
    7: { color: 'red', parity: 'odd', range: 'low', dozen: '1st-12' },
    8: { color: 'black', parity: 'even', range: 'low', dozen: '1st-12' },
    9: { color: 'red', parity: 'odd', range: 'low', dozen: '1st-12' },
    10: { color: 'black', parity: 'even', range: 'low', dozen: '1st-12' },
    11: { color: 'black', parity: 'odd', range: 'low', dozen: '1st-12' },
    12: { color: 'red', parity: 'even', range: 'low', dozen: '1st-12' },
    13: { color: 'black', parity: 'odd', range: 'low', dozen: '2nd-12' },
    14: { color: 'red', parity: 'even', range: 'low', dozen: '2nd-12' },
    15: { color: 'black', parity: 'odd', range: 'low', dozen: '2nd-12' },
    16: { color: 'red', parity: 'even', range: 'low', dozen: '2nd-12' },
    17: { color: 'black', parity: 'odd', range: 'low', dozen: '2nd-12' },
    18: { color: 'red', parity: 'even', range: 'low', dozen: '2nd-12' },
    19: { color: 'red', parity: 'odd', range: 'high', dozen: '2nd-12' },
    20: { color: 'black', parity: 'even', range: 'high', dozen: '2nd-12' },
    21: { color: 'red', parity: 'odd', range: 'high', dozen: '2nd-12' },
    22: { color: 'black', parity: 'even', range: 'high', dozen: '2nd-12' },
    23: { color: 'red', parity: 'odd', range: 'high', dozen: '2nd-12' },
    24: { color: 'black', parity: 'even', range: 'high', dozen: '2nd-12' },
    25: { color: 'red', parity: 'odd', range: 'high', dozen: '3rd-12' },
    26: { color: 'black', parity: 'even', range: 'high', dozen: '3rd-12' },
    27: { color: 'red', parity: 'odd', range: 'high', dozen: '3rd-12' },
    28: { color: 'black', parity: 'even', range: 'high', dozen: '3rd-12' },
    29: { color: 'black', parity: 'odd', range: 'high', dozen: '3rd-12' },
    30: { color: 'red', parity: 'even', range: 'high', dozen: '3rd-12' },
    31: { color: 'black', parity: 'odd', range: 'high', dozen: '3rd-12' },
    32: { color: 'red', parity: 'even', range: 'high', dozen: '3rd-12' },
    33: { color: 'black', parity: 'odd', range: 'high', dozen: '3rd-12' },
    34: { color: 'red', parity: 'even', range: 'high', dozen: '3rd-12' },
    35: { color: 'black', parity: 'odd', range: 'high', dozen: '3rd-12' },
    36: { color: 'red', parity: 'even', range: 'high', dozen: '3rd-12' }
};

const wheelOrder = [
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23,
    10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];
const numSegments = wheelOrder.length;
const segmentAngle = (2 * Math.PI) / numSegments;
const colors = {
    red: '#f44336',
    black: '#212121',
    green: '#4caf50'
};

// UI Elements
const balanceEl = document.getElementById('balance');
const potEl = document.getElementById('pot');
const lastResultEl = document.getElementById('last-result');
const spinBtn = document.getElementById('spin-btn');
const clearBtn = document.getElementById('clear-btn');
const resetBtn = document.getElementById('reset-btn');
const stakeInput = document.getElementById('stake-input');
const numberGrid = document.getElementById('bet-grid');
const rouletteWheelCanvas = document.getElementById('roulette-wheel');
const ctx = rouletteWheelCanvas.getContext('2d');

// Wheel drawing and animation
let currentRotation = 0;
let animationId = null;

function drawWheel() {
    ctx.clearRect(0, 0, rouletteWheelCanvas.width, rouletteWheelCanvas.height);
    const radius = rouletteWheelCanvas.width / 2;
    const centerX = radius;
    const centerY = radius;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(currentRotation);

    wheelOrder.forEach((num, i) => {
        const startAngle = i * segmentAngle;
        const endAngle = (i + 1) * segmentAngle;
        const color = winningNumbers[num].color;

        ctx.beginPath();
        ctx.fillStyle = colors[color];
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fill();

        // Draw numbers
        ctx.save();
        ctx.rotate(startAngle + segmentAngle / 2);
        ctx.textAlign = 'right';
        ctx.fillStyle = 'white';
        ctx.font = '18px Arial';
        ctx.fillText(num, radius - 15, 5);
        ctx.restore();
    });

    ctx.restore();
}

function animateWheel(start, duration, targetRotation) {
    let elapsed = 0;
    const easing = t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;

    function frame() {
        const time = Date.now();
        elapsed = time - start;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easing(progress);
        currentRotation = easedProgress * targetRotation;
        drawWheel();

        if (progress < 1) {
            animationId = requestAnimationFrame(frame);
        } else {
            state.isSpinning = false;
            handleResult(targetRotation);
        }
    }
    animationId = requestAnimationFrame(frame);
}

// Game logic
function updateUI() {
    balanceEl.textContent = `€${state.balance}`;
    potEl.textContent = `€${state.currentPot}`;
    // Visual bet indicators
    document.querySelectorAll('.bet-cell, .bet-option').forEach(el => {
        const betType = el.dataset.bet;
        if (state.bets[betType]) {
            el.classList.add('active');
            el.dataset.stake = state.bets[betType];
        } else {
            el.classList.remove('active');
            delete el.dataset.stake;
        }
    });
}

function placeBet(betType, stake) {
    if (state.balance < stake || state.isSpinning) {
        alert("Niet genoeg saldo of wiel draait al.");
        return;
    }

    if (!state.bets[betType]) {
        state.bets[betType] = 0;
    }
    state.bets[betType] += stake;
    state.balance -= stake;
    state.currentPot += stake;
    updateUI();
}

function handleResult(finalRotation) {
    const totalWheelRotation = 2 * Math.PI;
    const normalizedRotation = finalRotation % totalWheelRotation;
    const segmentIndex = Math.floor(normalizedRotation / segmentAngle);
    const winningNumber = wheelOrder[numSegments - 1 - segmentIndex];
    
    lastResultEl.textContent = winningNumber;
    let winnings = 0;

    // Check bets and calculate winnings
    const resultInfo = winningNumbers[winningNumber];
    
    // Check specific number bets
    if (state.bets[winningNumber]) {
        winnings += state.bets[winningNumber] * 35;
    }
    // Check color bets
    if (resultInfo.color && state.bets[resultInfo.color]) {
        winnings += state.bets[resultInfo.color] * 2;
    }
    // Check parity bets
    if (resultInfo.parity && state.bets[resultInfo.parity] && resultInfo.color !== 'green') {
        winnings += state.bets[resultInfo.parity] * 2;
    }
    // Check range bets
    if (resultInfo.range && state.bets[resultInfo.range] && resultInfo.color !== 'green') {
        winnings += state.bets[resultInfo.range] * 2;
    }
    // Check dozen bets
    if (resultInfo.dozen && state.bets[resultInfo.dozen] && resultInfo.color !== 'green') {
        winnings += state.bets[resultInfo.dozen] * 3;
    }
    
    state.balance += winnings;
    state.currentPot = 0;
    state.bets = {};
    updateUI();
    
    // Toon resultaat aan de gebruiker
    if (winnings > 0) {
        alert(`Je hebt gewonnen! Winst: €${winnings}`);
    } else {
        alert(`Verloren. Het winnende getal was ${winningNumber}.`);
    }
}

function generateNumberButtons() {
    for (let i = 0; i <= 36; i++) {
        const btn = document.createElement('button');
        btn.classList.add('bet-cell', 'number');
        if (winningNumbers[i] && winningNumbers[i].color) {
            btn.classList.add(winningNumbers[i].color);
        }
        btn.textContent = i;
        btn.dataset.bet = i;
        numberGrid.appendChild(btn);
    }
}

// Event Listeners
spinBtn.addEventListener('click', () => {
    if (state.isSpinning || state.currentPot === 0) return;
    state.isSpinning = true;
    const randomSpins = Math.floor(Math.random() * 5) + 3; // 3-7 extra spins
    const winningIndex = Math.floor(Math.random() * numSegments);
    const targetRotation = (randomSpins * 2 * Math.PI) + (winningIndex * segmentAngle) + (2 * Math.PI - currentRotation);
    animateWheel(Date.now(), 5000, targetRotation);
});

clearBtn.addEventListener('click', () => {
    state.balance += state.currentPot;
    state.currentPot = 0;
    state.bets = {};
    updateUI();
});

resetBtn.addEventListener('click', () => {
    state.balance = 10000;
    state.currentPot = 0;
    state.bets = {};
    updateUI();
});

stakeInput.addEventListener('change', (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 1 && value <= state.balance) {
        state.currentStake = value;
    }
});

document.addEventListener('click', (e) => {
    const target = e.target;
    if (target.classList.contains('bet-cell') || target.classList.contains('bet-option')) {
        const betType = target.dataset.bet;
        if (betType) {
            placeBet(betType, state.currentStake);
        }
    }
});

// Initialization
function init() {
    generateNumberButtons();
    drawWheel();
    updateUI();
}
init();
