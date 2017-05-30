import * as actionTypes from '../constants/memberActionTypes'
import fetch from '../utils/fetch'

export function changePasswordPending(payload) {
  return {
    type: actionTypes.CHANGE_PASSWORD_PENDING,
    status: 'pending',
    payload: payload,
  }
}

export function changePasswordFulfilled(payload, response) {
  return {
    type: actionTypes.CHANGE_PASSWORD_FULFILLED,
    status: response.status == 200 ? "success" : "error",
    payload: payload,
  }
}


export function changePasswordRejected(error) {
    return {
      type: actionTypes.CHANGE_PASSWORD_REJECTED,
      status: "error",
      payload: {
        errors: [
        "A server error occurred."
        ]
      },
    }
}

export function executeChangePassword(payload) {
  return function(dispatch) {
    dispatch(changePasswordPending(payload))

    return fetch(`/account/change-password`, {
      method: 'POST',
      credentials: "same-origin",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    .then((response) => {
      return response.json().then((json) => ({json: json, response: response}))
    })
    .then((obj) => {
      return dispatch(changePasswordFulfilled(obj.json, obj.response))
    })
    .catch((ex) => {
      return dispatch(changePasswordRejected(ex))
    })
  }
}
