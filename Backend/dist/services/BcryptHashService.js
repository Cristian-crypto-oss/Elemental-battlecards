"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BcryptHashService = void 0;
// src/services/BcryptHashService.ts
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class BcryptHashService {
    constructor(saltRounds = 10) {
        this.saltRounds = saltRounds;
    }
    async hash(plain) {
        return bcryptjs_1.default.hash(plain, this.saltRounds);
    }
    async compare(plain, hashed) {
        return bcryptjs_1.default.compare(plain, hashed);
    }
}
exports.BcryptHashService = BcryptHashService;
//# sourceMappingURL=BcryptHashService.js.map