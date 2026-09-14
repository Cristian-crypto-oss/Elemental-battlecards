// Feature: backend-solid-refactor, Propiedad 6: credenciales inválidas — mensaje genérico
// Feature: backend-solid-refactor, Propiedad 7: registro válido produce token
// Validates: Requisitos 8.4, 7.1

import * as fc from 'fast-check';
import { AuthService, AuthError } from '../../services/AuthService';
import { JwtTokenService } from '../../services/JwtTokenService';
import { IUserRepository } from '../../interfaces/IUserRepository';
import { IHashService } from '../../interfaces/IHashService';
import { ITokenService } from '../../interfaces/ITokenService';
import { UserEntity } from '../../entities/UserEntity';
import { RegisterDto } from '../../dtos/RegisterDto';

// ---------------------------------------------------------------------------
// Shared test secret for JwtTokenService
// ---------------------------------------------------------------------------
const TEST_SECRET = 'test-secret-for-property-tests';

// ---------------------------------------------------------------------------
// Generator helpers
// ---------------------------------------------------------------------------

/** Generates a LoginDto with at least a username and a non-empty password. */
const loginDtoArb = fc.record({
  username: fc.string({ minLength: 1 }),
  password: fc.string({ minLength: 1 }),
});

/** Generates a RegisterDto with all three fields non-empty. */
const registerDtoArb = fc.record({
  username: fc.string({ minLength: 1 }),
  email: fc.string({ minLength: 1 }),
  password: fc.string({ minLength: 1 }),
});

// ---------------------------------------------------------------------------
// Helper factories
// ---------------------------------------------------------------------------

/** Creates an IUserRepository mock where every lookup returns null (user never exists). */
function makeEmptyRepository(): IUserRepository {
  return {
    findByEmail: jest.fn().mockResolvedValue(null),
    findByUsername: jest.fn().mockResolvedValue(null),
    create: jest.fn(),
  };
}

/**
 * Creates an IUserRepository mock that:
 * - returns null on lookups (no duplicates),
 * - persists the created user and returns it with id=1.
 */
function makeRegisterRepository(dto: RegisterDto): IUserRepository {
  return {
    findByEmail: jest.fn().mockResolvedValue(null),
    findByUsername: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockImplementation(async (data: RegisterDto) => {
      return new UserEntity(1, data.username, data.email, data.password);
    }),
  };
}

/** Creates an IHashService mock whose hash/compare do NOT validate passwords (for Propiedad 6). */
function makeRejectingHashService(): IHashService {
  return {
    hash: jest.fn().mockResolvedValue('hashed'),
    // compare always returns false — ensures isMatch is always false
    compare: jest.fn().mockResolvedValue(false),
  };
}

/**
 * Creates an IHashService mock that:
 * - hash: returns a deterministic fake hash.
 * - compare: not used during register flow.
 */
function makeHashServiceForRegister(): IHashService {
  return {
    hash: jest.fn().mockResolvedValue('hashed_password'),
    compare: jest.fn().mockResolvedValue(false),
  };
}

// ---------------------------------------------------------------------------
// Propiedad 6: Credenciales Inválidas — Mensaje Genérico
// ---------------------------------------------------------------------------

describe('AuthService — Propiedad 6: Credenciales Inválidas — Mensaje Genérico', () => {
  /**
   * Validates: Requisito 8.4
   *
   * Para todo LoginDto en el que el usuario no existe en el repositorio mock,
   * authService.login(dto) debe:
   *   1. Lanzar AuthError con statusCode === 401.
   *   2. El mensaje debe ser exactamente 'Credenciales inválidas.'.
   *   3. No debe modificar el estado del repositorio (create nunca se llama).
   */
  it('login with non-existent user always throws AuthError 401 with generic message', async () => {
    await fc.assert(
      fc.asyncProperty(loginDtoArb, async (dto) => {
        const repository = makeEmptyRepository();
        const hashService = makeRejectingHashService();
        const tokenService = new JwtTokenService(TEST_SECRET);
        const authService = new AuthService(repository, hashService, tokenService);

        let thrownError: unknown = null;

        try {
          await authService.login(dto);
        } catch (err) {
          thrownError = err;
        }

        // Must throw
        expect(thrownError).not.toBeNull();
        expect(thrownError).toBeInstanceOf(AuthError);

        const authErr = thrownError as AuthError;

        // Correct status code
        expect(authErr.statusCode).toBe(401);

        // Exact generic message — does not reveal whether user exists
        expect(authErr.message).toBe('Credenciales inválidas.');

        // Repository must not have been mutated (create was never called)
        expect((repository.create as jest.Mock).mock.calls).toHaveLength(0);
      }),
      { numRuns: 100 },
    );
  });
});

// ---------------------------------------------------------------------------
// Propiedad 7: Registro Válido Produce Token
// ---------------------------------------------------------------------------

describe('AuthService — Propiedad 7: Registro Válido Produce Token', () => {
  /**
   * Validates: Requisito 7.1
   *
   * Para todo RegisterDto con username, email y password no vacíos y sin
   * duplicados en el repositorio mock, authService.register(dto) debe:
   *   1. Devolver un AuthResponseDto cuyo campo `token` es verificable por
   *      tokenService.verify (i.e., el token fue firmado con el mismo secreto).
   *   2. Los campos user.username y user.email deben coincidir con el DTO de entrada.
   */
  it('register with valid dto returns verifiable token and matching user fields', async () => {
    const tokenService = new JwtTokenService(TEST_SECRET);

    await fc.assert(
      fc.asyncProperty(registerDtoArb, async (dto) => {
        const repository = makeRegisterRepository(dto);
        const hashService = makeHashServiceForRegister();
        const authService = new AuthService(repository, hashService, tokenService);

        const result = await authService.register(dto);

        // Token must be a non-empty string
        expect(typeof result.token).toBe('string');
        expect(result.token.length).toBeGreaterThan(0);

        // Token must be verifiable with the same secret
        const payload = tokenService.verify(result.token);
        expect(payload).toBeDefined();

        // user fields must match the input DTO
        expect(result.user.username).toBe(dto.username);
        expect(result.user.email).toBe(dto.email);

        // Verified payload must also carry the same username and email
        expect(payload.username).toBe(dto.username);
        expect(payload.email).toBe(dto.email);
      }),
      { numRuns: 100 },
    );
  });
});
