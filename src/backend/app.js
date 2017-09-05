const { Promise } = require("bluebird")

global.Promise = Promise

const fs = Promise.promisifyAll(require("fs"))
const path = Promise.promisifyAll(require("path"))

const koa = require("koa")
const convert = require('koa-convert')
const serve = require('koa-static')

// Fix pg issue: https://github.com/sequelize/sequelize/issues/3781#issuecomment-104278869
const pg = require('pg')

delete pg.native

const logger = require("./lib/logger")

const config = require("./config")

logger.notice("app", `=== PirateDB startup: app.js initialising, version ${config.packageJson.version}`)

config.configLoggerStream.toString().split("\n").forEach((line) => {
  try {
    const log = JSON.parse(line)

    logger.log(log.level, "config", log.message)
  } catch (e) {
    return
  }
})
// config.configLogger.remove('memory-file')

const env = config.env
const isDevelopment = env === "development"

// database spin up
const models = require("./models")

// if (isDevelopment && false) {
if (isDevelopment) {
  models.connection.sync().then(() => {
    logger.notice("app", "Models database sync complete.")
  })
} else {
  // TODO: check migrations up to date, must be run manually, probably die otherwise?
  logger.notice("app", "Models database sync skipped, check migrations are up to date manually.")
}

const emailService = require("./services/emailService")

logger.notice("app", `Email service is using the ${emailService.transportConfig.name} provider.`)

const app = new koa()

process.on("unhandledRejection", (error) => {
  logger.error("app-error-message", error.message)
  if (error && error.sql) {
    logger.error("app-error-sequalize-sql", error.sql)
  }
  logger.error("app-error-stack", error.stack)
})

// templating
require("koa-ejs")(app, {
  root: path.join(__dirname, "../frontend/views"),
  layout: false,
  cache: !isDevelopment,
})

// querystrings
const qs = require('koa-qs')

qs(app)

// body parsers.
const koaBody = require('koa-body')

app.use(koaBody({
  multipart: true,
  formidable: { keepExtensions: true }
}))

// validation
require('koa-validate')(app)

// Helmet HTTP header protection.
const frameguard = {}

if (isDevelopment) {
  frameguard.action = 'allow-from'
  frameguard.domain = 'https://discuss.pirateparty.org.au/'
} else {
  frameguard.action = 'sameorigin'
}

app.use(require("koa-helmet")({
  frameguard: frameguard
}))

// Simple sessions.
const redis = require('koa-redis')
const session = require('koa-session')
const sessionStore = redis()

const SESSION_CONFIG = {
  key: 'piratedb:session',
  store: sessionStore,
  maxAge: 14400000,  /** 4 hours **/
}

app.keys = [config.session.secret]
app.use(session(SESSION_CONFIG, app))

// Passport authentication
const passport = require("koa-passport")

app.use(passport.initialize())
app.use(passport.session())

// Add Passport local strategy
const User = require("./models").User

passport.use(User.createStrategy())
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

// Application state context
app.use(async (ctx, next) => {
  const context = Object.assign({}, config.context)

  context.meta = context.meta ? Object.assign({}, context.meta) : {}

  ctx.state.title = `${context.organisation_name} - ${context.application_name}`
  ctx.state.context = context
  return next()
})

// Application routes
const routes = require("./routes")

app.use(routes.router.routes())
app.use(routes.router.allowedMethods())

// static files
app.use(serve(path.resolve(path.join(__dirname, "/../../public"))))

// Renewal reminders, we love money.
const membershipRenewalService = require("./services/membershipRenewalService")

membershipRenewalService.start()

// mailing list sync
const dadaMailingListSyncService = require("./services/dadaMailingListSyncService")
const ppauMailingListSyncService = require("./services/ppauMailingListSyncService")

module.exports = app
