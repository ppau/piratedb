
const { Promise } = require("bluebird")
const process = require("process")
const moment = require("moment")
const config = require("../config")
const nodemailer = Promise.promisifyAll(require("nodemailer"))
const models = require("../models")

// Nodemailer transports
const transports = {
  sendmail: require("nodemailer-sendmail-transport"),
  smtp: require("nodemailer-smtp-transport"),
  stub: config.env == 'development' ? require("nodemailer-stub-transport") : null
}

if (!config.email.transport) {
  throw new Error("No email.transport defined in config.")
}

const options = !!config.email.options ? config.email.options : {}
const transportConfig = transports[config.email.transport](options)
const transport = Promise.promisifyAll(nodemailer.createTransport(transportConfig))

const stubCallback = (error, info) => {
  console.log(info.response.toString())
}

const organisationName = "Pirate Party Australia"

const globalContext = config.email.context
const appContext = {
  organisationName: organisationName,
  organisationFromEmail: config.email.from,
}

class EmailService {

  static get transport(){
    return transport
  }

  static get transportConfig(){
    return transportConfig
  }

  static send(to, emailTemplate, context) {
    // add context from config
    context = Object.assign({}, globalContext, appContext, context)

    const bodyHTML = emailTemplate.renderHTML(context)
    const bodyText = emailTemplate.renderText(context)
    const subject = emailTemplate.renderSubject(context)

    const data = {
      to: to,
      from: emailTemplate.from,
      subject: subject,
      html: bodyHTML,
      text: bodyText,
    }

    if (transportConfig.name === 'Stub'){
      return transport.sendMailAsync(data, stubCallback)
    }
    return transport.sendMailAsync(data)
  }

  static memberApplicationReceived(member) {
    return models.EmailTemplate.findByName("applicationReceived")
      .then((template) => {
        const context = {
          firstName: member.getFirstName(),
          givenNames: member.givenNames,
        }

        return EmailService.send(member.email, template, context)
      })
  }

  static memberApplicationAccepted(member) {
    return models.EmailTemplate.findByName("applicationAccepted")
      .then((template) => {
        const context = {
          givenNames: member.givenNames,
        }

        return EmailService.send(member.email, template, context)
      })
  }

  static memberRenewalReminder(member) {
    return models.EmailTemplate.findByName("memberRenewalReminder")
      .then((template) => {
        const context = {
          givenNames: member.givenNames,
          firstName: member.getFirstName(),
          remainderPeriod: moment.utc(member.expiresOn).fromNow(),
        }

        return EmailService.send(member.email, template, context)
      })
  }

  static memberExpiredReminder(member) {
    return models.EmailTemplate.findByName("memberExpiredReminder")
      .then((template) => {
        const context = {
          givenNames: member.givenNames,
          firstName: member.getFirstName(),
        }

        return EmailService.send(member.email, template, context)
      })
  }

  static memberRenewalSuccessful(member) {
    return models.EmailTemplate.findByName("memberRenewalSuccessful")
      .then((template) => {
        const context = {
          givenNames: member.givenNames,
          firstName: member.getFirstName(),
        }

        return EmailService.send(member.email, template, context)
      })
  }

  static memberVerifyEmail(member) {
    return models.EmailTemplate.findByName("verifyEmail")
      .then((template) => {
        const context = {
          firstName: member.getFirstName(),
          memberId: member.id,
          verificationHash: member.verificationHash,
        }

        return EmailService.send(member.email, template, context)
      })
  }

  static userPasswordChanged(user) {
    // if the user has an attached member, send that member an email
    user.getMember()
      .then((member) => {
        if (member) {
          return [
            member,
            models.EmailTemplate.findByName("userPasswordChanged"),
          ]
        }
        return Promise.reject(new Error("User has no member instance."))
      })
      .spread((member, template) => {
        const context = {
          firstName: member.getFirstName(),
        }

        return EmailService.send(member.email, template, context)
      })
      .catch((error) => {
        throw error
      })
  }

  // Secretary emails
  static memberApplicationSecretaryNotification(member) {
    // TODO: replace with settings

    const secretariat = [
      'secretary@pirateparty.org.au',
    ]

    return models.EmailTemplate.findByName("memberApplicationSecretaryNotification")
      .then((template) => {
        const context = {
          givenNames: member.givenNames,
          surname: member.surname,
          email: member.email,
          state: member.residentialAddress.state,
          type: member.type,
          memberId: member.id,
        }

        template.subject = `${template.subject}: ${member.givenNames} ${member.surname} [${member.type} member][${member.residentialAddress.state}][${member.email}]`

        secretariat.map((email) => {
          EmailService.send(email, template, context)
        })
      })
  }

  /*
  * Imported member user password
  */
  static importedUserPasswordResetKey(member) {
    return models.EmailTemplate.findByName("importedUserPasswordResetKey")
      .then(async (template) => {
        const user = await member.getUser() || {}

        const context = {
          firstName: member.getFirstName(),
          resetPasswordKey: user.resetPasswordKey,
          username: user.username,
        }

        return EmailService.send(member.email, template, context)
      })
  }

  /*
  * Forgotten password emails
  */
  static forgottenPasswordResetKey(member) {
    return models.EmailTemplate.findByName("forgottenPasswordResetKey")
      .then((template) => {
        const context = {
          firstName: member.getFirstName(),
          resetPasswordKey: member.user.resetPasswordKey,
          username: member.user.username,
        }

        return EmailService.send(member.email, template, context)
      })
  }
  static forgottenPasswordUserNotFound(email) {
    return models.EmailTemplate.findByName("forgottenPasswordUserNotFound")
      .then((template) => {
        const context = {
        }

        return EmailService.send(email, template, context)
      })
  }
  static donationReferenceNumber(email, invoice) {
    return models.EmailTemplate.findByName("donationReferenceNumber")
      .then((template) => {
        const context = {
          referenceNumber: invoice.getReferenceNumber()
        }

        return EmailService.send(email, template, context)
      })
  }
}

module.exports = EmailService
