import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import * as verificationActions from '../actions/verification'
import AccountVerificationPage from '../pages/AccountVerificationPage.jsx'

const AccountVerificationPageContainer = connect(
  state => ({
    verification: state.verification
  }),
  dispatch => {
    return bindActionCreators(verificationActions, dispatch)
  }
)(AccountVerificationPage)
export default AccountVerificationPageContainer