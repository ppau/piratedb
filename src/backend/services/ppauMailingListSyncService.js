/**
 * Created by thomas on 2017-08-18.
 */

const _ = require("lodash")
const logger = require("../lib/logger")
const config = require("../config")
const dadaMailingListSyncService = require("./dadaMailingListSyncService")
const TAG = "ppau-mailing-list-sync"

const listMappings = [
  {
    name: "Australia",
    states: [
      {
        name: "Tasmania",
        list: "AnnoTas"
      }
    ]
  }
]

class PPAUMailingListSyncService {
  constructor(syncConfig) {
    this.syncConfig = syncConfig
    logger.notice(TAG, `Initialised PPAU mailing list sync.`)
  }

  async emit(eventName, member) {
    if (!this.syncConfig || !!dadaMailingListSyncService) {
      return
    }

    const eventHandlers = this.syncConfig.handlers.filter((handlerConfig) => {
      return handlerConfig.event === eventName
    })

    for (const eventHandler of eventHandlers) {
      for (const list of eventHandler.lists) {
        if (typeof list === "string") {
          logger.warning(TAG, `Execute action ${eventHandler.action} on member.id = ${member.id}, member.email = ${member.email} to ${list} mailing list.`)
          const actionFn = dadaMailingListSyncService[eventHandler.action]

          actionFn.bind(dadaMailingListSyncService)(member.email, list)
        } else if (list instanceof Object) {
          const actionFn = this[list.customHandler]

          actionFn(member)
        }
      }
    }
  }

  async stateListManagerSubscriber(member) {
    if (!member.residentialAddress) {
      logger.warning(TAG, `State lists manager could not find a residentialAddress on ${member.id}`)
      return
    }

    const country = listMappings.filter((c) => {
      return c.name === member.residentialAddress.country
    })[0]

    if (!country) {
      return
    }

    const state = country.states.filter((s) => {
      return s.name === member.residentialAddress.state
    })[0]

    logger.warning(TAG, `Adding member ${member.id}, ${member.email} to ${state.list} mailing list.`)
    dadaMailingListSyncService.subscribe(member.email, state.list)
  }

  async stateListManagerUnsubscriber(member) {
    if (!member.residentialAddress) {
      logger.warning(TAG, `State lists manager could not find a residentialAddress on ${member.id}`)
      return
    }

    const country = listMappings.filter((c) => {
      return c.name === member.residentialAddress.country
    })[0]

    if (!country) {
      return
    }

    const state = country.states.filter((s) => {
      return s.name === member.residentialAddress.state
    })[0]

    logger.warning(TAG, `Removing member ${member.id}, ${member.email} from ${state.list} mailing list.`)
    dadaMailingListSyncService.unsubscribe(member.email, state.list)
  }
}

const ppauMailingListSyncService = new PPAUMailingListSyncService(_.get(config, 'services.ppau_mail_sync'))

module.exports = ppauMailingListSyncService
