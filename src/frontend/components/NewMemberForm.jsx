import React, { Component } from "react"
import ReactDOM from "react-dom"
import MembershipType from "./MembershipType.jsx"
import Details from "./Details.jsx"
import Payment from "./Payment.jsx"
import ConfirmDetails from "./ConfirmDetails.jsx"
import ProgressBar from "./ProgressBar.jsx"
import Finished from "./Finished.jsx"

export default class NewMemberForm extends Component {
  constructor(props) {
    super(props)
    this.nextStep = this.nextStep.bind(this)
    this.previousStep = this.previousStep.bind(this)
    this.setMembershipType = this.setMembershipType.bind(this)
    this.submitPaymentComplete = this.submitPaymentComplete.bind(this)
    this.saveAndContinue = this.saveAndContinue.bind(this)
    this.submitMemberDetails = this.submitMemberDetails.bind(this)
    this.componentDidUpdate = this.componentDidUpdate.bind(this)
    this.getForm = this.getForm.bind(this)

    const startingState = 1

    this.state = {
      errors: [],
      step: (this.props.initialState === undefined ? startingState : this.props.initialState)
    }

    this.formValues = {
      membershipType: "",
      isEnrolled: "",
      residentialStatus: "",
      isMemberOfOtherParty: "",
      eligibility: "",
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      gender: "",
      email: "",
      primaryPhoneNumber: "",
      secondaryPhoneNumber: "",
      residentialAddress: {
        address: "",
        suburb: "",
        country: "",
        state: "",
        postcode: ""
      },
      postalAddress: {
        address: "",
        suburb: "",
        country: "",
        state: "",
        postcode: ""
      }
    }
  }

  componentDidUpdate() {
    ReactDOM.findDOMNode(this).scrollIntoView()
  }

  nextStep(payload) {
    this.setState({
      step: this.state.step + 1,
      paymentData: payload
    })
  }

  previousStep() {
    this.setState({step: this.state.step - 1})
  }

  setMembershipType(type) {
    this.setState({membershipType: type})
    this.nextStep()
  }

  saveAndContinue(fieldValues) {
    this.setState({
      errors: []
    })
    this.formValues = fieldValues
    this.nextStep()
  }

  submitMemberDetails() {
    return window.fetch("/members/new", {
      method: 'POST',
      credentials: "same-origin",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        details: this.formValues
      })
    })
      .then((response) => {
        if (response.status !== 200) {
          return Promise.reject(response)
        }
        return response.json()
      })
      .then((json) => {
        this.formValues.id = json.id
        this.saveAndContinue(this.formValues)
        return Promise.resolve(json)
      })
      .catch((ex) => {
        this.setState({
          errors: ["Sorry, we could not process your application at this time. Please try again, or " +
          "contact us at membership@pirateparty.org.au."]
        })
      })
  }

  submitPaymentComplete(payload) {
    this.nextStep(payload)
  }

  getForm() {
    switch (this.state.step) {
      case 1:
        return <MembershipType nextStep={this.setMembershipType}
                               formValues={this.formValues} />
      case 2:
        return <Details formValues={this.formValues}
                        nextStep={this.saveAndContinue}
                        previousStep={this.previousStep}
                        membershipType={this.state.membershipType} />
      case 3:
        return <ConfirmDetails formValues={this.formValues}
                               nextStep={this.submitMemberDetails}
                               previousStep={this.previousStep}
                               errors={this.state.errors} />
      case 4:
        return <Payment formValues={this.formValues}
                        preNextStep={null}
                        nextStep={this.submitPaymentComplete}
                        previousStep={this.previousStep}
                        errors={this.state.errors}
                        member={this.formValues} />
      case 5:
        return <Finished paymentData={this.state.paymentData} mode="new" email={this.formValues.email} history={this.props.history} />
    }
  }

  render() {
    return (
      <div id="form" className="form-container">
        <ProgressBar progress={this.state.step}/>
        {this.getForm() }
      </div>
    )
  }
}
