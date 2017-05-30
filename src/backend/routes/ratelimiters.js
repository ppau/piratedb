/**
 * Created by thomas on 2017-06-28.
 */
const ratelimit = require('koa-ratelimit')
const redis = require('redis')
const uuid = require("node-uuid")

const hour = 3600000

function createIpRatelimiter(limit, duration) {
  // unique id for each ratelimiter instance.
  const id = uuid.v4()

  return ratelimit({
    db: redis.createClient(),
    duration: duration,
    max: limit,
    id: function(context) {
      // console.log(`${context.ip}://${id}`)
      return `${context.ip}://${id}`
    }
  })
}

function createIpHourlyRatelimiter(limit) {
  return createIpRatelimiter(limit, hour)
}

module.exports = {
  createIpRatelimiter,
  createIpHourlyRatelimiter,
}
