import React, {Component} from 'react'
import Errors from './Errors.jsx'
import FullMemberDeclarationText from './declaration-text/FullMemberDeclarationText.jsx'
import OtherMemberDeclarationText from './declaration-text/OtherMemberDeclarationText.jsx'

export default class ConfirmDetails extends Component {
  constructor(props) {
    super(props)
    this.getFullAddress = this.getFullAddress.bind(this)
    this.confirmDetailsOnClick = this.confirmDetailsOnClick.bind(this)
    this.getDeclaration = this.getDeclaration.bind(this)
    this.getCheckboxText = this.getCheckboxText.bind(this)
    this.isValidationError = this.isValidationError.bind(this)
    this.state = {
        errors: [],
        errorTitle: ""
    }
  }

  getFullAddress(addressObj) {
    return addressObj.address + ', '
        + addressObj.suburb + ', '
        + addressObj.state + ', '
        + addressObj.country + ', '
        + addressObj.postcode
  }

  componentWillReceiveProps(props) {
    this.setState({ errors: props.errors,
                    errorTitle: props.errors ? "Error:" : ""})
  }

  isValidationError() {
    return this.state.errors.length > 0 && !this.refs.declarationConfirmation.checked
  }

  confirmDetailsOnClick() {
    if (this.refs.declarationConfirmation.checked) {
      this.props.nextStep()
    }
    else {
      this.setState({errorTitle: "Please check the following fields:", errors:["Please click the declaration checkbox and check that your details are correct before continuing."]})
    }
  }

  getDeclaration() {
    if (this.props.formValues.membershipType === 'full') {
      return <FullMemberDeclarationText />
    }
    return <OtherMemberDeclarationText />
  }

  getCheckboxText() {
    if (this.props.formValues.membershipType === 'full') {
      return <b>I agree to the declaration, I am enrolled to vote in Australian federal elections, and consent to my details being provided
                  to the Australian Electoral Commission.</b>
    }
    return <b>I agree to the declaration.</b>
  }

  render() {
    return (<fieldset>
        <h1 className="form-title">Confirm</h1>

        <div className="form-body">
            <Errors invalidFields={this.state.errors}
                    scrollToError={true}
                    errorTitle={this.state.errorTitle}/>

            <div className="heading">
                <h2 className="sub-title">Declaration </h2>
                 <div className="sub-description"> Read the following and click the checkbox below.</div>
            </div>
            <div className="declaration">
              {this.getDeclaration()}
            </div>
            <label className={this.isValidationError() ? "invalid" : ""} id="checkbox_declaration">
                <input type="checkbox" name="circumstance" ref="declarationConfirmation"/>
                     {this.getCheckboxText()}<span className="mandatoryField">* </span>
            </label>
            <div className="heading">
                <h2 className="sub-title">Check your details</h2>
                <div className="sub-description">Please enter all the data you have entered is correct. It is a serious offence to make a false declaration.</div>
            </div>
            <div className="declaration">
                <div className="declaration-text">
                    <b> Name: </b> {this.props.formValues.givenNames} {this.props.formValues.surname} <br/>
                    <b> Date of birth: </b> {this.props.formValues.dateOfBirth} <br/>
                    <b> Gender: </b> {this.props.formValues.gender || "(empty)"} <br/>
                    <b> Residential address: </b> {this.getFullAddress(this.props.formValues.residentialAddress)} <br/>
                    <b> Postal address: </b> {this.getFullAddress(this.props.formValues.postalAddress)} <br/>
                    <b> Email: </b> {this.props.formValues.email} <br/>
                    <b> Phone: </b> {this.props.formValues.primaryPhoneNumber} <br/>
                </div>
            </div>
            <div className="navigation">
                <button className="nav-button" onClick={this.confirmDetailsOnClick}>My details are correct</button>
                <p>or <a onClick={this.props.previousStep} id='go-back' href="#">go back to change your details</a></p>
            </div>
        </div>
    </fieldset>)
  }
}
