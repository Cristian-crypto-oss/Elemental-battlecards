"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseEventHandler = void 0;
class BaseEventHandler {
    constructor(io, rooms) {
        this.io = io;
        this.rooms = rooms;
    }
    /** Emite un evento a todos los sockets de una sala. */
    emitToRoom(code, event, data) {
        this.io.to(code).emit(event, data);
    }
    /** Devuelve la sala si existe, o null en caso contrario. */
    getRoomOrFail(code) {
        return this.rooms.get(code) ?? null;
    }
}
exports.BaseEventHandler = BaseEventHandler;
//# sourceMappingURL=BaseEventHandler.js.map