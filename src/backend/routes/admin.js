
const { requireAuth, requireAdmin } = require("../providers/auth")
const { Member, Address, User, LogEntry, Invoice } = require("../models")
const Serializer = require('sequelize-to-json')
const Sequelize = require("sequelize")
const logger = require("../lib/logger")
const moment = require("moment")
const jpath = require('json-path')

const BaseRoutes = require("../lib/routes").BaseRoutes
const endpoints = require("../lib/routes").endpoints
const ratelimiters = require('./ratelimiters')
const emailService = require("../services/emailService")
const ppauMailingListSyncService = require("../services/ppauMailingListSyncService")

const memberValidator = require('../../lib/memberValidator')
const statisticsProvider = require('../providers/statistics')

class AdminRoutes extends BaseRoutes {
  [endpoints]() {
    return {
      get: {
        "/admin/dashboard": [requireAuth, requireAdmin, this.renderDashboard],

        "/admin/members": [requireAuth, requireAdmin, this.members],
        "/admin/members/:id": [requireAuth, requireAdmin, this.member],

        "/admin/audit": [requireAuth, requireAdmin, this.index],
        "/admin/audit-list": [requireAuth, requireAdmin, this.audit],

        "/admin/treasurer": [requireAuth, requireAdmin, this.index],
        "/admin/invoices": [requireAuth, requireAdmin, this.index],
        "/admin/invoices-list": [requireAuth, requireAdmin, this.invoices],

        "/admin/statistics": [requireAuth, requireAdmin, this.statistics],

        "/admin/secretary/member-view/:id": [requireAuth, requireAdmin, this.index],
        "/admin/secretary": [requireAuth, requireAdmin, this.index],

        //"/admin*": [requireAuth, requireAdmin, this.redirect],
      },

      post: {
        "/admin/members/create-user/:id": [requireAuth, requireAdmin, this.createUserForMember],
        "/admin/members/:id": [requireAuth, requireAdmin, this.memberUpdate],

        "/admin/users/toggle-enabled/:id": [requireAuth, requireAdmin, this.toggleUserEnabled],
      }
    }
  }

  async index(ctx) {
    await ctx.render("admin", {title: "Pirate Party Australia"})
  }

  async renderDashboard(ctx) {
    await ctx.render("admin", {title: "Dashboard"})
  }

  static get memberScheme() {
    return {
      include: [
        "id",
        "email",
        "givenNames",
        "surname",
        "dateOfBirth",
        "gender",
        "primaryPhoneNumber",
        "secondaryPhoneNumber",
        "type",
        "status",
        "memberSince",
        "expiresOn",
        "verified",
        "postalAddress",
        "residentialAddress",
        "isPostalAddressDifferent",
        "userId",
      ],
      assoc: {
        postalAddress: {
          include: ["address", "suburb", "postcode", "state", "country"]
        },
        residentialAddress: {
          include: ["address", "suburb", "postcode", "state", "country"]
        }
      }
    }
  }

  static get userScheme() {
    return {
      include: [
        "username",
        "id",
        "lastAuthenticated",
        "enabled",
      ],
    }
  }

  static get logEntryScheme() {
    return {
      include: [
        "id",
        "timestamp",
        "level",
        "action",
        "message",
        "severity",
        "meta",
      ],
    }
  }

  static get invoiceScheme() {
    return {
      include: [
        "id",
        "totalAmountInCents",
        "paymentDate",
        "paymentMethod",
        "reference",
        "paymentStatus",
        "transactionId",
        "data",
        "createdAt",
        "updatedAt",
      ],
    }
  }

  static get memberProps() {
    return {
      attributes: [
        "id",
        "email",
        "givenNames",
        "surname",
        "dateOfBirth",
        "gender",
        "primaryPhoneNumber",
        "secondaryPhoneNumber",
        "type",
        "status",
        "memberSince",
        "expiresOn",
        "verified",
        "isPostalAddressDifferent",
        "userId",
      ],
      include: [
        {model: Address, as: "postalAddress"},
        {model: Address, as: "residentialAddress"},
        {model: User, as: "user"}
      ]
    }
  }

