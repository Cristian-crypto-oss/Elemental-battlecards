require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const https = require('https');
const fs = require('fs');
const cors = require('cors');

// Importar módulos
const db = require('./config/db'); // ahora importamos el objeto
const socketManager = require('./socketManager');
const { displayNetworkInfo } = require('./show-network-info');

const app = express();
const PORT = process.env.PORT || 3000;

const startServer = async () => {
    // Conectar a la base de datos
    let sequelize;
    try {
        if (typeof db.connectDB === 'function') {
            sequelize = await db.connectDB();
        } else if (db.sequelize) {
            sequelize = db.sequelize;
            await sequelize.authenticate();
            console.log('DB conectada');
        } else {
            console.log('No hay configuración de base de datos disponible');
        }

        // Sincronizar modelos (crea tablas si no existen)
        if (sequelize) {
            await sequelize.sync({ alter: true });
            console.log('Tablas sincronizadas');
        }
    } catch (err) {
        console.error('No se pudo conectar a la BD:', err.message || err);
        sequelize = null;
    }

    // Configuración de CORS - PERMISIVA en desarrollo
    const corsOptions = {
        origin: function (origin, callback) {
            // Permitir peticiones sin origen (como Postman) o cualquier origen en desarrollo
            console.log('[CORS] Request from origin:', origin);
            callback(null, true);
        },
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
        credentials: true,
        optionsSuccessStatus: 200,
        maxAge: 86400
    };

    // Middleware de CORS debe ir PRIMERO
    app.use(cors(corsOptions));
    
    // Manejador explícito de preflight requests ANTES de cualquier otro middleware
    app.options('*', cors(corsOptions));
    
    // Headers adicionales para asegurar CORS
    app.use((req, res, next) => {
        const origin = req.get('origin');
        if (origin) {
            res.header('Access-Control-Allow-Origin', origin);
            res.header('Access-Control-Allow-Credentials', 'true');
            res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
            res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
        }
        
        console.log(`[CORS] ${req.method} ${req.path} - Origin: ${origin || 'no-origin'}`);
        
        // Si es una petición OPTIONS, responder inmediatamente
        if (req.method === 'OPTIONS') {
            return res.sendStatus(200);
        }
        
        next();
    });
    
    app.use(bodyParser.json());

    // Rutas de autenticación — se habilitan automáticamente si la BD está disponible
    if (sequelize) {
        try {
            const authRoutes = require('./routes/authRoutes');
            app.use('/api/auth', authRoutes);
            console.log('Rutas de autenticación habilitadas');
        } catch (err) {
            console.warn('No se pudieron cargar las rutas de autenticación:', err.message);
        }
    } else {
        console.log('Rutas de autenticación deshabilitadas (sin BD)');
    }

    // Health check
    app.get('/ping', (req, res) => {
        res.json({ ok: true, time: Date.now(), host: req.hostname });
    });

    // Crear el servidor HTTP o HTTPS dependiendo de la disponibilidad de certificados
    let server;
    
    // Intentar usar HTTPS solo si los certificados existen Y no estamos en localhost
    const certFile = process.env.CERT_FILE || './cert.pem';
    const keyFile = process.env.KEY_FILE || './key.pem';
    const forceHTTP = process.env.FORCE_HTTP === 'true';
    
    try {
        if (!forceHTTP && fs.existsSync(certFile) && fs.existsSync(keyFile)) {
            // Verificar si estamos en un entorno que requiere HTTPS
            const useHTTPS = process.env.USE_HTTPS === 'true';
            
            if (useHTTPS) {
                const options = {
                    cert: fs.readFileSync(certFile),
                    key: fs.readFileSync(keyFile)
                };
                server = https.createServer(options, app);
                console.log('Servidor HTTPS inicializado');
            } else {
                server = http.createServer(app);
                console.log('Servidor HTTP inicializado (desarrollo local)');
            }
        } else {
            server = http.createServer(app);
            console.log('Servidor HTTP inicializado');
        }
    } catch (err) {
        console.warn('Error al cargar certificados HTTPS, usando HTTP:', err.message);
        server = http.createServer(app);
    }

    // Inicializar Socket.io con CORS
    const { Server } = require('socket.io');
    const io = new Server(server, {
        cors: {
            origin: [
                'http://localhost:5173',
                'http://localhost:3000',
                'http://127.0.0.1:5173',
                'http://127.0.0.1:3000',
                'https://localhost:5173',
                'https://localhost:3000',
                'https://127.0.0.1:5173',
                'https://127.0.0.1:3000',
                'https://x5v4c69f-5173.use.devtunnels.ms'
            ],
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    socketManager(io);

    server.listen(PORT, '0.0.0.0', () => {
        console.log('\n[SERVER] Servidor escuchando en 0.0.0.0:' + PORT);
        console.log('[SERVER] Modo HTTPS:', process.env.USE_HTTPS === 'true' ? 'ACTIVADO ✅' : 'DESACTIVADO');
        console.log('[SERVER] CORS configurado para aceptar CUALQUIER origen\n');
        displayNetworkInfo(PORT);
    });
};

// Iniciar servidor
startServer();
