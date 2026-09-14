// Feature: backend-solid-refactor, Propiedad 2: round-trip firma/verificación JWT
import * as fc from 'fast-check';
import { JwtTokenService } from '../../services/JwtTokenService';
import { TokenPayload } from '../../interfaces/ITokenService';

const TEST_SECRET = 'test-secret-for-property-tests';

describe('JwtTokenService — Propiedad 2: Round-Trip Firma/Verificación JWT', () => {
  /**
   * Validates: Requisitos 7.6, 8.5
   *
   * Para todo payload { id, username, email } con valores no vacíos,
   * verify(sign(payload)) debe devolver un objeto que contenga los mismos
   * valores de id, username y email que el payload original.
   */
  it('verify(sign(payload)) preserves id, username and email for all valid payloads', () => {
    const tokenService = new JwtTokenService(TEST_SECRET);

    fc.assert(
      fc.property(
        fc.record<TokenPayload>({
          id: fc.integer(),
          username: fc.string({ minLength: 1 }),
          email: fc.string({ minLength: 1 }),
        }),
        (payload) => {
          const token = tokenService.sign(payload);
          const recovered = tokenService.verify(token);

          return (
            recovered.id === payload.id &&
            recovered.username === payload.username &&
            recovered.email === payload.email
          );
        },
      ),
      { numRuns: 100 },
    );
  });

  it('sign produces a non-empty string token for all valid payloads', () => {
    const tokenService = new JwtTokenService(TEST_SECRET);

    fc.assert(
      fc.property(
        fc.record<TokenPayload>({
          id: fc.integer(),
          username: fc.string({ minLength: 1 }),
          email: fc.string({ minLength: 1 }),
        }),
        (payload) => {
          const token = tokenService.sign(payload);
          return typeof token === 'string' && token.length > 0;
        },
      ),
      { numRuns: 100 },
    );
  });
});
