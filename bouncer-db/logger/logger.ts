import winston from "winston";

const LOG_FILE_DIR = "logs";

const winstonFormat = winston.format.combine(
  winston.format.json(),
  winston.format.timestamp()
);

const winstonFileOptions = { flags: "w" };

export const genericLogger = winston.createLogger({
  format: winstonFormat,
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: `${LOG_FILE_DIR}/info.log`,
      level: "info",
      options: winstonFileOptions,
    }),
    new winston.transports.File({
      filename: `${LOG_FILE_DIR}/error.log`,
      level: "error",
      options: winstonFileOptions,
    }),
  ],
});
