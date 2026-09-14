"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/authRoutes.ts  — Composition Root Auth
const express_1 = require("express");
const SequelizeUserRepository_1 = require("../repositories/SequelizeUserRepository");
const BcryptHashService_1 = require("../services/BcryptHashService");
const JwtTokenService_1 = require("../services/JwtTokenService");
const AuthService_1 = require("../services/AuthService");
const RegisterController_1 = require("../controllers/RegisterController");
const LoginController_1 = require("../controllers/LoginController");
const models_1 = require("../models");
const router = (0, express_1.Router)();
// --- Construcción del grafo de dependencias (orden obligatorio) ---
const userRepo = new SequelizeUserRepository_1.SequelizeUserRepository(models_1.db.User);
const hashService = new BcryptHashService_1.BcryptHashService(10);
const tokenService = new JwtTokenService_1.JwtTokenService(process.env.JWT_SECRET);
const authService = new AuthService_1.AuthService(userRepo, hashService, tokenService);
const registerCtrl = new RegisterController_1.RegisterController(authService);
const loginCtrl = new LoginController_1.LoginController(authService);
// --- Rutas ---
router.post('/register', (req, res) => registerCtrl.handle(req, res));
router.post('/login', (req, res) => loginCtrl.handle(req, res));
exports.default = router;
//# sourceMappingURL=authRoutes.js.map