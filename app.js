// 전역 변수
let game = null;
let ai = null;
let gameMode = null;

// 화면 전환
function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const targetScreen = document.getElementById(id);
    if (targetScreen) {
        targetScreen.classList.add('active');
    }
}

function showStartScreen() {
    showScreen('start-screen');
    const modeSection = document.getElementById('mode-section');
    const backBtn = document.getElementById('mode-back-btn');
    const mainButtons = document.querySelector('.main-buttons');
    
    if (modeSection) {
        modeSection.style.display = 'block';
    }
    if (backBtn) {
        backBtn.style.display = 'none';
    }
    if (mainButtons) {
        mainButtons.style.display = 'flex';
    }
}

function hideModeSection() {
    const modeSection = document.getElementById('mode-section');
    const backBtn = document.getElementById('mode-back-btn');
    const mainButtons = document.querySelector('.main-buttons');
    
    if (modeSection) modeSection.style.display = 'none';
    if (backBtn) backBtn.style.display = 'none';
    if (mainButtons) mainButtons.style.display = 'flex';
}

function showHelpScreen() {
    showScreen('help-screen');
}

function backToMenu() {
    showStartScreen();
}

// 게임 시작
function startGame(mode) {
    try {
        gameMode = mode;
        game = new Game(7);
        ai = mode === 'computer' ? new AI() : null;
        
        const player1Name = document.getElementById('player1-name');
        const player2Name = document.getElementById('player2-name');
        if (player1Name) player1Name.textContent = '플레이어 1';
        if (player2Name) player2Name.textContent = mode === 'computer' ? '컴퓨터' : '플레이어 2';
        
        showScreen('game-screen');
        
        const canvas = document.getElementById('board');
        if (canvas && game) {
            game.initRenderer(canvas, onCellClick);
            updateUI();
        }
    } catch (error) {
        console.error('게임 시작 오류:', error);
        alert('게임 시작 중 오류가 발생했습니다.');
    }
}

// 셀 클릭
function onCellClick(row, col) {
    if (!game || game.isGameOver()) return;
    if (gameMode === 'computer' && game.getCurrentPlayer() === 2) return;
    
    if (game.makeMove(row, col)) {
        updateUI();
        
        if (game.isGameOver()) {
            setTimeout(() => showGameOver(), 500);
            return;
        }
        
        if (gameMode === 'computer' && game.getCurrentPlayer() === 2) {
            setTimeout(() => {
                if (ai && game) {
                    const move = ai.getMove(game);
                    if (move && game.makeMove(move.row, move.col)) {
                        updateUI();
                        if (game.isGameOver()) {
                            setTimeout(() => showGameOver(), 500);
                        }
                    }
                }
            }, 500);
        }
    } else {
        showMessage('여기에 놓을 수 없어요!');
    }
}

// UI 업데이트
function updateUI() {
    if (!game) return;
    
    const p1Count = game.getCount(1);
    const p2Count = game.getCount(2);
    const currentPlayer = game.getCurrentPlayer();
    
    const p1CountEl = document.getElementById('player1-count');
    const p2CountEl = document.getElementById('player2-count');
    if (p1CountEl) p1CountEl.textContent = p1Count;
    if (p2CountEl) p2CountEl.textContent = p2Count;
    
    const indicator = document.getElementById('turn-indicator');
    if (indicator) {
        if (currentPlayer === 1) {
            indicator.textContent = '🟢 차례';
            indicator.style.background = '#4CAF50';
        } else {
            indicator.textContent = gameMode === 'computer' ? '🤖 생각 중...' : '🔴 차례';
            indicator.style.background = '#F44336';
        }
    }
    
    const p1Score = document.getElementById('player1-score');
    const p2Score = document.getElementById('player2-score');
    if (p1Score) p1Score.style.opacity = currentPlayer === 1 ? '1' : '0.6';
    if (p2Score) p2Score.style.opacity = currentPlayer === 2 ? '1' : '0.6';
}

// 메시지 표시
function showMessage(text) {
    const msg = document.getElementById('game-message');
    if (msg) {
        msg.textContent = text;
        setTimeout(() => {
            if (msg) msg.textContent = '';
        }, 2000);
    }
}

// 게임 종료 화면
function showGameOver() {
    if (!game) return;
    
    const winner = game.getWinner();
    const p1Count = game.getCount(1);
    const p2Count = game.getCount(2);
    
    const finalP1Name = document.getElementById('final-p1-name');
    const finalP2Name = document.getElementById('final-p2-name');
    const finalP1Count = document.getElementById('final-p1-count');
    const finalP2Count = document.getElementById('final-p2-count');
    
    if (finalP1Name) finalP1Name.textContent = '플레이어 1';
    if (finalP2Name) finalP2Name.textContent = gameMode === 'computer' ? '컴퓨터' : '플레이어 2';
    if (finalP1Count) finalP1Count.textContent = p1Count;
    if (finalP2Count) finalP2Count.textContent = p2Count;
    
    const icon = document.getElementById('result-icon');
    const message = document.getElementById('result-message');
    
    if (icon && message) {
        if (winner === 0) {
            icon.textContent = '🤝';
            message.textContent = '무승부!';
            message.style.color = '#666';
        } else if (winner === 1) {
            icon.textContent = '🎉';
            message.textContent = '플레이어 1 승리!';
            message.style.color = '#4CAF50';
        } else {
            icon.textContent = gameMode === 'computer' ? '🤖' : '🎉';
            message.textContent = gameMode === 'computer' ? '컴퓨터 승리!' : '플레이어 2 승리!';
            message.style.color = '#F44336';
        }
    }
    
    showScreen('game-over-screen');
}

// 게임 재시작
function restartGame() {
    if (game) {
        game.reset();
        showScreen('game-screen');
        updateUI();
    }
}

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    // 모든 화면 숨기기
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // 시작 화면만 표시
    const startScreen = document.getElementById('start-screen');
    if (startScreen) {
        startScreen.classList.add('active');
    }
    
    showStartScreen();
    
    // 윈도우 리사이즈 처리
    window.addEventListener('resize', () => {
        if (game && game.renderer) {
            game.renderer.setupCanvas();
            game.renderer.render();
        }
    });
});
