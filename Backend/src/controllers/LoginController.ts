// src/controllers/LoginController.ts
import { Request, Response } from 'express';
import { IController } from '../interfaces/IController';
import { IAuthService } from '../interfaces/IAuthService';
import { AuthError } from '../services/AuthService';

export class LoginController implements IController {
  private readonly authService: IAuthService;

  constructor(authService: IAuthService) {
    this.authService = authService;
  }

  async handle(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.authService.login(req.body);
      res.status(200).json(result);
    } catch (error) {
      if (error instanceof AuthError) {
        res.status(error.statusCode).json({ message: error.message });
        return;
      }
      console.error('Error en login:', error);
      res.status(500).json({ message: 'Error en el servidor.' });
    }
  }
}
