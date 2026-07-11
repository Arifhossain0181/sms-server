import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import http from 'http';



import { initSocket } from './config/socket';
import { errorMiddleware } from './middleware/error.middle';
import logger from './utils/logger';
import router from './routes';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Socket.io initialize
initSocket(server);

// Middlewares
app.use(helmet());


const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3001',
].filter((origin): origin is string => Boolean(origin));

const allowedOriginSet = new Set(allowedOrigins);
const isLocalhost = (origin: string) =>
  origin.includes('localhost') || origin.includes('127.0.0.1');

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like curl requests)
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOriginSet.has(origin) || isLocalhost(origin)) {
        return callback(null, true);
      }

      logger.warn(`CORS blocked for origin: ${origin}`);
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);

// Request logging (skipped in production to avoid per-request I/O overhead)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    logger.info(`[REQUEST] ${req.method} ${req.path}`);
    next();
  });
}

app.use(express.json({ limit: '1mb' }));

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
  console.log(`\n Server running on port ${PORT}\n`);
});