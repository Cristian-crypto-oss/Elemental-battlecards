import 'dotenv/config';
import { Sequelize } from 'sequelize';

const useSqlite = (process.env.DB_USE_SQLITE ?? 'false').toLowerCase() === 'true';

let sequelize: Sequelize;

if (useSqlite) {
  const dbPath = process.env.DB_SQLITE_PATH ?? './elemental_battlecards.sqlite';
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath,
    logging: false,
  });
  console.log(`[DB] SQLite configurado en: ${dbPath}`);
} else {
  const requireSSL = (process.env.DB_REQUIRE_SSL ?? 'false').toLowerCase() === 'true';
  const dialectOptions = requireSSL
    ? { ssl: { require: true, rejectUnauthorized: false } }
    : {};

  sequelize = new Sequelize(
    process.env.DB_NAME ?? 'elemental',
    process.env.DB_USER ?? 'postgres',
    process.env.DB_PASS ?? 'password',
    {
      host: process.env.DB_HOST ?? '127.0.0.1',
      port: parseInt(process.env.DB_PORT ?? '5432', 10),
      dialect: 'postgres',
      logging: false,
      dialectOptions,
    },
  );
}

export async function connectDB(): Promise<Sequelize | null> {
  try {
    await sequelize.authenticate();
    console.log('DB conectado (connectDB)');
    return sequelize;
  } catch (error) {
    console.error('Error conectando a DB (connectDB):', error);
    return null;
  }
}

export { sequelize, Sequelize };
