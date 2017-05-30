/**
 * Created by thomas on 2017-07-05.
 */

import React, { Component } from 'react'
import { Button, Checkbox, Dialog, DialogTitle, DialogContent, DialogActions, DataTable, Icon, TableHeader, Spinner } from 'react-mdl'
import dialogPolyfill from 'dialog-polyfill'
import InlineError from '../InlineError.jsx'

export default class CreateUserDialog extends Component {
  constructor(props) {
    super(props)
    this.state = {
      parentOnCloseHandler: this.props.onClose,
      member: this.props.member,
      user: this.props.user,
      membersWithSameEmail: [],
      isOpen: this.props.isOpen,
      isFinished: false,
      notifyMember: true,
      errors: [],
    }

    this.handleOpen = this.handleOpen.bind(this)
    this.handleClose = this.handleClose.bind(this)

    this.handleCreateUser = this.handleCreateUser.bind(this)

    this.handleNotifyMemberCheckboxChange = this.handleNotifyMemberCheckboxChange.bind(this)
  }

  componentDidMount() {
    dialogPolyfill.registerDialog(this.dialog.dialogRef)
  }

  componentWillReceiveProps(nextProps) {
    const isFinished = !this.props.administrationCreateUserForMember.succeeded && nextProps.administrationCreateUserForMember.succeeded

    this.setState({
      isOpen: nextProps.isOpen,
      errors: nextProps.administrationCreateUserForMember.errors,
      isFinished: isFinished,
    })
  }

  handleCreateUser() {
    const payload = {
      data: {
        create: true,
        memberId: this.state.member.id,
        notifyMember: this.state.notifyMember,
      },
    }

    this.props.executeCreateUserForMember(payload)
  }

  handleOpen() {
    this.setState({
      isOpen: true,
      errors: {}
    })
  }

  handleClose() {
    this.setState({
      isOpen: false
    })

    if (this.state.parentOnCloseHandler){
      this.state.parentOnCloseHandler()
    }
  }

  handleNotifyMemberCheckboxChange(e) {
    this.setState({
      notifyMember: e.target.checked
    })
  }

  render() {
    const spinnerContent = () => {
      return (
        <div style={{minHeight: 150, padding: 0, textAlign: "center"}}>
          <Spinner style={{margin: "50px 0 50px 0"}}/>
        </div>
      )
    }

    const finishedContent = () => {
      return (
        <div style={{padding: "25px 0", textAlign: "center"}}>
            <img src="/images/Tick.svg" style={{width: "50px"}}/>
            <p>User created</p>
        </div>
      )
    }

    let content = () => {
      return (
            <div ref={(elem) => { this.dialogContent = elem }}>

              { this.state.errors && this.state.errors.length ?
                <div className="validationErrors">
                  {this.state.errors.map((error, i) => (
                    <InlineError key={`errors-main-key-${i}`} isError={true}
                                 errorMessage={error}
                                 emptySpace={false}/>
                  ))}
                </div>
                : null }

              <p>Please review other member records for this email first:</p>

              <DataTable
                shadow={0}
                rows={this.state.membersWithSameEmail.map((member) => {
                  return {
                    id: member.id,
                    email: member.email,
                    memberSince: member.memberSince,
                    givenNames: member.givenNames,
                    surname: member.surname,
                    type: member.type,
                    status: member.status,
                  }
                })}
              >
                <TableHeader name="email">Email</TableHeader>
                <TableHeader name="memberSince">Member since</TableHeader>
                <TableHeader name="givenNames">Name</TableHeader>
                <TableHeader name="surname">Surname</TableHeader>
                <TableHeader name="type">Type</TableHeader>
                <TableHeader name="status">Status</TableHeader>
              </DataTable>

              <Checkbox label="Notify member by email" checked={this.state.notifyMember} onChange={this.handleNotifyMemberCheckboxChange} />

            </div>
      )
    }

    if (this.props.administrationCreateUserForMember.pending){
      content = spinnerContent()
    } else if (this.state.isFinished) {
      content = finishedContent()
    } else {
      content = content()
    }

    return (
      <Dialog open={this.state.isOpen} ref={(elem) => { this.dialog = elem }}>
        <DialogTitle>Create user for member?</DialogTitle>
        <DialogContent className="form-container">

          { content }

        </DialogContent>
        <DialogActions>
          { !this.state.isFinished ?
            <div>
              <Button disabled={this.props.administrationCreateUserForMember.pending} colored type='button' onClick={this.handleCreateUser}>Create user</Button>
              <Button disabled={this.props.administrationCreateUserForMember.pending} colored type='button' onClick={this.handleClose}>
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
