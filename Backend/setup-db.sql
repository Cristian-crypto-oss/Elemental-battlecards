-- Script para crear la base de datos de Elemental Battlecards
-- Ejecutar como: psql -U postgres -f setup-db.sql

-- Crear la base de datos
CREATE DATABASE elemental_battlecards
    WITH
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE = 'en_US.UTF-8';

-- Conectar a la nueva BD
\c elemental_battlecards

-- Crear extensiones si es necesario
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS "Users" (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar usuario admin
-- Contraseña: 12345678 (hasheada con bcryptjs, rounds=10)
-- Hash generado con: bcryptjs.hash('12345678', 10)

INSERT INTO "Users" (username, email, password, "createdAt", "updatedAt")
VALUES (
    'admin',
    'admin@admin.com',
    '$2a$10$EyAv.lIfOdWrQBcldfmf5e9a/XB6.LLfyw0LOU05f0Qhb.IcU2TTu',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (email) DO NOTHING;

-- Mensaje de confirmación
\echo 'Base de datos elemental_battlecards creada exitosamente'
\echo 'Usuario admin creado:'
\echo '  Email: admin@admin.com'
\echo '  Contraseña: 12345678'
\echo ''
\echo 'Tabla de usuarios:'
SELECT id, username, email FROM "Users";
