"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameEventHandler = void 0;
const BaseEventHandler_1 = require("./BaseEventHandler");
class GameEventHandler extends BaseEventHandler_1.BaseEventHandler {
    registerEvents(socket) {
        const extSocket = socket;
        socket.on('game_event', (payload) => {
            const code = extSocket.roomCode;
            if (!code || !this.getRoomOrFail(code))
                return;
            socket.to(code).emit('game_event', payload);
        });
        socket.on('end_turn', () => {
            const code = extSocket.roomCode;
            const room = code ? this.getRoomOrFail(code) : null;
            if (!room)
                return;
            const currentRole = extSocket.playerRole;
            room.gameState.currentTurn = currentRole === 'host' ? 'guest' : 'host';
            room.gameState.turnNumber += 1;
            this.emitToRoom(code, 'turn_changed', {
                currentTurn: room.gameState.currentTurn,
                turnNumber: room.gameState.turnNumber,
            });
        });
    }
}
exports.GameEventHandler = GameEventHandler;
//# sourceMappingURL=GameEventHandler.js.map