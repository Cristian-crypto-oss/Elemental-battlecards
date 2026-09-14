"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
// src/models/index.ts
const db_1 = require("../config/db");
const user_1 = require("./user");
const User = (0, user_1.defineUserModel)(db_1.sequelize);
exports.db = { User };
//# sourceMappingURL=index.js.map