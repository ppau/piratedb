import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import * as authActions from '../actions/auth'
import AdminTabs from '../components/administration/AdminTabs.jsx'

const AdminTabsContainer = connect(
  state => ({
    auth: state.auth
  }),
  dispatch => {
    return bindActionCreators(authActions, dispatch)
  }
)(AdminTabs)

export default AdminTabsContainer
