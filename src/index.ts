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

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3001',
].filter((origin): origin is string => Boolean(origin));

console.log(`\n[SERVER] Allowed CORS origins:`, allowedOrigins);

app.use(
  cors({
    origin: (origin, callback) => {
      console.log(`[CORS] Request from origin: ${origin || 'no-origin'}`);
      
      // Allow requests with no origin (like curl requests)
      if (!origin) {
        console.log(`[CORS] ✅ Allowed - No origin`);
        return callback(null, true);
      }
      
      // Check if origin is allowed
      if (allowedOrigins.includes(origin)) {
        console.log(`[CORS] ✅ Allowed - Origin in whitelist`);
        return callback(null, true);
      }

      // Development mode - allow all localhost
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        console.log(`[CORS] ✅ Allowed - Localhost`);
        return callback(null, true);
      }

      console.log(`[CORS] ❌ Blocked - Origin not allowed`);
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`\n[REQUEST] ${req.method} ${req.path}`);
  console.log(`[REQUEST] Headers:`, { 
    'content-type': req.headers['content-type'],
    'authorization': req.headers['authorization'] ? '***' : 'none'
  });
  next();
});

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

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`\n Server running on port ${PORT}\n`);
});