import React, { Component } from 'react';
import MembershipTypeExplanation from './MembershipTypeExplanation.jsx';

export default class SupporterInfoBox extends Component {
  constructor(props) {
    super(props);
    this.render = this.render.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
  }

  componentDidMount() {
    this.props.didUpdate(true);
  }

  render() {
    return (<div className="info-box info-box-warning">
      <div className="info-heading">
        <h3>You are entitled to a Supporter Membership. </h3>
        <MembershipTypeExplanation />
      </div>
      <div className="info-body">
        <p>Full membership with the Pirate Party requires you to resign from any other political parties first.</p>
        <p>As a member of another political party, Supporters are not eligible to vote at Pirate Party proceedings, but
          they can:</p>
        <ul>
          <li>Participate in the decision making process;</li>
          <li>Communicate and submit policy and constitutional amendment proposals.</li>
        </ul>
        As a Supporter, you can pay <b>whatever you want</b> to join (even $0!)
      </div>
    </div>)
  }
}
