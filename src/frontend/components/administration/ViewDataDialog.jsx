/**
 * Created by thomas on 2017-07-11.
 */

import React, { Component } from 'react'
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Spinner } from 'react-mdl'
import dialogPolyfill from 'dialog-polyfill'
import ReactJson from 'react-json-view'

export default class ViewDataDialog extends Component {
  constructor(props) {
    super(props)
    this.state = {
      parentOnCloseHandler: this.props.onClose,
      member: this.props.member,
      isOpen: this.props.isOpen,
      isFinished: false,
      errors: [],
    }

    this.handleOpen = this.handleOpen.bind(this)
    this.handleClose = this.handleClose.bind(this)
  }

  componentDidMount() {
    dialogPolyfill.registerDialog(this.dialog.dialogRef)
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      isOpen: nextProps.isOpen,
    })
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
          <p>Finished</p>
        </div>
      )
    }

    let content = () => {
      return (
        <div ref={(elem) => { this.dialogContent = elem }}>
          <ReactJson src={this.state.member.data} collapsed={true} onEdit={(elem) => {}} name="data" />
        </div>
      )
    }

    if (!this.props.auth.initialised) {
      content = spinnerContent()
    } else if (this.state.isFinished) {
      content = finishedContent()
    } else {
      content = content()
    }

    return (
      <Dialog open={this.state.isOpen} ref={(elem) => { this.dialog = elem }}>
        <DialogTitle>Data for member</DialogTitle>
        <DialogContent className="form-container">

          { content }

        </DialogContent>
        <DialogActions>
          <Button type='button' onClick={this.handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    )
  }
}
