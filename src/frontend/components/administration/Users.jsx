import React, { Component } from 'react'
import Errors from '../Errors.jsx'

export default class Users extends Component {
  constructor(props) {
    super(props)
    this.render = this.render.bind(this)
  }

  render() {
    return (
      <div className="users-page">
        <p style={{ textAlign: "center", padding: 50}}><i>Users: to do</i></p>
      </div>)
  }
}
