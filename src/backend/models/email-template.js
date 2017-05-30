const marked = require('marked')
const fs = require('fs')
const path = require('path')
const ejs = require('ejs')

const config = require("../config")
const emails = require("../lib/emails")
const markdownUtils = require("../utils/markdown")

const masterEmailTemplatePath = path.join(__dirname, '../templates/emails/piratedb.html')
const masterEmailTemplate = fs.readFileSync(masterEmailTemplatePath, "utf-8")

module.exports = (sequelize, DataTypes) => {
  const EmailTemplate = sequelize.define('EmailTemplate', {
    name: {type: DataTypes.STRING, allowNull: false, unique: true},
    isMarkDown: {type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false},
    from: {type: DataTypes.STRING, allowNull: false},
    subject: {type: DataTypes.STRING, allowNull: false},
    body: {type: DataTypes.TEXT, allowNull: false},
    metadata: {type: DataTypes.JSON},
  })

  EmailTemplate.findByName = function(name) {
    return EmailTemplate.findOne({ where: { name } })
      .then((instance) => {
        if (!instance && name in emails.defaultEmails) {
          return Promise.resolve(EmailTemplate.build(emails.defaultEmails[name]))
        }
        return Promise.resolve(instance)
      })
  }

  EmailTemplate.prototype.renderHTML = function(context) {
    let template = ejs.compile(this.body)(context)

    if (this.isMarkDown) {
      template = this.replaceCallToAction(template)
      template = marked(template)
    }

    context.markdownHtmlContent = template

    return ejs.compile(masterEmailTemplate)(context)
  }

  EmailTemplate.prototype.renderText = function(context) {
    let text = ejs.compile(this.body)(context)

    if (this.isMarkDown) {
      text = markdownUtils.renderMarkdownToText(text)
    }

    return text
  }

  EmailTemplate.prototype.renderSubject = function(context) {
    return ejs.compile(this.subject)(context)
  }

  EmailTemplate.prototype.replaceCallToAction = function(template) {
    const re = /@\[(.*)]\((.*)\)/g

    return template.replace(
      re,
      '<table border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: auto;"><tbody><tr><td style="font-family: \'Open Sans\', sans-serif; font-size: 14px; vertical-align: top; border-radius: 5px; text-align: center; background-color: #3498db;" valign="top" align="center" bgcolor="#3498db"> <a href="$2" target="_blank" style="border: solid 1px #3498db; border-radius: 5px; box-sizing: border-box; cursor: pointer; display: inline-block; font-size: 14px; font-weight: bold; margin: 0; padding: 12px 25px; text-decoration: none; background-color: #3498db; color: #ffffff;">$1</a></td></tr></tbody></table>'
    )
  }

  return EmailTemplate
}
