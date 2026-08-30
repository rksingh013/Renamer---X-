const winston = require("winston");

const logger = winston.createLogger({
  level: "info",

  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })
  ),

  transports: [
    // General logs
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
    }),

    // All logs
    new winston.transports.File({
      filename: "logs/combined.log",
    }),

    // Show logs in terminal
    new winston.transports.Console(),
  ],
});

module.exports = logger;