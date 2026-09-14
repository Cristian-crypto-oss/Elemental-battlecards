// Feature: backend-solid-refactor, Propiedad 5: alternancia de turno
import * as fc from 'fast-check';
import { GameEventHandler } from '../../socket/GameEventHandler';
import { RoomMap, Room } from '../../socket/BaseEventHandler';
import { Server, Socket } from 'socket.io';

/**
 * Validates: Requisitos 10.2
 *
 * Para todo N ≥ 1, tras N llamadas a `end_turn`, el valor de `currentTurn`
 * alterna estrictamente entre 'host' y 'guest' en cada llamada, y
 * `turnNumber` debe incrementarse exactamente en 1 por llamada (valor final = N).
 */

/** Builds a minimal mock of socket.io Server whose to().emit() is a no-op. */
function buildMockIo(): Server {
  const mockEmit = jest.fn();
  const mockTo = jest.fn().mockReturnValue({ emit: mockEmit });
  return { to: mockTo } as unknown as Server;
}

/**
 * Builds a mock Socket that records event handlers via `socket.on`.
 * Returns both the mock socket and an accessor for registered handlers.
 */
function buildMockSocket(roomCode: string, initialRole: 'host' | 'guest') {
  const handlers: Record<string, (...args: unknown[]) => void> = {};

  const extSocket = {
    roomCode,
    playerRole: initialRole as 'host' | 'guest',
    on: (event: string, handler: (...args: unknown[]) => void) => {
      handlers[event] = handler;
    },
    to: jest.fn().mockReturnValue({ emit: jest.fn() }),
  } as unknown as Socket & { roomCode: string; playerRole: 'host' | 'guest' };

  return { socket: extSocket, handlers };
}

/** Creates a fresh room with two players, starting at host's turn, turnNumber = 0. */
function buildRoomMap(code: string): RoomMap {
  const rooms: RoomMap = new Map();
  const room: Room = {
    players: [
      { socketId: 'socket-host', role: 'host' },
      { socketId: 'socket-guest', role: 'guest' },
    ],
    gameState: { currentTurn: 'host', turnNumber: 0 },
    createdAt: Date.now(),
  };
  rooms.set(code, room);
  return rooms;
}

describe('GameEventHandler — Propiedad 5: Alternancia de Turno', () => {
  it('currentTurn alternates strictly and turnNumber equals N after N end_turn calls', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 200 }),
        (n) => {
          const ROOM_CODE = '123456';

          // Fresh state for each run
          const rooms = buildRoomMap(ROOM_CODE);
          const room = rooms.get(ROOM_CODE)!;
          const io = buildMockIo();
          const handler = new GameEventHandler(io, rooms);

          // Build a socket whose playerRole we can mutate between calls
          const { socket, handlers } = buildMockSocket(ROOM_CODE, 'host');
          handler.registerEvents(socket);

          const endTurnHandler = handlers['end_turn'];
          expect(endTurnHandler).toBeDefined();

          // Expected sequence: after call k, currentTurn = k % 2 === 1 ? 'guest' : 'host'
          // (because we always set playerRole = current turn owner before calling end_turn)
          for (let k = 1; k <= n; k++) {
            const ownerBeforeCall: 'host' | 'guest' = (k - 1) % 2 === 0 ? 'host' : 'guest';
            const expectedAfterCall: 'host' | 'guest' = ownerBeforeCall === 'host' ? 'guest' : 'host';

            // The socket belongs to the current turn owner
            (socket as Socket & { playerRole: 'host' | 'guest' }).playerRole = ownerBeforeCall;

            endTurnHandler();

            // Strict alternation: currentTurn must equal expected value
            if (room.gameState.currentTurn !== expectedAfterCall) return false;

            // turnNumber must have been incremented to k
            if (room.gameState.turnNumber !== k) return false;
          }

          return true;
        },
      ),
      { numRuns: 100 },
    );
  });

  it('turnNumber equals N after any N end_turn calls regardless of starting role', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 200 }),
        fc.constantFrom<'host' | 'guest'>('host', 'guest'),
        (n, startingRole) => {
          const ROOM_CODE = '654321';

          const rooms = buildRoomMap(ROOM_CODE);
          const room = rooms.get(ROOM_CODE)!;
          // Override starting turn to match the starting role
          room.gameState.currentTurn = startingRole;

          const io = buildMockIo();
          const handler = new GameEventHandler(io, rooms);
          const { socket, handlers } = buildMockSocket(ROOM_CODE, startingRole);
          handler.registerEvents(socket);

          const endTurnHandler = handlers['end_turn'];

          let currentRole = startingRole;
          for (let k = 1; k <= n; k++) {
            (socket as Socket & { playerRole: 'host' | 'guest' }).playerRole = currentRole;
            endTurnHandler();
            currentRole = currentRole === 'host' ? 'guest' : 'host';
          }

          return room.gameState.turnNumber === n;
        },
      ),
      { numRuns: 100 },
    );
  });
});
