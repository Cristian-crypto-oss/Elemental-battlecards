// src/socket/GameEventHandler.ts
import { Socket } from 'socket.io';
import { BaseEventHandler } from './BaseEventHandler';

export class GameEventHandler extends BaseEventHandler {
  registerEvents(socket: Socket): void {
    const extSocket = socket as Socket & { roomCode?: string; playerRole?: string };

    socket.on('game_event', (payload: unknown) => {
      const code = extSocket.roomCode;
      if (!code || !this.getRoomOrFail(code)) return;
      socket.to(code).emit('game_event', payload);
    });

    socket.on('end_turn', () => {
      const code = extSocket.roomCode;
      const room = code ? this.getRoomOrFail(code) : null;
      if (!room) return;

      const currentRole = extSocket.playerRole as 'host' | 'guest';
      room.gameState.currentTurn = currentRole === 'host' ? 'guest' : 'host';
      room.gameState.turnNumber += 1;

      this.emitToRoom(code!, 'turn_changed', {
        currentTurn: room.gameState.currentTurn,
        turnNumber: room.gameState.turnNumber,
      });
    });
  }
}
