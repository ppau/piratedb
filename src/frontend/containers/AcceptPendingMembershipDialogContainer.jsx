import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import * as administrationActions from '../actions/administration'
import AcceptPendingMembershipDialog from '../components/administration/AcceptPendingMembershipDialog.jsx'

const AcceptPendingMembershipDialogContainer = connect(
  state => ({
    administration: state.administration
  }),
  dispatch => {
    return bindActionCreators(administrationActions, dispatch)
  }
)(AcceptPendingMembershipDialog)
export default AcceptPendingMembershipDialogContainer