import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import * as administrationActions from '../actions/administration'
import CreateUserDialog from '../components/administration/CreateUserDialog.jsx'

const CreateUserDialogContainer = connect(
  state => ({
    administration: state.administration,
    administrationCreateUserForMember: state.administrationCreateUserForMember,
  }),
  dispatch => {
    return bindActionCreators(administrationActions, dispatch)
  }
)(CreateUserDialog)

export default CreateUserDialogContainer
