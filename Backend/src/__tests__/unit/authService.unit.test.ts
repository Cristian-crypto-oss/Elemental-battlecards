// src/__tests__/unit/authService.unit.test.ts
// Validates: Requirements 7.2–7.4, 8.2–8.4

import { AuthService, AuthError } from '../../services/AuthService';
import { IUserRepository } from '../../interfaces/IUserRepository';
import { IHashService } from '../../interfaces/IHashService';
import { ITokenService } from '../../interfaces/ITokenService';
import { UserEntity } from '../../entities/UserEntity';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeUser(overrides: Partial<{ id: number; username: string; email: string; passwordHash: string }> = {}): UserEntity {
  return new UserEntity(
    overrides.id ?? 1,
    overrides.username ?? 'testuser',
    overrides.email ?? 'test@example.com',
    overrides.passwordHash ?? 'hashed_password',
  );
}

function makeMocks() {
  const repository: jest.Mocked<IUserRepository> = {
    findByEmail: jest.fn(),
    findByUsername: jest.fn(),
    create: jest.fn(),
  };

  const hashService: jest.Mocked<IHashService> = {
    hash: jest.fn(),
    compare: jest.fn(),
  };

  const tokenService: jest.Mocked<ITokenService> = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const authService = new AuthService(repository, hashService, tokenService);

  return { repository, hashService, tokenService, authService };
}

// ---------------------------------------------------------------------------
// register() tests
// ---------------------------------------------------------------------------

describe('AuthService.register()', () => {
  describe('field validation — missing fields throw AuthError 400', () => {
    it('missing username → AuthError with statusCode 400', async () => {
      const { authService } = makeMocks();
      await expect(
        authService.register({ username: '', email: 'a@b.com', password: 'pass123' }),
      ).rejects.toMatchObject({ name: 'AuthError', statusCode: 400 });
    });

    it('missing email → AuthError with statusCode 400', async () => {
      const { authService } = makeMocks();
      await expect(
        authService.register({ username: 'user', email: '', password: 'pass123' }),
      ).rejects.toMatchObject({ name: 'AuthError', statusCode: 400 });
    });

    it('missing password → AuthError with statusCode 400', async () => {
      const { authService } = makeMocks();
      await expect(
        authService.register({ username: 'user', email: 'a@b.com', password: '' }),
      ).rejects.toMatchObject({ name: 'AuthError', statusCode: 400 });
    });
  });

  describe('duplicate detection', () => {
    it('duplicate email → AuthError 409 "El correo electrónico ya está en uso."', async () => {
      const { repository, authService } = makeMocks();
      repository.findByEmail.mockResolvedValueOnce(makeUser());
      repository.findByUsername.mockResolvedValue(null);

      await expect(
        authService.register({ username: 'user', email: 'dup@example.com', password: 'pass123' }),
      ).rejects.toMatchObject({
        name: 'AuthError',
        statusCode: 409,
        message: 'El correo electrónico ya está en uso.',
      });
    });

    it('duplicate username → AuthError 409 "El nombre de usuario ya está en uso."', async () => {
      const { repository, authService } = makeMocks();
      repository.findByEmail.mockResolvedValueOnce(null);
      repository.findByUsername.mockResolvedValueOnce(makeUser());

      await expect(
        authService.register({ username: 'dupuser', email: 'new@example.com', password: 'pass123' }),
      ).rejects.toMatchObject({
        name: 'AuthError',
        statusCode: 409,
        message: 'El nombre de usuario ya está en uso.',
      });
    });
  });

  describe('successful registration', () => {
    it('valid registration → returns AuthResponseDto with token and user', async () => {
      const { repository, hashService, tokenService, authService } = makeMocks();

      repository.findByEmail.mockResolvedValueOnce(null);
      repository.findByUsername.mockResolvedValueOnce(null);
      hashService.hash.mockResolvedValueOnce('hashed_pw');
      repository.create.mockResolvedValueOnce(makeUser({ id: 42 }));
      tokenService.sign.mockReturnValueOnce('signed.jwt.token');

      const result = await authService.register({
        username: 'newuser',
        email: 'new@example.com',
        password: 'secret123',
      });

      expect(result).toMatchObject({
        token: 'signed.jwt.token',
        user: {
          id: 42,
          username: 'testuser',
          email: 'test@example.com',
        },
      });
      expect(result.message).toBe('Usuario registrado exitosamente.');
    });
  });
});

// ---------------------------------------------------------------------------
// login() tests
// ---------------------------------------------------------------------------

describe('AuthService.login()', () => {
  describe('field validation', () => {
    it('no username and no email → AuthError 400 "Proporciona username o email."', async () => {
      const { authService } = makeMocks();
      await expect(
        authService.login({ password: 'pass123' }),
      ).rejects.toMatchObject({
        name: 'AuthError',
        statusCode: 400,
        message: 'Proporciona username o email.',
      });
    });

    it('no password → AuthError 400 "La contraseña es obligatoria."', async () => {
      const { authService } = makeMocks();
      await expect(
        authService.login({ username: 'user', password: '' }),
      ).rejects.toMatchObject({
        name: 'AuthError',
        statusCode: 400,
        message: 'La contraseña es obligatoria.',
      });
    });
  });

  describe('invalid credentials', () => {
    it('user not found → AuthError 401 "Credenciales inválidas."', async () => {
      const { repository, hashService, authService } = makeMocks();
      repository.findByUsername.mockResolvedValueOnce(null);
      // hashService.compare should not be called, but isMatch = false by default
      hashService.compare.mockResolvedValue(false);

      await expect(
        authService.login({ username: 'ghost', password: 'irrelevant' }),
      ).rejects.toMatchObject({
        name: 'AuthError',
        statusCode: 401,
        message: 'Credenciales inválidas.',
      });
    });

    it('wrong password → AuthError 401 "Credenciales inválidas."', async () => {
      const { repository, hashService, authService } = makeMocks();
      repository.findByUsername.mockResolvedValueOnce(makeUser());
      hashService.compare.mockResolvedValueOnce(false);

      await expect(
        authService.login({ username: 'testuser', password: 'wrongpass' }),
      ).rejects.toMatchObject({
        name: 'AuthError',
        statusCode: 401,
        message: 'Credenciales inválidas.',
      });
    });
  });

  describe('successful login', () => {
    it('valid login → returns AuthResponseDto with token and user', async () => {
      const { repository, hashService, tokenService, authService } = makeMocks();

      repository.findByUsername.mockResolvedValueOnce(makeUser({ id: 7 }));
      hashService.compare.mockResolvedValueOnce(true);
      tokenService.sign.mockReturnValueOnce('login.jwt.token');

      const result = await authService.login({ username: 'testuser', password: 'correctpass' });

      expect(result).toMatchObject({
        token: 'login.jwt.token',
        user: {
          id: 7,
          username: 'testuser',
          email: 'test@example.com',
        },
      });
    });
  });
});
