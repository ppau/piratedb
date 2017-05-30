/**
 * Created by thomas on 13/11/16.
 */
import React, { Component } from 'react'
import GridLoading from '../components/GridLoading.jsx'
import GridErrors from '../components/GridErrors.jsx'
import Errors from '../components/Errors.jsx'
import {Grid, Cell, Icon, Card, CardTitle, CardText, Spinner } from 'react-mdl'
import LandingPage from '../pages/LandingPage.jsx'
import SignInContainer from '../containers/SignInContainer.jsx'

export default class AccountVerificationPage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      verification: this.props.verification,
      errors: [],
    }

    this.componentDidMount = this.componentDidMount.bind(this)
    this.componentWillReceiveProps = this.componentWillReceiveProps.bind(this)
  }

  componentDidMount() {
    if (!this.state.verification.initialised && !this.state.verification.loaded) {
      // ui min response timer
      setTimeout(()=>{
        this.props.executeVerification(this.props.match.params.id, this.props.match.params.hash)
      }, 3000)
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      verification: nextProps.verification,
      errors: !nextProps.verification.verificationAccepted ? [nextProps.verification.message] : []
    })
  }

  render() {
    if (!this.state.verification.initialised || !this.state.verification.loaded) {
      return (
        <LandingPage>
          <Grid className="mdlwp-1200 text-centre">
            <Card id="sign-in" style={{minHeight: "120px", margin: "0 auto"}}>
              <CardTitle className="text-center">Verifying your account...</CardTitle>
              <CardText className="text-center">
                <div>
                  <Spinner style={{margin: "16px 0 50px 0"}}/>
                </div>
              </CardText>
            </Card>
          </Grid>
        </LandingPage>
      )
    }

    if (this.state.verification.loaded && !this.state.verification.verificationAccepted) {
      return (
        <LandingPage>
          <div id="landing">
            <Grid className="mdlwp-1200">
              <Cell col={6}>
                <Card style={{minHeight: "auto"}}>
                  <CardTitle className="text-center">
                    Something went wrong
                  </CardTitle>
                  <CardText className="text-center" style={{width: "100%"}}>
                    <Errors
                      style={{ margin: "0"}}
                      errorTitle="An error occurred:"
                      invalidFields={!!this.state.errors ? this.state.errors : []}
                    />
                  </CardText>
                </Card>
              </Cell>
              <Cell col={6}>
                <SignInContainer history={ this.props.history } />
              </Cell>
            </Grid>
          </div>
        </LandingPage>


      )
    }

    return (
      <LandingPage>
        <div id="landing">
          <Grid className="mdlwp-1200">
            <Cell col={6}>
              <Card>
                <CardTitle className="text-center">
                  Account verification complete!
                </CardTitle>
                <CardText className="text-center">
                  <img src="/images/Tick.svg" style={{width: "50px", marginBottom: "16px"}}/>
                  <p>You can now sign in.</p>
                </CardText>
              </Card>
            </Cell>
            <Cell col={6}>
              <SignInContainer history={ this.props.history } />
            </Cell>
          </Grid>
        </div>
      </LandingPage>
    )
  }
}