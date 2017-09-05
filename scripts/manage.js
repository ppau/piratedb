/**
 * Created by thomas on 2017-06-26.
 */
const { Promise } = require("bluebird")

global.Promise = Promise

const uuid = require("node-uuid")
const fs = Promise.promisifyAll(require("fs"))
const path = Promise.promisifyAll(require("path"))
const mkdirp = require('mkdirp')

const sequelize = require("sequelize")
const models = require("../src/backend/models")
const emailService = require("../src/backend/services/emailService")
const authUtils = require('../src/backend/utils/auth')

const inquirer = require('inquirer')
const ui = new inquirer.ui.BottomBar()

const moment = require("moment")
const appLogger = require("../src/backend/lib/logger")
const winston = require("winston")
const logger = new (winston.Logger)({
  levels: winston.config.syslog.levels,
  transports: [
    new (winston.transports.Console)(),
  ]
})

appLogger.remove(appLogger.transports.console)

const memberValidator = require('../src/lib/memberValidator')

const dataDir = path.join(__dirname, "../data")
const dataExportDir = path.join(dataDir, "export")
const dataImportDir = path.join(dataDir, "import")

function mkdirs() {
  mkdirp(dataExportDir, function(err) {
    if (err) {
      console.error(err)
      process.exit(1)
    }
  })
  mkdirp(dataImportDir, function(err) {
    if (err) {
      console.error(err)
      process.exit(1)
    }
  })
}

function getShortState(state){
  switch (state){
    case "Australian Capital Territory".toUpperCase():
    case "ACT":
      return 'ACT'
    case "New South Wales".toUpperCase():
    case "NSW":
      return 'NSW'
    case "Northern Territory".toUpperCase():
    case "NT":
      return 'NT'
    case "Queensland".toUpperCase():
    case "QLD":
      return 'QLD'
    case "South Australia".toUpperCase():
    case "SA":
      return 'SA'
    case "Tasmania".toUpperCase():
    case "TAS":
      return 'TAS'
    case "Victoria".toUpperCase():
    case "VIC":
      return 'VIC'
    case "Western Australia".toUpperCase():
    case "WA":
      return 'WA'
  }
  return null
}

function newAdmin(){
  const questions = [
    {
      type: 'input',
      name: 'username',
      message: 'Username: '
    },
    {
      type: 'password',
      name: 'password',
      message: 'Password: '
    },
  ]

  return inquirer.prompt(questions).then(async (answers) => {
    if (await authUtils.usernameNotAvailable(answers.username)) {
      console.error("***************************")
      console.error("Username is already in use.")
      console.error("***************************")
      return
    }

    await models.User.register(
      answers.username,
      answers.password)
      .then((user) => {
        return user.makeSecretary()
      })
      .then((user) => {
        return user.makeTreasurer()
      })
      .then((user) => {
        console.log(`User ${user.username} created.`)
        process.exit(0)
      }).catch((error) => {
        console.error("Error: Could not make admin user")
        console.error(error.stack)
        process.exit(1)
      })
  })
}

