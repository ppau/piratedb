
const logger = require("../../lib/logger")
const { Payments } = require("./index")
const { Invoice, Member } = require("../../models")
const emailService = require("../../services/emailService")

class DirectDepositPayments extends Payments {
  constructor(router) {
    super(router)

    this.name = "direct-deposit"
  }

  async generateToken(ctx) {
    ctx.status = 501
  }

  async processPayment(ctx) {
    const data = ctx.request.body
    const invoice = await Invoice.createFromFormData(this.name, data)

    let member = ctx.state.user ? await ctx.state.user.getMember() : null

    if (!member) {
      member = data.memberId ? await Member.findById(data.memberId) : null
    }

    if (member) {
      await member.addInvoice(invoice)
      emailService.donationReferenceNumber(member.email, invoice)
    }

    ctx.status = 200
    ctx.body = {
      transactionId: invoice.transactionId,
      reference: invoice.getReferenceNumber(),
    }
  }
}

module.exports = { DirectDepositPayments }
