const process = require("process")
const streams = require('memory-streams')
const winston = require("winston")
const configJson = require("../../../config")
const packageJson = require('../../../package.json')

const env = process.env.NODE_ENV || "development"

/*
 * A temporary logger is used for the config loading since the main app logger uses
 * database transports which are not available until after this config module is loaded
 * (since the db obviously needs config settings before it can start up).
 */
const configLoggerStream = new streams.WritableStream()
const configLogger = new (winston.Logger)({
  levels: winston.config.syslog.levels,
  transports: [new winston.transports.File({ name: "memory-file", stream: configLoggerStream })]
})

class ConfigError extends Error {
  constructor(message) {
    super(message)
    this.message = message
    this.name = 'ConfigError'
  }
}

let environmentOverride
let localOverride

// env override
try {
  environmentOverride = configJson[env]
  if (!environmentOverride) {
    throw new ConfigError(`No ${env}.json override file found.`)
  }
  environmentOverride = configJson[env]
  configLogger.notice(`Config provided for env "${env}.json"!`)
} catch (e) {
  configLogger.notice(`No config provided for env "${env}.json" override; using defaults.`)
  environmentOverride = {}
}

// local override
try {
  localOverride = configJson['local'][env]
  if (!localOverride) {
    throw new ConfigError('No local.json override file found.')
  }
  configLogger.notice(`Config provided for "local.json"`)
} catch (e) {
  configLogger.notice(`No config provided for "local.json" override; using defaults.`)
  localOverride = {}
}

const config = Object.assign(true, {
  database: configJson.config[env].database,
  session: configJson.config[env].session,
  www: configJson.config[env].www,
  gateways: require('./gateways'),
  email: configJson.email[env],
  packageJson: packageJson,
}, environmentOverride, localOverride, { env, configLogger, configLoggerStream })

module.exports = Object.freeze(config)
