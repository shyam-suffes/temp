const logger = require('./config/logger');
const app = require('./app');

let server = app.listen(global.env.PORT, () => {
  logger.info({ apiModule: "server", apiHandler: "server.js" }, `Listening to port ${global.env.PORT}`);
});
//exitHandler
const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info({ apiModule: "server", apiHandler: "server.js" }, 'Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  console.log("unexpectedErrorHandler", error);
  logger.error({ apiModule: "server", apiHandler: "server.js" }, error);
  exitHandler();
};
// console.log("__dirname", process.env)
process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info({ apiModule: "server", apiHandler: "server.js" }, 'SIGTERM received');
  if (server) {
    server.close();
  }
});