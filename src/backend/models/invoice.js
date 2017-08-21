const moment = require("moment")
const uuid = require("node-uuid")

const { INVOICE_TYPES, INVOICE_STATUSES} = require('../../lib/invoiceConstants')

module.exports = (sequelize, DataTypes) => {
  const Invoice = sequelize.define('Invoice', {
    totalAmountInCents: DataTypes.BIGINT,
    paymentDate: DataTypes.DATE,
    paymentMethod: DataTypes.STRING,
    reference: DataTypes.STRING,
    paymentStatus: DataTypes.STRING,
    transactionId: DataTypes.STRING,
    data: { type: DataTypes.JSON, defaultValue: {} },
  })

  Invoice.INVOICE_TYPES = INVOICE_TYPES
  Invoice.INVOICE_STATUSES = INVOICE_STATUSES

  Invoice.associate = (models) => {
    Invoice.belongsToMany(models.Member, {as: 'members', through: 'MemberInvoices', foreignKey: 'invoiceId'})
  }

  Invoice.createFromFormData = async function(paymentMethod, data) {
    const invoice = await Invoice.create({
      paymentMethod,
      // TODO: Check that this conversion is correct:
      totalAmountInCents: Math.floor(parseFloat(data.amount) * 100),
      paymentDate: moment.utc().format("L"),
      reference: "", // updated in updateReferenceNumber()
      paymentStatus: data.status || "new",
      transactionId: uuid.v4(),
      data: {
        memberId: data.memberId || null
      }
    })

    invoice.updateReferenceNumber()
    return invoice
  }

  Invoice.prototype.getReferenceNumber = function() {
    return `${moment.utc(this.get('createdAt')).year()}P${("00000" + this.get('id')).slice(-5)}`
  }

  Invoice.prototype.updateReferenceNumber = async function() {
    await this.update({reference: this.getReferenceNumber()})
  }

  return Invoice
}
