import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import * as forgottenPasswordChange from '../actions/forgottenPasswordChange'
import ForgottenPasswordChangePage from '../pages/ForgottenPasswordChangePage.jsx'

const ImportedMemberPasswordChangePageContainer = connect(
  state => ({
    forgottenPasswordChange: state.forgottenPasswordChange,
    cardFormTitle: "New account password",
    cardCompleteTitle: "New account password",
  }),
  dispatch => {
    return bindActionCreators(forgottenPasswordChange, dispatch)
  }
)(ForgottenPasswordChangePage)

export default ImportedMemberPasswordChangePageContainer
