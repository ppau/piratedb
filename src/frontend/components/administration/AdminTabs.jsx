/**
 * Created by thomas on 15/11/16.
 */
import React, { Component } from 'react'
import { Navigation, Header, HeaderRow, HeaderTabs } from 'react-mdl'
import { NavLink } from 'react-router-dom'
import PirateHeaderRow from './../PirateHeaderRow.jsx'

export default class AdminTabs extends Component {
  constructor(props) {
    super(props)
    this.state = {
      auth: props.auth
    }
  }

  render() {
    if (!this.props.auth.initialised || !this.props.auth.user.data) {
      return null
    }

    return (
      <HeaderRow style={{clear: "both"}} className="mdl-layout__header-row-tabs">
        <Navigation>
          <NavLink to="/admin/dashboard" activeClassName="is-active">Dashboard</NavLink>
          { this.props.auth.user.data.roles.isSecretary ?
            <NavLink to="/admin/secretary" activeClassName="is-active">Secretary</NavLink>
              : null }
            { this.props.auth.user.data.roles.isTreasurer ?
            <NavLink to="/admin/treasurer" activeClassName="is-active">Treasurer</NavLink>
              : null }
          <NavLink to="/admin/settings" activeClassName="is-active">Settings</NavLink>
        </Navigation>
      </HeaderRow>
    )
  }
}