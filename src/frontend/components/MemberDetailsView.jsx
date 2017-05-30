/**
 * Created by thomas on 13/11/16.
 */
import React, { Component } from 'react'
import moment from 'moment'

import { Grid, Cell, Card, CardTitle, CardText, CardActions, Tooltip, Button, FABButton, Icon } from 'react-mdl'
import { SelectField, Option } from 'react-mdl-extra'

import ModifyMembershipDialogContainer from '../containers/ModifyMembershipDialogContainer.jsx'

// Member dialogs
import ChangePasswordDialogContainer from '../containers/ChangePasswordDialogContainer.jsx'

// Admin dialogs
import AcceptPendingMembershipDialogContainer from '../containers/AcceptPendingMembershipDialogContainer.jsx'
import CreateUserDialogContainer from '../containers/CreateUserDialogContainer.jsx'
import ToggleUserEnabledDialogContainer from '../containers/ToggleUserEnabledDialogContainer.jsx'
import ViewDataDialogContainer from '../containers/ViewDataDialogContainer.jsx'

import MemberRenewContainer from "../containers/MemberRenewContainer.jsx"

export default class MemberDetailsView extends Component {
  constructor(props) {
    super(props)
    this.state = {
      parent: props.parent,
      member: props.member,
      user: props.user,
      isAdmin: props.isAdmin,
      modifyMembershipDialogIsOpen: false,
      acceptPendingMembershipDialogIsOpen: false,
      changePasswordDialogIsOpen: false,
      createUserDialogIsOpen: false,
      toggleUserEnabledDialogIsOpen: false,
      viewDataDialogIsOpen: false,
      showUserButtons: props.showUserButtons,
    }

    this.getMembershipActions = this.getMembershipActions.bind(this)
    this.getMembershipAdminActions = this.getMembershipAdminActions.bind(this)
    this.getMembershipMemberActions = this.getMembershipMemberActions.bind(this)
    this.getAccountDetailsAdmin = this.getAccountDetailsAdmin.bind(this)

    // Change password application dialog
    this.handleOpenChangePasswordDialog = this.handleOpenChangePasswordDialog.bind(this)
    this.handleCloseChangePasswordDialog = this.handleCloseChangePasswordDialog.bind(this)

    // Modify admin membership dialog
    this.handleOpenModifyMembershipDialog = this.handleOpenModifyMembershipDialog.bind(this)
    this.handleCloseModifyMembershipDialog = this.handleCloseModifyMembershipDialog.bind(this)

    // Accept admin application dialog
    this.handleOpenAcceptPendingMembershipDialog = this.handleOpenAcceptPendingMembershipDialog.bind(this)
    this.handleCloseAcceptPendingMembershipDialog = this.handleCloseAcceptPendingMembershipDialog.bind(this)

    // Create admin user dialog
    this.handleOpenCreateUserDialog = this.handleOpenCreateUserDialog.bind(this)
    this.handleCloseCreateUserDialog = this.handleCloseCreateUserDialog.bind(this)

    // Toggle admin user enabled state dialog
    this.handleOpenToggleUserEnabledDialog = this.handleOpenToggleUserEnabledDialog.bind(this)
    this.handleCloseToggleUserEnabledDialog = this.handleCloseToggleUserEnabledDialog.bind(this)

    // Toggle admin view data json
    this.handleOpenViewDataDialog = this.handleOpenViewDataDialog.bind(this)
    this.handleCloseViewDataDialog = this.handleCloseViewDataDialog.bind(this)

    this.render = this.render.bind(this)
  }

  handleOpenModifyMembershipDialog(e) {
    this.setState({
      modifyMembershipDialogIsOpen: true
    })
  }

  handleCloseModifyMembershipDialog(e) {
    this.setState({
      modifyMembershipDialogIsOpen: false
    })
  }

  handleOpenAcceptPendingMembershipDialog(e) {
    this.setState({
      acceptPendingMembershipDialogIsOpen: true
    })
  }

