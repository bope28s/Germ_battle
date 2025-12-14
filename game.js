// 게임 상태
class GameState {
    constructor(size = 7) {
        this.size = size;
        this.board = Array(size).fill(null).map(() => Array(size).fill(0));
        this.currentPlayer = 1; // 1 = 플레이어 1 (초록), 2 = 플레이어 2 (빨강)
        this.gameMode = null; // 'vs-computer' or 'vs-player'
        this.gameOver = false;
        this.winner = null;
        this.initialized = false;
    }

    // 초기 보드 설정 (가장자리에 말 배치)
    initialize() {
        // 모든 칸을 비움
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                this.board[i][j] = 0;
            }
        }

        // 가장자리에 초기 말 배치 (대칭적으로)
        const corners = [
            [0, 0], [0, this.size - 1],
            [this.size - 1, 0], [this.size - 1, this.size - 1]
        ];

        // 왼쪽 위와 오른쪽 아래는 플레이어 1 (초록)
        this.board[0][0] = 1;
        this.board[this.size - 1][this.size - 1] = 1;

        // 왼쪽 아래와 오른쪽 위는 플레이어 2 (빨강)
        this.board[0][this.size - 1] = 2;
        this.board[this.size - 1][0] = 2;

        this.currentPlayer = 1; // 플레이어 1부터 시작
        this.initialized = true;
        this.gameOver = false;
        this.winner = null;
    }

    // 가능한 이동 위치 찾기
    getValidMoves(player) {
        const moves = [];
        const board = this.board;
        const size = this.size;

        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                if (board[i][j] === player) {
                    // 한 칸 또는 두 칸 떨어진 위치 찾기
                    for (let di = -2; di <= 2; di++) {
                        for (let dj = -2; dj <= 2; dj++) {
                            if (di === 0 && dj === 0) continue;

                            const distance = Math.abs(di) + Math.abs(dj);
                            if (distance > 2) continue; // 두 칸 이상 떨어진 곳 제외
                            if (Math.abs(di) > 2 || Math.abs(dj) > 2) continue;

                            const ni = i + di;
                            const nj = j + dj;

                            // 보드 범위 확인
                            if (ni < 0 || ni >= size || nj < 0 || nj >= size) continue;

                            // 빈 칸인지 확인
                            if (board[ni][nj] !== 0) continue;

                            // 거리 확인: 한 칸 또는 두 칸 (Chebyshev distance 사용)
                            const chebyshevDist = Math.max(Math.abs(di), Math.abs(dj));

                            // 정확히 한 칸 또는 두 칸만 허용 (가로, 세로, 대각선 모두 포함)
                            if (chebyshevDist === 1 || chebyshevDist === 2) {
                                if (!moves.some(m => m.row === ni && m.col === nj)) {
                                    moves.push({
                                        row: ni,
                                        col: nj,
                                        fromRow: i,
                                        fromCol: j,
                                        distance: chebyshevDist
                                    });
                                }
                            }
                        }
                    }
                }
            }
        }

        return moves;
    }

    // 말 놓기
    makeMove(row, col, player) {
        if (this.gameOver) return false;
        if (this.board[row][col] !== 0) return false;

        // 유효한 이동인지 확인
        const validMoves = this.getValidMoves(player);
        const move = validMoves.find(m => m.row === row && m.col === col);
        
        if (!move) return false;

        // 두 칸 떨어진 곳이면 원래 위치의 말 제거
        if (move.distance === 2) {
            this.board[move.fromRow][move.fromCol] = 0;
        }

        // 말 놓기
        this.board[row][col] = player;

        // 주변 상대방 말 전염 (인접한 8방향)
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];

        const opponent = player === 1 ? 2 : 1;
        directions.forEach(([di, dj]) => {
            const ni = row + di;
            const nj = col + dj;
            
            if (ni >= 0 && ni < this.size && nj >= 0 && nj < this.size) {
                if (this.board[ni][nj] === opponent) {
                    this.board[ni][nj] = player;
                }
            }
        });

        // 플레이어 변경
        this.currentPlayer = opponent;

        // 게임 종료 조건 확인
        this.checkGameOver();

        return true;
    }

    // 게임 종료 확인
    checkGameOver() {
        const p1Moves = this.getValidMoves(1);
        const p2Moves = this.getValidMoves(2);

        // 둘 다 더 이상 둘 곳이 없으면 게임 종료
        if (p1Moves.length === 0 && p2Moves.length === 0) {
            this.gameOver = true;
            this.calculateWinner();
        } else if (p1Moves.length === 0 || p2Moves.length === 0) {
            // 한 쪽만 더 이상 둘 곳이 없으면, 나머지 칸을 그 쪽의 말로 채움
            const winner = p1Moves.length === 0 ? 2 : 1;
            for (let i = 0; i < this.size; i++) {
                for (let j = 0; j < this.size; j++) {
                    if (this.board[i][j] === 0) {
                        this.board[i][j] = winner;
                    }
                }
            }
            this.gameOver = true;
            this.calculateWinner();
        }

        // 모든 칸이 찬 경우
        let allFilled = true;
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.board[i][j] === 0) {
                    allFilled = false;
                    break;
                }
            }
            if (!allFilled) break;
        }

        if (allFilled) {
            this.gameOver = true;
            this.calculateWinner();
        }
    }

    // 승자 계산
    calculateWinner() {
        let p1Count = 0;
        let p2Count = 0;

        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.board[i][j] === 1) p1Count++;
                else if (this.board[i][j] === 2) p2Count++;
            }
        }

        if (p1Count > p2Count) {
            this.winner = 1;
        } else if (p2Count > p1Count) {
            this.winner = 2;
        } else {
            this.winner = 0; // 무승부
        }
    }

    // 말 개수 세기
    getPieceCount(player) {
        let count = 0;
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.board[i][j] === player) count++;
            }
        }
        return count;
    }

    // 보드 복사 (AI용)
    clone() {
        const newState = new GameState(this.size);
        newState.board = this.board.map(row => [...row]);
        newState.currentPlayer = this.currentPlayer;
        newState.gameMode = this.gameMode;
        newState.gameOver = this.gameOver;
        newState.winner = this.winner;
        newState.initialized = this.initialized;
        return newState;
    }
}

