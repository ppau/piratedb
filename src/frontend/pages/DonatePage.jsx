/**
 * Created by thomas on 2017-03-01.
 */
import React, { Component } from 'react'
import Payment from "../components/Payment.jsx"
import GridLoading from '../components/GridLoading.jsx'
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
    this.renderBankDetails = this.renderBankDetails.bind(this)
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

  renderBankDetails(){
    return (
      <div>
        {this.state.paymentData.json.reference ? (
        <Grid>
          <Cell col={12}>
            <div style={{clear: "both"}}>
              <div className="info-box payment">
              <div className="info-body" style={{fontSize: 16}}>
                <p><strong>Your reference number is {this.state.paymentData.json.reference}</strong></p>
                <p>
                  Please quote your number when you make your payment.
                </p>
              </div>
              </div></div>
            </Cell>
          </Grid>
          )
              : null}
        <Grid>
          <Cell col={6}>

            <h1 className="mdl-card__title-text">Direct Deposit</h1>
            <dl>
              <dt>Account Name:</dt>
              <dd>Pirate Party Australia Incorporated</dd>
              <dt>BSB:</dt>
              <dd>012084</dd>
              <dt>Account Number:</dt>
              <dd>213142205</dd>
            </dl>
          </Cell>
          <Cell col={6}>
            <h1 className="mdl-card__title-text">Cheque</h1>
            <address>
              Pirate Party Australia Incorporated<br/>
              PO Box 385<br/>
              Figtree NSW 2525
            </address>
          </Cell>
        </Grid>
      </div>
    )
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
                  ? this.renderBankDetails() : null }

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