/**
 * Created by thomas on 2017-07-05.
 */

import React, { Component } from 'react'
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Spinner } from 'react-mdl'
import dialogPolyfill from 'dialog-polyfill'
import InlineError from '../InlineError.jsx'

export default class ToggleUserEnabledDialog extends Component {
  constructor(props) {
    super(props)
    this.state = {
      parentOnCloseHandler: this.props.onClose,
      user: this.props.user,
      isOpen: this.props.isOpen,
      isFinished: false,
      errors: {},
    }

    this.handleOpen = this.handleOpen.bind(this)
    this.handleClose = this.handleClose.bind(this)

    this.handleToggleUserEnabled = this.handleToggleUserEnabled.bind(this)
  }

  componentDidMount(){
    dialogPolyfill.registerDialog(this.dialog.dialogRef)
  }

  componentWillReceiveProps(nextProps) {
    const isFinished = !this.props.administrationToggleUserEnabled.succeeded && nextProps.administrationToggleUserEnabled.succeeded

    this.setState({
      isOpen: nextProps.isOpen,
      isFinished: isFinished,
    })
  }

  handleToggleUserEnabled() {
    const payload = {
      data: {
        userId: this.state.user.id,
        enabled: !this.state.user.enabled,
      }
    }

    this.props.executeToggleUserEnabled(payload)
  }

  handleOpen() {
    this.setState({
      isOpen: true,
      errors: {}
    })
  }

  handleClose() {
    this.setState({
      isOpen: false
    })

    if (this.state.parentOnCloseHandler){
      this.state.parentOnCloseHandler()
    }
  }

  render() {
    const spinnerContent = () => {
      return (
        <div style={{minHeight: 150, padding: 0, textAlign: "center"}}>
          <Spinner style={{margin: "50px 0 50px 0"}}/>
        </div>
      )
    }

    const finishedContent = () => {
      return (
        <div style={{padding: "25px 0", textAlign: "center"}}>
            <img src="/images/Tick.svg" style={{width: "50px"}}/>
            <p>Changes saved.</p>
        </div>
      )
    }

    let content = ()=>{
      return (
            <div ref={(elem) => { this.dialogContent = elem }}>
              <p>Toggle user enabled state to { this.state.user.enabled ? "disabled" : "enabled" }?</p>

              { this.props.administrationToggleUserEnabled && this.props.administrationToggleUserEnabled.errors ?
                <div className="validationErrors">
                  {this.props.administrationToggleUserEnabled.errors.map((error, i) => (
                    <InlineError key={`errors-main-key-${i}`} isError={true}
                                 errorMessage={error}
                                 emptySpace={false}/>
                  ))}
                </div>
                : null }

            </div>
      )
    }

    if (this.props.administrationToggleUserEnabled.pending){
      content = spinnerContent()
    } else if (this.state.isFinished) {
      content = finishedContent()
    } else {
      content = content()
    }


    return (
      <Dialog open={this.state.isOpen} ref={(elem) => { this.dialog = elem }}>
        <DialogTitle>{ this.state.user.enabled ? "Disable user account?" : "Enable user account?" }</DialogTitle>
        <DialogContent className="form-container">

          { content }

        </DialogContent>
        <DialogActions>
          { !this.state.isFinished ?
            <div>
              <Button disabled={this.props.administrationToggleUserEnabled.pending} colored type='button' onClick={this.handleToggleUserEnabled}>{ this.state.user.enabled ? "Disable user" : "Enable user" }</Button>
              <Button disabled={this.props.administrationToggleUserEnabled.pending} colored type='button' onClick={this.handleClose}>
                Cancel
              </Button>
            </div>
            :
            <Button type='button' onClick={this.handleClose}>Ok</Button>
          }
        </DialogActions>
      </Dialog>
    )
  }
}
