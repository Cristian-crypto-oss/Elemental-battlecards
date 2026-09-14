"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterController = void 0;
const AuthService_1 = require("../services/AuthService");
class RegisterController {
    constructor(authService) {
        this.authService = authService;
    }
    async handle(req, res) {
        try {
            const result = await this.authService.register(req.body);
            res.status(201).json(result);
        }
        catch (error) {
            if (error instanceof AuthService_1.AuthError) {
                res.status(error.statusCode).json({ message: error.message });
                return;
            }
            console.error('Error en registro:', error);
            res.status(500).json({ message: 'Error en el servidor.' });
        }
    }
}
exports.RegisterController = RegisterController;
//# sourceMappingURL=RegisterController.js.map