  handleCloseAcceptPendingMembershipDialog(e) {
    this.setState({
      acceptPendingMembershipDialogIsOpen: false
    })
  }

  handleOpenViewDataDialog(e) {
    this.setState({
      viewDataDialogIsOpen: true
    })
  }

  handleCloseViewDataDialog(e) {
    this.setState({
      viewDataDialogIsOpen: false
    })
  }

  handleOpenChangePasswordDialog(e) {
    this.setState({
      changePasswordDialogIsOpen: true
    })
  }

  handleCloseChangePasswordDialog(e) {
    this.setState({
      changePasswordDialogIsOpen: false
    })
  }

  handleOpenCreateUserDialog(e) {
    this.setState({
      createUserDialogIsOpen: true
    })
  }

  handleCloseCreateUserDialog(e) {
    this.setState({
      createUserDialogIsOpen: false
    })

    if (this.state.parent && this.state.isAdmin) {
      this.state.parent.getMember()
    }
  }

  handleOpenToggleUserEnabledDialog(e) {
    this.setState({
      toggleUserEnabledDialogIsOpen: true
    })
  }

  handleCloseToggleUserEnabledDialog(e) {
    this.setState({
      toggleUserEnabledDialogIsOpen: false
    })

    if (this.state.parent && this.state.isAdmin) {
      this.state.parent.getMember()
    }
  }

  getMembershipActions() {
    return !!this.state.isAdmin ? this.getMembershipAdminActions() : this.getMembershipMemberActions()
  }

  getMembershipAdminActions() {
    return (
      <CardActions border>
        <Button colored onClick={this.handleOpenModifyMembershipDialog}>Modify membership</Button>
        { this.state.member.status === "pending" ?

        <Tooltip label="Accept pending membership" position="bottom">
            <Button colored onClick={this.handleOpenAcceptPendingMembershipDialog}>Accept</Button>
        </Tooltip>
          : null}

        <Button colored onClick={this.handleOpenViewDataDialog}>View data</Button>
      </CardActions>
    )
  }

  getMembershipMemberActions() {
    return null
  }

  /**
   * get user actions
   * @returns {*}
   */
  getUserActions() {
    return !!this.state.isAdmin ? this.getUserAdminActions() : this.getUserMemberActions()
  }

  getUserAdminActions() {
    const buttons = []

    if (!this.state.user) {
      buttons.push(
        <Button key="create-user" colored onClick={this.handleOpenCreateUserDialog}>Create user</Button>
      )
    } else {
      buttons.push(
        <Button key="toggle-user-enabled" colored onClick={this.handleOpenToggleUserEnabledDialog}>{ this.state.user.enabled ? "Disable user" : "Enable user" }</Button>
      )
    }

    return (
      <CardActions border>
        { buttons }
      </CardActions>
    )
  }

  getUserMemberActions() {
    if (this.state.showUserButtons) {
      return (
        <CardActions border>
          <Button colored onClick={this.handleOpenChangePasswordDialog}>Change password</Button>
        </CardActions>
      )
    }
  }

  getAccountDetailsAdmin() {
    if (this.state.isAdmin) {
      return [
        <dt key="account-details-enable-title">Enabled</dt>,
        <dd key="account-details-enable-value">{this.state.user.enabled ? "Yes" : "No"}</dd>,
        <dt key="account-details-last-login-title">Last login</dt>,
        <dd key="account-details-last-login-value">
          { this.state.user.lastAuthenticated ?
            <div>
              <span>{ moment.utc(this.state.user.lastAuthenticated).format("DD/MM/YYYY h:mm:ss a") }</span><br />
              <small> ({ moment(this.state.user.lastAuthenticated).fromNow() })</small>
            </div>
            : <span>Never signed in.</span> }
        </dd>,
      ]
    }
  }

