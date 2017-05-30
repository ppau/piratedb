import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import * as authActions from '../actions/auth'
import MemberRenewPage from '../pages/MemberRenewPage.jsx'

const MemberRenewPageContainer = connect(
  state => ({
    auth: state.auth
  }),
  dispatch => {
    return bindActionCreators(authActions, dispatch)
  }
)(MemberRenewPage)

export default MemberRenewPageContainer
