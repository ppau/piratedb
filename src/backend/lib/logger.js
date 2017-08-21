
const winston = require("winston")
const moment = require("moment")
const config = require("../config")

const { Logger, Transport, transports } = winston

// { emerg: 0, alert, crit, error, warning, notice, info, debug: 7 }
winston.setLevels(winston.config.syslog.levels)

class ActionLogger extends Logger {
  log(level, action, message, meta) {
    const data = {
      action,
      message,
      meta
    }

    return super.log(level, action, data)
  }
}

class DatabaseTransport extends Transport {
  constructor(options) {
    super(options)
    this.name = "database"
    this.level = options.level || "info"
  }

  log(level, action, data, callback) {
    const { message, meta } = data
    const timestamp = moment.utc().toDate()
    const LogEntry = require("../models").LogEntry

    LogEntry.create({
      timestamp: timestamp,
      level: level,
      action: action,
      message: message,
      severity: winston.config.syslog.levels[level],
      meta: meta,
    }).then((log) => {
      return callback(null, true)
    }).catch((error) => {
      return callback(error, false)
    })
  }
}

class ConsoleTransport extends transports.Console {
  timestamp() {
    return new Date().toISOString()
  }

  static formatter(opts) {
    const { action, meta, userId } = opts.meta
    const message = opts.meta.message || "(no message provided)"
    const timestamp = opts.timestamp()
    const level = opts.level.toUpperCase()

    let base = `[${timestamp}] [${level}] [${action}] ${message}`

    if (userId != null) {
      base += ` (User: ${userId})`
    }

    if (meta && config.env !== "production") {
      try {
        base += `\n  ${JSON.stringify(meta)}`
      } catch (err) {
        // give up
      }
    }

    return base
  }
}

const logger = new ActionLogger({
  levels: winston.config.syslog.levels,
  transports: [
    new ConsoleTransport({
      level: config.env === "production" ? "notice" : "debug",
      timestamp: () => {
        return moment.utc().format("YYYY-MM-DD HH:mm:ss ZZ")
      },
      formatter: ConsoleTransport.formatter
    }),
    new DatabaseTransport({
      level: "notice",
      timestamp: () => {
        return moment.utc().format("YYYY-MM-DD HH:mm:ss ZZ")
      },
      formatter: ConsoleTransport.formatter
    })
  ]
})

module.exports = logger
