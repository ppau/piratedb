/**
 * Created by thomas on 2017-07-03.
 */
import fetch from './fetch'

export function promiseDispatchFactory({url, payload, pending, fulfilled, rejected, method='POST', contentType='application/json'}) {
  return function(dispatch) {
    dispatch(pending(payload))

    const options = {
      method: method,
      credentials: "same-origin",
      headers: {
        'Content-Type': contentType
      },
    }

    if (payload) {
      options.body = JSON.stringify(payload)
    }

    return fetch(url, options)
    .then((response) => {
      return response.json().then((json) => ({json: json, response: response}))
    })
    .then((obj) => {
      return dispatch(fulfilled(obj.json, obj.response))
    })
    .catch((ex) => {
      return dispatch(rejected(ex))
    })
  }
}
