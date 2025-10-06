import http from 'http';
import mongoose from 'mongoose';
import app from './app';
import config from './config';

const server = http.createServer(app);

async function start() {
  try {
    await mongoose.connect(config.mongoUri);
    // eslint-disable-next-line no-console
    console.log('Connected to MongoDB');

    server.listen(config.port, () => {
      // eslint-disable-next-line no-console
      console.log(`Server running on http://localhost:${config.port}`);
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();

process.on('unhandledRejection', (reason) => {
  // eslint-disable-next-line no-console
  console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  // eslint-disable-next-line no-console
  console.error('Uncaught Exception:', err);
  process.exit(1);
});
