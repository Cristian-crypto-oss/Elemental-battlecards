// src/server.ts  — Composition Root Socket + punto de entrada
import 'dotenv/config';
import express from 'express';
import http from 'http';
import https from 'https';
import fs from 'fs';
import cors from 'cors';
import { Server, Socket } from 'socket.io';

import { connectDB } from './config/db';
import { displayNetworkInfo } from './show-network-info';
import { RoomMap, BaseEventHandler } from './socket/BaseEventHandler';
import { RoomEventHandler } from './socket/RoomEventHandler';
import { GameEventHandler } from './socket/GameEventHandler';

// Validar JWT_SECRET antes de arrancar (Requisito 7.7)
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET no está definido. El servidor no puede arrancar sin él.');
}

const PORT = process.env.PORT ?? 3000;

async function startServer(): Promise<void> {
  const sequelize = await connectDB();
  if (sequelize) await sequelize.sync({ alter: true });

  const app = express();
  app.use(cors({ origin: true, credentials: true }));
  app.options('*', cors({ origin: true, credentials: true }));
  app.use(express.json());

  if (sequelize) {
    const { default: authRoutes } = await import('./routes/authRoutes');
    app.use('/api/auth', authRoutes);
  }

  app.get('/ping', (_req, res) => res.json({ ok: true, time: Date.now() }));

  // Crear servidor HTTP o HTTPS
  let server: http.Server | https.Server;
  const certFile = process.env.CERT_FILE ?? './cert.pem';
  const keyFile = process.env.KEY_FILE ?? './key.pem';

  if (
    process.env.USE_HTTPS === 'true' &&
    fs.existsSync(certFile) &&
    fs.existsSync(keyFile)
  ) {
    server = https.createServer(
      { cert: fs.readFileSync(certFile), key: fs.readFileSync(keyFile) },
      app,
    );
  } else {
    server = http.createServer(app);
  }

  const io = new Server(server, {
    cors: { origin: true, methods: ['GET', 'POST'], credentials: true },
  });

  // Composition Root Socket: construir el mapa compartido y los handlers
  const rooms: RoomMap = new Map();
  const handlers: BaseEventHandler[] = [
    new RoomEventHandler(io, rooms),
    new GameEventHandler(io, rooms),
  ];

  io.on('connection', (socket: Socket) => {
    // Polimorfismo de subtipo (Requisito 5.1 y 5.2):
    // se invoca registerEvents sobre cada BaseEventHandler sin conocer el tipo concreto
    handlers.forEach((handler) => handler.registerEvents(socket));
  });

  server.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[SERVER] Escuchando en 0.0.0.0:${PORT}`);
    displayNetworkInfo(Number(PORT));
  });
}

startServer().catch((err) => {
  console.error('Error fatal al iniciar el servidor:', err);
  process.exit(1);
});
