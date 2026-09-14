"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/server.ts  — Composition Root Socket + punto de entrada
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const https_1 = __importDefault(require("https"));
const fs_1 = __importDefault(require("fs"));
const cors_1 = __importDefault(require("cors"));
const socket_io_1 = require("socket.io");
const db_1 = require("./config/db");
const show_network_info_1 = require("./show-network-info");
const RoomEventHandler_1 = require("./socket/RoomEventHandler");
const GameEventHandler_1 = require("./socket/GameEventHandler");
// Validar JWT_SECRET antes de arrancar (Requisito 7.7)
if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET no está definido. El servidor no puede arrancar sin él.');
}
const PORT = process.env.PORT ?? 3000;
async function startServer() {
    const sequelize = await (0, db_1.connectDB)();
    if (sequelize)
        await sequelize.sync({ alter: true });
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)({ origin: true, credentials: true }));
    app.options('*', (0, cors_1.default)({ origin: true, credentials: true }));
    app.use(express_1.default.json());
    if (sequelize) {
        const { default: authRoutes } = await Promise.resolve().then(() => __importStar(require('./routes/authRoutes')));
        app.use('/api/auth', authRoutes);
    }
    app.get('/ping', (_req, res) => res.json({ ok: true, time: Date.now() }));
    // Crear servidor HTTP o HTTPS
    let server;
    const certFile = process.env.CERT_FILE ?? './cert.pem';
    const keyFile = process.env.KEY_FILE ?? './key.pem';
    if (process.env.USE_HTTPS === 'true' &&
        fs_1.default.existsSync(certFile) &&
        fs_1.default.existsSync(keyFile)) {
        server = https_1.default.createServer({ cert: fs_1.default.readFileSync(certFile), key: fs_1.default.readFileSync(keyFile) }, app);
    }
    else {
        server = http_1.default.createServer(app);
    }
    const io = new socket_io_1.Server(server, {
        cors: { origin: true, methods: ['GET', 'POST'], credentials: true },
    });
    // Composition Root Socket: construir el mapa compartido y los handlers
    const rooms = new Map();
    const handlers = [
        new RoomEventHandler_1.RoomEventHandler(io, rooms),
        new GameEventHandler_1.GameEventHandler(io, rooms),
    ];
    io.on('connection', (socket) => {
        // Polimorfismo de subtipo (Requisito 5.1 y 5.2):
        // se invoca registerEvents sobre cada BaseEventHandler sin conocer el tipo concreto
        handlers.forEach((handler) => handler.registerEvents(socket));
    });
    server.listen(Number(PORT), '0.0.0.0', () => {
        console.log(`[SERVER] Escuchando en 0.0.0.0:${PORT}`);
        (0, show_network_info_1.displayNetworkInfo)(Number(PORT));
    });
}
startServer().catch((err) => {
    console.error('Error fatal al iniciar el servidor:', err);
    process.exit(1);
});
//# sourceMappingURL=server.js.map