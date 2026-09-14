import { RegisterDto } from '../dtos/RegisterDto';
import { UserEntity } from '../entities/UserEntity';
export interface IUserRepository {
    findByEmail(email: string): Promise<UserEntity | null>;
    findByUsername(username: string): Promise<UserEntity | null>;
    create(data: RegisterDto): Promise<UserEntity>;
}
//# sourceMappingURL=IUserRepository.d.ts.map