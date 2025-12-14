// 전역 변수
let gameState = null;
let gameRenderer = null;
let ai = null;
let currentGameMode = null;

// 화면 전환 함수
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

function showStartScreen() {
    showScreen('start-screen');
}

function showModeSelection() {
    showScreen('mode-screen');
}

function showRules() {
    showScreen('rules-screen');
}

function returnToModeSelection() {
    if (gameState && gameState.gameOver) {
        showGameOverScreen();
        return;
    }
    showModeSelection();
}

function showGameOverScreen() {
    if (!gameState || !gameState.gameOver) return;

    const messageDiv = document.getElementById('game-over-message');
    const p1Count = gameState.getPieceCount(1);
    const p2Count = gameState.getPieceCount(2);

    let message = '';
    if (gameState.winner === 0) {
        message = '🤝 무승부!';
    } else if (gameState.winner === 1) {
        message = '🟢 플레이어 1 승리! 🎉';
    } else {
        if (currentGameMode === 'vs-computer') {
            message = '🤖 컴퓨터 승리!';
        } else {
            message = '🔴 플레이어 2 승리! 🎉';
        }
    }

    message += `<br><small>플레이어 1: ${p1Count}개, 플레이어 2: ${p2Count}개</small>`;
    messageDiv.innerHTML = message;
    showScreen('game-over-screen');
}

// 게임 시작
function startGame(mode) {
    currentGameMode = mode;
    gameState = new GameState(7);
    gameState.gameMode = mode;
    gameState.initialize();
    
    ai = new SimpleAI('easy');
    
    // 게임 화면으로 전환
    showScreen('game-screen');
    
    // 플레이어 이름 설정
    document.getElementById('player1-name').textContent = '플레이어 1';
    if (mode === 'vs-computer') {
        document.getElementById('player2-name').textContent = '컴퓨터';
    } else {
        document.getElementById('player2-name').textContent = '플레이어 2';
    }
    
    // 렌더러 초기화
    const canvas = document.getElementById('game-board');
    gameRenderer = new GameRenderer(canvas, gameState, handleCellClick);
    
    updateUI();
    gameRenderer.render();
}

// 셀 클릭 처리
function handleCellClick(row, col) {
    if (gameState.gameOver) return;
    
    // 현재 플레이어의 차례인지 확인
    if (currentGameMode === 'vs-computer' && gameState.currentPlayer === 2) {
        return; // 컴퓨터 차례에는 클릭 무시
    }
    
    // 말 놓기 시도
    if (gameState.makeMove(row, col, gameState.currentPlayer)) {
        updateUI();
        gameRenderer.render();
        
        if (gameState.gameOver) {
            setTimeout(() => showGameOverScreen(), 500);
            return;
        }
        
        // 컴퓨터 모드인 경우 컴퓨터 차례 처리
        if (currentGameMode === 'vs-computer' && gameState.currentPlayer === 2) {
            setTimeout(() => {
                makeAIMove();
            }, 500);
        }
    } else {
        // 유효하지 않은 이동
        showMessage('여기에 놓을 수 없어요! 💭', 2000);
    }
}

// AI 수 처리
function makeAIMove() {
    if (gameState.gameOver || gameState.currentPlayer !== 2) return;
    
    const move = ai.chooseMove(gameState);
    if (move) {
        gameState.makeMove(move.row, move.col, 2);
        updateUI();
        gameRenderer.render();
        
        if (gameState.gameOver) {
            setTimeout(() => showGameOverScreen(), 500);
        }
    }
}

// UI 업데이트
function updateUI() {
    const p1Count = gameState.getPieceCount(1);
    const p2Count = gameState.getPieceCount(2);
    
    document.getElementById('player1-count').textContent = p1Count;
    document.getElementById('player2-count').textContent = p2Count;
    
    // 현재 차례 표시
    const turnIndicator = document.getElementById('current-turn');
    if (gameState.currentPlayer === 1) {
        turnIndicator.textContent = '🟢 차례';
        turnIndicator.style.color = '#4CAF50';
    } else {
        if (currentGameMode === 'vs-computer') {
            turnIndicator.textContent = '🤖 컴퓨터 생각 중...';
        } else {
            turnIndicator.textContent = '🔴 차례';
        }
        turnIndicator.style.color = '#F44336';
    }
    
    // 플레이어 정보 강조
    document.getElementById('player1-info').style.opacity = gameState.currentPlayer === 1 ? '1' : '0.6';
    document.getElementById('player2-info').style.opacity = gameState.currentPlayer === 2 ? '1' : '0.6';
}

// 메시지 표시
function showMessage(message, duration = 3000) {
    const messageDiv = document.getElementById('game-message');
    messageDiv.textContent = message;
    messageDiv.style.display = 'flex';
    
    setTimeout(() => {
        messageDiv.textContent = '';
    }, duration);
}

// 게임 재시작
function restartGame() {
    if (gameState) {
        gameState.initialize();
        gameState.currentPlayer = 1;
        updateUI();
        gameRenderer.render();
        showScreen('game-screen');
    }
}

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    showStartScreen();
});

