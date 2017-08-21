/**
 * Created by thomas on 13/11/16.
 */
import React, { Component } from 'react'
import { Button, Card, CardTitle, CardText, CardActions, Spinner } from 'react-mdl'
import { NavLink } from 'react-router-dom'
import validator from 'validator'
import _ from 'lodash'

import InlineError from '../components/InlineError.jsx';

export default class ForgottenPassword extends Component {
  constructor(props) {
    super(props)
    this.state = {
      username: '',
      errors: {},
    }

    this.componentWillMount = this.componentWillMount.bind(this)
    this.inputKeyPress = this.inputKeyPress.bind(this)
    this.handleUsernameChange = this.handleUsernameChange.bind(this);
    this.isValidationError = this.isValidationError.bind(this)
    this.validationErrorClass = this.validationErrorClass.bind(this)
    this.isValid = this.isValid.bind(this)
    this.onFormSubmit = this.onFormSubmit.bind(this)
  }

  componentWillMount(nextProps, nextState) {
    if (this.props.forgottenPassword.status !== "initial"){
      this.props.forgottenPasswordInitial({})
    }
  }

  handleUsernameChange(event) {
    this.setState({username: event.target.value});
  }

  inputKeyPress(event) {
    if (event.key === 'Enter') {
      this.onFormSubmit()
    }
  }

  isValidationError(fieldName) {
    return fieldName in this.state.errors
  }

  validationErrorClass(fieldName) {
    if (this.isValidationError(fieldName)) {
      return 'invalid'
    }
    return
  }

  isValid() {
    const errors = {}
    const username = _.trim(this.state.username)

    if (validator.isEmpty(username)) {
      errors['username'] = "Email is required"
    } else {
      if (!validator.isEmail(username)) {
        errors['username'] = "Valid email address is required"
      }
    }
    this.setState({errors: errors})
    return _.isEmpty(errors)
  }

  onFormSubmit(e) {
    if (e){
      e.preventDefault()
    }
    if (!this.isValid()) {
      return
    }

    const payload = {
      username: _.trim(this.state.username),
      history: this.props.history
    }

    this.props.executeForgottenPassword(payload)
  }

  render() {
    if (this.props.forgottenPassword.pending || (!this.props.forgottenPassword.fulfilled && this.props.forgottenPassword.succeeded !== null)) {
      return (
        <Card id="forgotten-password">
          <CardTitle className="text-center">
            Forgotten password
          </CardTitle>
          <CardText className="text-center">
            <div>
              <Spinner style={{margin: "16px 0 50px 0"}}/>
            </div>
          </CardText>
        </Card>
      )
    }

    if (this.props.forgottenPassword.fulfilled && this.props.forgottenPassword.succeeded) {
      return (
        <Card id="forgotten-password">
          <CardTitle className="text-center">
            Forgotten password
          </CardTitle>
          <CardText className="text-center">
            <img src="/images/Tick.svg" style={{width: "50px", marginBottom: "16px"}}/>
            <p>We have sent further instructions to the email address you provided, those instructions should arrive shortly.</p>
          </CardText>
          <CardActions border style={this.state.submitting ? {display: "none"} : null }>
            <NavLink to="/" className="mdl-button mdl-js-button mdl-button--colored">Back</NavLink>
          </CardActions>
        </Card>
      )
    }

    return (
      <Card id="forgotten-password">
        <CardTitle className="text-center">
          Forgotten password
        </CardTitle>
        <CardText className="" id="forgotten-password-form">
          <p>Enter your email address below, and we'll email instructions to reset your password.</p>
          <form action="/forgotten-password" onSubmit={this.onFormSubmit}>
            { this.props.forgottenPassword.errors ?
              <div className="errors">
                {this.props.forgottenPassword.errors.map((error, i) => (
                  <InlineError key={`errors-main-key-${i}`} isError={true}
                               errorMessage={error}
                               emptySpace={false}/>
                ))}
              </div>
              : null }

            <div className={this.validationErrorClass('username')}>
              <label htmlFor="username" className="">Email</label>
              <input type="text" id="sign-in-username" ref="username"
                     onChange={this.handleUsernameChange}
                     value={this.state.username}
                     onKeyPress={this.inputKeyPress}
                     className=""/>
              <InlineError isError={this.isValidationError('username')}
                           errorMessage={this.state.errors.username}
                           emptySpace={true}/>
            </div>
          </form>
        </CardText>
        <CardActions border style={this.props.forgottenPassword.pending ? {display: "none"} : null }>
          <Button colored onClick={() => { this.onFormSubmit(null)} }>Reset password</Button>
          <NavLink to="/" className="mdl-button mdl-js-button mdl-button--colored pull-right">Cancel</NavLink>
        </CardActions>
      </Card>
    )
  }
}