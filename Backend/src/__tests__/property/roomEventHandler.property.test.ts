// Feature: backend-solid-refactor, Propiedad 3: unicidad y formato de códigos de sala
// Feature: backend-solid-refactor, Propiedad 4: invariante de capacidad de sala
// Validates: Requirements 9.1, 9.4

import * as fc from 'fast-check';
import { EventEmitter } from 'events';
import { RoomEventHandler } from '../../socket/RoomEventHandler';
import { RoomMap } from '../../socket/BaseEventHandler';

// ---------------------------------------------------------------------------
// Minimal mocks for Socket.IO Server and Socket
// ---------------------------------------------------------------------------

/** Creates a fake Socket.IO Server whose `to().emit` is a jest no-op. */
function makeFakeIo() {
  return {
    to: jest.fn().mockReturnValue({ emit: jest.fn() }),
  } as unknown as import('socket.io').Server;
}

/**
 * Creates a fake Socket that:
 *   - extends EventEmitter so we can call socket.emit('create_room', cb)
 *   - exposes a stable `id`
 *   - has a no-op `join()`
 */
function makeFakeSocket(id: string): import('socket.io').Socket & { roomCode?: string; playerRole?: string } {
  const emitter = new EventEmitter() as EventEmitter & {
    id: string;
    join: jest.Mock;
    roomCode?: string;
    playerRole?: string;
  };
  emitter.id = id;
  emitter.join = jest.fn();
  // Socket.IO uses `.on` which EventEmitter already provides.
  return emitter as unknown as import('socket.io').Socket & { roomCode?: string; playerRole?: string };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Registers a RoomEventHandler on `socket` (invoking `registerEvents`) and
 * triggers `create_room`, collecting the callback response.
 */
function createRoom(
  handler: RoomEventHandler,
  socket: ReturnType<typeof makeFakeSocket>,
): Promise<{ success: boolean; code: string; role: string }> {
  return new Promise((resolve) => {
    handler.registerEvents(socket);
    (socket as unknown as EventEmitter).emit('create_room', resolve);
  });
}

/**
 * Triggers `join_room` on a socket that already has events registered,
 * collecting the callback response.
 */
function joinRoom(
  socket: ReturnType<typeof makeFakeSocket>,
  code: string,
): Promise<{ success: boolean; message?: string }> {
  return new Promise((resolve) => {
    (socket as unknown as EventEmitter).emit('join_room', { code }, resolve);
  });
}

// ---------------------------------------------------------------------------
// Propiedad 3: Unicidad y Formato de Códigos de Sala
// ---------------------------------------------------------------------------

/**
 * Propiedad 3: Tras N llamadas a `create_room` (N entre 1 y 50):
 *   1. El mapa contiene exactamente N entradas.
 *   2. Todos los códigos son distintos entre sí.
 *   3. Cada código cumple `/^\d{6}$/`.
 */
describe('RoomEventHandler — Propiedad 3: Unicidad y Formato de Códigos de Sala', () => {
  it('N create_room calls produce exactly N unique 6-digit codes', async () => {
    await fc.assert(
      fc.asyncProperty(fc.integer({ min: 1, max: 50 }), async (n) => {
        const rooms: RoomMap = new Map();
        const io = makeFakeIo();
        const handler = new RoomEventHandler(io, rooms);

        // Each create_room uses its own socket (different socket IDs).
        const responses: Array<{ success: boolean; code: string; role: string }> = [];
        for (let i = 0; i < n; i++) {
          const socket = makeFakeSocket(`socket-${i}`);
          const response = await createRoom(handler, socket);
          responses.push(response as { success: boolean; code: string; role: string });
        }

        // 1. Map has exactly N rooms.
        expect(rooms.size).toBe(n);

        // 2. All codes are unique.
        const codes = responses.map((r) => r.code);
        const uniqueCodes = new Set(codes);
        expect(uniqueCodes.size).toBe(n);

        // 3. Every code matches /^\d{6}$/.
        const sixDigit = /^\d{6}$/;
        for (const code of codes) {
          expect(code).toMatch(sixDigit);
        }
      }),
      { numRuns: 100 },
    );
  });
});

// ---------------------------------------------------------------------------
// Propiedad 4: Invariante de Capacidad de Sala
// ---------------------------------------------------------------------------

/**
 * Propiedad 4: Para toda sala ya creada con 2 jugadores, cualquier intento
 * adicional de `join_room` debe:
 *   1. Recibir `{ success: false, message: 'Sala llena.' }`.
 *   2. Dejar `players.length` igual a 2 sin importar cuántos intentos se hagan (entre 1 y 20).
 */
describe('RoomEventHandler — Propiedad 4: Invariante de Capacidad de Sala', () => {
  it('extra join_room attempts on a full room are rejected and room stays at 2 players', async () => {
    await fc.assert(
      fc.asyncProperty(fc.integer({ min: 1, max: 20 }), async (extraAttempts) => {
        const rooms: RoomMap = new Map();
        const io = makeFakeIo();
        const handler = new RoomEventHandler(io, rooms);

        // --- Create the room (host socket) ---
        const hostSocket = makeFakeSocket('host-socket');
        const createResponse = await createRoom(handler, hostSocket);
        const roomCode = (createResponse as { code: string }).code;

        // --- First guest joins successfully ---
        const guestSocket = makeFakeSocket('guest-socket');
        handler.registerEvents(guestSocket);
        const joinResponse = await joinRoom(guestSocket, roomCode);
        expect(joinResponse.success).toBe(true);

        // Sanity check: room is now full.
        expect(rooms.get(roomCode)!.players.length).toBe(2);

        // --- Extra attempts must all be rejected ---
        for (let i = 0; i < extraAttempts; i++) {
          const lateSocket = makeFakeSocket(`late-socket-${i}`);
          handler.registerEvents(lateSocket);
          const late = await joinRoom(lateSocket, roomCode);

          expect(late.success).toBe(false);
          expect((late as { message?: string }).message).toBe('Sala llena.');
          // Room capacity remains exactly 2.
          expect(rooms.get(roomCode)!.players.length).toBe(2);
        }
      }),
      { numRuns: 100 },
    );
  });
});
