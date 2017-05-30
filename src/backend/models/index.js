
const fs = require("fs")
const path = require("path")
const sequelize = require("sequelize")
const basename = path.basename(module.filename)
const logger = require("../lib/logger")

const db = {}

const config = require("../config")
const connection = new sequelize(config.database.database, config.database.username, config.database.password, {
  dialect: config.database.dialect,
  host: config.database.host,
  port: config.database.port,
  logging: logger.debug.bind("sequelize")
})

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf(".") !== 0) && (file !== basename) && (file.slice(-3) === ".js")
  })
  .forEach(file => {
    const model = connection.import(path.join(__dirname, file))

    db[model.name] = model
  })

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db)
  }
})

db.connection = connection
db.sequelize = sequelize

module.exports = db
