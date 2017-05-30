import React, { Component } from "react"
import { Link } from 'react-router-dom'

export default class Finished extends Component {

  render() {

    return (
      <div id="form" className="form-container">
        <fieldset>
          <h1 className="form-title">Finish</h1>

          <div className="form-body">
              <div className="heading">
                  <h2 className="sub-title"> Thank you, we have received your details. </h2>
              </div>

              <label>
                  <p>You will soon receive a verification email to confirm your email address, please click on the link provided in the email.</p>

                  <p>If you don’t receive it, please contact us at <a href="mailto:membership@pirateparty.org.au">membership@pirateparty.org.au</a></p>

                  <br/>
              </label>
              <div className="navigation">
                <button className="nav-button" onClick={() => {
                  this.props.history.push('/account/details')
                }}>
                  Member area
                </button>
                <button onClick={() => {
                  window.location = 'https://pirateparty.org.au/'
                }}>
                  Return to website
                </button>
              </div>
          </div>
        </fieldset>
      </div>
    )
  }
}
