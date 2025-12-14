// 간단한 AI 알고리즘 (초등학생 수준의 난이도)
class SimpleAI {
    constructor(difficulty = 'easy') {
        this.difficulty = difficulty;
    }

    // AI가 다음 수를 선택
    chooseMove(gameState) {
        const validMoves = gameState.getValidMoves(2); // AI는 플레이어 2

        if (validMoves.length === 0) {
            return null;
        }

        if (this.difficulty === 'easy') {
            // 쉬운 난이도: 랜덤 선택
            return validMoves[Math.floor(Math.random() * validMoves.length)];
        } else {
            // 보통 난이도: 평가 함수 사용
            return this.bestMove(gameState, validMoves);
        }
    }

    // 최선의 수 찾기 (간단한 휴리스틱)
    bestMove(gameState, validMoves) {
        let bestMove = null;
        let bestScore = -Infinity;

        for (const move of validMoves) {
            // 이 수를 뒀을 때의 상태 시뮬레이션
            const testState = gameState.clone();
            testState.makeMove(move.row, move.col, 2);

            // 점수 계산
            const score = this.evaluatePosition(testState, 2);

            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }

        return bestMove || validMoves[0];
    }

    // 위치 평가 함수
    evaluatePosition(gameState, player) {
        const opponent = player === 1 ? 2 : 1;
        const myPieces = gameState.getPieceCount(player);
        const opponentPieces = gameState.getPieceCount(opponent);

        // 기본 점수: 말 개수 차이
        let score = myPieces - opponentPieces;

        // 추가 전략: 중앙을 선호
        const center = Math.floor(gameState.size / 2);
        for (let i = 0; i < gameState.size; i++) {
            for (let j = 0; j < gameState.size; j++) {
                if (gameState.board[i][j] === player) {
                    const distFromCenter = Math.abs(i - center) + Math.abs(j - center);
                    score += (gameState.size - distFromCenter) * 0.1;
                }
            }
        }

        // 가능한 이동 수 고려
        const myMoves = gameState.getValidMoves(player).length;
        const opponentMoves = gameState.getValidMoves(opponent).length;
        score += (myMoves - opponentMoves) * 0.5;

        return score;
    }
}

