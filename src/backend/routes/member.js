
const moment = require("moment")
const jpath = require('json-path')

const { Member } = require("../models")
const logger = require("../lib/logger")
const { requireAuth, requireAdmin } = require("../providers/auth")
const { json, RequestError } = require("../providers/view-helpers")
const emailService = require("../services/emailService")
const authUtils = require('../utils/auth')

const BaseRoutes = require("../lib/routes").BaseRoutes
const endpoints = require("../lib/routes").endpoints
const memberValidator = require('../../lib/memberValidator')
const ratelimiters = require('./ratelimiters')

/**
 * Member routing class
 *  - the /members/* paths are unauthenticated, new, verify etc.
 *  - the /account/* paths require an authenticated user.
 */
class MemberRoutes extends BaseRoutes {
  [endpoints]() {
    return {
      get: {
        "/members/new": this.renderNew,
        "/members/verify/:id/:hash": this.renderVerify,

        "/account/details": [requireAuth, this.index],
        "/account/update": [requireAuth, this.index],
        "/account/notifications": [requireAuth, this.index],
        "/account/renew": [requireAuth, this.index],
      },
      post: {
        "/members/new": [ratelimiters.createIpHourlyRatelimiter(5), json(this.new.bind(this))],
        "/members/verify/:id/:hash": [ratelimiters.createIpHourlyRatelimiter(5), json(this.verify.bind(this))],

        "/account/change-password": [ratelimiters.createIpHourlyRatelimiter(5), requireAuth, json(this.changePassword.bind(this))],
        "/account/update": [ratelimiters.createIpHourlyRatelimiter(10), requireAuth, json(this.update.bind(this))],
        "/account/renew": [ratelimiters.createIpHourlyRatelimiter(5), requireAuth, json(this.renew.bind(this))],
      },
      all: {
        "/members": async function(ctx) {
          ctx.redirect('/members/new')
          ctx.status = 302
        }
      }
    }
  }

  async index(ctx) {
    await ctx.render("index", {title: "Pirate Party Australia"})
  }

  async renderNew(ctx) {
    await ctx.render("index", {title: "Pirate Party Australia"})
  }

  async renderRenew(ctx) {
    await ctx.render("index", {title: "Pirate Party Australia"})
  }

  async renderVerify(ctx) {
      await ctx.render("index", {title: "Pirate Party Australia"})
  }

  async verify(ctx) {
    let member = await Member.findOne(Object.assign({}, {attributes: ["id", "verified", "verificationHash"]}, {where: {id: ctx.params.id}}))
      .then((member) => {
        if (member.verified){
          let error = new Error("Member is already verified.")
          error.member = member
          return Promise.reject(error)
        }

        if (member.verificationHash !== ctx.params.hash){
          return Promise.reject(new Error("Verification hash is invalid."))
        }

        member.verify()

        ctx.body = {
          verificationAccepted: true,
          message: "Verification request was successful."
        }
      }).catch((error) => {
        // within 7 days of verification, return that it was already successful.
        if (error.member && !!error.member.verified && moment.utc(error.member.verified) > moment.utc().subtract(7, "days")){
          ctx.body = {
            verificationAccepted: true,
            message: "Verification request has already been accepted."
          }
          return
        }
        ctx.body = {
          verificationAccepted: false,
          message: "Verification request is not valid."
        }
      })
  }

  async new(ctx) {
    // Validate the input
    const data = ctx.request.body.details

    logger.info("member-new")

    // Client sent a password, so we assume client side validation confirmed pw == confirmed pw.
    const validationErrors = memberValidator.isValidWithPasswords(data, data.password, data.password)

    if (await authUtils.usernameNotAvailable(data.email)) {
      validationErrors.push("Email address cannot be used at this time.")
    }

    // Handle any validation errors
    if (validationErrors.length){
      ctx.status = 400
      ctx.body = {
        errors: validationErrors,
      }
      return
    }

    // Create member, errors from here cannot go to the client side
    const { success, member, errors } = await Member.createFromFormData(data)

    // Handle any saving errors
    if (!success){
      ctx.status = 400
      ctx.body = {
        errors: [
          "An unexpected server error occurred, please try again later."
        ]
      }
      return
    }

    ctx.status = 200
    ctx.body = {
      success: true,
      id: member.id,
      type: member.type,
      verified: member.verified
    }
  }

  async renew(ctx) {
    logger.info("member-renew", `Membership renewal requested for user.id ${ctx.state.user.id}.`)

    let renewValidator = ctx.checkBody('/data/renew', jpath.create).get(0).notEmpty("Renew value required.").eq(true, "Invalid value.")

    if (renewValidator.hasError() || !renewValidator.value) {
      ctx.status = 400
      ctx.body = {
        errors: {
          renew: "Invalid value."
        }
      }
      return
    }

    await ctx.state.user.getMember()
      .then((member) => {
        if (!member) {
          ctx.errors.user = "User has no member"
          throw new Error("Invalid post data.")
        }

        return member.membershipRenew()
      })
      .then((member) => {
        ctx.status = 200
        ctx.body = {
          data: {
            success: true
          }
        }
      })
      .catch((error) => {
        logger.error("member-renew", error.message)
        ctx.status = 400
        ctx.body = {
          errors: ctx.errors || ["Your membership cannot be renewed at this time."]
        }
      })
  }

  async update(ctx) {
    // Validate the input
    const data = ctx.request.body.details

    logger.info("member-update", `Member update requested for user.id ${ctx.state.user.id}.`)

    const validationErrors = memberValidator.isValid(data)

    // Handle any validation errors
    if (validationErrors.length){
      ctx.status = 400
      ctx.body = {
        errors: validationErrors,
      }
      return
    }

    // Update member
    const { success, member, errors } = await Member.updateFromFormData(data, ctx.state.user, ctx)

    // Handle any saving errors
    if (!success){
      ctx.status = 400
      ctx.body = {
        errors: errors.map((error) => {
          return error.message ? error.message : "Unknown error"
        }),
      }
      return
    }

    ctx.status = 200
    ctx.body = {
      success: true,
      id: member.id,
      type: member.type,
      verified: member.verified
    }
  }

  async changePassword(ctx) {
    // Validate the input
    logger.info("account-change-password", ctx.state.user.id)

    // Required fields
    let data = {}
    try {
      data.currentPassword = ctx.request.body.data.currentPassword
      data.newPassword = ctx.request.body.data.newPassword
    }
    catch (e) {
      ctx.status = 400
      ctx.body = {
        errors: [
          "Required field missing",
        ]
      }
      return
    }

    if (!memberValidator.isValidPassword(data.newPassword)){
      ctx.status = 400
      ctx.body = {
        errors: [
          "Invalid new password",
        ]
      }
      return
    }

    const user = ctx.state.user
    await user.checkPasswordPromise(data.currentPassword)
      .then((match) => {
        if (!match){
          return Promise.reject(new RequestError("Current password was incorrect", ['currentPassword']))
        }
        return Promise.resolve(user)
      })
      .then((user) => {
        return user.savePassword(data.newPassword)
      })
      .then((user) => {
        ctx.status = 200
        ctx.body = {
          success: true
        }
      })
      .catch((error) => {
        let body = [
          'An unknown error occurred.'
        ]
        if (error instanceof RequestError) {
          body = {
            errors: error.getErrors(),
            fields: error.getFieldErrors(),
          }
        }

        ctx.status = 400
        ctx.body = body
      })
  }
}

module.exports = { MemberRoutes }
