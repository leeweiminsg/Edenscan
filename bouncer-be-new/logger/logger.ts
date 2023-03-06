import { createLogger, transports, format } from "winston";
const { combine, json, timestamp, prettyPrint } = format;

const winstonFileOptions = { flags: "w" };

const timezoned = () => {
  const utc0Time = new Date().toLocaleString("en-US", {
    timeZone: "Europe/London",
  });

  const sgTime = new Date().toLocaleString("en-US", {
    timeZone: "Asia/Singapore",
  });

  return `SG time: ${sgTime} | UTC+0 time: ${utc0Time}`;
};

const winstonIndexLoggerFormat = combine(
  json(),
  timestamp({ format: timezoned }),
  prettyPrint()
);

export const genericLogger = createLogger({
  format: winstonIndexLoggerFormat,
  transports: [
    new transports.File({
      filename: `logs/info.log`,
      level: "info",
      options: winstonFileOptions,
    }),
    new transports.File({
      filename: `logs/error.log`,
      level: "error",
      options: winstonFileOptions,
    }),
  ],
});

export const redisLogger = createLogger({
  format: winstonIndexLoggerFormat,
  transports: [
    new transports.File({
      filename: `redis/logs/info.log`,
      level: "info",
      options: winstonFileOptions,
    }),
    new transports.File({
      filename: `redis/logs/error.log`,
      level: "error",
      options: winstonFileOptions,
    }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  genericLogger.add(
    new transports.Console({
      format: combine(format.colorize(), format.simple()),
    })
  );

  redisLogger.add(
    new transports.Console({
      format: combine(format.colorize(), format.simple()),
    })
  );
}
