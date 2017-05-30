/**
 * Created by thomas on 2017-05-30.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types'
import moment from 'moment'

import { FABButton, Icon, Tooltip } from 'react-mdl'

export default class MemberRenew extends Component {
  constructor(props) {
    super(props)
    this.state = {
      member: props.member
    }

    this.getRenewButtonToolTipLabel = this.getRenewButtonToolTipLabel.bind(this)
    this.getRenewalAvailable = this.getRenewalAvailable.bind(this)
    this.handleRenewOnClick = this.handleRenewOnClick.bind(this)
  }

  handleRenewOnClick(e) {
    this.props.history.push('/account/renew')
  }

  getRenewalAvailable() {
    return moment.utc(this.state.member.expiresOn).subtract(60, "days") < moment.utc() && this.state.member.status === "accepted"
  }

  getRenewButtonToolTipLabel() {
    if (this.getRenewalAvailable()) {
      return (
        <span>Renew your membership</span>
      )
    } else {
      return (
        <span>Renewal isn't <br />required at this time</span>
      )
    }
  }

  render() {
    return (
      <h5>Renew membership
        <Tooltip label={this.getRenewButtonToolTipLabel()}>
          <FABButton onClick={this.handleRenewOnClick} mini colored disabled={!this.getRenewalAvailable()} accent style={{ marginLeft: "16px"}} className={this.getRenewalAvailable() ? "mdl-button--accent-green-important" : ""}>
            <Icon name="refresh" />
          </FABButton>
        </Tooltip>
      </h5>
    )
  }
}
MemberRenew.propTypes = {
  member: PropTypes.object
}

