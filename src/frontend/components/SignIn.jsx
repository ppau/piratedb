import React, { Component } from 'react'
import { Button, Card, CardTitle, CardText, CardActions, Spinner } from 'react-mdl'

import validator from 'validator'
import { Link } from 'react-router-dom'
import _ from 'lodash'

import InlineError from './InlineError.jsx';

export default class SignIn extends Component {
  constructor(props) {
    super(props)
    this.state = {
      username: '',
      password: '',
      auth: this.props.auth,
      errors: {}
    }

    /*/ dev
    this.state.username = 'test'
    this.state.password = 'password'
    //*/

    this.handleUsernameChange = this.handleUsernameChange.bind(this)
    this.handlePasswordChange = this.handlePasswordChange.bind(this)
    this.isValid = this.isValid.bind(this)
    this.signIn = this.signIn.bind(this)
    this.inputKeyPress = this.inputKeyPress.bind(this)
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      auth: nextProps.auth
    })
  }

  handleUsernameChange(event) {
    this.setState({username: event.target.value})
  }

  handlePasswordChange(event) {
    this.setState({password: event.target.value})
  }

  isValid() {
    let errors = {}
    if (validator.isEmpty(this.state.username)) {
      errors['username'] = "Email is required"
    }
    if (validator.isEmpty(this.state.password)) {
      errors['password'] = "Password is required"
    }

    this.setState({errors: errors})
    return _.isEmpty(errors)
  }

  signIn() {
    if (!this.isValid()) {
      return
    }

    const payload = {
      username: this.state.username,
      password: this.state.password,
      history: this.props.history
    }
    this.props.executeSignIn(payload)
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

  inputKeyPress(event) {
    if (event.key === 'Enter') {
      this.signIn()
    }
  }

  render() {
    if (!this.props.auth.initialised) {
      return (
        <Card id="sign-in" style={{minHeight: "120px"}} shadow={0}>
          <CardTitle className="text-center">Loading...</CardTitle>
          <CardText className="text-center">
            <Spinner singleColor/>
          </CardText>
        </Card>
      )
    }

    if (this.props.auth.initialised && this.props.auth.authenticated) {
      return (
        <Card id="sign-in" style={{minHeight: "150px"}}>
          <CardTitle>Welcome back!</CardTitle>
          <CardText>
            <p style={{margin: "16px 0"}}>What would you like to do today?</p>
          </CardText>
          <CardActions>
            <Button colored onClick={() => {
              this.props.history.push('/account/details')
            }}>Account details</Button>
            <Button colored onClick={() => {
              window.location = '/sign-out'
            }} className="pull-right">Sign out</Button>
          </CardActions>
        </Card>
      )
    }

    return (
      <Card id="sign-in">
        <CardTitle>Sign in</CardTitle>
        { this.state.auth.authenticating ?
          <CardText className="text-center">
            <Spinner singleColor style={{marginTop: 50, marginBottom: 50}}/>
          </CardText>
          :
          <CardText id="sign-in-form">
            <form action="/sign-in" onSubmit={this.signIn}>
              { this.state.auth.errors ?
                <div className="errors">
                  {this.state.auth.errors.map((error, i) => (
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
              <div className={this.validationErrorClass('password')}>
                <label htmlFor="password" className="">Password</label>
                <input type="password" id="sign-in-password" ref="password"
                       onChange={this.handlePasswordChange}
                       value={this.state.password}
                       onKeyPress={this.inputKeyPress}
                       className=""/>
                <InlineError isError={this.isValidationError('password')}
                             errorMessage={this.state.errors.password}
                             emptySpace={true}/>
              </div>
            </form>
          </CardText>
        }
        <CardActions border style={this.state.auth.authenticating ? {display: "none"} : null }>
          <Button colored onClick={this.signIn}>Sign in</Button>

          <Button colored className="pull-right" onClick={() => {
              this.props.history.push('/forgotten-password')
            }}>
            Forgotten password
          </Button>
        </CardActions>
      </Card>
    )
  }
}