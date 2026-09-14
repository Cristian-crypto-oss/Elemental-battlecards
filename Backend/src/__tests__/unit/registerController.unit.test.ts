// src/__tests__/unit/registerController.unit.test.ts
// Validates: Requirements 1.3

import { Request, Response } from 'express';
import { RegisterController } from '../../controllers/RegisterController';
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
// RegisterController.handle() tests
// ---------------------------------------------------------------------------

describe('RegisterController.handle()', () => {
  it('successful register → res.status(201).json(result)', async () => {
    const mockReq = { body: { username: 'user', email: 'a@b.com', password: 'pass123' } } as Request;
    const { mockRes, mockStatus, mockJson } = makeMockRes();
    const authService = makeMockService();

    const expectedResult = {
      token: 'signed.jwt.token',
      user: { id: 1, username: 'user', email: 'a@b.com' },
      message: 'Usuario registrado exitosamente.',
    };
    authService.register.mockResolvedValueOnce(expectedResult);

    const controller = new RegisterController(authService);
    await controller.handle(mockReq, mockRes);

    expect(authService.register).toHaveBeenCalledWith(mockReq.body);
    expect(mockStatus).toHaveBeenCalledWith(201);
    expect(mockStatus(201).json).toHaveBeenCalledWith(expectedResult);
  });

  it('AuthError 400 (missing fields) → res.status(400).json({ message })', async () => {
    const mockReq = { body: { username: '', email: 'a@b.com', password: 'pass123' } } as Request;
    const { mockRes, mockStatus, mockJson } = makeMockRes();
    const authService = makeMockService();

    authService.register.mockRejectedValueOnce(
      new AuthError('Faltan los campos: username.', 400),
    );

    const controller = new RegisterController(authService);
    await controller.handle(mockReq, mockRes);

    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockStatus(400).json).toHaveBeenCalledWith({ message: 'Faltan los campos: username.' });
  });

  it('AuthError 409 (duplicate email) → res.status(409).json({ message })', async () => {
    const mockReq = { body: { username: 'user', email: 'dup@example.com', password: 'pass123' } } as Request;
    const { mockRes, mockStatus, mockJson } = makeMockRes();
    const authService = makeMockService();

    authService.register.mockRejectedValueOnce(
      new AuthError('El correo electrónico ya está en uso.', 409),
    );

    const controller = new RegisterController(authService);
    await controller.handle(mockReq, mockRes);

    expect(mockStatus).toHaveBeenCalledWith(409);
    expect(mockStatus(409).json).toHaveBeenCalledWith({ message: 'El correo electrónico ya está en uso.' });
  });

  it('AuthError 409 (duplicate username) → res.status(409).json({ message })', async () => {
    const mockReq = { body: { username: 'dupuser', email: 'new@example.com', password: 'pass123' } } as Request;
    const { mockRes, mockStatus, mockJson } = makeMockRes();
    const authService = makeMockService();

    authService.register.mockRejectedValueOnce(
      new AuthError('El nombre de usuario ya está en uso.', 409),
    );

    const controller = new RegisterController(authService);
    await controller.handle(mockReq, mockRes);

    expect(mockStatus).toHaveBeenCalledWith(409);
    expect(mockStatus(409).json).toHaveBeenCalledWith({ message: 'El nombre de usuario ya está en uso.' });
  });

  it('generic Error → res.status(500).json({ message: "Error en el servidor." })', async () => {
    const mockReq = { body: {} } as Request;
    const { mockRes, mockStatus, mockJson } = makeMockRes();
    const authService = makeMockService();

    authService.register.mockRejectedValueOnce(new Error('Unexpected DB failure'));

    const controller = new RegisterController(authService);
    await controller.handle(mockReq, mockRes);

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockStatus(500).json).toHaveBeenCalledWith({ message: 'Error en el servidor.' });
  });
});
