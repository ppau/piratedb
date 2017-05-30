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
    if (await authUtils.usernameInUse(answers.username)) {
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
    const states = ['NSW', 'QLD', 'VIC', 'ACT', 'WA', 'SA', 'TAS', 'NT']
    const emails = {
      all: [],
    }

    for (const member of activeMembers) {
      const state = member.residentialAddress.state.toUpperCase()

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
     * active) are removed from our lists. Reduce the angry hoards.
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
    name: 'import',
    default: false,
    message: "This process will export all the member records to data/export/, are you sure you wish to continue?",
  }])
  .then((answer) => {
    if (!answer.import) {
      return Promise.reject(new Error("cancelled"))
    }

    return exportMembersEmailLists()
  })
}

function importMembers(){
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
    const members = require(membersJsonPath)

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


function interactionManager() {
  const choices = [
    {
      name: 'Create new admin',
      value: 'newAdmin',
    },
    new inquirer.Separator(),
    {
      name: 'Export members email lists',
      value: 'export',
    },
    {
      name: 'Import members',
      value: 'import',
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
    choices: choices
  }]).then(async (answer) => {
    switch (answer.menu){
      case "newAdmin":
        return newAdmin()
      case "export":
        return exportMembersEmailListsInteraction()
      case "import":
        return importMembers()
      case "exit":
        process.exit(0)
        break
    }
  })
}

// execute when db is ready
try {
  models.connection.sync()
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
