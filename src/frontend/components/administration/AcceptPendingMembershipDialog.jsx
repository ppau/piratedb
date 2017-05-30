/**
 * Created by thomas on 2017-01-16.
 */

import React, { Component } from 'react'
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Spinner } from 'react-mdl'
import dialogPolyfill from 'dialog-polyfill'
import InlineError from '../InlineError.jsx';
import { MEMBERSHIP_TYPES, MEMBERSHIP_STATUSES } from '../../../lib/membershipConstants'

export default class AcceptPendingMembershipDialog extends Component {
  constructor(props) {
    super(props)
    this.state = {
      administration: this.props.administration,
      parentOnCloseHandler: this.props.onClose,
      member: this.props.member,
      isOpen: this.props.isOpen,
      isFinished: false,
      errors: {},
    }

    this.handleOpen = this.handleOpen.bind(this)
    this.handleClose = this.handleClose.bind(this)

    this.handleAccept = this.handleAccept.bind(this)
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

  handleAccept() {
    this.state.member.status = MEMBERSHIP_STATUSES.accepted

    const payload = {
      data: {
        member: this.state.member,
      },
      fields: [
        'status',
      ]
    }
    this.props.executeUpdateMember(payload)
  }

  handleOpen() {
    this.setState({
      isOpen: true,
      errors: {}
    });
  }

  handleClose() {
    this.setState({
      isOpen: false
    });

    if (this.state.parentOnCloseHandler){
      this.state.parentOnCloseHandler()
    }
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
              <p>Accept this person's application to join.</p>

              { this.state.administration && this.state.administration.errors ?
                <div className="validationErrors">
                  {this.state.administration.errors.map((error, i) => (
                    <InlineError key={`errors-main-key-${i}`} isError={true}
                                 errorMessage={error}
                                 emptySpace={false}/>
                  ))}
                </div>
                : null }

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
        <DialogTitle>Accept application</DialogTitle>
        <DialogContent className="form-container">

          { content }

        </DialogContent>
        <DialogActions>
          { !this.state.isFinished ?
            <div>
              <Button disabled={this.props.administration.pending} colored type='button' onClick={this.handleAccept}>Accept application</Button>
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