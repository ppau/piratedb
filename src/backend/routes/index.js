
const Router = require("koa-router")

const {LandingRoutes} = require("./landing")
const {MemberRoutes} = require("./member")
const {AdminRoutes} = require("./admin")
const {AuthenticationRoutes} = require("./auth")

const {BraintreePayments} = require("../providers/payments/braintree")
const {DirectDepositPayments} = require("../providers/payments/direct-deposit")
const {ChequePayments} = require("../providers/payments/cheque")
const {StripePayments} = require("../providers/payments/stripe")

const router = new Router()

// General
router.use('', new AuthenticationRoutes().router.routes())
router.use('', new LandingRoutes().router.routes())
router.use('', new MemberRoutes().router.routes())
router.use('', new AdminRoutes().router.routes())

// Payment gateways
router.use('', new BraintreePayments().router.routes())
router.use('', new DirectDepositPayments().router.routes())
router.use('', new ChequePayments().router.routes())
router.use('', new StripePayments().router.routes())

module.exports = { router }
