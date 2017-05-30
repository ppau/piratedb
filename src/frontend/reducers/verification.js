import * as types from '../constants/verificationActionTypes'

const defaultState = {
  initialised: false,
  loaded: false,
  verificationAccepted: null,
  message: null
}

const verification = (state = defaultState, action) => {
  switch (action.type) {
    case types.VERIFICATION_REQUEST:
      return Object.assign({}, state, {
        initialised: true,
        loaded: false,
        verificationAccepted: null,
        message: null
      })
    case types.VERIFICATION_RESPONSE:
      return Object.assign({}, state, {
        initialised: true,
        loaded: true,
        verificationAccepted: action.payload.verificationAccepted,
        message: action.payload.message
      })
    default:
      return state
  }
}

export default verification