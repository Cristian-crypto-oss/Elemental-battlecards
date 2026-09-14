// src/routes/authRoutes.ts  — Composition Root Auth
import { Router, Request, Response, IRouter } from 'express';
import { SequelizeUserRepository } from '../repositories/SequelizeUserRepository';
import { BcryptHashService } from '../services/BcryptHashService';
import { JwtTokenService } from '../services/JwtTokenService';
import { AuthService } from '../services/AuthService';
import { RegisterController } from '../controllers/RegisterController';
import { LoginController } from '../controllers/LoginController';
import { db } from '../models';

const router: IRouter = Router();

// --- Construcción del grafo de dependencias (orden obligatorio) ---
const userRepo     = new SequelizeUserRepository(db.User);
const hashService  = new BcryptHashService(10);
const tokenService = new JwtTokenService(process.env.JWT_SECRET!);
const authService  = new AuthService(userRepo, hashService, tokenService);
const registerCtrl = new RegisterController(authService);
const loginCtrl    = new LoginController(authService);

// --- Rutas ---
router.post('/register', (req: Request, res: Response) => registerCtrl.handle(req, res));
router.post('/login',    (req: Request, res: Response) => loginCtrl.handle(req, res));

export default router;
