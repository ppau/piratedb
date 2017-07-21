
const passport = require("koa-passport")
const jpath = require('json-path')
const validator = require('validator')
const moment = require("moment")
const memberValidator = require('../../lib/memberValidator')

const { Member, Address, User } = require("../models")

const emailService = require("../services/emailService")
const BaseRoutes = require("../lib/routes").BaseRoutes
const endpoints = require("../lib/routes").endpoints
const ratelimiters = require('./ratelimiters')

class AuthenticationRoutes extends BaseRoutes {
  [endpoints]() {
    return {
      get: {
        "/sign-in": this.renderSignIn,
        "/sign-out": this.signOut,

        "/forgotten-password-change/:resetPasswordKey/:username": this.renderForgottenPasswordChange,
        "/imported-member-password-change/:resetPasswordKey/:username": this.renderForgottenPasswordChange,
        "/forgotten-password": this.renderForgottenPassword,

        "/user/details": this.userDetails,
      },
      post: {
        "/sign-in": [ratelimiters.createIpHourlyRatelimiter(20), this.signIn],
        "/sign-out": this.signOut,

        "/forgotten-password-change/:resetPasswordKey/:username": [ratelimiters.createIpHourlyRatelimiter(5), this.forgottenPasswordChange],
        "/forgotten-password": [ratelimiters.createIpHourlyRatelimiter(5), this.forgottenPassword],
      }
    }
  }

  async renderSignIn(ctx) {
    // ctx.body = ctx.isoRender("member-form", { mode: "new" })
    await ctx.render("index", { title: "Membership application form" })
  }

  async signIn(ctx, next) {
    return await passport.authenticate('local', async function(error, user, info, status) {
      if (error) {
        throw error
      }

      if (user === false) {
        if (ctx.request.is('json')) {
          ctx.status = 401
          ctx.body = await AuthenticationRoutes.getUserDetails(ctx)
          ctx.body = await Object.assign(ctx.body, {errors: ["Invalid username or password."]})
          return
        }
        ctx.redirect("/sign-in?error=local")
      } else {
        await ctx.login(user)
        if (ctx.request.is('json')) {
          ctx.body = await AuthenticationRoutes.getUserDetails(ctx)
          return
        }
        ctx.redirect("/")
      }
    })(ctx, next)
  }

  async signOut(ctx) {
    ctx.logout()

    // json logout
    if (ctx.request.is('json')) {
      ctx.body = await AuthenticationRoutes.getUserDetails(ctx)
      return
    }

    ctx.redirect("/")
  }

  async renderForgottenPasswordChange(ctx) {
    await ctx.render("index", {title: "Forgotten password"})
  }

  async forgottenPasswordChange(ctx) {
    let usernameValidator = ctx.checkBody('/data/username', jpath.create).get(0).notEmpty("Username required.").len(0, 255)
    let resetPasswordKeyValidator = ctx.checkBody('/data/resetPasswordKey', jpath.create).get(0).notEmpty("Password reset key required.").len(0, 255)
    let newPasswordValidator = ctx.checkBody('/data/newPassword', jpath.create).get(0).notEmpty("New password required.").len(0, 255)

    let username = usernameValidator.value
    let newPassword = newPasswordValidator.value
    let resetPasswordKey = resetPasswordKeyValidator.value
    let user = await User.findByUsername(username)

    let errors = []

    if (!memberValidator.isValidPassword(newPassword)){
      errors.push("Invalid new password.")
    }

    if (!user) {
      errors.push("An unknown error occurred.")  // don't leak user existence.
    } else {
      await User.resetPassword(username, newPassword, resetPasswordKey)
        .then((user) => {
          emailService.userPasswordChanged(user)
        })
        .catch((error) => {
          errors.push("An unknown error occurred.")  // don't leak user existence.
        })
    }

    if (ctx.errors || errors.length > 0) {
      ctx.status = 401
      ctx.body = {
        validationErrors: ctx.errors,
        errors: errors,
      }
      return
    }

    ctx.body = {
      succeeded: true,
    }
  }

  async renderForgottenPassword(ctx) {
    await ctx.render("index", {title: "Forgotten password"})
  }

  async forgottenPassword(ctx, next) {
    let usernameValidator = ctx.checkBody('/data/username', jpath.create).get(0).notEmpty("Username required.").len(0, 255)
    let username = usernameValidator.hasError() ? null : usernameValidator.value

    if (ctx.errors) {
      ctx.status = 401
      ctx.body = {
        requestProcessed: false,
        errors: ctx.errors,
      }
      return
    }

    await User.findByUsername(username)
      .then((user) => {
        if (!user) {
          throw new Error
        }
        return User.setResetPasswordKeyByUsername(username)
      })
      .then((user) => {
        return Promise.all([
            user.getMember(),
            Promise.resolve(user)
          ])
      })
      .spread((member, user) => {
        member.user = user
        emailService.forgottenPasswordResetKey(member)
        ctx.body = {
          requestProcessed: true,
        }
      })
      .catch((error) => {
        if (validator.isEmail(username)) {
          emailService.forgottenPasswordUserNotFound(username)
        }
        ctx.body = {
          requestProcessed: true,
        }
      })
  }

  static get memberProps() {
    return {
      attributes: [
        "id",
        "email",
        "givenNames",
        "surname",
        "dateOfBirth",
        "gender",
        "primaryPhoneNumber",
        "secondaryPhoneNumber",
        "type",
        "status",
        "verified",
        "memberSince",
        "expiresOn",
        "lastRenewalReminder",
        "isPostalAddressDifferent",
      ],
      include: [
        {
          model: Address,
          as: "postalAddress",
          attributes: [
            'address',
            'suburb',
            'state',
            'postcode',
            'country',
          ]
        },
        {
          model: Address,
          as: "residentialAddress",
          attributes: [
            'address',
            'suburb',
            'state',
            'postcode',
            'country',
          ]
        }
      ]
    }
  }

  static getUserDetails(ctx) {
    let p = []

    p.push(Promise.resolve().then(() => {
      let rtn = {
        authenticated: ctx.isAuthenticated(),
        user: null
      }

      if (ctx.isAuthenticated() && ctx.state) {
        rtn.user = ctx.state.user ? {
          username: ctx.state.user.username,
          enabled: ctx.state.user.enabled,
          lastAuthenticated: ctx.state.user.lastAuthenticated,
          data: ctx.state.user.data,
        } : null
      }
      return rtn
    }))

    if (ctx.isAuthenticated()) {
      p.push(Member.findOne(Object.assign({}, AuthenticationRoutes.memberProps, {where: {userId: ctx.state.user.id}})))
    } else {
      p.push(new Promise((res, rej) => res(null)))
    }

    return Promise.all(p).spread((details, member) => {
      if (member){
        member.dataValues.statusHuman = member.getStatusText()
      }
      return Object.assign(details, {member: member})
    })
  }

  async userDetails(ctx) {
    ctx.body = await AuthenticationRoutes.getUserDetails(ctx)
  }
}

module.exports = {AuthenticationRoutes}
