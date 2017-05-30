import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import * as forgottenPasswordActions from '../actions/forgottenPassword'
import ForgottenPassword from '../components/ForgottenPassword.jsx'

const ForgottenPasswordContainer = connect(
  state => ({
    forgottenPassword: state.forgottenPassword,
  }),
  dispatch => {
    return bindActionCreators(forgottenPasswordActions, dispatch)
  }
)(ForgottenPassword)
export default ForgottenPasswordContainer