  render() {
    if (!this.state.member) {
      return (
        <Grid className="mdlwp-1200">
          <Cell col={12}>
            <div className="validationErrors">
              <p className="validationErrors-text">
                A member object was not returned.
              </p>
            </div>
          </Cell>
        </Grid>
      )
    }

    const cardStyle = {fontSize: "20px", color: '#fff', backgroundColor: '#89c3e5'}

    return (
      <div>
        <Grid className="mdlwp-1200">

          <Cell col={2}>
            <div className="nc text-centre" style={{paddingRight: 16}} >
              <img className="mdl-shadow--2dp" src="/images/profiles/anon.png" />
            </div>
          </Cell>
          <Cell col={6}>
            <div className="nc">
              <div>
                <h5>
                  {this.state.member.givenNames} {this.state.member.surname}

                  <Tooltip label={<span>Edit your details</span>}>
                    <FABButton onClick={() => { this.props.history.push('/account/update') }} mini colored style={{ marginLeft: "16px"}} className="mdl-button-primary--fab">
                      <Icon name="edit" />
                    </FABButton>
                  </Tooltip>

                </h5>
                <p>{this.state.member.email}</p>

                {/* Member extra */}
                { !this.state.isAdmin && this.state.member.memberSince ?
                <p>Member since: {moment(this.state.member.memberSince).format("DD/MM/YYYY")}, {moment(this.state.member.memberSince).fromNow()}</p>
                  : null }

              </div>
            </div>
          </Cell>
          <Cell col={4} className="account-renew-membership">
            <MemberRenewContainer member={this.state.member} history={ this.props.history } />
          </Cell>
        </Grid>


        <Grid className="mdlwp-1200">
          <Cell col={4}>
            <Card shadow={0} id="personal-information" className="mdl-card-account-details">
              <CardTitle style={cardStyle}>Personal information</CardTitle>
              <CardText>
                <dl>
                  <dt>Given name(s)</dt>
                  <dd>{this.state.member.givenNames}</dd>
                  <dt>Surname</dt>
                  <dd>{this.state.member.surname}</dd>
                  <dt>Date of birth</dt>
                  <dd>{ moment(this.state.member.dateOfBirth).format("DD/MM/YYYY") }</dd>
                  <dt>Gender</dt>
                  <dd>{this.state.member.gender ? this.state.member.gender : (<i>empty</i>)}</dd>
                </dl>
              </CardText>
            </Card>

            <Card shadow={0} id="contact-details" className="mdl-card-account-details">
              <CardTitle style={cardStyle}>Contact details</CardTitle>
              <CardText>
                <dl>
                  <dt>Email</dt>
                  <dd>{this.state.member.email}</dd>
                  <dt>Phone number</dt>
                  <dd>{this.state.member.primaryPhoneNumber}</dd>
                  <dt>Secondary phone number</dt>
                  <dd>{this.state.member.secondaryPhoneNumber ? this.state.member.secondaryPhoneNumber : (
                    <i>empty</i>)}</dd>
                </dl>
              </CardText>
            </Card>
          </Cell>
          <Cell col={4}>
            <Card shadow={0} id="residential-address" className="mdl-card-account-details">
              <CardTitle style={cardStyle}>Residential address</CardTitle>
              <CardText>
                <dl>
                  <dt>Address</dt>
                  <dd>{this.state.member.residentialAddress.address}</dd>
                  <dt>Suburb/City</dt>
                  <dd>{this.state.member.residentialAddress.suburb}</dd>
                  <dt>State or territory</dt>
                  <dd>{this.state.member.residentialAddress.state}</dd>
                  <dt>Country</dt>
                  <dd>{this.state.member.residentialAddress.country}</dd>
                  <dt>Postcode/ZIP code</dt>
                  <dd>{this.state.member.residentialAddress.postcode}</dd>
                </dl>
              </CardText>
            </Card>

            <Card shadow={0} id="postal-address" className="mdl-card-account-details">
              <CardTitle style={cardStyle}>Postal address</CardTitle>
              <CardText>
                { this.state.member.isPostalAddressDifferent ? (
                  <dl>
                    <dt>Address</dt>
                    <dd>{this.state.member.postalAddress.address}</dd>
                    <dt>Suburb/City</dt>
                    <dd>{this.state.member.postalAddress.suburb}</dd>
                    <dt>State or territory</dt>
                    <dd>{this.state.member.postalAddress.state}</dd>
                    <dt>Country</dt>
                    <dd>{this.state.member.postalAddress.country}</dd>
                    <dt>Postcode/ZIP code</dt>
                    <dd>{this.state.member.postalAddress.postcode}</dd>
                  </dl>
                  )
                  : (
                    <p style={{ marginTop: "16px"}}>Same as residential address.</p>
                  )}
              </CardText>
            </Card>
          </Cell>
          <Cell col={4}>
            <Card shadow={0} id="membership-information" className="mdl-card-account-details">
              <CardTitle style={cardStyle}>Membership</CardTitle>
              <CardText>
                <dl>
                  <dt>Membership type</dt>
                  <dd>{this.state.member.type.toTitleCase()}</dd>
                  <dt>Membership status</dt>
                  <dd>
                    <span>{ this.state.member.statusHuman.toTitleCase() }</span>
                  </dd>
                  <dt style={ this.state.member.status !== "accepted" ? {display: "none"}: {}}>Membership expires</dt>
                  <dd style={ this.state.member.status !== "accepted" ? {display: "none"}: {}}>
                    <span>{ moment(this.state.member.expiresOn).format("DD/MM/YYYY") }</span>
                    <small> ({ moment(this.state.member.expiresOn).fromNow() })</small>
                  </dd>
                </dl>
              </CardText>
              {this.getMembershipActions()}
            </Card>

            <Card shadow={0} id="account" className="mdl-card-account-details">
              <CardTitle style={cardStyle}>Account</CardTitle>
              <CardText>
                { this.state.user ?
                <dl>
                  <dt>Username</dt>
                  <dd>{this.state.user.username}</dd>
                  <dt>Password</dt>
                  <dd><i>(obviously hidden)</i></dd>

                  { this.props.isAdmin ? this.getAccountDetailsAdmin() : null }

                </dl> : <p style={{marginTop: 16}}><i>User account not found</i></p> }

              </CardText>
              {this.getUserActions()}
            </Card>
          </Cell>

          <ModifyMembershipDialogContainer
            member={this.state.member}
            isOpen={this.state.modifyMembershipDialogIsOpen}
            onClose={this.handleCloseModifyMembershipDialog}
            ref={(elem) => { this.modifyMembershipDialog = elem }} />

          <AcceptPendingMembershipDialogContainer
            member={this.state.member}
            isOpen={this.state.acceptPendingMembershipDialogIsOpen}
            onClose={this.handleCloseAcceptPendingMembershipDialog}
            ref={(elem) => { this.acceptPendingMembershipDialog = elem }} />

          <ChangePasswordDialogContainer
            isOpen={this.state.changePasswordDialogIsOpen}
            onClose={this.handleCloseChangePasswordDialog}
            ref={(elem) => { this.changePasswordDialog = elem }} />

          <CreateUserDialogContainer
            member={this.state.member}
            user={this.state.user}
            isOpen={this.state.createUserDialogIsOpen}
            onClose={this.handleCloseCreateUserDialog}
            ref={(elem) => { this.createUserPasswordDialog = elem }} />

          { this.state.user ?
            <ToggleUserEnabledDialogContainer
              user={this.state.user}
              isOpen={this.state.toggleUserEnabledDialogIsOpen}
              onClose={this.handleCloseToggleUserEnabledDialog}
              ref={(elem) => { this.toggleUserEnabledDialog = elem }} />
            : null }

          <ViewDataDialogContainer
            member={this.state.member}
            isOpen={this.state.viewDataDialogIsOpen}
            onClose={this.handleCloseViewDataDialog}
            ref={(elem) => { this.viewDataPasswordDialog = elem }} />

        </Grid>
      </div>
    )
  }
}
