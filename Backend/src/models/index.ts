// src/models/index.ts
import { sequelize } from '../config/db';
import { defineUserModel } from './user';

const User = defineUserModel(sequelize);

export const db = { User };
export type { UserAttributes, UserCreationAttributes } from './user';
