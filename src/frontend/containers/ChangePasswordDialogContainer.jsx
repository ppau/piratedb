import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import * as memberActions from '../actions/member'
import ChangePasswordDialog from '../components/ChangePasswordDialog.jsx'

const ChangePasswordDialogContainer = connect(
  state => ({
    memberChangePassword: state.memberChangePassword
  }),
  dispatch => {
    return bindActionCreators(memberActions, dispatch)
  }
)(ChangePasswordDialog)
export default ChangePasswordDialogContainer