// 게임 렌더링 클래스
class GameRenderer {
    constructor(canvas, gameState, onCellClick) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.gameState = gameState;
        this.onCellClick = onCellClick;
        this.cellSize = 0;
        this.padding = 10;
        this.validMoves = [];

        this.setupCanvas();
        this.setupEventListeners();
    }

    setupCanvas() {
        const container = this.canvas.parentElement;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        const size = Math.min(containerWidth - this.padding * 2, containerHeight - this.padding * 2);
        this.canvas.width = size;
        this.canvas.height = size;
        this.canvas.style.width = size + 'px';
        this.canvas.style.height = size + 'px';
        
        this.cellSize = (size - this.padding * 2) / this.gameState.size;
        this.boardSize = size;
    }

    setupEventListeners() {
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const col = Math.floor((x - this.padding) / this.cellSize);
            const row = Math.floor((y - this.padding) / this.cellSize);
            
            if (row >= 0 && row < this.gameState.size && col >= 0 && col < this.gameState.size) {
                this.onCellClick(row, col);
            }
        });

        // 터치 이벤트
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            
            const col = Math.floor((x - this.padding) / this.cellSize);
            const row = Math.floor((y - this.padding) / this.cellSize);
            
            if (row >= 0 && row < this.gameState.size && col >= 0 && col < this.gameState.size) {
                this.onCellClick(row, col);
            }
        });

        // 리사이즈 이벤트
        window.addEventListener('resize', () => {
            this.setupCanvas();
            this.render();
        });
    }

    updateValidMoves() {
        this.validMoves = this.gameState.getValidMoves(this.gameState.currentPlayer);
    }

    // 귀여운 세균 캐릭터 그리기
    drawPiece(ctx, x, y, size, player) {
        ctx.save();
        ctx.translate(x, y);

        const colors = player === 1 
            ? { main: '#4CAF50', eye: '#1B5E20', mouth: '#2E7D32' }
            : { main: '#F44336', eye: '#B71C1C', mouth: '#C62828' };

        // 세균 몸체 (부드러운 원형)
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.5);
        gradient.addColorStop(0, player === 1 ? '#81C784' : '#EF5350');
        gradient.addColorStop(1, colors.main);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.4, 0, Math.PI * 2);
        ctx.fill();

        // 테두리
        ctx.strokeStyle = colors.main;
        ctx.lineWidth = 2;
        ctx.stroke();

        // 귀여운 얼굴
        const eyeSize = size * 0.1;
        const eyeOffset = size * 0.15;

        // 왼쪽 눈
        ctx.fillStyle = colors.eye;
        ctx.beginPath();
        ctx.arc(-eyeOffset, -eyeOffset, eyeSize, 0, Math.PI * 2);
        ctx.fill();

        // 오른쪽 눈
        ctx.beginPath();
        ctx.arc(eyeOffset, -eyeOffset, eyeSize, 0, Math.PI * 2);
        ctx.fill();

        // 미소
        ctx.strokeStyle = colors.mouth;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, eyeOffset * 0.5, size * 0.15, 0.2, Math.PI - 0.2);
        ctx.stroke();

        // 반짝임 효과 (초등학생을 위한 귀여운 효과)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(-eyeOffset * 0.5, -eyeOffset * 1.2, size * 0.08, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    render() {
        const ctx = this.ctx;
        const size = this.gameState.size;

        // 배경
        ctx.fillStyle = '#8B7355';
        ctx.fillRect(0, 0, this.boardSize, this.boardSize);

        // 그리드 그리기
        ctx.strokeStyle = '#6B5B4A';
        ctx.lineWidth = 2;

        for (let i = 0; i <= size; i++) {
            const pos = this.padding + i * this.cellSize;
            
            // 세로선
            ctx.beginPath();
            ctx.moveTo(pos, this.padding);
            ctx.lineTo(pos, this.boardSize - this.padding);
            ctx.stroke();

            // 가로선
            ctx.beginPath();
            ctx.moveTo(this.padding, pos);
            ctx.lineTo(this.boardSize - this.padding, pos);
            ctx.stroke();
        }

        // 유효한 이동 위치 하이라이트
        this.updateValidMoves();
        ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
        this.validMoves.forEach(move => {
            const x = this.padding + move.col * this.cellSize;
            const y = this.padding + move.row * this.cellSize;
            ctx.fillRect(x + 2, y + 2, this.cellSize - 4, this.cellSize - 4);
        });

        // 말 그리기
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                const player = this.gameState.board[i][j];
                if (player !== 0) {
                    const x = this.padding + j * this.cellSize + this.cellSize / 2;
                    const y = this.padding + i * this.cellSize + this.cellSize / 2;
                    this.drawPiece(ctx, x, y, this.cellSize * 0.8, player);
                }
            }
        }
    }
}

