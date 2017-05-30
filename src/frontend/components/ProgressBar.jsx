import React, { Component } from "react"

export default class ProgressBar extends Component {
  constructor(props) {
    super(props)
    this.getClass = this.getClass.bind(this)
  }

  getClass(progressStep) {
    if (progressStep < this.props.progress) {
      return "visited"
    } else if (progressStep === this.props.progress) {
      return "active"
    } else {
      return "unvisited"
    }
  }

  render() {
    return (<div className="header">
      <ul className="progress-bar">
        <li className={this.getClass(1)} id="progress-membership"><p>Eligibility</p></li>
        <li className={this.getClass(2)} id="progress-details"><p>Details</p></li>
        <li className={this.getClass(3)} id="progress-confirm"><p>Confirm</p></li>
        <li className={this.getClass(4)} id="progress-payment"><p>Contribution</p></li>
        <li className={this.getClass(5)} id="progress-finished"><p>Finish</p></li>
      </ul>
    </div>)
  }
}
