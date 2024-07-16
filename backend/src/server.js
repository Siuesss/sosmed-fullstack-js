import app from './app.js';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import { createServer } from 'http';
import winston from 'winston';

dotenv.config();

const port = process.env.PORT || "3001";
const connectedUsers = new Map();

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

io.on('connection', (socket) => {
  socket.on('userConnected', (userId) => {
    connectedUsers.set(socket.id, userId);
    socket.join(userId);
  });

  socket.on('disconnect', () => {
    const userId = connectedUsers.get(socket.id);
    if (userId) {
      connectedUsers.delete(socket.id);
      socket.leave(userId);
    }
  });

  socket.on('error', (err) => {
    logger.error(`Socket error: ${err}`);
  });
});

server.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
});

const shutdown = () => {
  logger.info('Received shutdown signal, shutting down gracefully...');
  server.close(() => {
    logger.info('Closed out remaining connections.');
    process.exit(0);
  });

  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

export { io };