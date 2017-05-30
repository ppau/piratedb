const Promise = require("bluebird").Promise
const uuid = require("node-uuid")
const moment = require("moment")
const MEMBERSHIP_STATUSES = require('../../lib/membershipConstants').MEMBERSHIP_STATUSES

const logger = require("../lib/logger")

const EXCLUDED_CURRENT_STATUSES = [
  MEMBERSHIP_STATUSES.pending,
  MEMBERSHIP_STATUSES.rejected,
  MEMBERSHIP_STATUSES.resigned,
  MEMBERSHIP_STATUSES.suspended,
  MEMBERSHIP_STATUSES.expelled,
]

const ACTIVE_STATUSES = [
  MEMBERSHIP_STATUSES.accepted,
]

module.exports = (sequelize, DataTypes) => {
  const Member = sequelize.define('Member', {
    id: {type: DataTypes.UUID, primaryKey: true},
    email: {type: DataTypes.STRING},
    givenNames: DataTypes.STRING,
    surname: DataTypes.STRING,
    dateOfBirth: DataTypes.DATEONLY,
    gender: DataTypes.STRING,
    primaryPhoneNumber: DataTypes.STRING,
    secondaryPhoneNumber: DataTypes.STRING,
    type: DataTypes.STRING,
    status: DataTypes.STRING,
    verified: {type: DataTypes.DATE, allowNull: true},
    verificationHash: {type: DataTypes.STRING, allowNull: true},
    memberSince: {type: DataTypes.DATE, allowNull: true},
    expiresOn: {type: DataTypes.DATE, allowNull: false},
    lastRenewalReminder: {type: DataTypes.DATE, allowNull: true},
    renewalHash: {type: DataTypes.UUID, allowNull: true},
    isPostalAddressDifferent: {type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false},
    data: { type: DataTypes.JSON, defaultValue: {} },
  })

  Member.MEMBERSHIP_STATUSES = MEMBERSHIP_STATUSES

  Member.associate = (models) => {
    Member.belongsTo(models.Address, { as: "postalAddress", foreignKey: "postalAddressId" })
    Member.belongsTo(models.Address, { as: "residentialAddress", foreignKey: "residentialAddressId" })
    Member.belongsToMany(models.Invoice, { as: 'invoices', through: 'MemberInvoices', foreignKey: 'memberId' })
    Member.belongsTo(models.User, { as: "user", foreignKey: "userId" })
  }

  Member.withActiveStatusAndEnabledUserExpiringBefore = (date) => {
    const User = require('../models').User

    return Member.findAll({
      where: {
        expiresOn: { $lt: date },
        type: { $notIn: EXCLUDED_CURRENT_STATUSES },
        userId: { $ne: null },
      },
      include: [{
        model: User,
        as: "user",
        where: {
          enabled: true,
        }
      }]
    })
  }

  /**
   * Includes members with expired memberships, essentially 'accepted' status, e.g. not resigned.
   * @param options
   * @returns {Promise.<Array.<Model>>|Array|undefined}
   */
  Member.withActiveStatus = (options) => {
    return Member.findAll(Object.assign({
      where: {
        status: { $notIn: EXCLUDED_CURRENT_STATUSES }
      }
    }, options || {}))
  }

  /**
  * Includes members with active memberships, essentially 'resigned' status, e.g. not accepted.
  * @param options
  * @returns {Promise.<Array.<Model>>|Array|undefined}
  */
  Member.withInactiveStatus = (options) => {
    return Member.findAll(Object.assign({
      where: {
        status: { $in: EXCLUDED_CURRENT_STATUSES }
      }
    }, options || {}))
  }

  Member.allCurrent = () => {
    return Member.find({
      where: {
        expiresOn: { $gt: new Date() },
        type: { $notIn: EXCLUDED_CURRENT_STATUSES }
      }
    })
  }

  Member.updateFromFormData = (data, user, ctx) => {

    function updateMember(data) {
      return {
        givenNames: data.givenNames,
        surname: data.surname,
        email: data.email,
        dateOfBirth: moment.utc(data.dateOfBirth, "DD/MM/YYYY").toDate(),
        gender: data.gender,
        primaryPhoneNumber: data.primaryPhoneNumber,
        secondaryPhoneNumber: data.secondaryPhoneNumber,
        isPostalAddressDifferent: data.isPostalAddressDifferent,
        residentialAddress: {
          address: data.residentialAddress.address,
          suburb: data.residentialAddress.suburb,
          state: data.residentialAddress.state,
          postcode: data.residentialAddress.postcode,
          country: data.residentialAddress.country,
        },
        postalAddress: {
          address: data.postalAddress.address,
          suburb: data.postalAddress.suburb,
          state: data.postalAddress.state,
          postcode: data.postalAddress.postcode,
          country: data.postalAddress.country,
        },
      }
    }

    return sequelize.transaction().then(async (t) => {
      const authUtils = require('../utils/auth')
      const Address = require("../models").Address
      const User = require("../models").User
      const logger = require("../lib/logger")
      const addressIncludeOptions = [
        {model: Address, as: 'residentialAddress'},
        {model: Address, as: 'postalAddress'}
      ]

      const memberData = updateMember(data)

      let emailChanged = null

      return await user.getMember({include: addressIncludeOptions})
        .then(async (member) => {
          // no member for user
          if (!member) {
            return Promise.reject(new Error("No member for this user."))
          }

          // Check the member is active
          if (!member.getIsActiveStatus()) {
            return Promise.reject(new Error("Member status is not active."))
          }

          emailChanged = member.email !== memberData.email
          return member
        })
        .then(async (member) => {
          // Check if the email has change
          if (emailChanged) {
            const emailIsAvailable = await authUtils.usernameInUse(memberData.email, user, member) === false

            if (!emailIsAvailable) {
              return Promise.reject(new authUtils.UsernameInUseError("Changed email cannot be used."))
            }
          }
          return member
        })
        .then(async (member) => {
          const residentialAddress = Object.assign(member.residentialAddress, memberData.residentialAddress)
          const postalAddress = Object.assign(member.postalAddress, memberData.postalAddress)

          delete memberData.residentialAddress
          delete memberData.postalAddress

          Object.assign(member, memberData)


          await residentialAddress.save({transaction: t})
          await postalAddress.save({transaction: t})

          return member.save({transaction: t})
        })
        .then(async (savedMember) => {
          if (emailChanged && !user.isAdmin()) {
            user.username = memberData.email
            await user.save({transaction: t})
          }
          return savedMember
        })
        .then((savedMember) => {
          return {
            success: true,
            member: savedMember,
            errors: null
          }
        })
        .then((rtn) => {
          t.commit()
          logger.info("member-update", `Update member succeeded with uuid: ${rtn.member.id}`)
          if (ctx && emailChanged) {
            logger.info("member-update", `Email changed, force logging in user.id: ${ctx.state.user.id}`)
            ctx.login(user)
          }

          return rtn
        })
        .catch((error) => {
          logger.error("member-update", "Failed to update member", {error: error.toString(), member: data})
          t.rollback()

          let errors = [
            "An error occurred trying to update account."
          ]

          if (error instanceof authUtils.UsernameInUseError) {
            errors = [
              {email: "invalid", message: "Your email address cannot be changed at this time."}
            ]
          }

          return {
            success: false,
            member: null,
            errors: errors
          }
        })
    })
  }

  Member.createFromFormData = (data) => {
    function createHash() {
      return uuid.v4()
    }

    function setupMember(data) {
      return {
        id: createHash(),
        givenNames: data.givenNames,
        surname: data.surname,
        email: data.email.toLowerCase(),
        dateOfBirth: moment.utc(data.dateOfBirth, "DD/MM/YYYY").toDate(),
        gender: data.gender,
        primaryPhoneNumber: data.primaryPhoneNumber,
        secondaryPhoneNumber: data.secondaryPhoneNumber,
        type: data.membershipType,
        status: MEMBERSHIP_STATUSES.pending,
        verified: null,
        verificationHash: createHash(),
        memberSince: null,
        expiresOn: moment.utc().add(1, "year").toDate(), // FIXME should be config
        lastRenewalReminder: null,
        renewalHash: null,
        isPostalAddressDifferent: data.isPostalAddressDifferent,
        residentialAddress: data.residentialAddress,
        postalAddress: data.postalAddress,
      }
    }

    return sequelize.transaction().then((t) => {
      const User = require("../models").User
      const Address = require("../models").Address
      const logger = require("../lib/logger")

      let promise = User.register(data.email, data.password, {transaction: t})

      return Promise.join(promise, (user) => {
        let member = setupMember(data)
        member.userId = user.id
        return member
      })
        .then((member) => {
          return Member.create(member, {
            transaction: t,
            include: [
              {model: Address, as: 'residentialAddress'},
              {model: Address, as: 'postalAddress'},
            ]
          })
        })
        .then((savedMember) => {
          return {
            success: true,
            member: savedMember,
            errors: null
          }
        })
        .then((rtn) => {
          const emailService = require("../services/emailService")

          t.commit()
          emailService.memberApplicationReceived(rtn.member)
          emailService.memberVerifyEmail(rtn.member)
          emailService.memberApplicationSecretaryNotification(rtn.member)
          logger.info("member-new", `New member and user created with uuid: ${rtn.member.id}`)
          return rtn
        })
        .catch((error) => {
          logger.error("member-new", "Failed to create member", {error: error.toString(), member: data})
          t.rollback()
          return {
            success: false,
            member: null,
            errors: [
              error
            ]
          }
        })
    })
  }

  Member.prototype.shouldSendRenewalReminder = function() {
    if (this.lastRenewalReminder === null) {
      return true
    }

    const fortnight = moment.utc(this.lastRenewalReminder).add(14, "days").toDate()

    return fortnight < moment.utc()
  }

  Member.prototype.memberRenewalOpen = function() {
    if (this.status !== MEMBERSHIP_STATUSES.accepted) {
      return false
    }

    if (moment.utc(this.expiresOn).add(-60, "days") > moment.utc()) {
      return false
    }

    return true
  }

  Member.prototype.membershipAccepted = function() {
    this.memberSince = moment.utc().format("L")
    return this.save()
      .then((member) => {
        const emailService = require("../services/emailService")

        emailService.memberApplicationAccepted(member)
        return member
      })
  }

  Member.prototype.membershipRenew = function() {
    if (!this.memberRenewalOpen()) {
      throw new Error(`Membership renewal is not open for ${this.id}.`)
    }
    this.expiresOn = this.expiresOn > moment.utc() ? moment.utc(this.expiresOn).add(1, "years") : moment.utc().add(1, "years")
    return this.save()
      .then((member) => {
        const emailService = require("../services/emailService")
        emailService.memberRenewalSuccessful(member)
        return member
      })
  }

  Member.prototype.createUser = async function() {
    const User = require('../models').User
    const authUtils = require('../utils/auth')
    const emailService = require('../services/emailService')

    if (await !this.getUser()) {
      throw new Error("Member already has a user account.")
    }

    if (await authUtils.usernameInUse(this.email, null, this)) {
      throw new Error("Email address already in use as a username.")
    }

    const user = await sequelize.transaction().then((t) => {
      return User.register(this.email, uuid.v4(), {transaction: t})
        .then((newUser) => {
          this.setUser(newUser, {transaction: t})
          return newUser.setResetPasswordKey({transaction: t})
        }).then((newUser) => {
          t.commit()
          return newUser
        }).catch((error) => {
          t.rollback()
          logger.error("member-model-create-user", error.message)
          throw new Error("An error occurred")
        })
    })

    return user
  }

  Member.prototype.verify = function() {
    this.verified = moment.utc()
    this.save()
  }

  Member.prototype.getFirstName = function() {
    return this.givenNames.split(" ")[0]
  }

  Member.prototype.getAcceptedStatus = function() {
    return !(this.status in EXCLUDED_CURRENT_STATUSES)
  }

  Member.prototype.getStatusText = function() {
    if (this.status !== MEMBERSHIP_STATUSES.accepted) {
      return this.status
    }

    if (this.expiresOn < moment.utc()) {
      return "expired"
    }
    return "current"
  }

  Member.prototype.getIsActiveStatus = function() {
    return ACTIVE_STATUSES.includes(this.status)
  }

  return Member
}
