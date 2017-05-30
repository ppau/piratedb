import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { Spacer } from 'react-mdl'

export default class PirateNavigation extends Component {
  constructor(props) {
    super(props);
    this.state = this.getStateFromProps(props)
  }

  getStateFromProps(props) {
    const {className = '', children = [], header = null, ...otherProps} = props
    return {
      className: className,
      children: children,
      header: header,
      otherProps: otherProps,
      classes: classNames('mdl-navigation', className)
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState(this.getStateFromProps(nextProps))
  }

  cloneChildren(children, props) {
    return React.Children.map(children, child => {
      if (!child) return child;
      const newProps = typeof props === 'function' ? props(child) : props;
      return React.cloneElement(child, newProps);
    })
  }

  render() {
    return (
      <nav className={this.state.classes} {...this.state.otherProps}>
        { this.state.header }
        { this.cloneChildren(this.state.children, (child) => ({
          className: classNames({'mdl-navigation__link': child.type !== Spacer}, child.props.className)
        })) }
      </nav>
    )
  }
}
