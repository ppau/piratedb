const strategy = require("../lib/passport-local-sequelize")

module.exports = (sequelize, DataTypes) => {
  const User = strategy.defineUser(sequelize, {
    data: {
      type: DataTypes.JSON,
      defaultValue: {}
    },
  },
    null, { usernameLowerCase: true })

  User.associate = (models) => {
    User.hasOne(models.Member, {foreignKey: "userId"})
  }

  User.prototype.isAdmin = function() {
    return this.data.isAdmin
  }

  User.prototype.savePassword = function(newPassword) {
    return this.setPassword(newPassword)
      .then((user) => {
        return user.save()
      })
      .then((user) => {
        const emailService = require("../services/emailService")

        emailService.userPasswordChanged(user)
        return user
      })
  }

  User.prototype.makeAdmin = function() {
    this.data = this.data ? this.data : {}
    this.data.roles = this.data.roles ? this.data.roles : {}
    this.data.isAdmin = true
    return this.save()
  }

  User.prototype.makeSecretary = function() {
    this.makeAdmin()
    this.data.roles.isSecretary = true
    return this.save()
  }

  User.prototype.makeTreasurer = function() {
    this.makeAdmin()
    this.data.roles.isTreasurer = true
    return this.save()
  }

  User.prototype.removeAdmin = function() {
    this.data = {}
    return this.save()
  }

  return User
}
