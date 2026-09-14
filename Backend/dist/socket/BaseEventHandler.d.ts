import { Server, Socket } from 'socket.io';
export interface Player {
    socketId: string;
    role: 'host' | 'guest';
}
export interface GameState {
    currentTurn: 'host' | 'guest';
    turnNumber: number;
}
export interface Room {
    players: Player[];
    gameState: GameState;
    createdAt: number;
}
export type RoomMap = Map<string, Room>;
export declare abstract class BaseEventHandler {
    protected readonly io: Server;
    protected readonly rooms: RoomMap;
    constructor(io: Server, rooms: RoomMap);
    /** Cada subclase registra sus propios eventos sobre el socket conectado. */
    abstract registerEvents(socket: Socket): void;
    /** Emite un evento a todos los sockets de una sala. */
    protected emitToRoom(code: string, event: string, data: unknown): void;
    /** Devuelve la sala si existe, o null en caso contrario. */
    protected getRoomOrFail(code: string): Room | null;
}
//# sourceMappingURL=BaseEventHandler.d.ts.map