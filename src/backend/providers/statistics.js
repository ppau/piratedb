/**
 * Created by thomas on 2017-07-02.
 */
const moment = require("moment")
const Sequelize = require("sequelize")

const { Member, Invoice, User } = require('../models')
const logger = require("../lib/logger")

async function dashboard() {
  const days30Ago = moment.utc().add(-30, "days").toDate()
  const memberSince = {
    memberSince: {
      $gte: days30Ago
    }
  }

  return {
    all: {
      members: {
        total: await Member.count(),
        acceptedMembers: await Member.count({where: Object.assign({}, {status: Member.MEMBERSHIP_STATUSES.accepted})}),
        pendingMembers: await Member.count({where: {status: Member.MEMBERSHIP_STATUSES.pending}}),
        expiredMembers: await Member.count({where: {status: Member.MEMBERSHIP_STATUSES.accepted, expiresOn: { $lte: moment.utc() }}}),
        resignedMembers: await Member.count({where: {status: Member.MEMBERSHIP_STATUSES.resigned}}),
        acceptedNotExpiredByType: await Promise.all(Object.keys(Member.MEMBERSHIP_TYPES).map(async (type) => {
          const count = await Member.count(
            {
              where: {
                type: type,
                status: Member.MEMBERSHIP_STATUSES.accepted,
                expiresOn: { $gte: moment.utc() }
              }
            })

          return {
            name: type,
            count: count,
          }
        }))
      },
      users: {
        total: await User.count(),
        withoutSignIn: await User.count({where: { lastAuthenticated: null }}),
      },
      revenue: {
        new: await Invoice.sum('totalAmountInCents', {
          where: {paymentStatus: Invoice.INVOICE_STATUSES.new}
        }),
      }
    },
    days30: {
      members: {
        newMembers: await Member.count({where: Object.assign({}, memberSince, {status: Member.MEMBERSHIP_STATUSES.accepted})}),
        pendingMembers: await Member.count({where: {status: Member.MEMBERSHIP_STATUSES.pending, createdAt: { $gte: days30Ago }}}),
        expiredMembers: await Member.count({where: {status: Member.MEMBERSHIP_STATUSES.accepted, expiresOn: { $lte: moment.utc(), $gte: days30Ago }}}),
        resignedMembers: await Member.count({where: {status: Member.MEMBERSHIP_STATUSES.resigned, expiresOn: { $gte: days30Ago }}}),
      },
      revenue: {
        fees: await Invoice.sum('totalAmountInCents', {
          where: {createdAt: {$gte: days30Ago}, paymentStatus: Invoice.INVOICE_STATUSES.paid}
        }),
        donations: "Not available",
      }
    },
  }
}

module.exports = {
  dashboard,
}
