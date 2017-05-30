const moment = require("moment")
const uuid = require("node-uuid")

module.exports = (sequelize, DataTypes) => {
  const Invoice = sequelize.define('Invoice', {
    totalAmountInCents: DataTypes.BIGINT,
    paymentDate: DataTypes.DATE,
    paymentMethod: DataTypes.STRING,
    reference: DataTypes.STRING,
    paymentStatus: DataTypes.STRING,
    transactionId: DataTypes.STRING,
  })

  Invoice.associate = (models) => {
    Invoice.belongsToMany(models.Member, {as: 'members', through: 'MemberInvoices', foreignKey: 'invoiceId'})
  }

  Invoice.createFromFormData = function(paymentMethod, data) {
    return Invoice.create({
      paymentMethod,
      // TODO: Check that this conversion is correct:
      totalAmountInCents: Math.floor(parseFloat(data.amount) * 100),
      paymentDate: moment.utc().format("L"),
      reference: data.memberId,
      paymentStatus: data.status || "new",
      transactionId: uuid.v4()
    })
  }

  Invoice.prototype.getReferenceNumber = function() {
    return `${moment.utc(this.get('createdAt')).year()}P${("00000" + this.get('id')).slice(-5)}`
  }

  return Invoice
}
