import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import * as authActions from '../actions/auth'
import MemberDetailsViewPage from '../pages/MemberDetailsViewPage.jsx'

const MemberDetailsViewPageContainer = connect(
  state => ({
    auth: state.auth
  }),
  dispatch => {
    return bindActionCreators(authActions, dispatch)
  }
)(MemberDetailsViewPage)
export default MemberDetailsViewPageContainer