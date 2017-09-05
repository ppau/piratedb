/**
 * Created by thomas on 08/12/16.
 */

import React, { Component } from 'react'
import moment from 'moment'
import ConfirmRenewal from '../components/ConfirmRenewal.jsx'
import Payment from '../components/Payment.jsx'
import RenewalFinish from '../components/RenewalFinish.jsx'
import GridLoading from '../components/GridLoading.jsx'

export default class MemberRenewPage extends Component {

  constructor(props) {
    super(props)
    this.state = {
      errors: {},
      step: 1,
      renewalAvailable: false,
      initialised: props.auth.initialised && props.auth.authenticated,
    }

    if (props.auth.initialised && props.auth.authenticated) {
      this.state.renewalAvailable = this.getRenewalAvailable(props.auth.member)
    }

    this.confirmMembershipRenewal = this.confirmMembershipRenewal.bind(this)
    this.getForm = this.getForm.bind(this)
    this.nextStep = this.nextStep.bind(this)
    this.getRenewalAvailable = this.getRenewalAvailable.bind(this)
  }

  componentDidMount() {
  }

  componentWillReceiveProps(nextProps) {
    if (!this.state.initialised && nextProps.auth.initialised && nextProps.auth.authenticated) {
      this.setState({
        renewalAvailable: this.getRenewalAvailable(nextProps.auth.member),
        initialised: nextProps.auth.initialised && nextProps.auth.authenticated,
      })
    }
  }

  nextStep(payload) {
    const step = this.state.step + 1

    this.setState({
      step: step,
      payload: payload,
    })

    if (step === 2) {
      this.props.executeInitialise()
    }
  }

  confirmMembershipRenewal() {
    window.fetch("/account/renew", {
      method: 'POST',
      credentials: "same-origin",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        data: {
          renew: true
        }
      })
    })
      .then((response) => {
        if (response.status !== 200) {
          response.json().then((json) => {
            if (!json){
              return
            }
            this.setState({
              errors: json.errors || {}
            })
          })
          return Promise.reject(response)
        }
        return response.json()
      })
      .then((json) => {
        this.nextStep(json.data)
      })
      .catch((ex) => {
        console.log(ex)
      })
  }

  getForm() {
    switch (this.state.step) {
      case 1:
        return <ConfirmRenewal nextStep={this.confirmMembershipRenewal}
                               errors={this.state.errors}
                               member={this.props.auth.member}
                               history={this.props.history} />
      case 2:
        return <Payment email={this.props.auth.member.email}
                        member={this.props.auth.member}
                        invoiceId={this.state.invoiceId}
                        nextStep={this.nextStep}/>
      case 3:
        return <RenewalFinish paymentData={this.state.payload} history={this.props.history} />
    }
  }

  getRenewalAvailable(member) {
    return moment.utc(member.expiresOn).subtract(60, "days") < moment.utc() && member.status === "accepted"
  }

  render() {
    if (!this.state.initialised) {
      return (
        <GridLoading />
      )
    }

    if (!this.state.renewalAvailable) {
      return (
        <div className="container">
          <div id="form" className="form-container">
            <div className="header">
            </div>
            <fieldset>
              <h1 className="form-title">Renewal not available</h1>

              <div className="form-body">
                <div className="heading">
                  <h3 className="sub-title">You don't need to renew your membership at this time.</h3>
                </div>
                <div className="navigation">
                  <button className="nav-button" onClick={() => {
                    this.props.history.push('/account/details')
                  }}>
                    Members area
                  </button>

                  <button className="nav-button" onClick={() => {
                    this.props.history.push('/donate')
                  }}>
                    Make a donation
                  </button>
                </div>
              </div>
            </fieldset>
          </div>
        </div>
      )
    }

    return (
      <div className="container">
        <div id="form" className="form-container">
          <div className="header">
          </div>
          {this.getForm()}
        </div>
      </div>
    )
  }
}
