import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import * as authActions from '../actions/auth'
import DonatePage from '../pages/DonatePage.jsx'

const DonatePageContainer = connect(
  state => ({
    auth: state.auth,
    router: state.router,
  }),
  dispatch => {
    return bindActionCreators(authActions, dispatch)
  }
)(DonatePage)
export default DonatePageContainer
