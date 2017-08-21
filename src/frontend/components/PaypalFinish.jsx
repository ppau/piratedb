import React, { Component } from 'react'

export default class PaypalFinish extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return <p>
      A copy of your receipt has also been emailed to you via PayPal. To view the details of
      this transaction check your email, or visit <a href="https://paypal.com" target="_blank">paypal.com</a>.
    </p>
  }
}
