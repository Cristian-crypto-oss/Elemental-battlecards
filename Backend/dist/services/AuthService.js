"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = exports.AuthError = void 0;
class AuthError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'AuthError';
    }
}
exports.AuthError = AuthError;
class AuthService {
    constructor(repository, hashService, tokenService) {
        this.repository = repository;
        this.hashService = hashService;
        this.tokenService = tokenService;
    }
    async register(dto) {
        // Validación de campos
        if (!dto.username || !dto.email || !dto.password) {
            const missing = [
                !dto.username && 'username',
                !dto.email && 'email',
                !dto.password && 'password',
            ].filter(Boolean).join(', ');
            throw new AuthError(`Faltan los campos: ${missing}.`, 400);
        }
        // Verificar duplicados
        const byEmail = await this.repository.findByEmail(dto.email);
        if (byEmail)
            throw new AuthError('El correo electrónico ya está en uso.', 409);
        const byUsername = await this.repository.findByUsername(dto.username);
        if (byUsername)
            throw new AuthError('El nombre de usuario ya está en uso.', 409);
        // Hash de la contraseña
        const hashedPassword = await this.hashService.hash(dto.password);
        // Persistir
        const user = await this.repository.create({ ...dto, password: hashedPassword });
        // Firmar token
        const token = this.tokenService.sign({ id: user.id, username: user.username, email: user.email });
        return {
            token,
            user: { id: user.id, username: user.username, email: user.email },
            message: 'Usuario registrado exitosamente.',
        };
    }
    async login(dto) {
        // Validar campos obligatorios
        if (!dto.password) {
            throw new AuthError('La contraseña es obligatoria.', 400);
        }
        if (!dto.username && !dto.email) {
            throw new AuthError('Proporciona username o email.', 400);
        }
        // Buscar usuario
        let user = null;
        if (dto.username) {
            user = await this.repository.findByUsername(dto.username);
        }
        else if (dto.email) {
            user = await this.repository.findByEmail(dto.email);
        }
        // Verificar credenciales — mismo mensaje en ambos casos (no revela si el usuario existe)
        const isMatch = user ? await this.hashService.compare(dto.password, user.passwordHash) : false;
        if (!user || !isMatch) {
            throw new AuthError('Credenciales inválidas.', 401);
        }
        const token = this.tokenService.sign({ id: user.id, username: user.username, email: user.email });
        return {
            token,
            user: { id: user.id, username: user.username, email: user.email },
        };
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=AuthService.js.map