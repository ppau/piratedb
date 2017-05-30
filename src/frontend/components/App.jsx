import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { Link, Route } from 'react-router-dom'
import ConnectedRouterSwitch from './ConnectedRouterSwitch.jsx'

import { Layout, Drawer, Content, Footer, FooterSection, FooterLinkList, Icon, Switch, Spacer, Navigation, Grid, Cell } from 'react-mdl'

import Routes from '../Routes.jsx'
import AdminTabsContainer from '../containers/AdminTabsContainer.jsx'

import PirateHeader from './PirateHeader.jsx'
import PirateHeaderRow from './PirateHeaderRow.jsx'
import PirateNavigation from './PirateNavigation.jsx'

import env from '../utils/env'

export default class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      auth: props.auth,
      roadmapVisible: false,
    }

    this.closeDrawerOnClick = this.closeDrawerOnClick.bind(this)
    this.getMenuItems = this.getMenuItems.bind(this)
    this.roadmapSwitchOnChange = this.roadmapSwitchOnChange.bind(this)

    this.props.executeInitialise()
  }

  componentWillReceiveProps(nextProps) {
  }

  componentWillUpdate(nextProps, nextState) {
  }

  closeDrawerOnClick() {
    let layout = document.querySelector('.mdl-layout')
    layout.MaterialLayout.toggleDrawer()
  }

  getMenuItems() {
    let menu = []

    // Return to main website link
    menu.push(
      <a key="app-menu-website-link" href="https://pirateparty.org.au/"><Icon name="public"/>Return to website</a>
    )

    // User authenticated toggle (Form | Account links)
    if (!this.props.auth.authenticated) {
      menu.push(
        <Link key="app-menu-sign-up" onClick={this.closeDrawerOnClick} to="/"><Icon name="assignment"/>Members area</Link>
      )
    } else {
      menu.push(
        <hr key="app-menu-account-hr"/>,
        <Link key="app-menu-account-profile" onClick={this.closeDrawerOnClick} to="/account/details"><Icon
          name="account_box"/>Account</Link>,

        <Link key="app-menu-account-donate" onClick={this.closeDrawerOnClick} to="/donate"><Icon
          name="attach_money"/>Donate</Link>,

        /*
        TODO
        <Link key="app-menu-account-payments" onClick={this.closeDrawerOnClick} to="/account/payments"><Icon
          name="account_balance_wallet"/>Payments</Link>,*/

        /*<hr key="app-menu-sign-out-hr"/>,
        <a key="app-menu-sign-out" href="/sign-out">
          <i className="material-icons">exit_to_app</i>
          Sign out
        </a>,*/
        //<Link key="app-menu-account-notifications" onClick={this.closeDrawerOnClick} to="/account/notifications"><Icon name="notifications" /> Notifications</Link>,

        <hr key="app-menu-discuss-hr"/>,
        <span key="app-menu-discuss-subheading" className="subheading">Discussion</span>,
        <Link key="app-menu-chatrooms-link" to="/chat" onClick={this.closeDrawerOnClick}><Icon name="chat"/>Chat</Link>,
        <Link key="app-menu-discussion-forum-link" target="_blank" to="https://discuss.pirateparty.org.au/" onClick={this.closeDrawerOnClick}>
          <Icon name="forum"/>
          Forum
          &nbsp;&nbsp;&nbsp;<Icon style={{ fontSize: 18 }} name="open_in_new"/>
        </Link>,
      )
    }

    // Admin links
    if (this.props.auth.initialised && this.props.auth.authenticated && this.props.auth.user.data.isAdmin) {
      menu.push(
        <hr key="app-menu-admin-hr"/>,
        <span key="app-menu-admin-subheading" className="subheading">Administration</span>,
        <Link key="app-menu-admin-dashboard" onClick={this.closeDrawerOnClick} to="/admin/dashboard"><Icon
          name="dashboard"/>Dashboard</Link>,
      )

      if (this.props.auth.user.data.roles.isSecretary) {
        menu.push(
          <Link key="app-menu-admin-secretary" onClick={this.closeDrawerOnClick} to="/admin/secretary"><Icon
            name="group"/>Secretary</Link>
        )
      }

      if (this.props.auth.user.data.roles.isTreasurer) {
        menu.push(
          <Link key="app-menu-admin-treasurer" onClick={this.closeDrawerOnClick} to="/admin/treasurer"><Icon
            name="group"/>Treasurer</Link>
        )
      }
    }

    // The roadmap! Can you code? HELP US: https://github.com/ppau/piratedb
    if (this.state.roadmapVisible) {
      menu.push(
        <hr key="app-menu-organise-hr"/>,
        <span key="app-menu-organise-subheading" className="subheading">Organise</span>,
        <Link key="app-menu-local-crews-link" to="/local-crews" onClick={this.closeDrawerOnClick}><Icon name="public"/>Local crews &amp; teams</Link>,
        <Link key="app-menu-events-link" to="/events" onClick={this.closeDrawerOnClick}><Icon name="event"/>Events</Link>,
        <Link key="app-menu-volunteer-link" to="/volunteer" onClick={this.closeDrawerOnClick}><Icon name="accessibility"/>Volunteer</Link>,

        <hr key="app-menu-build-hr"/>,
        <span key="app-menu-build-subheading" className="subheading">Build</span>,
        <Link key="app-menu-elections-link" to="/elections" onClick={this.closeDrawerOnClick}><Icon name="move_to_inbox"/>Elections (0)</Link>,
        <Link key="app-menu-crowdfund-link" to="/crowdfund" onClick={this.closeDrawerOnClick}><Icon name="attach_money"/>Crowdfund</Link>,
        <Link key="app-menu-store-link" to="/store" onClick={this.closeDrawerOnClick}><Icon name="shopping_cart"/>Store</Link>,
      )
    }

    return menu
  }

  roadmapSwitchOnChange(e){
    this.setState({
      roadmapVisible: !this.state.roadmapVisible,
    })
  }


  render() {
    function getBanner() {
      switch (env.NODE_ENV) {
        case "development":
        case "staging":
          return (
            <span className="notlive">
              Beta testing, applications will not be processed.
            </span>
          )
        default:
          return null
      }
    }
    const banner = getBanner()
    const isBanner = !!banner

    return (
      <Layout fixedHeader className={ isBanner ? "layout-notlive": "" }>
        { banner }
        <PirateHeader title={<span>Members area</span>}>
          <PirateHeaderRow>
            <Spacer />
            { this.props.auth.authenticated ?
              <Navigation className="pull-right">
                <a href="/sign-out">
                  <i className="material-icons">exit_to_app</i>
                  &nbsp;Sign out
                </a>
              </Navigation>
              : null }
          </PirateHeaderRow>

          <ConnectedRouterSwitch>
            <Route path="/admin" component={ AdminTabsContainer } />
          </ConnectedRouterSwitch>
        </PirateHeader>
        <Drawer title="">
          <PirateNavigation style={{flexGrow: "1"}} header={
            <div>
              <button id="drawer_close_button" onClick={this.closeDrawerOnClick}
                      className="mdl-button mdl-js-button mdl-button--icon">
                <i className="material-icons">close</i>
              </button>
              <span className="mdl-layout-title">
                  <a id="logo" href="/">
                      pirate<span>party</span><br/>
                      <span className="country">members area</span>
                  </a>
              </span>
            </div>
          }>
            { this.getMenuItems() }
          </PirateNavigation>
          <div className="roadmap" style={{margin: "0 auto", paddingBottom: "16px", fontSize: "12px"}}>
            <Switch id="roadmapSwitch" ref={(elem) => {this.roadmapSwitch = elem}} onChange={this.roadmapSwitchOnChange}>Show roadmap</Switch>
          </div>
        </Drawer>
        <Content>

          <Routes />

          <Footer>
            <FooterSection type="bottom">
              <FooterLinkList>
                <a href="https://pirateparty.org.au/privacy/">Privacy Policy</a>
              </FooterLinkList>
            </FooterSection>
          </Footer>
        </Content>
      </Layout>
    )
  }
}
App.propTypes = {
  tabs: PropTypes.element
}
