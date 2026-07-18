require('dotenv').config();
const { Sequelize } = require('sequelize');

const useSqlite = (process.env.DB_USE_SQLITE || 'false').toLowerCase() === 'true';
let sequelize;

if (useSqlite) {
    const dbPath = process.env.DB_SQLITE_PATH || './elemental_battlecards.sqlite';
    sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: dbPath,
        logging: false,
    });
    console.log(`[DB] SQLite configurado en: ${dbPath}`);
} else {
    const requireSSL = ((process.env.DB_REQUIRE_SSL || 'true').toString().toLowerCase() === 'true');

    const dialectOptions = requireSSL
        ? { ssl: { require: true, rejectUnauthorized: false } }
        : undefined;

    const host = process.env.DB_HOST || '127.0.0.1';
    const port = process.env.DB_PORT || 5432;
    const database = process.env.DB_NAME || 'elemental';
    const username = process.env.DB_USER || 'postgres';
    const password = process.env.DB_PASS || 'password';

    sequelize = new Sequelize(database, username, password, {
        host,
        port,
        dialect: 'postgres',
        logging: false,
        dialectOptions,
    });
}

async function connectDB() {
    try {
        await sequelize.authenticate();
        console.log('DB conectado (connectDB) y SSL:', !!process.env.DB_REQUIRE_SSL);
        return sequelize;
    } catch (error) {
        console.error('Error conectando a DB (connectDB):', error);
        throw error;
    }
}

module.exports = { sequelize, Sequelize, connectDB };
