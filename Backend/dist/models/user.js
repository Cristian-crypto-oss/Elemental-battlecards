"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defineUserModel = void 0;
// src/models/user.ts
const sequelize_1 = require("sequelize");
function defineUserModel(sequelize) {
    const model = sequelize.define('User', {
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        username: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        email: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        password: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
    }, {
        tableName: 'users',
        timestamps: true,
    });
    return model;
}
exports.defineUserModel = defineUserModel;
//# sourceMappingURL=user.js.map