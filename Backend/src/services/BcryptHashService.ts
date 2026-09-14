// src/services/BcryptHashService.ts
import bcrypt from 'bcryptjs';
import { IHashService } from '../interfaces/IHashService';

export class BcryptHashService implements IHashService {
  private readonly saltRounds: number;

  constructor(saltRounds = 10) {
    this.saltRounds = saltRounds;
  }

  async hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, this.saltRounds);
  }

  async compare(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  }
}
