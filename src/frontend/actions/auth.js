import * as actionTypes from '../constants/authActionTypes'
import fetch from '../utils/fetch'

export function initialiseRequest() {
  return {
    type: actionTypes.INITIALISE_REQUEST,
  }
}

export function initialiseResponse(payload) {
  return {
    type: actionTypes.INITIALISE_RESPONSE,
    payload: payload,
  }
}

export function signInRequest(payload) {
  return {
    type: actionTypes.SIGN_IN_REQUEST,
    payload: payload,
  }
}

export function signInResponse(payload, requestPayload) {
  if (payload.authenticated) {
    if (payload.user && payload.user.data && payload.user.data.isAdmin) {
      requestPayload.history.push('/admin/dashboard')
    } else {
      requestPayload.history.push('/account/details')
    }
  }
  return {
    type: actionTypes.SIGN_IN_RESPONSE,
    payload: payload,
  }
}

export function signOutRequest() {
  return {
    type: actionTypes.SIGN_OUT_REQUEST,
  }
}

export function signOutResponse(payload) {
  return {
    type: actionTypes.SIGN_OUT_RESPONSE,
    payload: payload,
  }
}

export function executeSignIn(payload) {
  return function(dispatch) {
    dispatch(signInRequest(payload))

    return fetch('/sign-in', {
      method: 'POST',
      credentials: "same-origin",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: payload.username,
        password: payload.password,
      })
    })
    .then((response) => response.json())
    .then((json) =>
      dispatch(signInResponse(json, payload))
    )
    .catch((ex) => {
      dispatch(signInResponse({
        authenticated: false,
        user: null,
        member: null,
        errors: [
          'Server error occurred.'
        ]
      }), payload)
    })
  }
}

export function executeInitialise() {
  return function(dispatch) {
    dispatch(initialiseRequest())

    return fetch('/user/details', {
      method: 'GET',
      credentials: "same-origin",
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then((response) => response.json())
      .then((json) =>
        dispatch(initialiseResponse(json))
      )
      .catch((ex) => {
        dispatch(initialiseResponse({
          authenticated: false,
          user: null,
          member: null,
          errors: [
            'Server error occurred.'
          ]
        }))
      })
  }
}