  static get userProps() {
    return {
      attributes: [
        "id",
        "username",
        "verified",
        "enabled",
        "lastAuthenticated",
      ],
      include: [
      ]
    }
  }

  static get logEntryProps() {
    return {
      attributes: [
        "id",
        "timestamp",
        "level",
        "action",
        "message",
        "severity",
        "meta",
      ],
      include: [
      ]
    }
  }


  static get invoiceProps() {
    return {
      attributes: [
        "id",
        "totalAmountInCents",
        "paymentDate",
        "paymentMethod",
        "reference",
        "paymentStatus",
        "transactionId",
        "data",
        "createdAt",
        "updatedAt",
      ],
      include: [
      ]
    }
  }

  async invoices(ctx) {
    const paginationDefaults = {
      size: 15,
      page: 1,
    }

    const fields = {}
    const validatorFn = (field, validator) => {
      fields[field] = validator
      return validator.hasError() ? null : validator.value
    }

    const paginationPage = validatorFn('page', ctx.checkQuery('page').toInt().gt(0)) || paginationDefaults.page
    const paginationSize = validatorFn('size', ctx.checkQuery('size').toInt().gt(0).le(100)) || paginationDefaults.size
    const filterStatus = validatorFn('status', ctx.checkQuery('status').optional().in(Object.keys(Invoice.INVOICE_STATUSES).concat(['all'])))
    const filterSearch = validatorFn('search', ctx.checkQuery('search').optional().len(1, 50))

    const pagination = {
      limit: paginationSize,
      offset: paginationSize * (paginationPage - 1),
    }

    const where = {
      $and: []
    }

    if (filterStatus && filterStatus !== 'all') {
      where.$and.push({
        paymentStatus: {
          $eq: filterStatus
        }
      })
    }


    if (filterSearch) {
      where.$and.push(
        Sequelize.where(Sequelize.fn("concat", Sequelize.col("reference"), Sequelize.col("transactionId")), {
          $iLike: `%${filterSearch}%`
        })
      )
    }

    ctx.body = await Invoice.findAndCountAll(Object.assign({
      where: where,
      order: [
        ["createdAt", "desc"],
      ]
    }, AdminRoutes.invoiceProps, pagination))
      .then((result) => {
        return {
          invoices: Serializer.serializeMany(result.rows, Invoice, AdminRoutes.invoiceScheme),
          count: result.count,
        }
      })
      .catch((error) => {
        logger.error("admin-invoices", error)
        return Sequelize.Promise.reject("An error has occurred while fetching invoices.")
      })
  }

  async audit(ctx) {
    const paginationDefaults = {
      size: 15,
      page: 1,
    }

    const fields = {}
    const validatorFn = (field, validator) => {
      fields[field] = validator
      return validator.hasError() ? null : validator.value
    }

    const paginationPage = validatorFn('page', ctx.checkQuery('page').toInt().gt(0)) || paginationDefaults.page
    const paginationSize = validatorFn('size', ctx.checkQuery('size').toInt().gt(0).le(100)) || paginationDefaults.size
    const filterSearch = validatorFn('search', ctx.checkQuery('search').optional().len(1, 50))

    const pagination = {
      limit: paginationSize,
      offset: paginationSize * (paginationPage - 1),
    }

    const where = {
      $and: []
    }

    if (filterSearch) {
      where.$and.push(
        Sequelize.where(Sequelize.fn("concat", Sequelize.col("message"), Sequelize.col("action")), {
          $iLike: `%${filterSearch}%`
        })
      )
    }

    ctx.body = await LogEntry.findAndCountAll(Object.assign({
      where: where,
      order: [
        ["timestamp", "desc"],
      ]
    }, AdminRoutes.logEntryProps, pagination))
      .then((result) => {
        return {
          logEntries: Serializer.serializeMany(result.rows, LogEntry, AdminRoutes.logEntryScheme),
          count: result.count,
        }
      })
      .catch((error) => {
        logger.error("admin-audit", error)
        return Sequelize.Promise.reject("An error has occurred while fetching log entries.")
      })
  }

