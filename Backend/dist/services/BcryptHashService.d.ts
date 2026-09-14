import { IHashService } from '../interfaces/IHashService';
export declare class BcryptHashService implements IHashService {
    private readonly saltRounds;
    constructor(saltRounds?: number);
    hash(plain: string): Promise<string>;
    compare(plain: string, hashed: string): Promise<boolean>;
}
//# sourceMappingURL=BcryptHashService.d.ts.map