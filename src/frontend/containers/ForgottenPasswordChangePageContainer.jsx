import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import * as forgottenPasswordChange from '../actions/forgottenPasswordChange'
import ForgottenPasswordChangePage from '../pages/ForgottenPasswordChangePage.jsx'

const ForgottenPasswordChangePageContainer = connect(
  state => ({
    forgottenPasswordChange: state.forgottenPasswordChange
  }),
  dispatch => {
    return bindActionCreators(forgottenPasswordChange, dispatch)
  }
)(ForgottenPasswordChangePage)

export default ForgottenPasswordChangePageContainer
