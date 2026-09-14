"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtTokenService = void 0;
// src/services/JwtTokenService.ts
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class JwtTokenService {
    constructor(secret, expiresIn = '1h') {
        if (!secret) {
            throw new Error('JWT_SECRET es obligatorio. El servidor no puede arrancar sin él.');
        }
        this.secret = secret;
        this.expiresIn = expiresIn;
    }
    sign(payload) {
        return jsonwebtoken_1.default.sign({ user: payload }, this.secret, { expiresIn: this.expiresIn });
    }
    verify(token) {
        const decoded = jsonwebtoken_1.default.verify(token, this.secret);
        return decoded.user;
    }
}
exports.JwtTokenService = JwtTokenService;
//# sourceMappingURL=JwtTokenService.js.map