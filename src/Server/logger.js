const winston = require("winston");
const fs = require("fs");
const path = require("path");

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Custom function to get caller info (file and line number)
const getCallerInfo = () => {
  const stack = new Error().stack.split("\n");
  // Find the first stack entry that's not in logger.js
  for (let i = 2; i < stack.length; i++) {
    const line = stack[i];
    if (!line.includes("logger.js") && !line.includes("node_modules")) {
      const match = line.match(/\((.+?):(\d+):(\d+)\)/);
      if (match) {
        const filePath = match[1];
        const lineNum = match[2];
        const fileName = path.basename(filePath);
        return { file: fileName, line: lineNum, path: filePath };
      }
    }
  }
  return { file: "unknown", line: "unknown", path: "unknown" };
};

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  defaultMeta: { service: "sabotage-server" },
  transports: [
    // Console output (colorized for development)
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.errors({ stack: true }),
        winston.format.printf(
          ({ timestamp, level, message, stack, ...meta }) => {
            const callerInfo = getCallerInfo();
            const metaStr = Object.keys(meta).length
              ? JSON.stringify(meta)
              : "";
            return `${timestamp} [${level}] (${callerInfo.file}:${callerInfo.line}): ${message}${
              metaStr ? " " + metaStr : ""
            }${stack ? "\n" + stack : ""}`;
          },
        ),
      ),
    }),
    // Error logs
    new winston.transports.File({
      filename: path.join(logsDir, "error.log"),
      level: "error",
      format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.errors({ stack: true }),
        winston.format.printf(
          ({ timestamp, level, message, stack, ...meta }) => {
            const callerInfo = getCallerInfo();
            return JSON.stringify({
              timestamp,
              level,
              message,
              file: callerInfo.file,
              line: callerInfo.line,
              path: callerInfo.path,
              stack,
              ...meta,
            });
          },
        ),
      ),
    }),
    // All logs
    new winston.transports.File({
      filename: path.join(logsDir, "combined.log"),
      format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.errors({ stack: true }),
        winston.format.printf(
          ({ timestamp, level, message, stack, ...meta }) => {
            const callerInfo = getCallerInfo();
            return JSON.stringify({
              timestamp,
              level,
              message,
              file: callerInfo.file,
              line: callerInfo.line,
              path: callerInfo.path,
              stack,
              ...meta,
            });
          },
        ),
      ),
    }),
  ],
});

module.exports = logger;
