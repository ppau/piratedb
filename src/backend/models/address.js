
module.exports = (sequelize, DataTypes) => {
  const Address = sequelize.define('Address', {
    address: DataTypes.STRING,
    suburb: DataTypes.STRING,
    state: DataTypes.STRING,
    postcode: { type: DataTypes.STRING, validate: { len: [4, 17] }},
    country: DataTypes.STRING,
  })

  Address.associate = (models) => {
    Address.hasOne(models.Member, {foreignKey: "postalAddressId"})
    Address.hasOne(models.Member, {foreignKey: "residentialAddressId"})
  }

  return Address
}
