import React, { Component } from 'react'
import moment from 'moment'

import Errors from './Errors.jsx'
import InlineError from './InlineError.jsx'
import * as memberValidator from '../../lib/memberValidator'
import countrySelector from '../../lib/countries'

export default class Details extends Component {
  constructor(props) {
    super(props)
    this.storeDetails = this.storeDetails.bind(this)
    this.continueOnClick = this.continueOnClick.bind(this)
    this.getPersonalInformationSubtitletext = this.getPersonalInformationSubtitletext.bind(this)
    this.getResidentialAddressSubtitleText = this.getResidentialAddressSubtitleText.bind(this)
    this.handlePostalAddress = this.handlePostalAddress.bind(this)
    this.handleValidationErrors = this.handleValidationErrors.bind(this)
    this.validationErrorClass = this.validationErrorClass.bind(this)
    this.isValidationError = this.isValidationError.bind(this)
    this.clearValidationErrors = this.clearValidationErrors.bind(this)
    this.componentWillReceiveProps = this.componentWillReceiveProps.bind(this)
    this.render = this.render.bind(this)
    this.state = {
      invalidFields: [],
      errorNames: [],
      parentErrors: props.parentErrors || [],
      showPostalAddress: !!props.formValues.isPostalAddressDifferent,
      residentialCountry: 'Australia',
      postalCountry: 'Australia'
    }

    this.errorTypes = {
      givenNames: {name: 'Given names', message: 'Please enter your given names. No symbols allowed.'},
      surname: {name: 'Surname', message: 'Please enter your surname. No symbols allowed.'},
      email: {name: 'Email', message: 'Please enter a valid email address e.g. you@example.com'},
      password: {name: 'Password', message: 'Please enter a valid password, 8 or more characters.'},
      confirmPassword: {name: 'Confirm password', message: "Your passwords didn't match"},
      dateOfBirth: {
        name: 'Date of birth',
        message: 'Must be in the format DD/MM/YYYY and you must be over 16 years of age.'
      },
      primaryPhoneNumber: {name: 'Phone number', message: 'Please enter a valid phone number.'},
      secondaryPhoneNumber: {name: 'Secondary phone number', message: 'Please enter a valid phone number.'},
      residentialAddress: {name: 'Residential address', message: 'Please enter your address.'},
      residentialState: {name: 'Residential state', message: 'Please select your state from the dropdown menu.'},
      residentialCountry: {name: 'Residential country', message: 'Please select your country from the dropdown menu.'},
      residentialPostcode: {
        name: 'Residential postcode',
        message: 'Please enter your postcode/zip code. Must not be longer than 16 digits.'
      },
      residentialSuburb: {name: 'Residential suburb', message: 'Please enter your suburb/city.'},
      postalAddress: {name: 'Postal address', message: 'Please enter your address.'},
      postalState: {name: 'Postal state', message: 'Please select your state from the dropdown menu.'},
      postalCountry: {name: 'Postal country', message: 'Please select your country from the dropdown menu.'},
      postalPostcode: {
        name: 'Postal postcode',
        message: 'Please enter your postcode/zip code. Must not be longer than 16 digits.'
      },
      postalSuburb: {name: 'Postal suburb', message: 'Please enter your suburb/city.'},
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      parentErrors: nextProps.parentErrors,
    })
  }

  handlePostalAddress() {
    if (this.refs.differentPostal.checked) {
      this.setState({showPostalAddress: true})
    } else {
      this.setState({showPostalAddress: false})
    }
  }

  handleValidationErrors(validationErrors, scrollToError) {
    let invalidFields = validationErrors

    if (!this.refs.differentPostal.checked) {
      invalidFields = _.filter(validationErrors, (error) => !_.startsWith(error, 'postal'))
    }

    let errors = []

    _.forEach(invalidFields, function(error) {
      errors.push(this.errorTypes[error].name)
    }.bind(this))

    this.setState({ invalidFields: invalidFields, errorNames: errors, scrollToError: scrollToError })
  }

  clearValidationErrors() {
    this.setState({ invalidFields: [], errorNames: [] })
  }

  componentDidMount() {
    countrySelector.populateCountries('residentialAddress[country]', 'residentialAddress[state]')
    countrySelector.populateCountries('postalAddress[country]', 'postalAddress[state]')

    countrySelector.setCountryAddress('residentialAddress[country]', this.props.formValues.residentialAddress.country, 'residentialAddress[state]', this.props.formValues.residentialAddress.state)
    countrySelector.setCountryAddress('postalAddress[country]', this.props.formValues.postalAddress.country, 'postalAddress[state]', this.props.formValues.postalAddress.state)
  }

  getPersonalInformationSubtitletext() {
    if (this.props.membershipType === 'full') {
      return 'Please enter your details exactly as they would appear on the electoral roll.'
    }
    return 'Please enter your details.'
  }

  getResidentialAddressSubtitleText() {
    if (this.props.membershipType === 'full') {
      return 'Please enter the address that you are enrolled to vote from.'
    }
    return 'Please enter your address.'
  }

  isValidationError(fieldName) {
    return _.indexOf(this.state.invalidFields, fieldName) > -1
  }

  validationErrorClass(fieldName) {
    if (this.isValidationError(fieldName)) {
      return 'invalid'
    }
    return
  }

  continueOnClick(e){
    this.storeDetails()
  }

  storeDetails() {
    let fieldValues = {
      membershipType: this.props.membershipType,
      givenNames: this.refs.givenNames.value,
      surname: this.refs.surname.value,
      dateOfBirth: this.refs.dateOfBirth.value,
      gender: this.refs.gender.value,
      email: this.refs.email.value,
      password: this.refs.password.value,
      primaryPhoneNumber: this.refs.phoneNumber.value,
      secondaryPhoneNumber: this.refs.secondaryPhoneNumber.value,
      isPostalAddressDifferent: this.refs.differentPostal.checked,
      residentialAddress: {
        address: this.refs.residentialAddress.value,
        suburb: this.refs.residentialSuburb.value,
        country: this.refs.residentialCountry.value,
        state: this.refs.residentialState.value,
        postcode: this.refs.residentialPostcode.value
      },
      postalAddress: {
        address: this.refs.postalAddress.value,
        suburb: this.refs.postalSuburb.value,
        country: this.refs.postalCountry.value,
        state: this.refs.postalState.value,
        postcode: this.refs.postalPostcode.value
      }
    }

    if (!this.refs.differentPostal.checked) {
      fieldValues.postalAddress = fieldValues.residentialAddress
    }

    const validator = this.props.update ? memberValidator.isValid : memberValidator.isValidWithPasswords
    const validationErrors = validator(fieldValues, this.refs.password.value, this.refs.confirmPassword.value)

    if (validationErrors.length > 0) {
      this.handleValidationErrors(validationErrors, true)
      return
    }
    this.clearValidationErrors()
    return this.props.nextStep(fieldValues)
  }

  render() {
    return (
      <fieldset>
        <h1 className="form-title">Details</h1>

        <div className="form-body">

          <div className="reminder">
            <img src="/images/reminder.svg" />

            <div className="reminder-text">
              The information provided in this form may be used for the purpose of ensuring that the
              Pirate Party can register or remain registered as a political party in Australia, and its
              states and territories. <a href="https://pirateparty.org.au/privacy/" target="_blank">View our Privacy
              Policy.</a>
            </div>
          </div>

          <Errors invalidFields={this.state.parentErrors}
                  scrollToError={this.state.scrollToError}
                  errorTitle="Server errors:"/>

          <Errors invalidFields={this.state.errorNames}
                  scrollToError={this.state.scrollToError}
                  errorTitle="Please check the following fields:"/>

          <div className="heading">
            <h2 className="sub-title">Personal information</h2>
            <div className="sub-description">{this.getPersonalInformationSubtitletext()}</div>
          </div>
          <div className="field-group">
            <label htmlFor="givenNames" className={this.validationErrorClass('givenNames')}>Given name(s) <span
              className="mandatoryField">* </span>
              <InlineError isError={this.isValidationError('givenNames')}
                           errorMessage={this.errorTypes['givenNames'].message}/>
              <input type="text" defaultValue={this.props.formValues.givenNames} ref="givenNames" id="givenNames"
                     className="givenNames"/>
            </label>
            <label htmlFor="surname" className={this.validationErrorClass('surname')}>Surname <span
              className="mandatoryField">* </span>
              <InlineError isError={this.isValidationError('surname')}
                           errorMessage={this.errorTypes['surname'].message}/>
              <input type="text" defaultValue={this.props.formValues.surname} ref="surname" id="surname"
                     className="surname"/>
            </label>
            <label htmlFor="dateOfBirth" className={this.validationErrorClass('dateOfBirth')}>Date of birth <span
              className="mandatoryField">* </span>
              <InlineError isError={this.isValidationError('dateOfBirth')}
                           errorMessage={this.errorTypes['dateOfBirth'].message}/>
              <input type="text" defaultValue={this.props.formValues.dateOfBirth ? moment(this.props.formValues.dateOfBirth).format("DD/MM/YYYY") : ""} ref="dateOfBirth"
                     placeholder="DD/MM/YYYY" id="dateOfBirth" className="dateOfBirth"/>
            </label>
            <label htmlFor="gender">Gender <i>(optional)</i>
              <input type="text" defaultValue={this.props.formValues.gender} ref="gender" id="gender"
                     className="gender"/>
            </label>
          </div>

          <div className="heading">
            <h2 className="sub-title">Account details</h2>
            <div className="sub-description">
              Please enter your current email{ this.props.update === true ? "." : " and a new password."}
            </div>
          </div>
          <div className="field-group">
            <label htmlFor="email" className={this.validationErrorClass('email')}>Email <span
              className="mandatoryField">* </span>
              <InlineError isError={this.isValidationError('email')}
                           errorMessage={this.errorTypes['email'].message}/>
              <input type="text" defaultValue={this.props.formValues.email} ref="email" id="email"
                     className="email"/>
            </label>
            <div className={ this.props.update === true ? "hidden" : "" }>
              <label htmlFor="password" className={this.validationErrorClass('password')}>Password <span
                className="mandatoryField">* </span>
                <InlineError isError={this.isValidationError('password')}
                             errorMessage={this.errorTypes['password'].message}/>
                <input type="password" ref="password" id="password"
                       className="password"/>
              </label>
              <label htmlFor="confirmPassword" className={this.validationErrorClass('confirmPassword')}>Confirm password <span
                className="mandatoryField">* </span>
                <InlineError isError={this.isValidationError('confirmPassword')}
                             errorMessage={this.errorTypes['confirmPassword'].message}/>
                <input type="password" ref="confirmPassword" id="confirmPassword"
                       className="confirmPassword"/>
              </label>
            </div>
          </div>

          <div className="heading">
            <h2 className="sub-title">Residential address</h2>
            <div className="sub-description">{this.getResidentialAddressSubtitleText()}</div>
          </div>
          <div className="field-group">
            <label htmlFor="residentialAddress[address]" className={this.validationErrorClass('residentialAddress')}>Address
              <span className="mandatoryField">* </span>
              <InlineError isError={this.isValidationError('residentialAddress')}
                           errorMessage={this.errorTypes['residentialAddress'].message}/>
              <input type="text" defaultValue={this.props.formValues.residentialAddress.address}
                     ref="residentialAddress" id="residentialAddress[address]" className="residentialAddress"/>
            </label>
            <label htmlFor="residentialAddress[suburb]" className={this.validationErrorClass('residentialSuburb')}>Suburb/city
              <span className="mandatoryField">* </span>
              <InlineError isError={this.isValidationError('residentialSuburb')}
                           errorMessage={this.errorTypes['residentialSuburb'].message}/>
              <input type="text" defaultValue={this.props.formValues.residentialAddress.suburb} ref="residentialSuburb"
                     id="residentialAddress[suburb]" className="residentialSuburb"/>
            </label>
            <label htmlFor="residentialAddress[country]" className={this.validationErrorClass('residentialCountry')}>Country
              <span className="mandatoryField">* </span>
              <InlineError isError={this.isValidationError('residentialCountry')}
                           errorMessage={this.errorTypes['residentialCountry'].message}/>
              <select defaultValue={this.props.formValues.residentialAddress.country} ref="residentialCountry"
                      id="residentialAddress[country]" className="residentialCountry">
              </select>
            </label>
            <div className="state-code">
              <label htmlFor="residentialAddress[state]" className={this.validationErrorClass('residentialState')}>State
                or territory <span className="mandatoryField">* </span>
                <InlineError isError={this.isValidationError('residentialState')}
                             errorMessage={this.errorTypes['residentialState'].message}/>
                <select defaultValue={this.props.formValues.residentialAddress.state} ref="residentialState"
                        id="residentialAddress[state]" className="residentialState">
                  <option value="New South Wales">New South Wales</option>
                </select>
              </label>
              <label htmlFor="residentialAddress[postcode]"
                     className={this.validationErrorClass('residentialPostcode')}>Postcode/ZIP code<span
                className="mandatoryField">* </span>
                <InlineError isError={this.isValidationError('residentialPostcode')}
                             errorMessage={this.errorTypes['residentialPostcode'].message}/>
                <input type="text" defaultValue={this.props.formValues.residentialAddress.postcode}
                       ref="residentialPostcode" id="residentialAddress[postcode]"
                       className="residentialPostcode"/>
              </label>
            </div>
            <label>
              <input type="checkbox" onChange={this.handlePostalAddress}
                     ref="differentPostal"
                     value="Yes"
                     checked={this.state.showPostalAddress}
                     />
              My postal address is <b>different</b>.
            </label>
          </div>
          <div id="postal-address"
               className={(() => {
                 return this.state.showPostalAddress ? '' : 'hidden'
               })()}>
            <div className="heading">
              <h2 className="sub-title">Postal address</h2>
              <div className="sub-description">Please enter the postal address.</div>
            </div>
            <div className="field-group">
              <label htmlFor="postalAddress[address]" className={this.validationErrorClass('postalAddress')}>Address
                <span className="mandatoryField">* </span>
                <InlineError isError={this.isValidationError('postalAddress')}
                             errorMessage={this.errorTypes['postalAddress'].message}/>
                <input type="text" defaultValue={this.props.formValues.postalAddress.address}
                       ref="postalAddress" id="postalAddress"/>
              </label>
              <label htmlFor="postalAddress[suburb]" className={this.validationErrorClass('postalSuburb')}>Suburb <span
                className="mandatoryField">* </span>
                <InlineError isError={this.isValidationError('postalSuburb')}
                             errorMessage={this.errorTypes['postalSuburb'].message}/>
                <input type="text" defaultValue={this.props.formValues.postalAddress.suburb}
                       ref="postalSuburb" id="postalAddress[suburb]"/>
              </label>
              <label htmlFor="postalAddress[country]" className={this.validationErrorClass('postalCountry')}>Country
                <span className="mandatoryField">* </span>
                <InlineError isError={this.isValidationError('postalCountry')}
                             errorMessage={this.errorTypes['postalCountry'].message}/>
                <select defaultValue={this.props.formValues.postalAddress.country} ref="postalCountry"
                        id="postalAddress[country]">
                </select>
              </label>

              <div className="state-code">
                <label htmlFor="postalAddress[state]" className={this.validationErrorClass('postalState')}>State or
                  territory <span className="mandatoryField">* </span>
                  <InlineError isError={this.isValidationError('postalState')}
                               errorMessage={this.errorTypes['postalState'].message}/>
                  <select defaultValue={this.props.formValues.postalAddress.state} ref="postalState"
                          id="postalAddress[state]">
                  </select>
                </label>
                <label htmlFor="postalAddress[postcode]" className={this.validationErrorClass('postalPostcode')}>Postcode/ZIP
                  code <span className="mandatoryField">* </span>
                  <InlineError isError={this.isValidationError('postalPostcode')}
                               errorMessage={this.errorTypes['postalPostcode'].message}/>
                  <input type="text" defaultValue={this.props.formValues.postalAddress.postcode}
                         ref="postalPostcode" id="postalAddress[postcode]"/>
                </label>
              </div>
            </div>
          </div>

          <div className="heading">
            <h2 className="sub-title">Contact details</h2>
            <div className="sub-description">Please enter your contact phone number/s.</div>
          </div>
          <div className="field-group">
            <label htmlFor="phoneNumber" className={this.validationErrorClass('primaryPhoneNumber')}>Phone number <span
              className="mandatoryField">* </span>
              <InlineError isError={this.isValidationError('primaryPhoneNumber')}
                           errorMessage={this.errorTypes['primaryPhoneNumber'].message}/>
              <input type="text" defaultValue={this.props.formValues.primaryPhoneNumber} ref="phoneNumber"
                     id="primaryPhoneNumber" className="primaryPhoneNumber"/>
            </label>
            <label htmlFor="secondaryPhoneNumber" className={this.validationErrorClass('secondaryPhoneNumber')}>Secondary
              phone number<i>(optional)</i>
              <InlineError isError={this.isValidationError('secondaryPhoneNumber')}
                           errorMessage={this.errorTypes['secondaryPhoneNumber'].message}/>
              <input type="text" defaultValue={this.props.formValues.secondaryPhoneNumber} ref="secondaryPhoneNumber"
                     id="secondaryPhoneNumber" className="secondaryPhoneNumber"/>
            </label>
          </div>

          <div className="navigation">
            <button className="nav-button" onClick={this.continueOnClick}>{ this.props.update === true ? "Save" : "Continue" }</button>
            <p>or <a id="go-back" onClick={this.props.previousStep} href="#">{ this.props.update === true ? "Cancel" : "Go back" }</a></p>
          </div>
        </div>

      </fieldset>
    )
  }
}
