import * as actionTypes from '../constants/forgottenPasswordChangeActionTypes'
import fetch from '../utils/fetch'

/*
* Forgotten password change
*/

export function forgottenPasswordChangeInitial(payload) {
  return {
    type: actionTypes.FORGOTTEN_PASSWORD_CHANGE_INITIAL,
    status: 'initial',
    payload: payload,
  }
}

export function forgottenPasswordChangePending(payload) {
  return {
    type: actionTypes.FORGOTTEN_PASSWORD_CHANGE_PENDING,
    status: 'pending',
    payload: payload,
  }
}

export function forgottenPasswordChangeFulfilled(payload, response) {
  return {
    type: actionTypes.FORGOTTEN_PASSWORD_CHANGE_FULFILLED,
    status: response.status === 200 && payload.succeeded === true ? "success" : "error",
    payload: payload,
  }
}

export function forgottenPasswordChangeRejected(error) {
    return {
      type: actionTypes.FORGOTTEN_PASSWORD_CHANGE_REJECTED,
      status: "error",
      payload: {
        errors: [
        "A server error occurred."
        ]
      },
    }
}

export function executeForgottenPasswordChange(payload) {
  return function(dispatch) {
    dispatch(forgottenPasswordChangePending(payload))


    return fetch(`/forgotten-password-change/${payload.resetPasswordKey}/${payload.username}`, {
      method: 'POST',
      credentials: "same-origin",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        data: {
          username: payload.username,
          resetPasswordKey: payload.resetPasswordKey,
          newPassword: payload.newPassword,
        }
      })
    })
    .then((response) => {
      return response.json().then((json) => ({json: json, response: response}))
    })
    .then((obj) => {
      return dispatch(forgottenPasswordChangeFulfilled(obj.json, obj.response))
    })
    .catch((ex) => {
      return dispatch(forgottenPasswordChangeRejected(ex))
    })
  }
}