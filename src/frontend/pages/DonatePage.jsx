/**
 * Created by thomas on 2017-03-01.
 */
import React, { Component } from 'react'
import Payment from "../components/Payment.jsx"
import GridLoading from '../components/GridLoading.jsx'
import BankDetails from '../components/BankDetails.jsx'
import { NavLink } from 'react-router-dom'
import {Grid, Cell, Button, Card, CardTitle, CardText, CardActions, Spinner } from 'react-mdl'

export default class DonatePage extends Component {
  constructor(props){
    super(props)
    this.state = {
      errors: {},
      finished: false,
      paymentData: null,
    }

    this.onSubmitDataComplete = this.onSubmitDataComplete.bind(this)
    this.componentWillReceiveProps = this.componentWillReceiveProps.bind(this)
    this.reset = this.reset.bind(this)
  }

  reset() {
    this.setState({
      errors: {},
      finished: false,
      paymentData: null,
    })
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.router.location.key !== this.props.router.location.key) {
      this.reset()
    }
  }

  onSubmitDataComplete(data){
    console.log(data)
    this.setState({
      finished: true,
      paymentData: data,
    })
  }

  render() {
    if (!this.props.auth.initialised) {
      return (
        <GridLoading />
      )
    } else if (!this.props.auth.member) {
      return (
        <div>
          <div className="validationErrors">
            <p className="validationErrors-text">
              A member object was not returned.
            </p>
          </div>
        </div>
      )
    }

    if (!this.props.auth.authenticated) {
      return (
        <p>Login required to use the donate page.</p>
      )
    }

    if (!this.props.auth.authenticated) {
      return (
        <p>Login required to use the donate page.</p>
      )
    }

    if (this.state.finished) {
      return (
        <div id="form" className="form-container">
          <fieldset>
            <h1 className="form-title">Finished</h1>

            <div className="form-body">
                <div className="heading">
                    <h2 className="sub-title">Thank you, for your donation!</h2>
                </div>

                { this.state.paymentData && (this.state.paymentData.paymentType === "deposit" || this.state.paymentData.paymentType === "cheque")
                  ? <BankDetails reference={this.state.paymentData.json.reference} /> : null }

                <div className="navigation">
                  <NavLink to="/account/details" className="nav-button">
                    Account details
                  </NavLink>
                </div>
            </div>
          </fieldset>
        </div>
      )
    }

    return (
      <div id="form" className="form-container">
        <Payment
          title="Donation"
          hideNoContribution={true}
          showContributionBanner={false}
          nextStep={this.onSubmitDataComplete}
          errors={this.state.errors}
          member={this.props.auth.member}/>
      </div>
    )
  }
}