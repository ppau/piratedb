import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import * as authActions from '../actions/auth'
import MemberRenew from '../components/MemberRenew.jsx'

const MemberRenewContainer = connect(
  state => ({
    auth: state.auth,
  }),
  dispatch => {
    return bindActionCreators(authActions, dispatch)
  }
)(MemberRenew)

export default MemberRenewContainer
