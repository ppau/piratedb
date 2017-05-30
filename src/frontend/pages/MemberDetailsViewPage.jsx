/**
 * Created by thomas on 08/12/16.
 */
import React, { Component } from 'react'
import GridLoading from '../components/GridLoading.jsx'
import GridErrors from '../components/GridErrors.jsx'
import MemberDetailsView from '../components/MemberDetailsView.jsx'

export default class MemberDetailsViewPage extends Component {
  constructor(props) {
    super(props)
    this.state = this.setStateFromProps(props)
    this.render = this.render.bind(this)
  }

  setStateFromProps(props){
    return {
      initialised: props.auth.initialised,
      authenticated: props.auth.authenticated,
      member: props.auth.member ? props.auth.member : null,
      user: props.auth.user ? props.auth.user : null,
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState(this.setStateFromProps(nextProps))
  }

  render() {
    if (!this.state.initialised) {
      return (
        <GridLoading />
      )
    }

    if (this.state.initialised && !this.state.authenticated) {
      return (
        <GridErrors
          title="A member object was not returned."
          errors={!!this.state.errors ? this.state.errors : []}
        />
      )
    }

    return (
      <MemberDetailsView member={this.state.member} user={this.state.user} showUserButtons={true} history={ this.props.history } />
    )
  }
}
