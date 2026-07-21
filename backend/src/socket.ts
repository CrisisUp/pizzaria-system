import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';

let io: Server;

export function initSocket(httpServer: HttpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: '*', // Ou a URL do seu frontend Next.js
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