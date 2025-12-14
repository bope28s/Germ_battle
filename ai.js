// AI 클래스
class AI {
    constructor() {
        this.difficulty = 'easy';
    }

    getMove(game) {
        const validMoves = game.getValidMoves(2);
        if (validMoves.length === 0) return null;
        
        if (this.difficulty === 'easy') {
            // 랜덤 선택
            return validMoves[Math.floor(Math.random() * validMoves.length)];
        } else {
            // 최선의 수 선택
            return this.findBestMove(game, validMoves);
        }
    }

    findBestMove(game, moves) {
        let bestMove = null;
        let bestScore = -Infinity;
        
        for (const move of moves) {
            // 임시 게임 상태 생성
            const testGame = this.cloneGame(game);
            testGame.makeMove(move.row, move.col);
            
            const score = this.evaluate(testGame, 2);
            
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }
        
        return bestMove || moves[0];
    }

    evaluate(game, player) {
        const opponent = player === 1 ? 2 : 1;
        const myCount = game.getCount(player);
        const oppCount = game.getCount(opponent);
        
        // 기본 점수: 말 개수 차이
        let score = myCount - oppCount;
        
        // 중앙 선호
        const center = Math.floor(game.size / 2);
        for (let i = 0; i < game.size; i++) {
            for (let j = 0; j < game.size; j++) {
                if (game.board[i][j] === player) {
                    const dist = Math.abs(i - center) + Math.abs(j - center);
                    score += (game.size - dist) * 0.1;
                }
            }
        }
        
        // 이동 가능 수 고려
        const myMoves = game.getValidMoves(player).length;
        const oppMoves = game.getValidMoves(opponent).length;
        score += (myMoves - oppMoves) * 0.5;
        
        return score;
    }

    cloneGame(game) {
        const clone = new Game(game.size);
        clone.board = game.board.map(row => [...row]);
        clone.currentPlayer = game.currentPlayer;
        clone.gameOver = game.gameOver;
        clone.winner = game.winner;
        return clone;
    }
}
