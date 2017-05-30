/**
 * Created by thomas on 2017-01-16.
 */

import React, { Component } from 'react'
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Spinner } from 'react-mdl'
import dialogPolyfill from 'dialog-polyfill'
import InlineError from '../InlineError.jsx';
import { MEMBERSHIP_TYPES, MEMBERSHIP_STATUSES } from '../../../lib/membershipConstants'
import validator from 'validator'

export default class ModifyMembershipDialog extends Component {
  constructor(props) {
    super(props)
    this.state = {
      administration: this.props.administration,
      parentOnCloseHandler: this.props.onClose,
      member: this.props.member,
      membershipType: this.props.member.type,
      membershipStatus: this.props.member.status,
      isOpen: this.props.isOpen,
      isFinished: false,
      errors: {},
    }

    this.handleOpen = this.handleOpen.bind(this)
    this.handleClose = this.handleClose.bind(this)

    this.membershipTypeOnChange = this.membershipTypeOnChange.bind(this)
    this.membershipStatusOnChange = this.membershipStatusOnChange.bind(this)

    this.handleSave = this.handleSave.bind(this)
    this.isValid = this.isValid.bind(this)
    this.isValidationError = this.isValidationError.bind(this)
    this.validationErrorClass = this.validationErrorClass.bind(this)
    this.reset = this.reset.bind(this);
  }

  reset() {
    this.setState({
      membershipType: this.props.member.type,
      membershipStatus: this.props.member.status,
      isFinished: false,
      errors: {},
    })
  }

  componentDidMount(){
    dialogPolyfill.registerDialog(this.dialog.dialogRef)
  }

  componentWillReceiveProps(nextProps) {
    const isFinished = !this.props.administration.succeeded && nextProps.administration.succeeded

    this.setState({
      isOpen: nextProps.isOpen,
      administration: nextProps.administration,
      isFinished: isFinished,
    })
  }

  handleSave() {
    if (!this.isValid()) {
      return
    }

    this.state.member.type = this.state.membershipType
    this.state.member.status = this.state.membershipStatus

    const payload = {
      data: {
        member: this.state.member,
      },
      fields: [
        'type',
        'status',
      ]
    }
    this.props.executeUpdateMember(payload)
  }

  isValid() {

    let errors = {}
    if (validator.isEmpty(this.state.membershipType)) {
      errors['membershipType'] = "Membership type is required"
    }
    if (validator.isEmpty(this.state.membershipStatus)) {
      errors['membershipStatus'] = "Membership status is required"
    }

    if (!Object.keys(MEMBERSHIP_TYPES).includes(this.state.membershipType)) {
      errors['membershipType'] = "Membership type is not valid"
    }
    if (!Object.keys(MEMBERSHIP_STATUSES).includes(this.state.membershipStatus)) {
      errors['membershipStatus'] = "Membership status is not valid"
    }

    this.setState({errors: errors})
    return Object.keys(errors).length <= 0
  }

  handleOpen() {
    this.setState({
      isOpen: true
    });
  }

  handleClose() {
    this.setState({
      isOpen: false
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

  membershipTypeOnChange(e) {
    this.setState({
      membershipType: e.target.value
    })
  }

  membershipStatusOnChange(e) {
    this.setState({
      membershipStatus: e.target.value
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
            <p>Changes saved.</p>
        </div>
      )
    }

    let content = ()=>{
      return (
            <div ref={(elem) => { this.dialogContent = elem }}>
              <p>Modify this member's membership type and/or status.</p>

              { this.state.administration && this.state.administration.errors ?
                <div className="validationErrors">
                  {this.state.administration.errors.map((error, i) => (
                    <InlineError key={`errors-main-key-${i}`} isError={true}
                                 errorMessage={error}
                                 emptySpace={false}/>
                  ))}
                </div>
                : null }

              <div className={this.validationErrorClass('membershipType')}>
                <label htmlFor="membership-type" className="">Membership type</label>
                <select id="membership-type" ref="membershipType"
                        value={this.state.membershipType}
                        onChange={this.membershipTypeOnChange.bind(this)}
                        className="">

                  {Object.keys(MEMBERSHIP_TYPES).map((value, i) => {
                    return (
                      <option value={value} key={`membership-type-${i}`}>{ value }</option>
                    )
                  })}

                </select>
                <InlineError isError={this.isValidationError('membershipType')}
                             errorMessage={this.state.errors.membershipType}
                             emptySpace={true}/>
              </div>

              <div className={this.validationErrorClass('membershipStatus')}>
                <label htmlFor="membership-status" className="">Membership status</label>
                <select id="membership-status" ref="membershipStatus"
                        value={this.state.membershipStatus}
                        onChange={this.membershipStatusOnChange.bind(this)}
                        className="">

                  {Object.keys(MEMBERSHIP_STATUSES).map((value, i) => {
                    return (
                      <option value={value} key={`membership-status-${i}`}>{ value }</option>
                    )
                  })}

                </select>
                <InlineError isError={this.isValidationError('membershipStatus')}
                             errorMessage={this.state.errors.membershipStatus}
                             emptySpace={true}/>
              </div>
            </div>
      )
    }

    if (this.props.administration.pending){
      content = spinnerContent()
    } else if (this.state.isFinished) {
      content = finishedContent()
    } else {
      content = content()
    }


    return (
      <Dialog open={this.state.isOpen} ref={(elem) => { this.dialog = elem }}>
        <DialogTitle>Modify membership</DialogTitle>
        <DialogContent className="form-container">

          { content }

        </DialogContent>
        <DialogActions>
          { !this.state.isFinished ?
            <div>
              <Button disabled={this.props.administration.pending} colored type='button' onClick={this.handleSave}>Save</Button>
              <Button disabled={this.props.administration.pending} colored type='button' onClick={this.handleClose}>
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