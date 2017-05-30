/**
 * Created by thomas on 08/12/16.
 */
import React, { Component } from 'react'
import GridLoading from '../../components/GridLoading.jsx'
import GridErrors from '../../components/GridErrors.jsx'
import MemberDetailsView from '../../components/MemberDetailsView.jsx'

export default class MemberDetailsViewPage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      member: null,
      user: null,
      id: !!props.match.params.id ? props.match.params.id : null,
      loaded: false,
      errors: null,
    }
    this.render = this.render.bind(this)
    this.getMember = this.getMember.bind(this)
  }

  componentDidMount(){
    this.getMember()
    this._mounted = true
  }

  componentWillUnmount() {
    this._mounted = false
  }

  getMember() {
    this.setState({
      loaded: false,
    })

    if (!this.state.id) {
      this.setState({
        loaded: true,
      })
    }

    window.fetch(`/admin/members/${this.state.id}`, {
      method: 'GET',
      credentials: "same-origin",
      headers: {
        'Content-Type': 'application/json'
      },
    })
      .then((response) => {
        if (response.status !== 200) {
          return Promise.reject(response)
        }
        return response.json()
      })
      .then((json) => {
        this.setState({
          loaded: true,
          member: json.member,
          user: json.user,
        })
      })
      .catch((response) => {
        const errors = []

        if (response.status === 500) {
          errors.push("Internal server error")
        }
        if (this._mounted) {
          this.setState({
            loaded: true,
            errors: errors
          })
        }
      })
  }

  render() {
    if (!this.state.loaded) {
      return (
        <GridLoading />
      )
    }

    if (this.state.loaded && !this.state.member) {
      return (
        <GridErrors
          title="A member object was not returned."
          errors={!!this.state.errors ? this.state.errors : []}
        />
      )
    }


    return (
      <MemberDetailsView member={this.state.member} parent={this} user={this.state.user} isAdmin={true} history={ this.props.history } />
    )
  }
}