import http from "http";
import mongoose from "mongoose";
import app from "./app";
import config from "./config";

const server = http.createServer(app);

// Request must fully arrive within 2 minutes
server.requestTimeout = 2 * 60 * 1000; // 120_000 ms

// Headers must arrive within 30 seconds
server.headersTimeout = 30 * 1000; // 30_000 ms

// Idle socket timeout (no data activity)
server.timeout = 2 * 60 * 1000; // 120_000 ms

// Keep-alive idle timeout for persistent connections
server.keepAliveTimeout = 30 * 1000; // 10_000 ms

async function start() {
  try {
    await mongoose.connect(config.mongoUri);
    // eslint-disable-next-line no-console
    console.log("Connected to MongoDB");

    server.listen(config.port, () => {
      // eslint-disable-next-line no-console
      console.log(`Server running on http://localhost:${config.port}`);
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

start();

process.on("unhandledRejection", (reason) => {
  // eslint-disable-next-line no-console
  console.error("Unhandled Rejection:", reason);
});

process.on("uncaughtException", (err) => {
  // eslint-disable-next-line no-console
  console.error("Uncaught Exception:", err);
  process.exit(1);
});