function exportMembersVotingLists() {
  mkdirs()
  return models.Member.withActiveVotingStatus({
    attributes: [
      "id",
      "email",
      "status",
    ],
    include: [
      { model: models.Address, as: "residentialAddress", attributes: ['state', 'country'] },
    ]
  }).then((activeMembers) => {
    // sort by state
    const states = ['ACT', 'NSW', 'NT', 'QLD', 'SA', 'TAS', 'VIC', 'WA']
    const emails = {
      all: [],
    }

    for (const member of activeMembers) {
      let state = member.residentialAddress.state.toUpperCase()
      state = getShortState(state)

      if (!memberValidator.isValidEmail(member.email)) {
        continue
      }

      emails.all.push(member.email)

      if (states.indexOf(state) < 0) {
        continue
      }

      const stateArr = emails[state] || []

      stateArr.push(member.email)

      emails[state] = stateArr
    }

    return emails
  }).then((sortedEmails) => {
    /*
     * Collect all the inactive emails to make sure duplicate members records for an email (i.e. one resigned, one
     * active) are removed from our lists. Reduce the angry hordes.
     */
    const p = models.Member.withInactiveStatus({
      attributes: [
        "id",
        "email",
        "status",
      ]
    }).then((members) => {
      // Unique array of inactive emails (mostly resigned).
      return Array.from(new Set(members.map((inactiveMember) => {
        return inactiveMember.email
      })))
    })

    return Promise.all([sortedEmails, p])
  }).spread((votingEmailsSorted, inactiveEmails) => {

    for (const key of Object.keys(votingEmailsSorted)) {
      const filename = path.join(dataExportDir, `voting.${key}.txt`)

      // Get unique active emails and filter out inactive emails
      let keyEmails = Array.from(new Set(votingEmailsSorted[key]))

      keyEmails = keyEmails.filter((email) => {
        if (inactiveEmails.indexOf(email) >= 0){
          console.log(`Warning: multiple records for ${email} with voting rights, and inactive.`)
        }
        return true
      })

      fs.writeFileSync(filename, keyEmails.join("\n"), (err) => {
        console.log(err)
      })
      console.log(key, keyEmails.length)
    }

    console.log("\nExport finished")
  })
}

function exportMembersEmailLists() {
  mkdirs()
  return models.Member.withActiveStatus({
    attributes: [
      "id",
      "email",
      "status",
    ],
    include: [
      { model: models.Address, as: "residentialAddress", attributes: ['state', 'country'] },
    ]
  }).then((activeMembers) => {
    // sort by state
    const states = ['ACT', 'NSW', 'NT', 'QLD', 'SA', 'TAS', 'VIC', 'WA']
    const emails = {
      all: [],
    }

    for (const member of activeMembers) {
      let state = member.residentialAddress.state.toUpperCase()
      state = getShortState(state)

      if (!memberValidator.isValidEmail(member.email)) {
        continue
      }

      emails.all.push(member.email)

      if (states.indexOf(state) < 0) {
        continue
      }

      const stateArr = emails[state] || []

      stateArr.push(member.email)

      emails[state] = stateArr
    }

    return emails
  }).then((emails) => {
    /*
     * Collect all the inactive emails to make sure duplicate members records for an email (i.e. one resigned, one
     * active) are removed from our lists. Reduce the angry hordes.
     */
    const p = models.Member.withInactiveStatus({
      attributes: [
        "id",
        "email",
        "status",
      ]
    }).then((members) => {
      // Unique array of inactive emails (mostly resigned).
      return Array.from(new Set(members.map((inactiveMember) => {
        return inactiveMember.email
      })))
    })

    return Promise.all([emails, p])
  }).spread((emails, inactiveEmails) => {

    for (const key of Object.keys(emails)) {
      const filename = path.join(dataExportDir, `emails.${key}.txt`)

      // Get unique active emails and filter out inactive emails
      let keyEmails = Array.from(new Set(emails[key]))

      keyEmails = keyEmails.filter((email) => {
        if (inactiveEmails.indexOf(email) >= 0){
          return false
        }
        return true
      })

      fs.writeFileSync(filename, keyEmails.join(",\n"), (err) => {
        console.log(err)
      })
      console.log(key, keyEmails.length)
    }

    // write the resigned emails to a list
    const filename = path.join(dataExportDir, `emails.INACTIVE.txt`)

    fs.writeFileSync(filename, inactiveEmails.join(",\n"), (err) => {
      console.log(err)
    })
    console.log("Inactive emails ", inactiveEmails.length)

    console.log("\nExport finished")
  })
}

function exportMembersEmailListsInteraction() {
  return inquirer.prompt([{
    type: 'confirm',
    name: 'export_email',
    default: false,
    message: "This process will export all the email list member records to data/export/, are you sure you wish to continue?",
  }])
  .then((answer) => {
    if (!answer.export_email) {
      return Promise.reject(new Error("cancelled"))
    }

    return exportMembersEmailLists()
  })
}

