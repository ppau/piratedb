/**
 * Created by thomas on 2017-05-24.
 */
import { connect } from 'react-redux'
import { Switch as RouterSwitch } from 'react-router-dom'

const mapStateToProps = (state) => {
  return {
    location: state.router.location
  }
}
const ConnectedRouterSwitch = connect(mapStateToProps)(RouterSwitch)

export default ConnectedRouterSwitch
