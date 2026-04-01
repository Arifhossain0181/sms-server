import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import http from 'http';



import { initSocket } from './config/socket';
import { errorMiddleware } from './middleware/error.middle';
import router from './routes';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Socket.io initialize
initSocket(server);

// Middlewares
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SMS Backend API is running',
    health: '/api/v1/health',
  });
});

// All routes
app.use('/api/v1', router);

// Error handler 
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});