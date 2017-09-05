
const { Member } = require("../models")
const logger = require("../lib/logger")

const BaseRoutes = require("../lib/routes").BaseRoutes
const endpoints = require("../lib/routes").endpoints

class LandingRoutes extends BaseRoutes {
  [endpoints]() {
    return {
      get: {
        "/": this.landingPage,
        "/chat": this.landingPage,
        "/discussion-forum": this.landingPage,
        "/donate": this.landingPage,

        "/local-crews": this.landingPage,
        "/events": this.landingPage,
        "/volunteer": this.landingPage,
        "/elections": this.landingPage,
        "/crowdfund": this.landingPage,
        "/store": this.landingPage,
        "/test": this.landingPage,
      }
    }
  }

  async landingPage(ctx) {
    await ctx.render("index", {})
  }
}

module.exports = { LandingRoutes }
