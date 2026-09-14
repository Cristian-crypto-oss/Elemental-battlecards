import { ModelDefined, Sequelize } from 'sequelize';
export interface UserAttributes {
    id: number;
    username: string;
    email: string;
    password: string;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface UserCreationAttributes {
    username: string;
    email: string;
    password: string;
}
export declare function defineUserModel(sequelize: Sequelize): ModelDefined<UserAttributes, UserCreationAttributes>;
//# sourceMappingURL=user.d.ts.map