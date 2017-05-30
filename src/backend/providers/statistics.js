/**
 * Created by thomas on 2017-07-02.
 */
const { Member, Invoice } = require('../models')
const moment = require("moment")

async function dashboard() {
  const days30Ago = moment.utc().add(30, "days").toDate()
  const members = Member.findAll({
    attributes: ['id'],
    where: {
      memberSince: {
        $gte: days30Ago
      }
    }
  })

  return {
    days30: {
      members: {
        newMembers: members.filter((member) => { return member.status === Member.MEMBERSHIP_STATUSES.accepted }).length,
        pendingMembers: members.filter((member) => { return member.status === Member.MEMBERSHIP_STATUSES.pending }).length,
        expiredMembers: members.filter((member) => { return member.status === Member.MEMBERSHIP_STATUSES.accepted && member.expiresOn < moment.utc() }).length,
        resignationsMembers: members.filter((member) => { return member.status === Member.MEMBERSHIP_STATUSES.resigned }).length,
      },
      revenue: {
        fees: 0,
        donations: 0,
      }
    }
  }
}

module.exports = {
  dashboard,
}