  async members(ctx) {
    const states = ['NSW', 'QLD', 'VIC', 'ACT', 'WA', 'SA', 'TAS', 'NT']
    const paginationDefaults = {
      size: 15,
      page: 1,
    }

    const fields = {}
    const validatorFn = (field, validator) => {
      fields[field] = validator
      return validator.hasError() ? null : validator.value
    }

    const paginationPage = validatorFn('page', ctx.checkQuery('page').toInt().gt(0)) || paginationDefaults.page
    const paginationSize = validatorFn('size', ctx.checkQuery('size').toInt().gt(0).le(100)) || paginationDefaults.size
    const filterStatus = validatorFn('status', ctx.checkQuery('status').optional().in(Object.keys(Member.MEMBERSHIP_STATUSES).concat(['all'])))
    const filterState = validatorFn('state', ctx.checkQuery('state').optional().in(states))
    const filterSearch = validatorFn('search', ctx.checkQuery('search').optional().len(1, 50))

    const pagination = {
      limit: paginationSize,
      offset: paginationSize * (paginationPage - 1),
    }

    const where = {
      $and: []
    }

    if (filterStatus && filterStatus !== 'all') {
      where.$and.push({
        status: {
          $eq: filterStatus
        }
      })
    }

    if (filterSearch) {
      where.$and.push(
        Sequelize.where(Sequelize.fn("concat", Sequelize.col("givenNames"), Sequelize.col("surname"), Sequelize.col("email")), {
          $iLike: `%${filterSearch}%`
        })
      )
    }

    if (filterState) {
      where.$and.push({
        state: {
          $iLike: `%${filterState}`
        },
        country: {
          $iLike: `%australia`
        },
      })
    }

    ctx.body = await Member.findAndCountAll(Object.assign({
      where: where,
      include: [
        { model: Address, as: "residentialAddress", attributes: ['state', 'country'] },
      ],
      order: [
        ["givenNames", "asc"],
        ["surname", "asc"],
        ["email", "asc"],
      ]
    }, AdminRoutes.memberProps, pagination))
      .then((result) => {
        return {
          members: Serializer.serializeMany(result.rows, Member, AdminRoutes.memberScheme),
          count: result.count,
        }
      })
      .catch((error) => {
        logger.error("admin-members", error)
        return Sequelize.Promise.reject("An error has occurred while fetching members.")
      })
  }

  async member(ctx) {
    const props = Object.assign({}, AdminRoutes.memberProps)
    const memberScheme = Object.assign({}, AdminRoutes.memberScheme)

    props.attributes = Array.from(props.attributes).concat(['data'])
    memberScheme.include = Array.from(memberScheme.include).concat(['data'])

    ctx.body = await Member.findOne(Object.assign({}, props, {where: {id: ctx.params.id}}))
      .then((member) => {
        const memberSerialized = new Serializer(Member, memberScheme).serialize(member)

        memberSerialized.statusHuman = member.getStatusText()

        const serializedUser = member.user ? new Serializer(User, AdminRoutes.userScheme).serialize(member.user) : null

        if (serializedUser) {
          serializedUser.hasActiveResetPasswordKey = member.user.resetPasswordKey !== null
        }

        return {
          member: memberSerialized,
          user: serializedUser
        }
      }).catch((ex) => {
        return Sequelize.Promise.reject("An error has occurred while fetching member.")
      })
  }

  async memberUpdate(ctx) {
    // Validate the input

    const errors = memberValidator.isValidServer(ctx.request.body.data.member)

    // Handle any errors
    if (errors.length){
      ctx.status = 400
      ctx.body = {
        errors: errors,
      }
      return
    }

    logger.info("admin-member-update", `Updating userId: ${ctx.params.id}`)

    ctx.body = await Member.findOne(Object.assign({}, AdminRoutes.memberProps, {where: {id: ctx.params.id}}))
      .then((member) => {
        return Promise.all([
          member.previous("status"),
          member.update(ctx.request.body.data.member, {
          }),
        ])
      })
      .spread((previousStatus, member) => {
        // Membership accepted notification
        if (previousStatus === Member.MEMBERSHIP_STATUSES.pending && member.status === Member.MEMBERSHIP_STATUSES.accepted) {
          member.membershipAccepted()
          ppauMailingListSyncService.emit("memberAccepted", member)
        }

        // remove members from mailing lists
        if (previousStatus === Member.MEMBERSHIP_STATUSES.accepted &&
          [
            Member.MEMBERSHIP_STATUSES.resigned,
            Member.MEMBERSHIP_STATUSES.suspended,
            Member.MEMBERSHIP_STATUSES.expelled,
          ].includes(member.get("status"))) {
          ppauMailingListSyncService.emit("memberResignedOrSuspendedOrExpelled", member)
        }

        return {
          member: new Serializer(Member, AdminRoutes.memberScheme).serialize(member)
        }
      }).catch((error) => {
        logger.error("admin-member-update", 'Error occurred', {exception: error})
        return Sequelize.Promise.reject("An error has occurred while updating the member.")
      })
  }

