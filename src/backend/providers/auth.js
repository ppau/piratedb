
const logger = require("../lib/logger")

function requireAuth(ctx, next) {
  if (!ctx.isAuthenticated()) {
    logger.warning("routing",
      `Unauthorised request from ${ctx.request.ip} for resource: ${ctx.url}`,
      { request: ctx.request }
    )

    if (ctx.is("application/json")){
      ctx.status = 403
      ctx.body = {
        errors: ["Access denied"],
        authenticated: false
      }
      return
    }

    const path = ctx.url

    ctx.redirect(`/sign-in?redirect=${path}`)
    return
  } else {
    const user = ctx.state.user

    if (!user.enabled) {
      ctx.logout()
      ctx.redirect("/")
    }
  }

  return next()
}

function requireAdmin(ctx, next) {
  if (!ctx.state.user.data.isAdmin) {
    logger.warning("routing",
      `Unauthorised request from ${ctx.request.ip} for resource: ${ctx.url}`,
      { request: ctx.request }
    )

    ctx.redirect("/sign-in")
    return
  }

  return next()
}

module.exports = { requireAuth, requireAdmin }
