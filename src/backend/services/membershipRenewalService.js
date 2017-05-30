
const { CronJob } = require("cron")
const moment = require("moment")
const co = require("co")
const uuid = require("node-uuid")

const { EmailTemplate, Member } = require("../models")
const emailService = require("./emailService")
const logger = require("../lib/logger")

const everyDayAt0730 = "00 30 7 * * *"
const everyMinute = "00 */1 * * * *"

async function worker() {
  const sixtyDaysFromNow = moment.utc().add(60, "days").toDate()
  const fourteenDaysAgo = moment.utc().add(-14, "days").toDate()
  let sentCount = 0

  const members = await Member.withActiveStatusAndEnabledUserExpiringBefore(sixtyDaysFromNow)

  logger.notice("member-renewal-service", `Processing ${members.length} member renewal reminders.`)

  for (const member of members) {
    if (member.lastRenewalReminder > fourteenDaysAgo) {
      continue
    }

    if (!member.renewalHash) {
      member.renewalHash = uuid.v4()
      await member.save()
    }

    try {
      if (member.getIsActiveStatus()) {
        emailService.memberRenewalReminder(member)
      } else {
        emailService.memberExpiredReminder(member)
      }

      sentCount++

      logger.notice("member-renewal-service", `Reminder sent to member.id ${member.id}`)

      member.lastRenewalReminder = moment.utc().toDate()
      await member.save()
    } catch (error) {
      logger.error("member-renewal-service",
        "An error occurred while sending renewal notifications",
        { memberId: member.id, error }
      )
    }
  }

  logger.notice("member-renewal-service",
    `Notifications process finished; sent: ${sentCount}`,
    { count: sentCount }
  )
}

function start() {
  logger.notice("member-renewal-service", `Started renewal reminder service.`)
  const job = new CronJob({
    cronTime: everyDayAt0730,
    //cronTime: everyMinute,
    onTick: co.wrap(worker),
    start: false,
  })

  job.start()
}

module.exports = {
  start
}