async function createUsersForMembers(number, queue, excluded) {
  queue = queue || []

  const excludedEmails = excluded || []
  const members = await models.Member.findAll({
    where: {
      status: { $in: models.Member.ACTIVE_STATUSES },
      userId: { $eq: null },
      email: { $notIn: excludedEmails}
    },
    order: [
      ['memberSince', 'DESC'],
    ],
    limit: number
  })

  let created = 0

  for (const member of members) {
    const createUser = await authUtils.usernameNotAvailable(member.email, null, member) === false

    if (createUser) {
      await member.createUser()
      queue.push(emailService.importedUserPasswordResetKey(member))
      created++
      console.log(`${member.email} created`)
    } else {
      excludedEmails.push(member.email)
      console.log(`${member.email} already in use`)
    }
  }

  if (created < members.length) {
    await createUsersForMembers(members.length - created, queue, excludedEmails)
  }

  return queue
}

function createUsersForMembersInteraction() {
  return inquirer.prompt([{
    type: 'input',
    name: 'members_create_users',
    default: 50,
    message: "How many members would you like to generate user accounts for?",
  }])
  .then((answer) => {
    if (!answer.members_create_users) {
      return Promise.reject(new Error("cancelled"))
    }

    return createUsersForMembers(answer.members_create_users)
  }).then((queue) => {
    return Promise.all(queue)
  })
}

function exportMembersVotingListsInteraction() {
  return inquirer.prompt([{
    type: 'confirm',
    name: 'export_voting',
    default: false,
    message: "This process will export all the voting member records to data/export/, are you sure you wish to continue?",
  }])
    .then((answer) => {
      if (!answer.export_voting) {
        return Promise.reject(new Error("cancelled"))
      }

      return exportMembersVotingLists()
    })
}

function memberResendNewUserAccountInformationInteraction() {
  return inquirer.prompt([{
    type: 'confirm',
    name: 'resend',
    default: false,
    message: "This process will resend a member's new user account information, are you sure you wish to continue?",
  }]).then((answer) => {
    if (!answer.resend) {
      return Promise.reject(new Error("cancelled"))
    }

    const questions = [
      {
        type: 'input',
        name: 'memberEmail',
        message: 'Member email (member.email): '
      }
    ]

    return inquirer.prompt(questions)
  }).then((answer) => {
    if (!answer.memberEmail) {
      return Promise.reject(new Error("Missing memberEmail"))
    }

    const include = [
      {
        model: models.User,
        as: "user",
        where: { username: answer.memberEmail }
      }
    ]

    return models.Member.findOne({where: {email: answer.memberEmail}, include: include})
  }).then(async (member) => {
    if (!member) {
      return Promise.reject(new Error("Member not found"))
    }

    return await emailService.importedUserPasswordResetKeyReminder(member)
  }).then((success) => {
    console.log("Member new user account information resent.")
  }).catch((error) => {
    console.log(error.message)
    console.log(error.stack)
  })
}


function membersResendNewUserAccountInformationToAllUnactivatedInteraction() {
  return inquirer.prompt([{
    type: 'confirm',
    name: 'resend',
    default: false,
    message: "This process will resend all members' new user account information to unactivated accounts, are you sure you wish to continue?",
  }]).then(async (answer) => {
    if (!answer.resend) {
      return Promise.reject(new Error("cancelled"))
    }

    const sent = []
    const members = await models.Member.withActiveStatusAndEnabledUserAndUnactivated()

    try {
      for (const member of members) {
        await emailService.importedUserPasswordResetKeyReminder(member)
        sent.push(member.email)

        if (sent.length % 100 === 0) {
          console.log(`Emailed ${sent.length} of ${members.length}...`)
        }
      }
    } catch (error) {
      console.log("An error occurred. Emails were sent to:")
      console.log(sent)
      throw error
    }

    return members.length
  }).then((count) => {
    console.log(`${count} new user account information emails sent to unactivated members.`)
  }).catch((error) => {
    console.log(error.message)
    console.log(error.stack)
  })
}

