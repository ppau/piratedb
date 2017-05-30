import React, {Component} from 'react';
import ReactDOM from 'react-dom';

export default class Errors extends Component {
  constructor(props) {
    super(props)
    this.state = {
      style: !!this.props.style ? this.props.style : {},
      invalidFields: props.invalidFields || [],
    }
    this.getClass = this.getClass.bind(this)
    this.componentDidUpdate = this.componentDidUpdate.bind(this)
    this.componentWillReceiveProps = this.componentWillReceiveProps.bind(this)
  }

  getClass(invalidFields) {
    return invalidFields.length >= 1 ? "validationErrors" : "hidden"
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      invalidFields: nextProps.invalidFields || [],
    })
  }

  componentDidUpdate() {
    if (this.props.scrollToError) {
      ReactDOM.findDOMNode(this).scrollIntoView(false)
    }
  }

  render() {
    return (
      <div className={this.getClass(this.state.invalidFields)} style={this.state.style}>
        <div className="validationErrors-text">
            <span>{this.props.errorTitle}</span>
            { Array.isArray(this.state.invalidFields) && this.state.invalidFields.length > 0 ?
            <ul className="errors">
              {this.state.invalidFields.map((field, i) => {
                return <li key={i}>{field}</li>
              })}
            </ul>
                : null }
        </div>
      </div>
    )
  }
}
