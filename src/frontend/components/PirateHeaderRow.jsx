/**
 * Created by thomas on 7/11/16.
 */
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { Spacer } from 'react-mdl'

const PirateHeaderRow = props => {
  const {className, title, children, hideSpacer, ...otherProps} = props

  const classes = classNames('mdl-layout__header-row', className)

  return (
    <div className={classes} {...otherProps}>
            <span className="mdl-layout-title">
                <a id="logo" href="/">
                    pirate<span>party</span><br/>
                    <span className="country">members area</span>
                </a>
            </span>
      {title && <span className="mdl-layout-title mdl-layout--large-screen-only">
                {title}
            </span>}
      {title && !hideSpacer && <Spacer />}
      {children}
    </div>
  )
}
PirateHeaderRow.propTypes = {
  className: PropTypes.string,
  title: PropTypes.node,
  hideSpacer: PropTypes.bool
}

export default PirateHeaderRow;
