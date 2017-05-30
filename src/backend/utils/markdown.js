/**
 * Created by thomas on 2017-07-07.
 */
const xss = require('xss')
const removeMd = require('remove-markdown')

function renderMarkdownToText(text) {
  const reCallToAction = /@\[(.*)]\((.*)\)/g
  const reLink = /\[(.*)]\((.*)\)/g

  text = xss(text)

  // Call to action buttons
  text = text.replace(
    reCallToAction,
    '$1: $2'
  )

  // Links
  text = text.replace(
    reLink,
    '$1 ( $2 )'
  )

  text = removeMd(text, { stripListLeaders: false, gfm: false})
  text = text.replace(new RegExp(/\\\*/, 'g'), '*')
  return text
}

module.exports = {
  renderMarkdownToText,
}
