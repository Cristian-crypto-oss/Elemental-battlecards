// src/__tests__/unit/loginController.unit.test.ts
// Validates: Requirements 1.3

import { Request, Response } from 'express';
import { LoginController } from '../../controllers/LoginController';
import { IAuthService } from '../../interfaces/IAuthService';
import { AuthError } from '../../services/AuthService';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeMockRes() {
  const mockJson = jest.fn();
  const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
  const mockRes = { status: mockStatus, json: mockJson } as unknown as Response;
  return { mockRes, mockStatus, mockJson };
}

function makeMockService(): jest.Mocked<IAuthService> {
  return {
    register: jest.fn(),
    login: jest.fn(),
  };
}

// ---------------------------------------------------------------------------
// LoginController.handle() tests
// ---------------------------------------------------------------------------

describe('LoginController.handle()', () => {
  it('successful login → res.status(200).json(result)', async () => {
    const mockReq = { body: { username: 'user', password: 'pass123' } } as Request;
    const { mockRes, mockStatus, mockJson } = makeMockRes();
    const authService = makeMockService();

    const expectedResult = {
      token: 'login.jwt.token',
      user: { id: 1, username: 'user', email: 'a@b.com' },
    };
    authService.login.mockResolvedValueOnce(expectedResult);

    const controller = new LoginController(authService);
    await controller.handle(mockReq, mockRes);

    expect(authService.login).toHaveBeenCalledWith(mockReq.body);
    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(mockStatus(200).json).toHaveBeenCalledWith(expectedResult);
  });

  it('AuthError 400 (missing username and email) → res.status(400).json({ message })', async () => {
    const mockReq = { body: { password: 'pass123' } } as Request;
    const { mockRes, mockStatus, mockJson } = makeMockRes();
    const authService = makeMockService();

    authService.login.mockRejectedValueOnce(
      new AuthError('Proporciona username o email.', 400),
    );

    const controller = new LoginController(authService);
    await controller.handle(mockReq, mockRes);

    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockStatus(400).json).toHaveBeenCalledWith({ message: 'Proporciona username o email.' });
  });

  it('AuthError 400 (missing password) → res.status(400).json({ message })', async () => {
    const mockReq = { body: { username: 'user', password: '' } } as Request;
    const { mockRes, mockStatus, mockJson } = makeMockRes();
    const authService = makeMockService();

    authService.login.mockRejectedValueOnce(
      new AuthError('La contraseña es obligatoria.', 400),
    );

    const controller = new LoginController(authService);
    await controller.handle(mockReq, mockRes);

    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockStatus(400).json).toHaveBeenCalledWith({ message: 'La contraseña es obligatoria.' });
  });

  it('AuthError 401 (invalid credentials) → res.status(401).json({ message })', async () => {
    const mockReq = { body: { username: 'user', password: 'wrongpass' } } as Request;
    const { mockRes, mockStatus, mockJson } = makeMockRes();
    const authService = makeMockService();

    authService.login.mockRejectedValueOnce(
      new AuthError('Credenciales inválidas.', 401),
    );

    const controller = new LoginController(authService);
    await controller.handle(mockReq, mockRes);

    expect(mockStatus).toHaveBeenCalledWith(401);
    expect(mockStatus(401).json).toHaveBeenCalledWith({ message: 'Credenciales inválidas.' });
  });

  it('generic Error → res.status(500).json({ message: "Error en el servidor." })', async () => {
    const mockReq = { body: {} } as Request;
    const { mockRes, mockStatus, mockJson } = makeMockRes();
    const authService = makeMockService();

    authService.login.mockRejectedValueOnce(new Error('Connection timeout'));

    const controller = new LoginController(authService);
    await controller.handle(mockReq, mockRes);

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockStatus(500).json).toHaveBeenCalledWith({ message: 'Error en el servidor.' });
  });
});
