/**
 * Created by thomas on 2017-01-12.
 */
import React, { Component } from 'react'
import { Icon } from 'react-mdl'

export default class TestPage extends Component {
  render() {
    return (
      <div className="container text-centre">
        <h4><Icon name="build" /> Want to help us build this feature?</h4>
        <h5>Get involved with the project!</h5>

        <p>Visit our GitHub project: <a href="https://github.com/ppau/piratedb">https://github.com/ppau/piratedb</a></p>
      </div>
    )
  }
}