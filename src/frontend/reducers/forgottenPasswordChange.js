import * as actionTypes from '../constants/forgottenPasswordChangeActionTypes'
import moment from "moment"

const defaultState = {
  pending: false,
  fulfilled: false,
  fulfilledDateTime: null,
  succeeded: null,
  errors: null,
}

const forgottenPasswordChange = (state = defaultState, action) => {
  switch (action.type) {
    case actionTypes.FORGOTTEN_PASSWORD_CHANGE_INITIAL:
      return Object.assign({}, state, {
        pending: false,
        fulfilled: false,
        fulfilledDateTime: null,
        succeeded: null,
        errors: null,
      })
    case actionTypes.FORGOTTEN_PASSWORD_CHANGE_PENDING:
      return Object.assign({}, state, {
        pending: true,
        fulfilled: false,
        fulfilledDateTime: null,
        succeeded: null,
        errors: null,
      })
    case actionTypes.FORGOTTEN_PASSWORD_CHANGE_FULFILLED:
      return Object.assign({}, state, {
        pending: false,
        fulfilled: true,
        fulfilledDateTime: moment.utc(),
        succeeded: action.status === "success",
        errors: action.payload.errors ? action.payload.errors : null,
      })
    case actionTypes.FORGOTTEN_PASSWORD_CHANGE_REJECTED:
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

export default forgottenPasswordChange