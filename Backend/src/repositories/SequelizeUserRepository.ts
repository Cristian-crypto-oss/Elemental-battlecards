// src/repositories/SequelizeUserRepository.ts
import { ModelDefined } from 'sequelize';

import { RegisterDto } from '../dtos/RegisterDto';
import { UserEntity } from '../entities/UserEntity';
import { IUserRepository } from '../interfaces/IUserRepository';
import { UserAttributes, UserCreationAttributes } from '../models/user';

export class SequelizeUserRepository implements IUserRepository {
  private readonly userModel: ModelDefined<UserAttributes, UserCreationAttributes>;

  constructor(userModel: ModelDefined<UserAttributes, UserCreationAttributes>) {
    this.userModel = userModel;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const record = await this.userModel.findOne({ where: { email } });
    if (!record) return null;
    const data = record.get() as UserAttributes;
    return new UserEntity(data.id, data.username, data.email, data.password);
  }

  async findByUsername(username: string): Promise<UserEntity | null> {
    const record = await this.userModel.findOne({ where: { username } });
    if (!record) return null;
    const data = record.get() as UserAttributes;
    return new UserEntity(data.id, data.username, data.email, data.password);
  }

  async create(dto: RegisterDto): Promise<UserEntity> {
    const record = await this.userModel.create({
      username: dto.username,
      email: dto.email,
      password: dto.password,
    });
    const data = record.get() as UserAttributes;
    return new UserEntity(data.id, data.username, data.email, data.password);
  }
}
