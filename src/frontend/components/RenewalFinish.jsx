import React, { Component } from 'react'
import BankDetails from '../components/BankDetails.jsx'
import PaypalFinish from '../components/PaypalFinish.jsx'


export default class RenewalFinish extends Component {
  constructor(props) {
    super(props)
    this.state = {
      paymentData: props.paymentData,
    }
  }

  render() {
    return <fieldset>
      <h1 className="form-title">Thank You</h1>

      <div className="form-body">
        <div className="heading">
          <h2 className="sub-title"> We have received your renewal details. </h2>
        </div>

        <label>
          <p>Thank you for renewing your Pirate Party Australia membership.</p>
          <p>If you have any concerns please contact us at <a href="mailto:membership@pirateparty.org.au">membership@pirateparty.org.au</a></p>

          {this.props.paypalFinish ? <PaypalFinish /> : null}
        </label>

        { this.state.paymentData && (this.state.paymentData.paymentType === "deposit" || this.state.paymentData.paymentType === "cheque")
          ? <BankDetails reference={this.state.paymentData.json.reference} /> : null }

        <div className="navigation">
          <button className="nav-button" onClick={() => {
            this.props.history.push('/account/details')
          }}>
            Members area
          </button>
        </div>
      </div>
    </fieldset>
  }
}
