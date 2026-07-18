// Script para sincronizar la base de datos con los modelos Sequelize
require('dotenv').config();
const { sequelize } = require('./config/db');
const db = require('./models');

async function syncDatabase() {
    try {
        console.log('🔄 Sincronizando base de datos...');
        
        // Sincronizar todos los modelos con la base de datos
        // force: false = no elimina las tablas existentes
        await sequelize.sync({ force: false, alter: true });
        
        console.log('✓ Base de datos sincronizada correctamente');
        
        // Verificar si el usuario admin existe
        const adminUser = await db.User.findOne({ where: { email: 'admin@admin.com' } });
        
        if (!adminUser) {
            console.log('📝 Creando usuario admin...');
            const bcryptjs = require('bcryptjs');
            const hashedPassword = '$2a$10$EyAv.lIfOdWrQBcldfmf5e9a/XB6.LLfyw0LOU05f0Qhb.IcU2TTu'; // hash de '12345678'
            
            await db.User.create({
                username: 'admin',
                email: 'admin@admin.com',
                password: hashedPassword
            });
            
            console.log('✓ Usuario admin creado:');
            console.log('  Email: admin@admin.com');
            console.log('  Contraseña: 12345678');
        } else {
            console.log('✓ Usuario admin ya existe');
        }
        
        // Listar todos los usuarios
        const allUsers = await db.User.findAll();
        console.log(`\n📊 Total de usuarios: ${allUsers.length}`);
        allUsers.forEach(user => {
            console.log(`  - ${user.email} (${user.username})`);
        });
        
        console.log('\n✓✓✓ Sincronización completada ✓✓✓');
        process.exit(0);
    } catch (error) {
        console.error('✗ Error sincronizando la base de datos:', error.message);
        console.error(error);
        process.exit(1);
    }
}

syncDatabase();
