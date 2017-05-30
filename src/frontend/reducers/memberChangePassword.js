import * as actionTypes from '../constants/memberActionTypes'
import moment from "moment"

const defaultState = {
  pending: false,
  fulfilled: false,
  fulfilledDateTime: null,
  succeeded: null,
  errors: null,
}

const memberChangePassword = (state = defaultState, action) => {
  switch (action.type) {
    case actionTypes.CHANGE_PASSWORD_PENDING:
      return Object.assign({}, state, {
        pending: true,
        fulfilled: false,
        fulfilledDateTime: null,
        succeeded: null,
        errors: null,
      })
    case actionTypes.CHANGE_PASSWORD_FULFILLED:
      return Object.assign({}, state, {
        pending: false,
        fulfilled: true,
        fulfilledDateTime: moment.utc(),
        succeeded: action.status === "success",
        errors: action.payload.errors ? action.payload.errors : null,
      })
    case actionTypes.CHANGE_PASSWORD_REJECTED:
      return Object.assign({}, state, {
        pending: false,
        fulfilled: true,
        fulfilledDateTime: moment.utc(),
        succeeded: false,
        errors: action.payload.errors,
      })
    default:
      return state
  }
}

export default memberChangePassword