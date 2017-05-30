import * as actionTypes from '../constants/forgottenPasswordActionTypes'
import fetch from '../utils/fetch'

/*
* Forgotten password
*/

export function forgottenPasswordInitial(payload) {
  return {
    type: actionTypes.FORGOTTEN_PASSWORD_INITIAL,
    status: 'initial',
    payload: payload,
  }
}

export function forgottenPasswordPending(payload) {
  return {
    type: actionTypes.FORGOTTEN_PASSWORD_PENDING,
    status: 'pending',
    payload: payload,
  }
}

export function forgottenPasswordFulfilled(payload, response) {
  return {
    type: actionTypes.FORGOTTEN_PASSWORD_FULFILLED,
    status: response.status === 200 && payload.requestProcessed === true ? "success" : "error",
    payload: payload,
  }
}

export function forgottenPasswordRejected(error) {
    return {
      type: actionTypes.FORGOTTEN_PASSWORD_REJECTED,
      status: "error",
      payload: {
        errors: [
        "A server error occurred."
        ]
      },
    }
}

export function executeForgottenPassword(payload) {
  return function(dispatch) {
    dispatch(forgottenPasswordPending(payload))


    return fetch(`/forgotten-password`, {
      method: 'POST',
      credentials: "same-origin",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        data: {
          username: payload.username,
        }
      })
    })
    .then((response) => {
      return response.json().then((json) => ({json: json, response: response}))
    })
    .then((obj) => {
      return dispatch(forgottenPasswordFulfilled(obj.json, obj.response))
    })
    .catch((ex) => {
      return dispatch(forgottenPasswordRejected(ex))
    })
  }
}