import { ModelDefined } from 'sequelize';
import { RegisterDto } from '../dtos/RegisterDto';
import { UserEntity } from '../entities/UserEntity';
import { IUserRepository } from '../interfaces/IUserRepository';
import { UserAttributes, UserCreationAttributes } from '../models/user';
export declare class SequelizeUserRepository implements IUserRepository {
    private readonly userModel;
    constructor(userModel: ModelDefined<UserAttributes, UserCreationAttributes>);
    findByEmail(email: string): Promise<UserEntity | null>;
    findByUsername(username: string): Promise<UserEntity | null>;
    create(dto: RegisterDto): Promise<UserEntity>;
}
//# sourceMappingURL=SequelizeUserRepository.d.ts.map