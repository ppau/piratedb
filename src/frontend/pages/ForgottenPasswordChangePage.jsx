/**
 * Created by thomas on 13/11/16.
 */
import React, { Component } from 'react'
import {Grid, Cell, Button, Card, CardTitle, CardText, CardActions, Spinner } from 'react-mdl'

import { NavLink } from 'react-router-dom'
import validator from 'validator'
import _ from 'lodash'

import LandingPage from '../pages/LandingPage.jsx'
import InlineError from '../components/InlineError.jsx';

export default class ForgottenPasswordChangePage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      errors: {},
      username: props.match.params.username,
      resetPasswordKey: props.match.params.resetPasswordKey,
      newPassword: '',
      confirmPassword: '',
      cardFormTitle: props.cardFormTitle || "Reset your password",
      cardCompleteTitle: props.cardCompleteTitle || "Forgotten password",
    }

    this.componentWillMount = this.componentWillMount.bind(this)
    this.handleNewPasswordChange = this.handleNewPasswordChange.bind(this)
    this.handleConfirmPasswordChange = this.handleConfirmPasswordChange.bind(this)
    this.inputKeyPress = this.inputKeyPress.bind(this)
    this.isValid = this.isValid.bind(this)
    this.isValidationError = this.isValidationError.bind(this)
    this.validationErrorClass = this.validationErrorClass.bind(this)
  }

  componentWillMount(nextProps, nextState) {
    if (this.props.forgottenPasswordChange.status !== "initial"){
      this.props.forgottenPasswordChangeInitial({})
    }
  }

  handleNewPasswordChange(event) {
    this.setState({newPassword: event.target.value});
  }

  handleConfirmPasswordChange(event) {
    this.setState({confirmPassword: event.target.value});
  }

  isValid() {
    let errors = {}
    if (validator.isEmpty(this.state.newPassword)) {
      errors['newPassword'] = "Password is required"
    }

    if (validator.isEmpty(this.state.confirmPassword)) {
      errors['confirmPassword'] = "Confirm password is required"
    } else {
      if (this.state.confirmPassword !== this.state.newPassword) {
        errors['confirmPassword'] = "Confirm doesn't match"
      }
    }

    this.setState({errors: errors})
    return _.isEmpty(errors)
  }

  isValidationError(fieldName) {
    return fieldName in this.state.errors
  }

  inputKeyPress(event) {
    if (event.key === 'Enter') {
      this.onFormSubmit()
    }
  }

  onFormSubmit(e) {
    if (e){
      e.preventDefault()
    }
    if (!this.isValid()) {
      return
    }

    const payload = {
      username: this.state.username,
      resetPasswordKey: this.state.resetPasswordKey,
      newPassword: this.state.newPassword,
      history: this.props.history
    }
    this.props.executeForgottenPasswordChange(payload)
  }

  validationErrorClass(fieldName) {
    if (this.isValidationError(fieldName)) {
      return 'invalid';
    }
    return
  }

  render() {
    let content

    // Submitting
    if (this.props.forgottenPasswordChange.pending || (!this.props.forgottenPasswordChange.fulfilled && this.props.forgottenPasswordChange.succeeded !== null)) {
      content = (
        <Card id="forgotten-password">
          <CardTitle className="text-center">
            { this.state.cardFormTitle }
          </CardTitle>
          <CardText className="text-center">
            <div>
              <Spinner style={{margin: "16px 0 50px 0"}}/>
            </div>
          </CardText>
        </Card>
      )
    }

    // Finished
    if (this.props.forgottenPasswordChange.fulfilled && this.props.forgottenPasswordChange.succeeded) {
      content = (
        <Card id="forgotten-password">
          <CardTitle className="text-center">
            { this.state.cardCompleteTitle }
          </CardTitle>
          <CardText className="text-center">
            <img src="/images/Tick.svg" style={{width: "50px", marginBottom: "16px"}}/>
            <p>Your password has been changed, you may now sign in.</p>
          </CardText>
          <CardActions border>
            <NavLink to="/" className="mdl-button mdl-js-button mdl-button--colored">Sign in</NavLink>
          </CardActions>
        </Card>
      )
    }

    // Form
    if (!this.props.forgottenPasswordChange.succeeded) {
      content = (
        <Card id="forgotten-password">
          <CardTitle className="text-center">
            { this.state.cardFormTitle }
          </CardTitle>
          <CardText className="" id="forgotten-password-form">
            <p>Enter your new password and confirm it below.</p>
            <form action={`/forgotten-password-change/${this.state.resetPasswordKey}/${this.state.username}`} onSubmit={this.onFormSubmit}>
              { this.props.forgottenPasswordChange.errors ?
                <div className="errors">
                  {this.props.forgottenPasswordChange.errors.map((error, i) => (
                    <InlineError key={`errors-main-key-${i}`} isError={true}
                                 errorMessage={error}
                                 emptySpace={false}/>
                  ))}
                </div>
                : null }

              <div className={this.validationErrorClass('newPassword')}>
                <label htmlFor="newPassword" className="">Password</label>
                <input type="password" id="new-password" ref="newPassword"
                       onChange={this.handleNewPasswordChange}
                       value={this.state.newPassword}
                       onKeyPress={this.inputKeyPress}
                       className=""/>
                <InlineError isError={this.isValidationError('newPassword')}
                             errorMessage={this.state.errors.newPassword}
                             emptySpace={true}/>
              </div>

              <div className={this.validationErrorClass('confirmPassword')}>
                <label htmlFor="confirmPassword" className="">Confirm password</label>
                <input type="password" id="confirm-password" ref="confirmPassword"
                       onChange={this.handleConfirmPasswordChange}
                       value={this.state.confirmPassword}
                       onKeyPress={this.inputKeyPress}
                       className=""/>
                <InlineError isError={this.isValidationError('confirmPassword')}
                             errorMessage={this.state.errors.confirmPassword}
                             emptySpace={true}/>
              </div>
            </form>
          </CardText>
          <CardActions border style={this.props.forgottenPasswordChange.pending ? {display: "none"} : null }>
            <Button colored onClick={() => { this.onFormSubmit(null)} }>Change password</Button>
            <NavLink to="/" className="mdl-button mdl-js-button mdl-button--colored pull-right">Cancel</NavLink>
          </CardActions>
        </Card>
      )
    }

    return (
      <LandingPage>
        <div id="landing">
          <Grid className="mdlwp-1200">
            <Cell col={4}>
            </Cell>
            <Cell col={4}>
              { content }
            </Cell>
            <Cell col={4}>
            </Cell>
          </Grid>
        </div>
      </LandingPage>
    )
  }
}