function memberDeleteInteraction() {
  return inquirer.prompt([{
    type: 'confirm',
    name: 'delete',
    default: false,
    message: "This process will allow you to delete entirely a members details by their uuid, are you sure you wish to continue?",
  }]).then((answer) => {
    if (!answer.delete) {
      return Promise.reject(new Error("cancelled"))
    }

    const questions = [
      {
        type: 'input',
        name: 'memberId',
        message: 'Member UUID (member.id): '
      }
    ]

    return inquirer.prompt(questions)
  }).then((answer) => {
    if (!answer.memberId) {
      return Promise.reject(new Error("Missing memberId"))
    }

    const include = [
      {
        model: models.Address,
        as: "postalAddress",
      },
      {
        model: models.Address,
        as: "residentialAddress",
      },
      {
        model: models.User,
        as: "user",
      }
    ]

    return models.Member.findOne({where: {id: answer.memberId}, include: include})
  }).then((member) => {
    if (!member) {
      return Promise.reject(new Error("Member not found"))
    }

    return models.connection.transaction().then(async (t) => {
      if (member.residentialAddress) {
        console.log(`Deleting residentialAddress.id ${member.residentialAddress.id} ...`)
        await member.residentialAddress.destroy({transaction: t})
      }

      if (member.postalAddress) {
        console.log(`Deleting postalAddress.id ${member.postalAddress.id} ...`)
        await member.postalAddress.destroy({transaction: t})
      }

      if (member.user) {
        console.log(`Deleting user.id ${member.user.id} ...`)
        await member.user.destroy({transaction: t})
      }

      console.log(`Deleting member.id ${member.id} ...`)
      await member.destroy({transaction: t})

      return t
    }).then((t) => {
      return t.commit()
    })
  }).then((success) => {
    console.log("Member UUID and associated records deleted.")
  }).catch((error) => {
    console.log(error.message)
    console.log(error.stack)
  })
}

function importMembersInteraction(){
  return inquirer.prompt([{
    type: 'confirm',
    name: 'import',
    default: false,
    message: "This process will import all the member records from data/import/members.json, are you sure you wish to continue?",
  }])
  .then((answer) => {
    if (!answer.import) {
      return Promise.reject(new Error("cancelled"))
    }
    mkdirs()

    const membersJsonPath = path.join(dataImportDir, "members.json")

    if (!fs.existsSync(membersJsonPath)) {
      throw new Error(`The members.json file does not exist at path: ${membersJsonPath}`)
    }

    let members

    try {
      members = require(membersJsonPath)
    } catch (error) {
      console.log(error)
    }


    if (!Array.isArray(members)) {
      throw new Error(`The members.json file must be an array or member data.`)
    }

    const validationFailed = {}

    // validate each row and check email is unique
    members.forEach((member, index) => {
      // fix dob
      if (member.dateOfBirth) {
        member.dateOfBirth = moment.utc(member.dateOfBirth).format("DD/MM/YYYY")
      }

      function addrIsNull(obj) {
        return obj.address === null && obj.country === null && obj.postcode === null && obj.state === null && obj.suburb === null
      }

      if (addrIsNull(member.residentialAddress)) {
        delete member.residentialAddress
      }

      if (addrIsNull(member.postalAddress)) {
        delete member.postalAddress
      }

      const validationErrors = memberValidator.isValidImport(member)

      if (validationErrors.length) {
        validationFailed[index] = {
          index: index,
          member: member,
          residentialAddress: member.residentialAddress,
          postalAddress: member.postalAddress,
          errors: validationErrors
        }
      }
    })
    console.log("members to import:", members.length)
    console.log("validationFailed:", validationFailed)
    console.log("members with errors:", Object.keys(validationFailed).length)
    return members
  })
  .then(async (members) => {
    const existingEmails = await models.Member.findAll({attributes: ['email']})
      .map((member) => {
        return member.email
      })

    const countNewEmails = {}
    const newEmails = members.map((member) => {
      countNewEmails[member.email] = countNewEmails[member.email] ? countNewEmails[member.email] += 1 : 1
      return member.email
    })

    let conflictsFounds = false

    Object.keys(countNewEmails).map((email) => {
      if (countNewEmails[email] > 1) {
        console.log(`${countNewEmails[email]} member records for email ${email}`)
        conflictsFounds = true
      }
    })

    if (conflictsFounds) {
      console.log(`Duplicate email address were found on member records.`)
      return inquirer.prompt([{
        type: 'confirm',
        name: 'confirm',
        default: false,
        message: "Are you really sure you want to commit these records?",
      }])
        .then((answer) => {
          if (!answer.confirm) {
            return Promise.reject(new Error("cancelled"))
          }
          return members
        })
    }
    return members
  })
  .then(async (members) => {
    console.log(`Importing ${members.length} records...`)
    const newMembers = []

    for (const member of members) {
      await models.connection.transaction().then((t) => {
        member.dateOfBirth = moment.utc(member.dateOfBirth, "DD/MM/YYYY")
        member.memberSince = moment.utc(member.memberSince)
        member.expiresOn = moment.utc(member.expiresOn)
        member.id = uuid.v4()
        member.verificationHash = uuid.v4()

        return models.Member.create(member, {
          transaction: t,
          include: [
            {model: models.Address, as: 'residentialAddress'},
            {model: models.Address, as: 'postalAddress'},
          ]
        }).then((newMember) => {
          t.commit()
          newMembers.push(newMember)
          if (newMembers.length % 100 === 0) {
            console.log(`Imported ${newMembers.length} of ${members.length}...`)
          }
        })
      })
    }
    return newMembers
  }).then((all) => {
    console.log(`Created ${all.length} records.`)
    return all
  })
  .catch((err) => {
    if (err.message === "cancelled") {
      console.log("hit cancelled")
      return
    }
  })
}

