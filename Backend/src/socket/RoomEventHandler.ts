// src/socket/RoomEventHandler.ts
import { Socket } from 'socket.io';
import { BaseEventHandler } from './BaseEventHandler';

export class RoomEventHandler extends BaseEventHandler {
  private generateCode(): string {
    let code: string;
    do {
      code = Math.floor(100000 + Math.random() * 900000).toString();
    } while (this.rooms.has(code));
    return code;
  }

  registerEvents(socket: Socket): void {
    socket.on('create_room', (cb?: (res: unknown) => void) => {
      const code = this.generateCode();
      this.rooms.set(code, {
        players: [{ socketId: socket.id, role: 'host' }],
        gameState: { currentTurn: 'host', turnNumber: 0 },
        createdAt: Date.now(),
      });
      socket.join(code);
      (socket as Socket & { roomCode?: string; playerRole?: string }).roomCode = code;
      (socket as Socket & { roomCode?: string; playerRole?: string }).playerRole = 'host';

      console.log(`✅ Sala creada ${code} por ${socket.id} (host)`);
      if (typeof cb === 'function') cb({ success: true, code, role: 'host' });
      this.emitToRoom(code, 'room_created', { code });
    });

    socket.on('join_room', (data: { code?: string }, cb?: (res: unknown) => void) => {
      const code = data?.code?.toString().replace(/\s+/g, '') ?? '';
      const room = this.getRoomOrFail(code);

      if (!room) {
        if (typeof cb === 'function') cb({ success: false, message: 'Sala no encontrada.' });
        return;
      }
      if (room.players.length >= 2) {
        if (typeof cb === 'function') cb({ success: false, message: 'Sala llena.' });
        return;
      }

      room.players.push({ socketId: socket.id, role: 'guest' });
      socket.join(code);
      (socket as Socket & { roomCode?: string; playerRole?: string }).roomCode = code;
      (socket as Socket & { roomCode?: string; playerRole?: string }).playerRole = 'guest';

      if (typeof cb === 'function') cb({ success: true, code, role: 'guest' });
      this.emitToRoom(code, 'player_joined', {
        players: room.players.length,
        canStart: room.players.length === 2,
      });

      if (room.players.length === 2) {
        this.emitToRoom(code, 'game_start', {
          currentTurn: 'host',
          hostId: room.players[0].socketId,
          guestId: room.players[1].socketId,
        });
      }
    });

    socket.on('disconnect', () => {
      const extSocket = socket as Socket & { roomCode?: string };
      const code = extSocket.roomCode;
      if (!code) return;
      const room = this.getRoomOrFail(code);
      if (!room) return;

      room.players = room.players.filter((p) => p.socketId !== socket.id);
      if (room.players.length === 0) {
        this.rooms.delete(code);
        console.log(`Sala ${code} eliminada (vacía)`);
      } else {
        this.emitToRoom(code, 'player_left', {});
      }
    });
  }
}
