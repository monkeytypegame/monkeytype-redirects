import winston, { createLogger, format } from "winston";

const customFormat = format.combine(
  format.colorize(),
  format.timestamp(),
  format.printf((info) => {
    const { level, message, timestamp, stack, ...meta } = info;
    let metaString = "";
    try {
      if (Object.keys(meta).length > 0) {
        metaString = "\n" + JSON.stringify(meta, null, 2);
      }
    } catch (error) {
      metaString =
        "\n" + "Failed to stringify meta data " + (error as Error).message;
    }
    return `${timestamp} ${level} ${stack || message}${metaString}`;
  })
);

const logger = createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  transports: [
    new winston.transports.Console({
      format: customFormat,
      handleExceptions: true,
      handleRejections: true,
    }),
  ],
});

if (process.env.NODE_ENV === "production") {
  logger.add(
    new winston.transports.File({
      filename: "logs/combined.log",
      format: customFormat,
      handleExceptions: true,
      handleRejections: true,
    })
  );
}

export default logger;
