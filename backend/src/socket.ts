import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';

let io: Server;

export function initSocket(httpServer: HttpServer) {
  const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
  const corsOrigins = corsOrigin.split(',').map((s) => s.trim());

  io = new Server(httpServer, {
    path: '/api/socket.io',
    cors: {
      origin: corsOrigins,
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Cliente conectado ao WebSocket: ${socket.id}`);

    socket.on('disconnect', () => {
      console.log(`❌ Cliente desconectado: ${socket.id}`);
    });
  });

  return io;
}

export function getIO(): Server {
  if (!io) {
    throw new Error('Socket.io não foi inicializado!');
  }
  return io;
}
