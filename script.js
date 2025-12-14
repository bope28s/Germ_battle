// 게임 상태
let board = [];
let currentPlayer = 1; // 1 = 초록, 2 = 빨강
let gameMode = null;
let gameOver = false;
let winner = null;
let renderer = null;
let ai = null;
const BOARD_SIZE = 7;

// 초기화
function initGame() {
    board = Array(BOARD_SIZE).fill(0).map(() => Array(BOARD_SIZE).fill(0));
    board[0][0] = 1;
    board[BOARD_SIZE - 1][BOARD_SIZE - 1] = 1;
    board[0][BOARD_SIZE - 1] = 2;
    board[BOARD_SIZE - 1][0] = 2;
    currentPlayer = 1;
    gameOver = false;
    winner = null;
}

// 화면 전환
function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const screen = document.getElementById(id);
    if (screen) screen.classList.add('active');
}

function showModeSelect() {
    const modeSelect = document.getElementById('mode-select');
    if (modeSelect) {
        modeSelect.style.display = modeSelect.style.display === 'none' ? 'block' : 'none';
    }
}

function showHelp() {
    showScreen('help-screen');
}

function backToStart() {
    showScreen('start-screen');
    const modeSelect = document.getElementById('mode-select');
    if (modeSelect) modeSelect.style.display = 'block';
}

// 게임 시작
function startGame(mode) {
    gameMode = mode;
    initGame();
    ai = mode === 'computer' ? {} : null;
    
    document.getElementById('p1-name').textContent = '플레이어 1';
    document.getElementById('p2-name').textContent = mode === 'computer' ? '컴퓨터' : '플레이어 2';
    
    showScreen('game-screen');
    
    const canvas = document.getElementById('board');
    initRenderer(canvas);
    render();
    updateUI();
}

// 렌더러 초기화
function initRenderer(canvas) {
    const container = canvas.parentElement;
    const size = Math.min(container.clientWidth - 40, container.clientHeight - 300, window.innerWidth - 40, 500);
    const boardSize = Math.max(280, size);
    
    canvas.width = boardSize;
    canvas.height = boardSize;
    canvas.style.width = boardSize + 'px';
    canvas.style.height = boardSize + 'px';
    
    renderer = {
        canvas: canvas,
        ctx: canvas.getContext('2d'),
        size: boardSize,
        padding: 10,
        cellSize: (boardSize - 20) / BOARD_SIZE
    };
    
    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('touchstart', handleTouch);
}

function handleClick(e) {
    const rect = renderer.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const col = Math.floor((x - renderer.padding) / renderer.cellSize);
    const row = Math.floor((y - renderer.padding) / renderer.cellSize);
    
    if (row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE) {
        makeMove(row, col);
    }
}

function handleTouch(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = renderer.canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    const col = Math.floor((x - renderer.padding) / renderer.cellSize);
    const row = Math.floor((y - renderer.padding) / renderer.cellSize);
    
    if (row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE) {
        makeMove(row, col);
    }
}

// 가능한 이동 찾기
function getValidMoves(player) {
    const moves = [];
    
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            if (board[i][j] === player) {
                for (let di = -2; di <= 2; di++) {
                    for (let dj = -2; dj <= 2; dj++) {
                        if (di === 0 && dj === 0) continue;
                        
                        const ni = i + di;
                        const nj = j + dj;
                        
                        if (ni < 0 || ni >= BOARD_SIZE || nj < 0 || nj >= BOARD_SIZE) continue;
                        if (board[ni][nj] !== 0) continue;
                        
                        const dist = Math.max(Math.abs(di), Math.abs(dj));
                        if (dist === 1 || dist === 2) {
                            if (!moves.find(m => m.row === ni && m.col === nj)) {
                                moves.push({ row: ni, col: nj, fromRow: i, fromCol: j, distance: dist });
                            }
                        }
                    }
                }
            }
        }
    }
    
    return moves;
}

// 수 두기
function makeMove(row, col) {
    if (gameOver) return;
    if (board[row][col] !== 0) return;
    if (gameMode === 'computer' && currentPlayer === 2) return;
    
    const validMoves = getValidMoves(currentPlayer);
    const move = validMoves.find(m => m.row === row && m.col === col);
    
    if (!move) {
        showMessage('여기에 놓을 수 없어요!');
        return;
    }
    
    if (move.distance === 2) {
        board[move.fromRow][move.fromCol] = 0;
    }
    
    board[row][col] = currentPlayer;
    
    // 전염
    const dirs = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
    const opponent = currentPlayer === 1 ? 2 : 1;
    
    dirs.forEach(([di, dj]) => {
        const ni = row + di;
        const nj = col + dj;
        if (ni >= 0 && ni < BOARD_SIZE && nj >= 0 && nj < BOARD_SIZE) {
            if (board[ni][nj] === opponent) {
                board[ni][nj] = currentPlayer;
            }
        }
    });
    
    currentPlayer = opponent;
    checkGameOver();
    render();
    updateUI();
    
    if (gameOver) {
        setTimeout(() => showEndScreen(), 500);
    } else if (gameMode === 'computer' && currentPlayer === 2) {
        setTimeout(() => aiMove(), 500);
    }
}

// AI 수
function aiMove() {
    const moves = getValidMoves(2);
    if (moves.length > 0) {
        const move = moves[Math.floor(Math.random() * moves.length)];
        makeMove(move.row, move.col);
    }
}

