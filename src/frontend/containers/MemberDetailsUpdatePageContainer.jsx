import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import * as authActions from '../actions/auth'
import MemberDetailsUpdatePage from '../pages/MemberDetailsUpdatePage.jsx'

const MemberDetailsUpdatePageContainer = connect(
  state => ({
    auth: state.auth
  }),
  dispatch => {
    return bindActionCreators(authActions, dispatch)
  }
)(MemberDetailsUpdatePage)
export default MemberDetailsUpdatePageContainer
