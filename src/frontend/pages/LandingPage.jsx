/**
 * Created by thomas on 13/11/16.
 */
import React, { Component } from 'react'
import { Link, Route } from 'react-router-dom'
import { Button, Card, CardTitle, CardText, CardActions, Grid, Cell, Icon, Spinner } from 'react-mdl'
import ConnectedRouterSwitch from '../components/ConnectedRouterSwitch.jsx'
import SignInContainer from '../containers/SignInContainer.jsx'
import ForgottenPasswordContainer from '../containers/ForgottenPasswordContainer.jsx'

export default class LandingPage extends Component {

  constructor(props) {
    super(props)

    this.state = {
      redirect: this.props.location ? new URLSearchParams(this.props.location.search).get('redirect') : null
    }

    this.renderBecomeAMemberBlock = this.renderBecomeAMemberBlock.bind(this)
    this.renderRenewalLandingBlock = this.renderRenewalLandingBlock.bind(this)
  }

  renderBecomeAMemberBlock() {
    return (
      <div className="mdl-cell--6-col text-centre" style={{minHeight: "350px"}}>
        <h1>Join the first political party <br />ready for the digital age.</h1>

        <Link to="/members/new" className="hero__btn mdl-button mdl-js-button mdl-button--raised mdl-button--ripple mdl-button--colored">
          Become a member
        </Link>
      </div>
    )
  }

  renderRenewalLandingBlock() {
    return (
      <div className="mdl-cell--6-col">
        <Cell col={12} hidePhone hideTablet style={{marginTop: "0px"}}>
          <Card id="renewal-landing-block" className="pull-right" shadow={0}>
            <CardTitle className="text-center">Membership renewal</CardTitle>
            <CardText className="text-center" style={{width: "100%", minHeight: "165px", paddingTop: "45px"}}>
              <Icon name="chevron_right" className="pull-right" style={{fontSize: 60}}/>
              <p style={{marginTop: "8px"}}>To renew your membership, please sign in first.</p>
            </CardText>
            <CardActions border>
              <Button colored onClick={() => {
                this.props.history.push('/')
              }}>
                Return to members area
              </Button>
            </CardActions>
          </Card>
        </Cell>
        <Cell col={12} hideDesktop style={{marginLeft: "0px"}}>
          <Card id="renewal-landing-block" shadow={0} style={{minHeight: 0}}>
            <CardTitle className="text-center">Membership renewal</CardTitle>
            <CardText className="text-center" style={{width: "100%", paddingTop: 0}}>
              <Icon name="keyboard_arrow_down" className="pull-right" style={{fontSize: 60}}/>
              <p>To renew your membership, please sign in first.</p>
            </CardText>
          </Card>
        </Cell>
      </div>
    )
  }

  render() {
    return (
      <div className="hero hero--home">
        <p className="cc-credit">Photo:&nbsp;
          <a href="https://www.flickr.com/photos/fritten/6784979058/">
            Torben Friedrich
          </a> CC-BY-SA
        </p>
        <div className="hero__bg-container">
          <div className="hero__bg-container-overlay">
            { !this.props.children ? (
            <div id="landing" className="mdl-grid">

              { this.state.redirect === '/account/renew' || this.state.redirect === '/account/renew/'
                ? this.renderRenewalLandingBlock() : this.renderBecomeAMemberBlock() }

              <div className="mdl-cell--6-col">
                <ConnectedRouterSwitch>
                  <Route exact path="/forgotten-password" component={ ForgottenPasswordContainer }/>
                  <Route path="/" component={ SignInContainer }/>
                </ConnectedRouterSwitch>
              </div>
            </div>
              ) : this.props.children }
          </div>
        </div>
      </div>
    )
  }
}