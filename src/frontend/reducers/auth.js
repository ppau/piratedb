import * as actionTypes from '../constants/authActionTypes'

const defaultState = {
  initialised: false,
  authenticating: false,
  authenticated: false,
  user: null,
  member: null,
  errors: null
}

const auth = (state = defaultState, action) => {
  switch (action.type) {
    case actionTypes.INITIALISE_REQUEST:
      return Object.assign({}, state, {
        initialised: false,
        authenticating: state.authenticating,
        authenticated: state.authenticated,
        user: Object.assign({}, state.user),
        member: Object.assign({}, state.member),
        errors: null,
      })
    case actionTypes.SIGN_IN_REQUEST:
      return Object.assign({}, state, {
        initialised: true,
        authenticating: true,
        authenticated: state.authenticated,
        user: Object.assign({}, state.user),
        member: Object.assign({}, state.member),
        errors: null,
      })

    case actionTypes.INITIALISE_RESPONSE:
    case actionTypes.SIGN_IN_RESPONSE:
      return Object.assign({}, state, {
        initialised: true,
        authenticating: false,
        authenticated: action.payload.authenticated,
        user: action.payload.user ? Object.assign({}, action.payload.user) : null,
        member: action.payload.member ? Object.assign({}, action.payload.member) : null,
        errors: action.payload.errors ? action.payload.errors : null
      })
    default:
      return state
  }
}

export default auth