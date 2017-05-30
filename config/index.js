/**
 * Created by thomas on 2017-05-31.
 *
 * Imports all the *.json files in this config folder as modules.
 *
 */

const fs = require("fs")
const path = require("path")

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf(".") !== 0) && (file.slice(-5) === ".json")
  })
  .forEach(file => {
    this[file.slice(0, file.length - 5)] = require(`./${file.slice(0, file.length - 5)}`)
  })
