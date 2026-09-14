export interface TokenPayload {
    id: number;
    username: string;
    email: string;
}
export interface ITokenService {
    sign(payload: TokenPayload): string;
    verify(token: string): TokenPayload;
}
//# sourceMappingURL=ITokenService.d.ts.map