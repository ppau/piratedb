import React, { Component } from "react"
import env from '../utils/env'

import StripeCheckout from "react-stripe-checkout"

export default class StripePayment extends Component {
  constructor(props) {
    super(props)

    this.render = this.render.bind(this)
  }

  render() {
    return (
      <StripeCheckout
        token={(token) => this.props.didUpdate(token)}
        email={this.props.email}
        allowRememberMe={false}
        stripeKey={env.STRIPE_PUBLIC_KEY}
        currency="AUD"
      />
    )
  }
}
