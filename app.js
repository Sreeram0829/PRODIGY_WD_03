document.addEventListener('DOMContentLoaded', () => {
    const themeBtn = document.getElementById('theme-btn');
    const modeBtns = document.querySelectorAll('.mode-btn');
    const difficultyBtns = document.querySelectorAll('.difficulty-btn');
    const aiDifficultySection = document.querySelector('.ai-difficulty');
    const player1Input = document.getElementById('player1');
    const player2Input = document.getElementById('player2');
    const startBtn = document.querySelector('.start-btn');
    const gameContainer = document.querySelector('.game-container');
    const currentPlayerDisplay = document.getElementById('current-player');
    const cells = document.querySelectorAll('.cell');
    const player1Score = document.getElementById('player1-score');
    const player2Score = document.getElementById('player2-score');
    const drawsScore = document.getElementById('draws-score');
    const restartBtn = document.querySelector('.restart-btn');
    const newGameBtn = document.querySelector('.new-game-btn');
    const gameHistory = document.querySelector('.game-history');
    const historyList = document.querySelector('.history-list');
    const modal = document.querySelector('.modal');
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');
    const playAgainBtn = document.querySelector('.play-again');
    const modalNewGameBtn = document.querySelector('.modal-btn.new-game');

    let gameState = {
        mode: 'pvp',
        difficulty: 'easy',
        player1: 'Player 1',
        player2: 'Player 2',
        currentPlayer: 'X',
        board: ['', '', '', '', '', '', '', '', ''],
        gameActive: false,
        scores: {
            player1: 0,
            player2: 0,
            draws: 0
        },
        history: []
    };

    init();

    function init() {
        loadFromLocalStorage();
        setupEventListeners();
        updateUI();
        createFloatingParticles();
    }

    function setupEventListeners() {
        themeBtn.addEventListener('click', toggleTheme);

        modeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                modeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                gameState.mode = btn.dataset.mode;

                if (gameState.mode === 'pvc') {
                    aiDifficultySection.classList.remove('hidden');
                } else {
                    aiDifficultySection.classList.add('hidden');
                }
            });
        });

        difficultyBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                difficultyBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                gameState.difficulty = btn.dataset.difficulty;
            });
        });

        player1Input.addEventListener('input', (e) => {
            gameState.player1 = e.target.value || 'Player 1';
        });

        player2Input.addEventListener('input', (e) => {
            gameState.player2 = e.target.value || 'Player 2';
        });

        startBtn.addEventListener('click', startGame);

        cells.forEach(cell => {
            cell.addEventListener('click', handleCellClick);
        });

        restartBtn.addEventListener('click', restartGame);
        newGameBtn.addEventListener('click', newGame);

        playAgainBtn.addEventListener('click', restartGame);
        modalNewGameBtn.addEventListener('click', newGame);
    }

    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        if (currentTheme === 'dark') {
            document.documentElement.removeAttribute('data-theme');
            themeBtn.innerHTML = '<i class="fas fa-moon"></i>';
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            themeBtn.innerHTML = '<i class="fas fa-sun"></i>';
        }
        saveToLocalStorage();
    }

    function startGame() {
        gameState.gameActive = true;
        gameState.board = ['', '', '', '', '', '', '', '', ''];
        gameState.currentPlayer = 'X';

        if (gameState.mode === 'pvc') {
            gameState.player2 = 'Computer';
            player2Input.value = 'Computer';
            player2Input.disabled = true;
        } else {
            player2Input.disabled = false;
        }

        gameContainer.classList.remove('hidden');
        gameHistory.classList.remove('hidden');
        updateUI();

        cells.forEach(cell => {
            cell.textContent = '';
            cell.className = 'cell';
            cell.style.transform = '';
        });

        if (gameState.mode === 'pvc' && gameState.currentPlayer === 'O') {
            setTimeout(makeAIMove, 500);
        }
    }

    function handleCellClick(e) {
        const clickedCell = e.target;
        const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

        if (gameState.board[clickedCellIndex] !== '' || !gameState.gameActive) {
            return;
        }

        gameState.board[clickedCellIndex] = gameState.currentPlayer;
        updateCell(clickedCell, gameState.currentPlayer);

        const winningCombination = checkWin();
        if (winningCombination) {
            handleWin(winningCombination);
            return;
        }

        if (checkDraw()) {
            handleDraw();
            return;
        }

        switchPlayer();

        if (gameState.mode === 'pvc' && gameState.currentPlayer === 'O') {
            setTimeout(makeAIMove, 500);
        }
    }

    function updateCell(cell, player) {
        cell.classList.add(player.toLowerCase());
        cell.style.transform = 'scale(0) rotate(0deg)';
        setTimeout(() => {
            cell.style.transform = 'scale(1) rotate(360deg)';
        }, 10);
    }

    function switchPlayer() {
        gameState.currentPlayer = gameState.currentPlayer === 'X' ? 'O' : 'X';
        updateUI();
    }

    function checkWin() {
        const winConditions = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];

        for (let condition of winConditions) {
            const [a, b, c] = condition;
            if (gameState.board[a] && gameState.board[a] === gameState.board[b] && gameState.board[a] === gameState.board[c]) {
                return condition;
            }
        }
        return null;
    }

    function checkDraw() {
        return !gameState.board.includes('');
    }

    function handleWin(winningCombination) {
        gameState.gameActive = false;
        winningCombination.forEach(index => {
            cells[index].classList.add('win');
        });

        if (gameState.currentPlayer === 'X') {
            gameState.scores.player1++;
        } else {
            gameState.scores.player2++;
        }

        addToHistory(gameState.currentPlayer === 'X' ? gameState.player1 : gameState.player2);
        showModal('Game Over!', `${gameState.currentPlayer === 'X' ? gameState.player1 : gameState.player2} wins!`);
        updateUI();
        saveToLocalStorage();
    }

    function handleDraw() {
        gameState.gameActive = false;
        gameState.scores.draws++;
        addToHistory('draw');
        showModal('Game Over!', "It's a draw!");
        updateUI();
        saveToLocalStorage();
    }

    function makeAIMove() {
        if (!gameState.gameActive) return;

        let move;
        switch (gameState.difficulty) {
            case 'easy':
                move = makeRandomMove();
                break;
            case 'medium':
                move = Math.random() > 0.5 ? makeSmartMove() : makeRandomMove();
                break;
            case 'hard':
                move = makeSmartMove();
                break;
            default:
                move = makeRandomMove();
        }

        gameState.board[move] = 'O';
        updateCell(cells[move], 'O');

        const winningCombination = checkWin();
        if (winningCombination) {
            handleWin(winningCombination);
            return;
        }

        if (checkDraw()) {
            handleDraw();
            return;
        }

        switchPlayer();
    }

    function makeRandomMove() {
        const emptyCells = gameState.board.map((cell, i) => cell === '' ? i : null).filter(i => i !== null);
        return emptyCells[Math.floor(Math.random() * emptyCells.length)];
    }

    function makeSmartMove() {
        for (let i = 0; i < 9; i++) {
            if (gameState.board[i] === '') {
                gameState.board[i] = 'O';
                if (checkWin()) {
                    gameState.board[i] = '';
                    return i;
                }
                gameState.board[i] = '';
            }
        }

        for (let i = 0; i < 9; i++) {
            if (gameState.board[i] === '') {
                gameState.board[i] = 'X';
                if (checkWin()) {
                    gameState.board[i] = '';
                    return i;
                }
                gameState.board[i] = '';
            }
        }

        if (gameState.board[4] === '') return 4;

        const corners = [0, 2, 6, 8];
        const emptyCorners = corners.filter(i => gameState.board[i] === '');
        if (emptyCorners.length > 0) return emptyCorners[Math.floor(Math.random() * emptyCorners.length)];

        const edges = [1, 3, 5, 7];
        const emptyEdges = edges.filter(i => gameState.board[i] === '');
        if (emptyEdges.length > 0) return emptyEdges[Math.floor(Math.random() * emptyEdges.length)];

        return makeRandomMove();
    }

    function restartGame() {
        gameState.board = ['', '', '', '', '', '', '', '', ''];
        gameState.currentPlayer = 'X';
        gameState.gameActive = true;
        cells.forEach(cell => {
            cell.textContent = '';
            cell.className = 'cell';
            cell.style.transform = '';
        });
        modal.classList.remove('active');
        updateUI();
        if (gameState.mode === 'pvc' && gameState.currentPlayer === 'O') {
            setTimeout(makeAIMove, 500);
        }
    }

    function newGame() {
        gameContainer.classList.add('hidden');
        modal.classList.remove('active');
        if (gameState.mode === 'pvc') {
            player2Input.disabled = false;
            player2Input.value = gameState.player2 === 'Computer' ? 'Player 2' : gameState.player2;
        }
    }

    function showModal(title, message) {
        modalTitle.textContent = title;
        modalMessage.textContent = message;
        modal.classList.add('active');
    }

    function addToHistory(winner) {
        const now = new Date();
        const historyItem = {
            winner,
            date: now.toLocaleString(),
            player1: gameState.player1,
            player2: gameState.player2,
            mode: gameState.mode,
            difficulty: gameState.difficulty
        };
        gameState.history.unshift(historyItem);
        updateHistoryUI();
    }

    function updateHistoryUI() {
        historyList.innerHTML = '';
        gameState.history.forEach(item => {
            const historyElement = document.createElement('div');
            historyElement.className = 'history-item';
            let winnerText = item.winner === 'draw'
                ? `<span class="history-winner draw">Draw</span>`
                : `<span class="history-winner ${item.winner === item.player1 ? 'x' : 'o'}">${item.winner} (${item.winner === item.player1 ? 'X' : 'O'})</span> wins`;
            historyElement.innerHTML = `
                <div>
                    ${winnerText} vs ${item.winner === item.player1 ? item.player2 : item.player1} ${item.mode === 'pvc' ? `(${item.difficulty})` : ''}
                </div>
                <div class="history-date">${item.date}</div>
            `;
            historyList.appendChild(historyElement);
        });
    }

    function updateUI() {
        currentPlayerDisplay.textContent = `${gameState.currentPlayer === 'X' ? gameState.player1 : (gameState.mode === 'pvp' ? gameState.player2 : 'Computer')}'s turn (${gameState.currentPlayer})`;
        currentPlayerDisplay.style.color = gameState.currentPlayer === 'X' ? 'var(--x-color)' : 'var(--o-color)';
        player1Score.querySelector('.player-name').textContent = gameState.player1;
        player1Score.querySelector('.score-value').textContent = gameState.scores.player1;
        player2Score.querySelector('.player-name').textContent = gameState.mode === 'pvp' ? gameState.player2 : 'Computer';
        player2Score.querySelector('.score-value').textContent = gameState.scores.player2;
        drawsScore.querySelector('.score-value').textContent = gameState.scores.draws;
    }

    function saveToLocalStorage() {
        localStorage.setItem('ticTacToeState', JSON.stringify(gameState));
        localStorage.setItem('ticTacToeTheme', document.documentElement.getAttribute('data-theme') || 'light');
    }

    function loadFromLocalStorage() {
        const savedState = localStorage.getItem('ticTacToeState');
        const savedTheme = localStorage.getItem('ticTacToeTheme');

        if (savedState) {
            gameState = JSON.parse(savedState);
            player1Input.value = gameState.player1;
            player2Input.value = gameState.player2;
            updateUI();
            updateHistoryUI();
        }

        if (savedTheme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
            themeBtn.innerHTML = '<i class="fas fa-sun"></i>';
        }
    }

    function createFloatingParticles() {
        const bgElements = document.querySelector('.bg-elements');
        const colors = ['var(--x-color)', 'var(--o-color)', 'var(--win-color)', 'var(--accent-color)'];

        for (let i = 0; i < 6; i++) {
            const element = document.createElement('div');
            element.className = 'bg-element';
            const size = Math.random() * 200 + 100;
            const color = colors[Math.floor(Math.random() * colors.length)];
            element.style.width = `${size}px`;
            element.style.height = `${size}px`;
            element.style.background = `radial-gradient(circle, ${color} 0%, transparent 70%)`;
            element.style.top = `${Math.random() * 100}%`;
            element.style.left = `${Math.random() * 100}%`;
            element.style.animationDuration = `${Math.random() * 30 + 20}s`;
            element.style.animationDelay = `-${Math.random() * 20}s`;
            bgElements.appendChild(element);
        }
    }
});
