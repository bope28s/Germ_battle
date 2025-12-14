// 게임 클래스
class Game {
    constructor(size = 7) {
        this.size = size;
        this.board = Array(size).fill(0).map(() => Array(size).fill(0));
        this.currentPlayer = 1;
        this.gameOver = false;
        this.winner = null;
        this.renderer = null;
    }

    // 초기화
    initialize() {
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                this.board[i][j] = 0;
            }
        }
        
        // 초기 말 배치 (모서리)
        this.board[0][0] = 1;
        this.board[this.size - 1][this.size - 1] = 1;
        this.board[0][this.size - 1] = 2;
        this.board[this.size - 1][0] = 2;
        
        this.currentPlayer = 1;
        this.gameOver = false;
        this.winner = null;
    }

    reset() {
        this.initialize();
        if (this.renderer) {
            this.renderer.render();
        }
    }

    // 렌더러 초기화
    initRenderer(canvas, onCellClick) {
        this.renderer = new Renderer(canvas, this, onCellClick);
        this.initialize();
        this.renderer.render();
    }

    // 가능한 이동 찾기
    getValidMoves(player) {
        const moves = [];
        
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.board[i][j] === player) {
                    // 8방향 + 2칸 범위 검사
                    for (let di = -2; di <= 2; di++) {
                        for (let dj = -2; dj <= 2; dj++) {
                            if (di === 0 && dj === 0) continue;
                            
                            const ni = i + di;
                            const nj = j + dj;
                            
                            // 범위 체크
                            if (ni < 0 || ni >= this.size || nj < 0 || nj >= this.size) continue;
                            
                            // 빈 칸인지 체크
                            if (this.board[ni][nj] !== 0) continue;
                            
                            // 거리 체크 (Chebyshev distance)
                            const dist = Math.max(Math.abs(di), Math.abs(dj));
                            if (dist === 1 || dist === 2) {
                                if (!moves.find(m => m.row === ni && m.col === nj)) {
                                    moves.push({
                                        row: ni,
                                        col: nj,
                                        fromRow: i,
                                        fromCol: j,
                                        distance: dist
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

    // 수 두기
    makeMove(row, col) {
        const player = this.currentPlayer;
        
        if (this.gameOver) return false;
        if (this.board[row][col] !== 0) return false;
        
        const validMoves = this.getValidMoves(player);
        const move = validMoves.find(m => m.row === row && m.col === col);
        
        if (!move) return false;
        
        // 두 칸이면 원래 위치 제거
        if (move.distance === 2) {
            this.board[move.fromRow][move.fromCol] = 0;
        }
        
        // 말 놓기
        this.board[row][col] = player;
        
        // 주변 전염
        const directions = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
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
        
        // 게임 종료 체크
        this.checkGameOver();
        
        return true;
    }

    // 게임 종료 체크
    checkGameOver() {
        const p1Moves = this.getValidMoves(1);
        const p2Moves = this.getValidMoves(2);
        
        if (p1Moves.length === 0 && p2Moves.length === 0) {
            this.endGame();
        } else if (p1Moves.length === 0 || p2Moves.length === 0) {
            // 한 쪽만 둘 곳이 없으면 나머지 칸 채우기
            const winner = p1Moves.length === 0 ? 2 : 1;
            for (let i = 0; i < this.size; i++) {
                for (let j = 0; j < this.size; j++) {
                    if (this.board[i][j] === 0) {
                        this.board[i][j] = winner;
                    }
                }
            }
            this.endGame();
        }
    }

    endGame() {
        this.gameOver = true;
        const p1Count = this.getCount(1);
        const p2Count = this.getCount(2);
        
        if (p1Count > p2Count) {
            this.winner = 1;
        } else if (p2Count > p1Count) {
            this.winner = 2;
        } else {
            this.winner = 0;
        }
    }

    // 개수 세기
    getCount(player) {
        let count = 0;
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.board[i][j] === player) count++;
            }
        }
        return count;
    }

    // 게터
    getCurrentPlayer() {
        return this.currentPlayer;
    }

    isGameOver() {
        return this.gameOver;
    }

    getWinner() {
        return this.winner;
    }
}

// 렌더러 클래스
class Renderer {
    constructor(canvas, game, onCellClick) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.game = game;
        this.onCellClick = onCellClick;
        this.padding = 10;
        this.setupCanvas();
        this.setupEvents();
    }

    setupCanvas() {
        const container = this.canvas.parentElement;
        if (!container) return;
        
        const containerWidth = container.clientWidth || window.innerWidth - 40;
        const containerHeight = container.clientHeight || window.innerHeight - 300;
        const windowWidth = window.innerWidth || 400;
        
        const availableSize = Math.min(containerWidth - 32, containerHeight, windowWidth - 40, 500);
        const boardSize = Math.max(280, availableSize);
        
        // 고해상도 디스플레이를 위한 DPR 조정
        const dpr = window.devicePixelRatio || 1;
        
        this.canvas.width = boardSize * dpr;
        this.canvas.height = boardSize * dpr;
        this.canvas.style.width = boardSize + 'px';
        this.canvas.style.height = boardSize + 'px';
        
        const ctx = this.canvas.getContext('2d');
        ctx.scale(dpr, dpr);
        
        this.cellSize = (boardSize - this.padding * 2) / this.game.size;
        this.boardSize = boardSize;
    }

    setupEvents() {
        // 클릭 이벤트
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const col = Math.floor((x - this.padding) / this.cellSize);
            const row = Math.floor((y - this.padding) / this.cellSize);
            
            if (row >= 0 && row < this.game.size && col >= 0 && col < this.game.size) {
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
            
            if (row >= 0 && row < this.game.size && col >= 0 && col < this.game.size) {
                this.onCellClick(row, col);
            }
        });

        // 리사이즈 이벤트
        const resizeHandler = () => {
            this.setupCanvas();
            this.render();
        };
        window.addEventListener('resize', resizeHandler);
    }

    render() {
        if (!this.ctx || !this.game) return;
        
        const ctx = this.ctx;
        const size = this.game.size;
        
        // 캔버스 클리어
        ctx.clearRect(0, 0, this.boardSize, this.boardSize);
        
        // 배경
        ctx.fillStyle = '#8B7355';
        ctx.fillRect(0, 0, this.boardSize, this.boardSize);
        
        // 그리드
        ctx.strokeStyle = '#6B5B4A';
        ctx.lineWidth = 2;
        
        for (let i = 0; i <= size; i++) {
            const pos = this.padding + i * this.cellSize;
            ctx.beginPath();
            ctx.moveTo(pos, this.padding);
            ctx.lineTo(pos, this.boardSize - this.padding);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(this.padding, pos);
            ctx.lineTo(this.boardSize - this.padding, pos);
            ctx.stroke();
        }
        
        // 유효한 이동 표시
        if (!this.game.gameOver) {
            const moves = this.game.getValidMoves(this.game.currentPlayer);
            ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
            moves.forEach(move => {
                const x = this.padding + move.col * this.cellSize + 2;
                const y = this.padding + move.row * this.cellSize + 2;
                ctx.fillRect(x, y, this.cellSize - 4, this.cellSize - 4);
            });
        }
        
        // 말 그리기
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                const player = this.game.board[i][j];
                if (player !== 0) {
                    const x = this.padding + j * this.cellSize + this.cellSize / 2;
                    const y = this.padding + i * this.cellSize + this.cellSize / 2;
                    this.drawPiece(ctx, x, y, this.cellSize * 0.75, player);
                }
            }
        }
    }

    drawPiece(ctx, x, y, size, player) {
        ctx.save();
        ctx.translate(x, y);
        
        const colors = player === 1 
            ? { main: '#4CAF50', light: '#81C784', dark: '#2E7D32' }
            : { main: '#F44336', light: '#EF5350', dark: '#C62828' };
        
        // 그라데이션
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.5);
        gradient.addColorStop(0, colors.light);
        gradient.addColorStop(1, colors.main);
        
        // 몸체
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.4, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = colors.dark;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // 얼굴
        const eyeSize = size * 0.1;
        const eyeOffset = size * 0.15;
        
        // 눈
        ctx.fillStyle = colors.dark;
        ctx.beginPath();
        ctx.arc(-eyeOffset, -eyeOffset, eyeSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(eyeOffset, -eyeOffset, eyeSize, 0, Math.PI * 2);
        ctx.fill();
        
        // 미소
        ctx.strokeStyle = colors.dark;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, eyeOffset * 0.5, size * 0.15, 0.2, Math.PI - 0.2);
        ctx.stroke();
        
        // 하이라이트
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.arc(-eyeOffset * 0.5, -eyeOffset * 1.2, size * 0.08, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}
