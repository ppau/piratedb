/**
 * Created by thomas on 2017-09-10.
 */
import React, { Component } from 'react'
import moment from 'moment'
import GridLoading from '../../components/GridLoading.jsx'
import GridErrors from '../../components/GridErrors.jsx'
import Details from "../../components/Details.jsx"

export default class AdminMemberDetailsUpdatePage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      member: null,
      user: null,
      id: !!props.match.params.id ? props.match.params.id : null,
      loaded: false,
      errors: null,
    }
    this.render = this.render.bind(this)
    this.getMember = this.getMember.bind(this)
    this.saveAndContinue = this.saveAndContinue.bind(this)
    this.cancelUpdate = this.cancelUpdate.bind(this)
    this.submitMemberDetails = this.submitMemberDetails.bind(this)
  }

  componentDidMount(){
    this.getMember()
    this._mounted = true
  }

  componentWillUnmount() {
    this._mounted = false
  }

  getMember() {
    this.setState({
      loaded: false,
    })

    if (!this.state.id) {
      this.setState({
        loaded: true,
      })
    }

    window.fetch(`/admin/members/${this.state.id}`, {
      method: 'GET',
      credentials: "same-origin",
      headers: {
        'Content-Type': 'application/json'
      },
    })
      .then((response) => {
        if (response.status !== 200) {
          return Promise.reject(response)
        }
        return response.json()
      })
      .then((json) => {
        this.setState({
          loaded: true,
          member: json.member,
          user: json.user,
        })
      })
      .catch((response) => {
        const errors = []

        if (response.status === 500) {
          errors.push("Internal server error")
        }
        if (this._mounted) {
          this.setState({
            loaded: true,
            errors: errors
          })
        }
      })
  }

  saveAndContinue(fieldValues) {
    this.formValues = fieldValues
    this.submitMemberDetails()
      .then((result) => {
        if (result && result.success === true) {
          this.props.history.push(`/admin/secretary/member-view/${this.state.member.id}`)
        }
      })
  }

  submitMemberDetails() {
    const memberData = Object.assign({}, this.formValues)

    memberData.dateOfBirth = moment.utc(memberData.dateOfBirth, "DD/MM/YYYY").format("YYYY-MM-DD")

    return window.fetch(`/admin/members/${this.state.member.id}`, {
      method: 'POST',
      credentials: "same-origin",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        data: {
          member: memberData ,
        }
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

  cancelUpdate(e) {
    this.props.history.push(`/admin/secretary/member-view/${this.state.member.id}`)
    e.preventDefault()
  }

  render() {
    if (!this.state.loaded) {
      return (
        <GridLoading />
      )
    }

    if (this.state.loaded && !this.state.member) {
      return (
        <GridErrors
          title="A member object was not returned."
          errors={!!this.state.errors ? this.state.errors : []}
        />
      )
    }

    return (
      <div id="form" className="form-container">

         <Details formValues={this.state.member}
                  parentErrors={this.state.errors}
                  update={true}
                  nextStep={this.saveAndContinue}
                  previousStep={this.cancelUpdate}
                  membershipType={this.state.member.type} />
      </div>
    )
  }
}