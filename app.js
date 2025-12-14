// 전역 변수
let game = null;
let ai = null;
let gameMode = null;

// 화면 전환
function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function showStartScreen() {
    showScreen('start-screen');
    // 모드 섹션을 다시 표시
    const modeSection = document.getElementById('mode-section');
    const backBtn = document.getElementById('mode-back-btn');
    const mainButtons = document.querySelector('.main-buttons');
    
    modeSection.style.display = 'block';
    backBtn.style.display = 'none';
    mainButtons.style.display = 'flex';
}

function hideModeSection() {
    const modeSection = document.getElementById('mode-section');
    const backBtn = document.getElementById('mode-back-btn');
    const mainButtons = document.querySelector('.main-buttons');
    
    modeSection.style.display = 'none';
    backBtn.style.display = 'none';
    mainButtons.style.display = 'flex';
}

function showHelpScreen() {
    showScreen('help-screen');
}

function backToMenu() {
    showStartScreen();
}

// 게임 시작
function startGame(mode) {
    gameMode = mode;
    game = new Game(7);
    ai = mode === 'computer' ? new AI() : null;
    
    // 플레이어 이름 설정
    document.getElementById('player1-name').textContent = '플레이어 1';
    document.getElementById('player2-name').textContent = mode === 'computer' ? '컴퓨터' : '플레이어 2';
    
    // 게임 화면 표시
    showScreen('game-screen');
    
    // 렌더러 초기화
    const canvas = document.getElementById('board');
    game.initRenderer(canvas, onCellClick);
    
    updateUI();
}

// 셀 클릭
function onCellClick(row, col) {
    if (game.isGameOver()) return;
    if (gameMode === 'computer' && game.getCurrentPlayer() === 2) return;
    
    if (game.makeMove(row, col)) {
        updateUI();
        
        if (game.isGameOver()) {
            setTimeout(() => showGameOver(), 500);
            return;
        }
        
        // 컴퓨터 차례
        if (gameMode === 'computer' && game.getCurrentPlayer() === 2) {
            setTimeout(() => {
                const move = ai.getMove(game);
                if (move) {
                    game.makeMove(move.row, move.col);
                    updateUI();
                    if (game.isGameOver()) {
                        setTimeout(() => showGameOver(), 500);
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
    const p1Count = game.getCount(1);
    const p2Count = game.getCount(2);
    const currentPlayer = game.getCurrentPlayer();
    
    document.getElementById('player1-count').textContent = p1Count;
    document.getElementById('player2-count').textContent = p2Count;
    
    const indicator = document.getElementById('turn-indicator');
    if (currentPlayer === 1) {
        indicator.textContent = '🟢 차례';
        indicator.style.background = '#4CAF50';
    } else {
        indicator.textContent = gameMode === 'computer' ? '🤖 생각 중...' : '🔴 차례';
        indicator.style.background = '#F44336';
    }
    
    // 플레이어 강조
    document.getElementById('player1-score').style.opacity = currentPlayer === 1 ? '1' : '0.6';
    document.getElementById('player2-score').style.opacity = currentPlayer === 2 ? '1' : '0.6';
}

// 메시지 표시
function showMessage(text) {
    const msg = document.getElementById('game-message');
    msg.textContent = text;
    setTimeout(() => {
        msg.textContent = '';
    }, 2000);
}

// 게임 종료 화면
function showGameOver() {
    const winner = game.getWinner();
    const p1Count = game.getCount(1);
    const p2Count = game.getCount(2);
    
    document.getElementById('final-p1-name').textContent = '플레이어 1';
    document.getElementById('final-p2-name').textContent = gameMode === 'computer' ? '컴퓨터' : '플레이어 2';
    document.getElementById('final-p1-count').textContent = p1Count;
    document.getElementById('final-p2-count').textContent = p2Count;
    
    const icon = document.getElementById('result-icon');
    const message = document.getElementById('result-message');
    
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
    showStartScreen();
});
