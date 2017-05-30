/**
 * Created by thomas on 08/12/16.
 */

import React, { Component } from "react"
import ReactDOM from "react-dom"
import Details from "../components/Details.jsx"
import GridLoading from '../components/GridLoading.jsx'

export default class MemberDetailsUpdatePage extends Component {
  constructor(props) {
    super(props)
    this.cancelUpdate = this.cancelUpdate.bind(this)
    this.saveAndContinue = this.saveAndContinue.bind(this)
    this.submitMemberDetails = this.submitMemberDetails.bind(this)
    this.componentDidUpdate = this.componentDidUpdate.bind(this)

    this.state = {
      errors: [],
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

  cancelUpdate(e) {
    this.props.history.push('/account/details')
    e.preventDefault()
  }

  saveAndContinue(fieldValues) {
    this.formValues = fieldValues
    this.submitMemberDetails()
      .then((result) => {
        if (result && result.success === true) {
          this.props.executeInitialise()
          this.props.history.push('/account/details')
        }
      })
  }

  submitMemberDetails() {
    return window.fetch("/account/update", {
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
        return Promise.resolve(json)
      })
      .catch((ex) => {
        this.setState({
          errors: [
            "We could not update your details at this time. Please try again, or " +
                "contact us at membership@pirateparty.org.au."
          ]
        })
      })
  }

  render() {
    if (!this.props.auth.initialised) {
      return (
        <GridLoading />
      )
    }

    return (
      <div id="form" className="form-container">

         <Details formValues={this.props.auth.member}
                  parentErrors={this.state.errors}
                  update={true}
                  nextStep={this.saveAndContinue}
                  previousStep={this.cancelUpdate}
                  membershipType={this.state.membershipType} />
      </div>
    )
  }
}
