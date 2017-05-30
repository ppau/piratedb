/**
 * Created by thomas on 13/11/16.
 */
import React, { Component } from 'react'
import { Link, Route } from 'react-router-dom'
import ConnectedRouterSwitch from '../components/ConnectedRouterSwitch.jsx'
import SignInContainer from '../containers/SignInContainer.jsx'
import ForgottenPasswordContainer from '../containers/ForgottenPasswordContainer.jsx'

export default class LandingPage extends Component {

  constructor(props) {
    super(props)
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
              <div className="mdl-cell--6-col text-centre" style={{minHeight: "350px"}}>
                <h1>Join the first political party <br />ready for the digital age.</h1>

                <Link to="/members/new" className="hero__btn mdl-button mdl-js-button mdl-button--raised mdl-button--ripple mdl-button--colored">
                  Become a member
                </Link>

              </div>
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