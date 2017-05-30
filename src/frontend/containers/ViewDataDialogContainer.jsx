import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import * as authActions from '../actions/auth'
import ViewDataDialog from '../components/administration/ViewDataDialog.jsx'

const ViewDataDialogContainer = connect(
  state => ({
    auth: state.auth,
  }),
  dispatch => {
    return bindActionCreators(authActions, dispatch)
  }
)(ViewDataDialog)

export default ViewDataDialogContainer
