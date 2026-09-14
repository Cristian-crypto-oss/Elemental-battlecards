"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserEntity = void 0;
// src/entities/UserEntity.ts
class UserEntity {
    constructor(id, username, email, passwordHash) {
        this._id = id;
        this._username = username;
        this._email = email;
        this._passwordHash = passwordHash;
    }
    get id() { return this._id; }
    get username() { return this._username; }
    get email() { return this._email; }
    get passwordHash() { return this._passwordHash; }
}
exports.UserEntity = UserEntity;
//# sourceMappingURL=UserEntity.js.map