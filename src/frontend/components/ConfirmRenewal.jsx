import React, { Component } from 'react'
import Errors from './Errors.jsx'
import FullMemberDeclarationText from './declaration-text/FullMemberDeclarationText.jsx'
import OtherMemberDeclarationText from './declaration-text/OtherMemberDeclarationText.jsx'
import moment from 'moment'

export default class ConfirmRenewal extends Component {
  constructor(props) {
    super(props)
    this.state = {
      errors: {...props.errors}
    }

    this.getFullAddress = this.getFullAddress.bind(this)
    this.componentWillReceiveProps = this.componentWillReceiveProps.bind(this)
    this.renewMember = this.renewMember.bind(this)
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      errors: {...nextProps.errors}
    })
  }

  getFullAddress(address) {
    if (address) {
      return `${address.address}, ${address.suburb}, ${address.state}, ${address.country}, ${address.postcode}`
    }
    return ''
  }

  renewMember() {
    if (this.refs.declarationConfirmation.checked) {
      this.props.nextStep()
      this.setState({ errors: { ...this.props.errors } })
    } else {
      this.setState({
        errors:
          { consent: "Please click the declaration checkbox and check that your details are correct before continuing.", ...this.props.errors }
      })
    }
  }

  render() {
    if (!this.props.member) {
      return (
        <div></div>
      )
    }

    return <fieldset>
      <h1 className="form-title">Renew your membership</h1>

      <div className="form-body">
        <Errors invalidFields={Object.values(this.state.errors)}
                scrollToError={true}
                errorTitle="Please check the following fields:"/>


        <div className="heading">
          <h2 className="sub-title">Declaration </h2>

          <div className="sub-description"> Read the following and click the checkbox below.</div>
        </div>
        <div className="declaration">
          <p>
            I wish to renew my membership for Pirate Party Australia. I have read and understand the <b><a href="https://pirateparty.org.au/constitution/" target="_blank">Pirate Party Australia Constitution </a></b> and agree with its platform and principles, and to the best of my ability work to uphold and promote them.
          </p>
        </div>
        <label className={!!this.state.errors.consent ? "invalid" : ""} id="checkbox_declaration">
          <input type="checkbox" name="circumstance" ref="declarationConfirmation"/>
          <b>I agree to the declaration and consent to my information being sent to the Australian Electoral Commission.</b>
        </label>

        <div className="heading">
          <h2 className="sub-title">Your details</h2>

          <div className="sub-description">
            Check that your details are up to date.
          </div>
        </div>
        <div className="declaration">
          <div className="declaration-text">
            <b>Name: </b> {this.props.member.givenNames} {this.props.member.surname} <br/>
            <b>Date of birth: </b> {moment.utc(this.props.member.dateOfBirth).format('YYYY-MM-DD')} <br/>
            <b>Gender: </b> {this.props.member.gender} <br/>
            <b>Residential address: </b> {this.getFullAddress(this.props.member.residentialAddress)}
            <br/>
            <b>Postal address: </b> {this.getFullAddress(this.props.member.postalAddress)} <br/>
            <b>Email: </b> {this.props.member.email} <br/>
            <b>Phone: </b> {this.props.member.primaryPhoneNumber} <br/>
            <br/>
          </div>
        </div>
        <div className="navigation">
          <button onClick={this.renewMember} className="nav-button">Renew my membership</button>
          <p>or <a id="go-back" onClick={() => { this.props.history.push('/account/details') }} href="#">Cancel</a></p>
        </div>
      </div>
    </fieldset>
  }
}
