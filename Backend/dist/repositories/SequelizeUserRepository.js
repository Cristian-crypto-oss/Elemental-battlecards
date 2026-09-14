"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SequelizeUserRepository = void 0;
const UserEntity_1 = require("../entities/UserEntity");
class SequelizeUserRepository {
    constructor(userModel) {
        this.userModel = userModel;
    }
    async findByEmail(email) {
        const record = await this.userModel.findOne({ where: { email } });
        if (!record)
            return null;
        const data = record.get();
        return new UserEntity_1.UserEntity(data.id, data.username, data.email, data.password);
    }
    async findByUsername(username) {
        const record = await this.userModel.findOne({ where: { username } });
        if (!record)
            return null;
        const data = record.get();
        return new UserEntity_1.UserEntity(data.id, data.username, data.email, data.password);
    }
    async create(dto) {
        const record = await this.userModel.create({
            username: dto.username,
            email: dto.email,
            password: dto.password,
        });
        const data = record.get();
        return new UserEntity_1.UserEntity(data.id, data.username, data.email, data.password);
    }
}
exports.SequelizeUserRepository = SequelizeUserRepository;
//# sourceMappingURL=SequelizeUserRepository.js.map