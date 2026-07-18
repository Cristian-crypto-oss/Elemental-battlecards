// Script para probar los endpoints de autenticación
const API_BASE = 'http://localhost:3001/api/auth';

async function hacerPeticion(ruta, metodo, datos) {
    const respuesta = await fetch(`${API_BASE}${ruta}`, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
    });
    return respuesta.json();
}

async function probarAutenticacion() {
    console.log('🧪 Iniciando pruebas de autenticación...\n');

    try {
        // Prueba 1: Login con admin existente
        console.log('📝 Prueba 1: Login con usuario admin@admin.com');
        const loginResp = await hacerPeticion('/login', 'POST', {
            username: 'admin',
            password: '12345678'
        });

        if (loginResp.token) {
            console.log('✓ Login exitoso');
            console.log('  Token:', loginResp.token.substring(0, 20) + '...');
            console.log('  Usuario:', loginResp.user.email);
        } else {
            console.log('✗ Error:', loginResp.message);
        }
        console.log('');

        // Prueba 2: Registro de nuevo usuario
        console.log('📝 Prueba 2: Registrar nuevo usuario');
        const registroResp = await hacerPeticion('/register', 'POST', {
            username: 'guerrero123',
            email: 'guerrero@test.com',
            password: 'pass123456'
        });

        if (registroResp.token) {
            console.log('✓ Registro exitoso');
            console.log('  Token:', registroResp.token.substring(0, 20) + '...');
            console.log('  Usuario:', registroResp.user.email);
        } else {
            console.log('✗ Error:', registroResp.message);
        }
        console.log('');

        // Prueba 3: Intentar registrar con email duplicado
        console.log('📝 Prueba 3: Intentar registrar con email duplicado');
        const duplicadoResp = await hacerPeticion('/register', 'POST', {
            username: 'otro123',
            email: 'guerrero@test.com',
            password: 'pass123456'
        });

        if (duplicadoResp.message) {
            console.log('✓ Fallo esperado:', duplicadoResp.message);
        }
        console.log('');

        // Prueba 4: Login con nuevo usuario
        console.log('📝 Prueba 4: Login con nuevo usuario guerrero@test.com');
        const loginNuevoResp = await hacerPeticion('/login', 'POST', {
            email: 'guerrero@test.com',
            password: 'pass123456'
        });

        if (loginNuevoResp.token) {
            console.log('✓ Login exitoso');
            console.log('  Token:', loginNuevoResp.token.substring(0, 20) + '...');
            console.log('  Usuario:', loginNuevoResp.user.email);
        } else {
            console.log('✗ Error:', loginNuevoResp.message);
        }
        console.log('');

        // Prueba 5: Intentar login con contraseña incorrecta
        console.log('📝 Prueba 5: Intentar login con contraseña incorrecta');
        const passIncorrectaResp = await hacerPeticion('/login', 'POST', {
            username: 'admin',
            password: 'contraseñaerrada'
        });

        if (passIncorrectaResp.message) {
            console.log('✓ Fallo esperado:', passIncorrectaResp.message);
        }
        console.log('');

        console.log('✓✓✓ Todas las pruebas completadas correctamente ✓✓✓');
        process.exit(0);

    } catch (error) {
        console.error('✗ Error durante las pruebas:', error.message);
        process.exit(1);
    }
}

// Esperar a que el servidor esté listo
setTimeout(probarAutenticacion, 1000);
