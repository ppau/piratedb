import React, { Component } from 'react';

export default class DirectDebitInfoBox extends Component {
  constructor(props) {
    super(props);
    this.render = this.render.bind(this);
    // this.componentDidMount = this.componentDidMount.bind(this);
  }

  // componentDidMount() {
  //     this.props.didUpdate(true);
  // }

  render() {
    return (<div className="info-box payment">
      <div className="info-body">
        <strong>A reference number will be sent by email. Please quote your number when you make your
          payment.</strong>
      </div>
    </div>)
  }
}
