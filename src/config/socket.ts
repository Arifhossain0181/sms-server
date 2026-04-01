import { Server } from 'socket.io';
import http from 'http';

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
    console.log('Client connected:', socket.id);

    // User using own  room  join  (userId)
    socket.on('join', (userId: string) => {
      socket.join(userId);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
};

//  anywhere in the code you can give notification to specific user by their userId
export const getIO = () => {
  if (!io) throw new Error('Socket not initialized');
  return io;
};