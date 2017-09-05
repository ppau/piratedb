import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { HeaderRow, HeaderTabs } from 'react-mdl'
import PirateHeaderRow from './PirateHeaderRow.jsx'

export default class PirateHeader extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    let classes = classNames('mdl-layout__header', {
      'mdl-layout__header--scroll': this.props.scroll,
      'mdl-layout__header--seamed': this.props.seamed,
      'mdl-layout__header--transparent': this.props.transparent,
      'mdl-layout__header--waterfall': this.props.waterfall,
      'mdl-layout__header--waterfall-hide-top': this.props.waterfall && this.props.hideTop
    }, this.props.className)

    let isRowOrTab = false
    React.Children.forEach(this.props.children, child => {
      if (child && (child.type === PirateHeaderRow || child.type === HeaderRow || child.type === HeaderTabs)) {
        isRowOrTab = true
      }
    })
    return (
      <header className={classes} {...this.props.otherProps}>
        {isRowOrTab ? this.props.children : (
          <PirateHeaderRow title={this.props.title} hideSpacer={this.props.hideSpacer}>{this.props.children}</PirateHeaderRow>
        )}
      </header>
    )
  }
}

PirateHeader.propTypes = {
  className: PropTypes.string,
  scroll: PropTypes.bool,
  seamed: PropTypes.bool,
  title: PropTypes.object,
  transparent: PropTypes.bool,
  waterfall: PropTypes.bool,
  hideTop: PropTypes.bool,
  hideSpacer: PropTypes.bool
}
