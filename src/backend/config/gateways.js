const configJson = require("../../../config")

const env = process.env.NODE_ENV || "development"
const braintree = require("braintree")

let braintreeExp = {}

try {
  const braintreeConfig = configJson.braintree[env]

  braintreeExp = {
    environment: env === "production" ? braintree.Environment.Production : braintree.Environment.Sandbox,
    merchantId: braintreeConfig["braintree_merchant_id"],
    publicKey: braintreeConfig["braintree_public_key"],
    privateKey: braintreeConfig["braintree_secret_key"],
  }
} catch (e) {
  return
}


let stripeExp = {}

try {
  const stripeConfig = configJson.stripe[env]

  stripeExp = {
    privateKey: stripeConfig["stripe_secret_key"],
    clientToken: stripeConfig["stripe_public_key"],
    currency: "aud",
  }
} catch (e) {
  return
}

const gateways = Object.assign(true, {
  braintree: braintreeExp,
  stripe: stripeExp
})

module.exports = Object.freeze(gateways)
