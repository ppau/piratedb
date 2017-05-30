import * as actionTypes from '../constants/verificationActionTypes'

export function verificationRequest() {
  return {
    type: actionTypes.VERIFICATION_REQUEST,
  }
}

export function verificationResponse(payload) {
  return {
    type: actionTypes.VERIFICATION_RESPONSE,
    payload: payload,
  }
}

export function executeVerification(id, hash) {
  return function(dispatch) {
    dispatch(verificationRequest())

    return fetch(`/members/verify/${id}/${hash}`, {
      method: 'POST',
      credentials: "same-origin",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: id,
        hash: hash,
      })
    })
      .then((response) => {
        return response.json()
      })
      .then((json) => {
        dispatch(verificationResponse(json))
      })
      .catch((ex) => {
        let error = new Error('parsing failed.', ex)
        error.exception = ex
        return error
      })
  }
}