/**
 * Created by thomas on 2017-08-10.
 */

require('isomorphic-fetch')
const _ = require("lodash")
const streams = require('memory-streams')
const process = require("process")
const moment = require("moment")
const crypto = require('crypto')
const querystring = require('querystring')
const config = require("../config")
const models = require("../models")
const logger = require("../lib/logger")

class DADAMailingListSyncService9_6_1 {
  constructor(syncConfig) {
    this.syncConfig = syncConfig
    this.endpoint = syncConfig.endpoint

    logger.notice("dada-mailing-list-sync-service", `Initialised DADA mailing list sync service.`)
  }

  createDigest(message, privateKey) {
    const hmac = crypto.createHmac('sha256', privateKey)

    hmac.setEncoding('base64')
    hmac.write(message)
    hmac.end()

    return hmac.read()
  }

  createNonce() {
    return crypto.randomBytes(64).toString('hex').slice(0, 8)
  }

  getListConfig(listName) {
    return this.syncConfig.lists.filter((list) => {
      return list.name === listName
    })[0]
  }

  handleEvent(event) {

  }

  createRequest(email, list, service) {
    const payload = [{
      email: email,
    }]

    // avert your eyes innocents.
    let i = 0
    const payloadManager = () => {
      i++
      const nonce = `${moment.utc().unix()}:${this.createNonce()}`

      const body = querystring.stringify({
        addresses: JSON.stringify(payload),
        nonce: nonce,
      })

      const digest = this.createDigest(body, list.private_key)

      if (digest.indexOf('/') > -1) {
        return payloadManager()
      }

      return {
        body: body,
        digest: digest,
      }
    }

    const {body, digest } = payloadManager()

    const url = `${this.endpoint}/api/${list.name}/${service}/`
    const url2 = `${this.endpoint}/api/${list.name}/${service}/${list.public_key}/${digest}`
    const headers = new Headers({
      //"Authorization": `hmac  ${list.public_key}:${digest}`,
      "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
      "Content-Length": Buffer.byteLength(body, "utf8").toString(),
    })

    const request = new Request(url2, {
      method: 'POST',
      headers: headers,
      body: body,
    })

    return request
  }

  validateSubscription(email, listName) {
    const list = this.getListConfig(listName)
    const service = "validate_subscription"

    const request = this.createRequest(email, list, service)

    return fetch(request).then((response) => {
      if (response.status !== 200) {
        throw new Error("Invalid response.status")
      }
      return response.json()
    }).then((json) => {
      if (json.errors) {
        throw new Error(`Error response: ${Object.keys(json.errors).join(', ')}`)
      }
      const isSubscribed = json.results.filter((result) => {
        return result.email === email &&
          (result.errors.subscribed === 1)
      }).length > 0

      return isSubscribed
    })
  }

  subscribe(email, listName) {
    const list = this.getListConfig(listName)
    const service = "subscription"

    const request = this.createRequest(email, list, service)

    return fetch(request).then((response) => {
      if (response.status !== 200) {
        throw new Error("Invalid response.status")
      }
      return response.json()
    }).then((json) => {
      if (json.errors) {
        throw new Error(`Error response: ${Object.keys(json.errors).join(', ')}`)
      }
      if (!json.results) {
        return false
      }

      const added = json.results.subscribed_addresses > 0
      const skipped = json.results.skipped_addresses > 0

      return added || skipped
    })
  }

  unsubscribe(email, listName) {
    const list = this.getListConfig(listName)
    const service = "unsubscription"

    const request = this.createRequest(email, list, service)

    return fetch(request).then((response) => {
      if (response.status !== 200) {
        throw new Error("Invalid response.status")
      }
      return response.json()
    }).then((json) => {
      if (json.errors) {
        throw new Error(`Error response: ${Object.keys(json.errors).join(', ')}`)
      }
      if (!json.results) {
        return false
      }

      const added = json.results.subscribed_addresses && json.results.subscribed_addresses > 0
      const skipped = json.results.skipped_addresses && json.results.skipped_addresses > 0

      return added || skipped
    })
  }
}

const syncConfig = _.get(config, 'services.dada_mail_sync')
let dadaMailingListSyncService

if (syncConfig) {
  dadaMailingListSyncService = new DADAMailingListSyncService9_6_1(syncConfig)
}

module.exports = dadaMailingListSyncService
