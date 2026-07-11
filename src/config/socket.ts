import { Server } from 'socket.io';
import http from 'http';
import logger from '../utils/logger';

let io: Server;

export const initSocket = (server: http.Server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    logger.debug('Client connected:', socket.id);

    // User using own  room  join  (userId)
    socket.on('join', (payload: string | { userId?: string; role?: string }) => {
      if (typeof payload === 'string') {
        socket.join(payload);
        return;
      }
      if (payload?.userId) socket.join(payload.userId);
      if (payload?.role) socket.join(payload.role);
    });

    socket.on('disconnect', () => {
      logger.debug('Client disconnected:', socket.id);
    });
  });
};

//  anywhere in the code you can give notification to specific user by their userId
export const getIO = () => {
  if (!io) throw new Error('Socket not initialized');
  return io;
};

export const emitToUser = (userId: string, event: string, payload: unknown) => {
  getIO().to(userId).emit(event, payload);
};

export const emitToRole = (role: string, event: string, payload: unknown) => {
  getIO().to(role).emit(event, payload);
};