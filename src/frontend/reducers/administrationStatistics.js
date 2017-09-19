import * as actionTypes from '../constants/administrationActionTypes'
import moment from "moment"

const defaultState = {
  pending: false,
  fulfilled: false,
  fulfilledDateTime: null,
  succeeded: null,
  errors: null,
}

const administrationStatistics = (state = defaultState, action) => {
  switch (action.type) {
    case actionTypes.MEMBER_STATISTICS_PENDING:
      return Object.assign({}, state, {
        pending: true,
        fulfilled: false,
        fulfilledDateTime: null,
        succeeded: null,
        payload: null,
        errors: null,
      })
    case actionTypes.MEMBER_STATISTICS_FULFILLED:
      return Object.assign({}, state, {
        pending: false,
        fulfilled: true,
        fulfilledDateTime: moment.utc(),
        succeeded: action.status === "success",
        payload: action.payload,
        errors: action.payload.errors ? action.payload.errors : null,
      })
    case actionTypes.MEMBER_STATISTICS_REJECTED:
      return Object.assign({}, state, {
        pending: false,
        fulfilled: true,
        fulfilledDateTime: moment.utc(),
        succeeded: false,
        payload: null,
        errors: action.payload.errors,

      })
    default:
      return state
  }
}

export default administrationStatistics
