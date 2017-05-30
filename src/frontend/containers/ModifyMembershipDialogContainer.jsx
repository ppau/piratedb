import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import * as administrationActions from '../actions/administration'
import ModifyMembershipDialog from '../components/administration/ModifyMembershipDialog.jsx'

const ModifyMembershipDialogContainer = connect(
  state => ({
    administration: state.administration
  }),
  dispatch => {
    return bindActionCreators(administrationActions, dispatch)
  }
)(ModifyMembershipDialog)
export default ModifyMembershipDialogContainer