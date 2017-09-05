import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import * as authActions from '../actions/auth'
import SignIn from '../components/SignIn.jsx'

const SignInContainer = connect(
  state => ({
    auth: state.auth,
    router: state.router,
  }),
  dispatch => {
    return bindActionCreators(authActions, dispatch)
  }
)(SignIn)

export default SignInContainer
