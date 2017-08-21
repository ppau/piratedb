import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import * as administrationActions from '../actions/administration'
import AdminDashboardPage from '../pages/administration/AdminDashboardPage.jsx'

const AdminDashboardPageContainer = connect(
  state => ({
    administrationStatistics: state.administrationStatistics
  }),
  dispatch => {
    return bindActionCreators(administrationActions, dispatch)
  }
)(AdminDashboardPage)

export default AdminDashboardPageContainer
