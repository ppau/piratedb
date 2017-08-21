/**
 * Created by thomas on 2017-06-22.
 */
const { Member, User } = require("../models")
const logger = require("../lib/logger")

/**
 * Determines whether the username is used on a user.username or member.email instance. Where user or member parameters
 * can be supplied to exclude those instances from the result i.e. when performing a lookup on an existing user/member
 * to check for conflicts while knowing the existing instance itself is a valid use of the username being queried.
 * @param username
 * @param user
 * @param member
 * @returns {Promise.<boolean>}
 */
async function usernameNotAvailable(username, user, member) {
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

    logger.debug("usernameNotAvailable", `Counted ${count} for username: ${username}`)
    return count > 0
  }

  await User.count({ where: { username: { $eq: username }}}).then((i) => { count += i })
  await Member.count({ where: { email: { $eq: username }}}).then((i) => { count += i })

  return count > 0
}

/**
 * Determines whether the username is actually in use on an existing user.username instance.
 * @param username
 * @param user
 * @returns {Promise.<boolean>}
 */
async function usernameInUse(username, user) {
  let count = 0

  username = username.toLowerCase()

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

  logger.debug("usernameInUse", `Counted ${count} for username: ${username}`)
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


module.exports = { usernameNotAvailable, usernameInUse, UsernameInUseError }
