#!/usr/bin/env node
/* eslint-disable no-process-exit,no-process-env,no-console */

const app = require("../src/backend/app")
const logger = require("../src/backend/lib/logger")
const debug = require("debug")("piratedb:server")
const http = require("http")
const config = require("../src/backend/config")

function normalizePort(val) {
  const p = parseInt(val, 10)

  if (Number.isNaN(p)) {
    // named pipe
    return val
  }

  if (p >= 0) {
    // port number
    return p
  }

  return false
}

const port = normalizePort(process.env.PORT || config.www.port)

function onError(error) {
  if (error.syscall !== "listen") {
    throw error
  }

  const bind = typeof port === "string" ? `Pipe ${port}` : `Port ${port}`

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      logger.error("app", `${bind} requires elevated privileges`)
      process.exit(1)
      break
    case "EADDRINUSE":
      logger.error("app", `${bind} is already in use`)
      process.exit(1)
      break
    default:
      throw error
  }
}

const server = http.createServer(app.callback())

function onListening() {
  const addr = server.address()
  const bind = typeof addr === "string" ? `pipe ${addr}` : `port ${addr.port}`

  logger.notice("app", `Listening on ${bind}`)
}

server.on("error", onError)
server.on("listening", onListening)
server.listen(port)
