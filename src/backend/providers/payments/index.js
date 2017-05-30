
const BaseRoutes = require("../../lib/routes").BaseRoutes
const endpoints = require("../../lib/routes").endpoints

const { json } = require("../view-helpers")

class Payments extends BaseRoutes {
  [endpoints]() {
    const name = this.name

    if (!name) {
      throw new TypeError("Subclass must provide this.name")
    }

    return {
      get: {
        [`/payment/${name}`]: this.generateToken.bind(this)
      },
      post: {
        [`/payment/${name}`]: json(this.processPayment.bind(this))
      }
    }
  }
}

module.exports = { Payments }
