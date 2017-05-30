const Router = require("koa-router")

const endpoints = Symbol("endpoints")

class BaseRoutes {
  get router() {
    let router = new Router()
    let routes = this[endpoints]()

    Object.keys(routes).map((key) => {
      let fn = Object.getPrototypeOf(router)[key].bind(router)
      Object.keys(routes[key]).forEach((path) => {

        if (!Array.isArray(routes[key][path])) {
          fn(path, (ctx, next) => {
            return routes[key][path](ctx, next)
          })
        } else {
          fn(path, ...routes[key][path].map((route) => {
            return (ctx, next) => {
              return route(ctx, next)
            }
          }))
        }

      })
    })
    return router
  }
}

module.exports = {endpoints, BaseRoutes}
