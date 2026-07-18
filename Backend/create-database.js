// Script para crear la base de datos y el usuario admin
require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');

const adminClient = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'password',
    database: 'postgres'  // Conectar a la base de datos 'postgres' por defecto
});

async function setupDatabase() {
    try {
        // Conectar como admin
        await adminClient.connect();
        console.log('✓ Conectado como admin a PostgreSQL');

        // Verificar si la base de datos ya existe
        const dbCheckResult = await adminClient.query(
            `SELECT 1 FROM pg_database WHERE datname = $1`,
            ['elemental_battlecards']
        );

        if (dbCheckResult.rows.length === 0) {
            // Crear la base de datos
            await adminClient.query('CREATE DATABASE elemental_battlecards ENCODING "UTF8"');
            console.log('✓ Base de datos elemental_battlecards creada');
        } else {
            console.log('✓ Base de datos elemental_battlecards ya existe');
        }

        await adminClient.end();

        // Conectar a la nueva base de datos
        const dbClient = new Client({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 5432,
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASS || 'password',
            database: 'elemental_battlecards'
        });

        await dbClient.connect();
        console.log('✓ Conectado a elemental_battlecards');

        // Crear tabla de usuarios
        await dbClient.query(`
            CREATE TABLE IF NOT EXISTS "Users" (
                id SERIAL PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✓ Tabla Users creada o ya existe');

        // Insertar usuario admin
        const adminPassword = '$2a$10$EyAv.lIfOdWrQBcldfmf5e9a/XB6.LLfyw0LOU05f0Qhb.IcU2TTu'; // bcryptjs hash de '12345678'
        
        const insertResult = await dbClient.query(
            `INSERT INTO "Users" (username, email, password, "createdAt", "updatedAt")
             VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
             ON CONFLICT (email) DO NOTHING
             RETURNING id, username, email`,
            ['admin', 'admin@admin.com', adminPassword]
        );

        if (insertResult.rows.length > 0) {
            console.log('✓ Usuario admin creado:');
            console.log(`  Email: admin@admin.com`);
            console.log(`  Contraseña: 12345678`);
        } else {
            console.log('✓ Usuario admin ya existe');
        }

        // Verificar usuarios
        const usersResult = await dbClient.query('SELECT id, username, email FROM "Users"');
        console.log(`\n✓ Total de usuarios en la base de datos: ${usersResult.rows.length}`);
        usersResult.rows.forEach(user => {
            console.log(`  - ${user.email} (${user.username})`);
        });

        await dbClient.end();
        console.log('\n✓✓✓ Base de datos configurada correctamente ✓✓✓');

    } catch (error) {
        console.error('✗ Error configurando la base de datos:', error.message);
        process.exit(1);
    }
}

setupDatabase();
