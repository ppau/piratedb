/**
 * Created by thomas on 2017-06-22.
 */
const { Member, User } = require("../models")
const logger = require("../lib/logger")

async function usernameInUse(username, user, member) {
  let count = 0

  username = username.toLowerCase()

  if (!member && user && await user.getMember()) {
    member = await user.getMember()
  }

  if (!user && member && await member.getUser()) {
    user = await member.getUser()
  }

  if (user || member) {
    if (user && user.id) {
      await User.count({
        where: {
          username: { $eq: username },
          $and: [
            { id: { $ne: user.id } },
          ]
        }
      }).then((i) => {
        count += i
      })
    } else {
      await User.count({ where: { username: { $eq: username }}}).then((i) => { count += i })
    }

    if (member && member.id) {
      await Member.count({
        where: {
          email: { $eq: username },
          $and: [
            { id: { $ne: member.id } },
          ]
        }
      }).then((i) => {
        count += i
      })
    } else {
      Member.count({ where: { email: { $eq: username }}}).then((i) => { count += i })
    }

    logger.info("usernameInUse", `Counted ${count} for email: ${username}`)
    return count > 0
  }

  await User.count({ where: { username: { $eq: username }}}).then((i) => { count += i })
  await Member.count({ where: { email: { $eq: username }}}).then((i) => { count += i })

  return count > 0
}

class UsernameInUseError extends Error {
  constructor(message, innerError) {
    super(message)
    this.message = message
    this.innerError = innerError
    this.name = 'UsernameInUseError'
  }
}


module.exports = { usernameInUse, UsernameInUseError }
