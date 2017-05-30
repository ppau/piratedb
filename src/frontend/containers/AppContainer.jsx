import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import * as authActions from '../actions/auth'
import App from '../components/App.jsx'

const AppContainer = connect(
  (state) => ({
    router: state.router,
    auth: state.auth
  }),
  (dispatch) => {
    return bindActionCreators(authActions, dispatch)
  }
)(App)

export default AppContainer
