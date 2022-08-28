const winston = require("winston");

const logger = winston.createLogger({
    transports:[
        new winston.transports.File({filename:"error-logs.log"}),
        new winston.transports.Console()
    ]
})
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
      format: winston.format.simple(),
    }));
  }

module.exports = (level,message) =>{
    logger.log({
        level:level,
        message:message
    })
}
