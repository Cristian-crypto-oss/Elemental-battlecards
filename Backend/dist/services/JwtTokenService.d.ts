import { ITokenService, TokenPayload } from '../interfaces/ITokenService';
export declare class JwtTokenService implements ITokenService {
    private readonly secret;
    private readonly expiresIn;
    constructor(secret: string, expiresIn?: string);
    sign(payload: TokenPayload): string;
    verify(token: string): TokenPayload;
}
//# sourceMappingURL=JwtTokenService.d.ts.map