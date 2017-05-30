import React, { Component } from "react"
import { DropIn } from "braintree-react"
import * as braintree from "braintree-web"

export default class BraintreeInfoBox extends Component {
  constructor(props) {
    super(props)
    this.state = {token: null, error: null}

    this.render = this.render.bind(this)
    this.getToken = this.getToken.bind(this)
    this.onError = this.onError.bind(this)
    this.nonceReceived = this.nonceReceived.bind(this)

    this.getToken()
  }

  getToken() {
    window.fetch("/payment/braintree", {
      method: 'GET',
      credentials: "same-origin",
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then((response) => {
        if (response.status != 200) {
          return Promise.reject(response);
        }
        return response.json()
      })
      .then((json) => {
        this.setState({token: json.token})
      })
      .catch((ex) => {
        console.warn("failed to get braintree client token", ex)
        this.setState({error: "Sorry, could not initialise braintree client token. Please try again later."})
      })
  }

  onError(error) {
    this.setState({
      error: "There was a problem with the Braintree widget. Please try again later."
    })
  }

  /**
   * cf. <https://developers.braintreepayments.com/reference/client-reference/javascript/v2/configuration#setup-method-options>
   *
   * @param {{nonce: string, type: string, details: Object}} nonce
   */
  nonceReceived(nonce) {
    this.props.didUpdate(nonce)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="info-box payment">
          <div>Sorry, there was problem.</div>
          <div>{this.state.error}</div>
        </div>
      )
    }

    if (this.state.token) {
      return (
        <div className="info-box payment" style={{padding: 15}}>
          <DropIn braintree={braintree} clientToken={this.state.token}
                  onError={this.onError}
                  onPaymentMethodReceived={this.nonceReceived}/>
        </div>
      )
    }

    return (
      <div className="info-box payment">
        Initilizing braintree widget…
      </div>
    )
  }
}
