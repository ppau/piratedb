import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import * as authActions from '../actions/auth'
import LandingPage from '../pages/LandingPage.jsx'

const LandingPageContainer = connect(
  state => ({
    router: state.router,
  }),
  dispatch => {
    return bindActionCreators(authActions, dispatch)
  }
)(LandingPage)

export default LandingPageContainer
