import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import * as administrationActions from '../actions/administration'
import ToggleUserEnabledDialog from '../components/administration/ToggleUserEnabledDialog.jsx'

const ToggleUserEnabledDialogContainer = connect(
  state => ({
    administration: state.administration,
    administrationToggleUserEnabled: state.administrationToggleUserEnabled,
  }),
  dispatch => {
    return bindActionCreators(administrationActions, dispatch)
  }
)(ToggleUserEnabledDialog)

export default ToggleUserEnabledDialogContainer
