// src/services/JwtTokenService.ts
import jwt from 'jsonwebtoken';
import { ITokenService, TokenPayload } from '../interfaces/ITokenService';

export class JwtTokenService implements ITokenService {
  private readonly secret: string;
  private readonly expiresIn: string;

  constructor(secret: string, expiresIn = '1h') {
    if (!secret) {
      throw new Error('JWT_SECRET es obligatorio. El servidor no puede arrancar sin él.');
    }
    this.secret = secret;
    this.expiresIn = expiresIn;
  }

  sign(payload: TokenPayload): string {
    return jwt.sign({ user: payload }, this.secret, { expiresIn: this.expiresIn as jwt.SignOptions['expiresIn'] });
  }

  verify(token: string): TokenPayload {
    const decoded = jwt.verify(token, this.secret) as { user: TokenPayload };
    return decoded.user;
  }
}
