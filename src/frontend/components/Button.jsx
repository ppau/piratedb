import React, {Component} from 'react';
import ReactDOM from 'react-dom';

export default class Button extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <button className="nav-button" type={this.props.type} disabled={this.props.disabled || false } id={this.props.id} onClick={this.props.onClick}>
        {this.props.textContent}
      </button>
    )
  }
}
