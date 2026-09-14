// Feature: backend-solid-refactor, Propiedad 1: round-trip hash/verify
// Validates: Requirements 7.5

import * as fc from 'fast-check';
import { BcryptHashService } from '../../services/BcryptHashService';

/**
 * Propiedad 1: Round-Trip Hash/Verify
 *
 * Para todo string no vacío `plain`:
 *   1. hash(plain) nunca debe igualar plain (la contraseña nunca se almacena en texto plano).
 *   2. compare(plain, hash(plain)) debe devolver true (el hash es verificable con el original).
 */
describe('BcryptHashService — Propiedad 1: Round-Trip Hash/Verify', () => {
  // Use saltRounds=4 to keep property runs fast while still exercising real bcrypt.
  const hashService = new BcryptHashService(4);

  it('round-trip hash/verify holds for all non-empty strings', async () => {
    await fc.assert(
      fc.asyncProperty(fc.string({ minLength: 1 }), async (plain) => {
        const hashed = await hashService.hash(plain);
        expect(hashed).not.toBe(plain);
        expect(await hashService.compare(plain, hashed)).toBe(true);
      }),
      { numRuns: 100 },
    );
  });
});