  async createUserForMember(ctx) {
    const createValidator = ctx.checkBody('/data/create', jpath.create).get(0).notEmpty("create value required.").eq(true, "Invalid value.")
    const notifyMemberValidator = ctx.checkBody('/data/notifyMember', jpath.create).get(0)
      .notEmpty("notifyMember value required.")
      .ensure((value) => value === true || value === false, "notifyMember value must be true or false.")
    const memberIdValidator = ctx.checkBody('/data/memberId', jpath.create).get(0).notEmpty("memberId value required.").isUUID("Must be a valid uuid4.", 4)
    const paramMemberIdValidator = ctx.checkParams('id').notEmpty("Invalid URL.").isUUID("Must be a valid uuid4.", 4).eq(memberIdValidator.value, "memberId body does not match URL memberId.")

    // Handle any errors
    if (ctx.errors && ctx.errors.length){
      ctx.status = 400
      ctx.body = {
        errors: ctx.errors,
      }
      return
    }

    logger.info("admin-member-create-user", `Creating user for memberId: ${memberIdValidator.value}`)

    ctx.body = await Member.findOne(Object.assign({}, AdminRoutes.memberProps, {where: {id: memberIdValidator.value}}))
      .then((member) => {
        return Promise.all([
          member.createUser(),
          member,
        ])
      })
      .spread((user, member) => {
        if (notifyMemberValidator.value) {
          emailService.importedUserPasswordResetKey(member)
        }
        return {
          success: true,
          userId: user.id
        }
      }).catch((error) => {
        logger.error("admin-member-update", 'Error occurred', {exception: error})
        ctx.status = 400
        return {
          errors: [
            error.message
          ]
        }
      })
  }

  async toggleUserEnabled(ctx) {
    const userIdValidator = ctx.checkBody('/data/userId', jpath.create).get(0).notEmpty("userId value required.").isInt("Must be a valid int.")
    const enabledValidator = ctx.checkBody('/data/enabled', jpath.create).get(0)
      .notEmpty("enabled value required.")
      .ensure((value) => value === true || value === false, "enabled value must be true or false.")

    const paramUserIdValidator = ctx.checkParams('id').notEmpty("Invalid URL.").isInt("Must be a valid int.").eq(userIdValidator.value, "userId body does not match URL userId.")

    // Handle any errors
    if (ctx.errors && ctx.errors.length){
      ctx.status = 400
      ctx.body = {
        errors: ctx.errors,
      }
      return
    }

    logger.info("admin-user-toggle-enabled", `Toggle enabled for userId: ${userIdValidator.value} to value: ${enabledValidator.value}`)

    ctx.body = await User.findOne(Object.assign({}, AdminRoutes.userProps, {where: {id: userIdValidator.value}}))
      .then((user) => {
        user.enabled = enabledValidator.value
        return user.save()
      })
      .then((user) => {
        return {
          success: true,
          userId: user.id
        }
      }).catch((error) => {
        logger.error("admin-user-toggle-enabled", 'Error occurred', {exception: error})
        ctx.status = 400
        return {
          errors: [
            error.message
          ]
        }
      })
  }

  async redirect(ctx) {
    ctx.redirect("/admin/dashboard")
  }

  async statistics(ctx){
    ctx.body = await statisticsProvider.dashboard()
  }
}

module.exports = { AdminRoutes }
