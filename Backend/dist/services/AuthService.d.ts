import { IAuthService } from '../interfaces/IAuthService';
import { IUserRepository } from '../interfaces/IUserRepository';
import { IHashService } from '../interfaces/IHashService';
import { ITokenService } from '../interfaces/ITokenService';
import { RegisterDto } from '../dtos/RegisterDto';
import { LoginDto } from '../dtos/LoginDto';
import { AuthResponseDto } from '../dtos/AuthResponseDto';
export declare class AuthError extends Error {
    readonly statusCode: number;
    constructor(message: string, statusCode: number);
}
export declare class AuthService implements IAuthService {
    private readonly repository;
    private readonly hashService;
    private readonly tokenService;
    constructor(repository: IUserRepository, hashService: IHashService, tokenService: ITokenService);
    register(dto: RegisterDto): Promise<AuthResponseDto>;
    login(dto: LoginDto): Promise<AuthResponseDto>;
}
//# sourceMappingURL=AuthService.d.ts.map