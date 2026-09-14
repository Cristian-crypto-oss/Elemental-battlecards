"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sequelize = exports.sequelize = exports.connectDB = void 0;
require("dotenv/config");
const sequelize_1 = require("sequelize");
Object.defineProperty(exports, "Sequelize", { enumerable: true, get: function () { return sequelize_1.Sequelize; } });
const useSqlite = (process.env.DB_USE_SQLITE ?? 'false').toLowerCase() === 'true';
let sequelize;
if (useSqlite) {
    const dbPath = process.env.DB_SQLITE_PATH ?? './elemental_battlecards.sqlite';
    exports.sequelize = sequelize = new sequelize_1.Sequelize({
        dialect: 'sqlite',
        storage: dbPath,
        logging: false,
    });
    console.log(`[DB] SQLite configurado en: ${dbPath}`);
}
else {
    const requireSSL = (process.env.DB_REQUIRE_SSL ?? 'false').toLowerCase() === 'true';
    const dialectOptions = requireSSL
        ? { ssl: { require: true, rejectUnauthorized: false } }
        : {};
    exports.sequelize = sequelize = new sequelize_1.Sequelize(process.env.DB_NAME ?? 'elemental', process.env.DB_USER ?? 'postgres', process.env.DB_PASS ?? 'password', {
        host: process.env.DB_HOST ?? '127.0.0.1',
        port: parseInt(process.env.DB_PORT ?? '5432', 10),
        dialect: 'postgres',
        logging: false,
        dialectOptions,
    });
}
async function connectDB() {
    try {
        await sequelize.authenticate();
        console.log('DB conectado (connectDB)');
        return sequelize;
    }
    catch (error) {
        console.error('Error conectando a DB (connectDB):', error);
        return null;
    }
}
exports.connectDB = connectDB;
//# sourceMappingURL=db.js.map