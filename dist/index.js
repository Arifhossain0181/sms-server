"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = __importDefault(require("http"));
const socket_1 = require("./config/socket");
const error_middle_1 = require("./middleware/error.middle");
const routes_1 = __importDefault(require("./routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
// Socket.io initialize
(0, socket_1.initSocket)(server);
// Middlewares
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express_1.default.json());
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'SMS Backend API is running',
        health: '/api/v1/health',
    });
});
// All routes
app.use('/api/v1', routes_1.default);
// Error handler 
app.use(error_middle_1.errorMiddleware);
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