async function memberEmailCaseCheck() {
  await models.Member.findAll({ attributes: [
    'id',
    'email'
  ]}).then((members) => {
    console.log(`Checking ${members.length} records.`)
    for (const member of members) {
      let i = 0

      while (i <= member.email.length) {
        if (member.email !== member.email.toLowerCase()) {
          console.log(`Upper case email, member.id: ${member.id}, member.email: ${member.email}`)
        }
        i++
      }
    }
  })
}

function interactionManager() {
  const choices = [
    {
      name: 'Create new admin',
      value: 'newAdmin',
    },
    new inquirer.Separator(),
    {
      name: 'Export members email lists',
      value: 'members_export_email',
    },
    {
      name: 'Export voting members list',
      value: 'members_export_voting',
    },
    {
      name: 'Import members',
      value: 'members_import',
    },
    new inquirer.Separator(),
    {
      name: 'Create users for members',
      value: 'members_create_users',
    },
    {
      name: 'Resend member new user account information',
      value: 'member_resend_new_user_account_information',
    },
    {
      name: 'Resend ALL member new user account information to unactivated accounts',
      value: 'members_resend_new_user_account_information_to_unactivated',
    },
    {
      name: 'Check member emails for uppercase chars',
      value: 'member_email_case_check',
    },
    new inquirer.Separator(),
    {
      name: 'Delete member',
      value: 'member_delete',
    },
    new inquirer.Separator(),
    {
      name: 'Exit',
      value: 'exit',
    },
  ]

  return inquirer.prompt([{
    type: 'list',
    name: 'menu',
    message: 'Select a menu option',
    choices: choices,
    pageSize: '15'
  }]).then(async (answer) => {
    switch (answer.menu){
      case "newAdmin":
        return newAdmin()
      case "members_export_email":
        return exportMembersEmailListsInteraction()
      case "members_export_voting":
        return exportMembersVotingListsInteraction()
      case "members_import":
        return importMembersInteraction()
      case "members_create_users":
        return createUsersForMembersInteraction()
      case "member_resend_new_user_account_information":
        return memberResendNewUserAccountInformationInteraction()
      case "members_resend_new_user_account_information_to_unactivated":
        return membersResendNewUserAccountInformationToAllUnactivatedInteraction()
      case "member_delete":
        return memberDeleteInteraction()
      case "member_email_case_check":
        return memberEmailCaseCheck()
      case "exit":
        process.exit(0)
        break
    }
  })
}

// execute when db is ready
try {
  models.connection.authenticate()
    .then(() => {
      return interactionManager()
    })
    .then(() => {
      process.exit(0)
    })
} catch (ex) {
  console.log(ex)
  process.exit(1)
}
