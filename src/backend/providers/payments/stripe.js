
const stripe = require("stripe")

const logger = require("../../lib/logger")
const { Payments } = require("./index")
const { Invoice, Member } = require("../../models")

const config = require("../../config")

class StripePayments extends Payments {
  constructor(router) {
    super(router)

    this.name = "stripe"
    this.gateway = stripe(config.gateways.stripe.privateKey)
  }

  async generateToken(ctx) {
    ctx.body = { token: config.gateways.stripe.clientToken }
  }

  async processPayment(ctx) {
    const { paymentInfo, amount, memberId } = ctx.request.body
    let charge_params = {
      source: paymentInfo.id,
      amount: Math.floor(parseFloat(amount) * 100),
      description: `Member contribution from ${memberId}`,
      currency: config.gateways.stripe.currency
    }
    try {
      const res = await this.gateway.charges.create(charge_params)

      const data = {
        amount,
        memberId,
        status: res.paid ? "paid" : null
      }
      const invoice = await Invoice.createFromFormData(this.name, data)

      let member = ctx.state.user ? await ctx.state.user.getMember() : null

      if (!member) {
        member = memberId ? await Member.findById(memberId) : null
      }

      if (member) {
        await member.addInvoice(invoice)
      }

      // TODO: email invoice

      ctx.status = 200
      ctx.body = {
        transactionId: invoice.transactionId
      }
    } catch (error) {
      if (error.type === "StripeCardError") {
        logger.warn("payments:stripe", "A card has been declined", { request: ctx.request, error })
        ctx.status = 400
        ctx.body = { error: "The card has been declined by the payment gateway." }
        // The card has been declined
      } else {
        logger.error("payments:stripe", "An unexpected error occurred processing a payment", { request: ctx.request, error })
        ctx.status = 502
        ctx.body = { error: "An unexpected error occurred processing a payment." }
      }
    }
  }
}

module.exports = { StripePayments }
