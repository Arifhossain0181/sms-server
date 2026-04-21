"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIO = exports.initSocket = void 0;
const socket_io_1 = require("socket.io");
let io;
const initSocket = (server) => {
    io = new socket_io_1.Server(server, {
        cors: {
            origin: process.env.CLIENT_URL,
            methods: ['GET', 'POST'],
            credentials: true,
        },
    });
    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);
        // User using own  room  join  (userId)
        socket.on('join', (userId) => {
            socket.join(userId);
        });
        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });
};
exports.initSocket = initSocket;
//  anywhere in the code you can give notification to specific user by their userId
const getIO = () => {
    if (!io)
        throw new Error('Socket not initialized');
    return io;
};
exports.getIO = getIO;
