/**
 * Created by thomas on 2017-02-17.
 */

import React, { Component } from 'react'
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Spinner } from 'react-mdl'
import dialogPolyfill from 'dialog-polyfill'
import InlineError from './InlineError.jsx';
import validator from 'validator'
import memberValidator from '../../lib/memberValidator'

export default class ChangePasswordDialog extends Component {
  constructor(props) {
    super(props)
    this.state = {
      memberChangePassword: this.props.memberChangePassword,
      parentOnCloseHandler: this.props.onClose,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
      isOpen: this.props.isOpen,
      isFinished: false,
      errors: {},
    }

    this.handleOpen = this.handleOpen.bind(this)
    this.handleClose = this.handleClose.bind(this)

    this.currentPasswordOnChange = this.currentPasswordOnChange.bind(this)
    this.newPasswordOnChange = this.newPasswordOnChange.bind(this)
    this.confirmPasswordOnChange = this.confirmPasswordOnChange.bind(this)

    this.handleSave = this.handleSave.bind(this)
    this.isValid = this.isValid.bind(this)
    this.isValidationError = this.isValidationError.bind(this)
    this.validationErrorClass = this.validationErrorClass.bind(this)

    this.inputKeyPress = this.inputKeyPress.bind(this);
    this.reset = this.reset.bind(this);
  }

  reset() {
    this.setState({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
      isFinished: false,
      errors: {},
    })
  }

  componentDidMount(){
    dialogPolyfill.registerDialog(this.dialog.dialogRef)
  }

  componentWillReceiveProps(nextProps) {
    const isFinished = !this.props.memberChangePassword.succeeded && nextProps.memberChangePassword.succeeded

    this.setState({
      isOpen: nextProps.isOpen,
      memberChangePassword: nextProps.memberChangePassword,
      isFinished: isFinished
    })
  }

  handleSave() {
    if (!this.isValid()) {
      return
    }

    const payload = {
      data: {
        currentPassword: this.state.currentPassword,
        newPassword: this.state.newPassword,
      },
      fields: [
        'currentPassword',
        'newPassword',
      ]
    }
    this.props.executeChangePassword(payload)
  }

  isValid() {
    let errors = {}
    if (validator.isEmpty(this.state.currentPassword)) {
      errors['currentPassword'] = "Current password is required."
    }
    if (validator.isEmpty(this.state.newPassword)) {
      errors['newPassword'] = "New password is required."
    }
    if (validator.isEmpty(this.state.confirmPassword)) {
      errors['confirmPassword'] = "Confirm password is required."
    }
    if (this.state.confirmPassword !== this.state.newPassword) {
      errors['confirmPassword'] = "Your confirm password does not match your new password."
    }


    if (!memberValidator.isValidPassword(this.state.newPassword)) {
      errors['newPassword'] = "Please enter a valid password, 8 or more characters."
    }

    this.setState({errors: errors})
    return Object.keys(errors).length <= 0
  }

  inputKeyPress(event) {
    if (event.key === 'Enter') {
      this.handleSave()
    }
  }

  handleOpen() {
    this.setState({
      isOpen: true,
      isFinished: false,
    });
  }

  handleClose() {
    this.setState({
      isOpen: false,
    });

    if (this.state.parentOnCloseHandler){
      this.state.parentOnCloseHandler()
    }

    this.reset()
  }

  validationErrorClass(fieldName) {
    if (this.isValidationError(fieldName)) {
      return 'invalid';
    }
    return
  }

  isValidationError(fieldName) {
    return fieldName in this.state.errors
  }

  currentPasswordOnChange(e) {
    this.setState({
      currentPassword: e.target.value
    })
  }

  newPasswordOnChange(e) {
    this.setState({
      newPassword: e.target.value
    })
  }

  confirmPasswordOnChange(e) {
    this.setState({
      confirmPassword: e.target.value
    })
  }

  render() {

    let spinnerContent = ()=>{
      return (
        <div style={{minHeight: 150, padding: 0, textAlign: "center"}}>
          <Spinner style={{margin: "50px 0 50px 0"}}/>
        </div>
      )
    }

    let finishedContent = ()=>{
      return (
        <div style={{padding: "25px 0", textAlign: "center"}}>
            <img src="/images/Tick.svg" style={{width: "50px"}}/>
            <p>New password saved.</p>
        </div>
      )
    }

    let content = ()=>{
      return (
            <div ref={(elem) => { this.dialogContent = elem }}>
              <p>Use this form to change your password.</p>

              { this.state.memberChangePassword && this.state.memberChangePassword.errors ?
                <div className="validationErrors">
                  {this.state.memberChangePassword.errors.map((error, i) => (
                    <InlineError key={`errors-main-key-${i}`} isError={true}
                                 errorMessage={error}
                                 emptySpace={false}/>
                  ))}
                </div>
                : null }

              <div className={this.validationErrorClass('currentPassword')}>
                <label htmlFor="current-password" className="">Current password</label>
                <input id="current-password" ref="currentPassword"
                        type="password"
                        onKeyPress={this.inputKeyPress}
                        value={this.state.currentPassword}
                        onChange={this.currentPasswordOnChange.bind(this)}
                        className="field" />

                <InlineError isError={this.isValidationError('currentPassword')}
                             errorMessage={this.state.errors.currentPassword}
                             emptySpace={true}/>
              </div>

              <div className={this.validationErrorClass('newPassword')}>
                <label htmlFor="new-password" className="">New password</label>
                <input id="new-password" ref="newPassword"
                        type="password"
                        onKeyPress={this.inputKeyPress}
                        value={this.state.newPassword}
                        onChange={this.newPasswordOnChange.bind(this)}
                        className="field" />

                <InlineError isError={this.isValidationError('newPassword')}
                             errorMessage={this.state.errors.newPassword}
                             emptySpace={true}/>
              </div>

              <div className={this.validationErrorClass('confirmPassword')}>
                <label htmlFor="confirm-password" className="">Confirm password</label>
                <input id="confirm-password" ref="confirmPassword"
                        type="password"
                        onKeyPress={this.inputKeyPress}
                        value={this.state.confirmPassword}
                        onChange={this.confirmPasswordOnChange.bind(this)}
                        className="field" />

                <InlineError isError={this.isValidationError('confirmPassword')}
                             errorMessage={this.state.errors.confirmPassword}
                             emptySpace={true}/>
              </div>
            </div>
      )
    }

    if (this.props.memberChangePassword.pending){
      content = spinnerContent()
    } else if (this.state.isFinished) {
      content = finishedContent()
    } else {
      content = content()
    }

    return (
      <Dialog open={this.state.isOpen} ref={(elem) => { this.dialog = elem }}>
        <DialogTitle>Change your password</DialogTitle>
        <DialogContent className="form-container">

          { content }

        </DialogContent>
        <DialogActions>
          { !this.state.isFinished ?
            <div>
              <Button disabled={this.props.memberChangePassword.pending} colored type='button' onClick={this.handleSave}>Save</Button>
              <Button disabled={this.props.memberChangePassword.pending} colored type='button' onClick={this.handleClose}>
                Cancel
              </Button>
            </div>
            :
            <Button type='button' onClick={this.handleClose}>Ok</Button>
          }
        </DialogActions>
      </Dialog>
    )
  }
}