// 게임 종료 확인
function checkGameOver() {
    const p1Moves = getValidMoves(1);
    const p2Moves = getValidMoves(2);
    
    if (p1Moves.length === 0 && p2Moves.length === 0) {
        endGame();
    } else if (p1Moves.length === 0 || p2Moves.length === 0) {
        const winnerPlayer = p1Moves.length === 0 ? 2 : 1;
        for (let i = 0; i < BOARD_SIZE; i++) {
            for (let j = 0; j < BOARD_SIZE; j++) {
                if (board[i][j] === 0) {
                    board[i][j] = winnerPlayer;
                }
            }
        }
        endGame();
    }
}

function endGame() {
    gameOver = true;
    let p1Count = 0, p2Count = 0;
    
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            if (board[i][j] === 1) p1Count++;
            if (board[i][j] === 2) p2Count++;
        }
    }
    
    if (p1Count > p2Count) winner = 1;
    else if (p2Count > p1Count) winner = 2;
    else winner = 0;
}

// 렌더링
function render() {
    if (!renderer) return;
    
    const ctx = renderer.ctx;
    const size = renderer.size;
    
    ctx.clearRect(0, 0, size, size);
    
    // 배경
    ctx.fillStyle = '#8B7355';
    ctx.fillRect(0, 0, size, size);
    
    // 그리드
    ctx.strokeStyle = '#6B5B4A';
    ctx.lineWidth = 2;
    
    for (let i = 0; i <= BOARD_SIZE; i++) {
        const pos = renderer.padding + i * renderer.cellSize;
        ctx.beginPath();
        ctx.moveTo(pos, renderer.padding);
        ctx.lineTo(pos, size - renderer.padding);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(renderer.padding, pos);
        ctx.lineTo(size - renderer.padding, pos);
        ctx.stroke();
    }
    
    // 유효한 이동 표시
    if (!gameOver) {
        const moves = getValidMoves(currentPlayer);
        ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
        moves.forEach(m => {
            const x = renderer.padding + m.col * renderer.cellSize + 2;
            const y = renderer.padding + m.row * renderer.cellSize + 2;
            ctx.fillRect(x, y, renderer.cellSize - 4, renderer.cellSize - 4);
        });
    }
    
    // 말 그리기
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            if (board[i][j] !== 0) {
                const x = renderer.padding + j * renderer.cellSize + renderer.cellSize / 2;
                const y = renderer.padding + i * renderer.cellSize + renderer.cellSize / 2;
                drawPiece(ctx, x, y, renderer.cellSize * 0.75, board[i][j]);
            }
        }
    }
}

function drawPiece(ctx, x, y, size, player) {
    ctx.save();
    ctx.translate(x, y);
    
    const colors = player === 1 
        ? { main: '#4CAF50', light: '#81C784', dark: '#2E7D32' }
        : { main: '#F44336', light: '#EF5350', dark: '#C62828' };
    
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.5);
    gradient.addColorStop(0, colors.light);
    gradient.addColorStop(1, colors.main);
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.4, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = colors.dark;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    const eyeSize = size * 0.1;
    const eyeOffset = size * 0.15;
    
    ctx.fillStyle = colors.dark;
    ctx.beginPath();
    ctx.arc(-eyeOffset, -eyeOffset, eyeSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(eyeOffset, -eyeOffset, eyeSize, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = colors.dark;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, eyeOffset * 0.5, size * 0.15, 0.2, Math.PI - 0.2);
    ctx.stroke();
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.beginPath();
    ctx.arc(-eyeOffset * 0.5, -eyeOffset * 1.2, size * 0.08, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
}

// UI 업데이트
function updateUI() {
    let p1Count = 0, p2Count = 0;
    
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            if (board[i][j] === 1) p1Count++;
            if (board[i][j] === 2) p2Count++;
        }
    }
    
    document.getElementById('p1-count').textContent = p1Count;
    document.getElementById('p2-count').textContent = p2Count;
    
    const turn = document.getElementById('turn');
    if (currentPlayer === 1) {
        turn.textContent = '🟢 차례';
        turn.style.background = '#4CAF50';
    } else {
        turn.textContent = gameMode === 'computer' ? '🤖 생각 중...' : '🔴 차례';
        turn.style.background = '#F44336';
    }
    
    document.getElementById('player1').style.opacity = currentPlayer === 1 ? '1' : '0.6';
    document.getElementById('player2').style.opacity = currentPlayer === 2 ? '1' : '0.6';
}

function showMessage(text) {
    const msg = document.getElementById('message');
    if (msg) {
        msg.textContent = text;
        setTimeout(() => {
            if (msg) msg.textContent = '';
        }, 2000);
    }
}

function showEndScreen() {
    let p1Count = 0, p2Count = 0;
    
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            if (board[i][j] === 1) p1Count++;
            if (board[i][j] === 2) p2Count++;
        }
    }
    
    document.getElementById('final-p1-name').textContent = '플레이어 1';
    document.getElementById('final-p2-name').textContent = gameMode === 'computer' ? '컴퓨터' : '플레이어 2';
    document.getElementById('final-p1-count').textContent = p1Count;
    document.getElementById('final-p2-count').textContent = p2Count;
    
    const icon = document.getElementById('result-icon');
    const text = document.getElementById('result-text');
    
    if (winner === 0) {
        icon.textContent = '🤝';
        text.textContent = '무승부!';
        text.style.color = '#666';
    } else if (winner === 1) {
        icon.textContent = '🎉';
        text.textContent = '플레이어 1 승리!';
        text.style.color = '#4CAF50';
    } else {
        icon.textContent = gameMode === 'computer' ? '🤖' : '🎉';
        text.textContent = gameMode === 'computer' ? '컴퓨터 승리!' : '플레이어 2 승리!';
        text.style.color = '#F44336';
    }
    
    showScreen('end-screen');
}

function restart() {
    initGame();
    showScreen('game-screen');
    render();
    updateUI();
}

// 페이지 로드 시
window.addEventListener('load', () => {
    showScreen('start-screen');
});

