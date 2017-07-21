/**
 * Created by thomas on 2017-01-12.
 */
import React, { Component } from 'react'
import { Spinner } from 'react-mdl'

export default class ChatPage extends Component {

  constructor(props){
    super(props)
    this.state = {
      //spinnerVisible: true,
    }
    this.handleFrameLoaded = this.handleFrameLoaded.bind(this)
  }

  handleFrameLoaded(e) {
    this.setState({
      //spinnerVisible: false,
    })
  }

  render() {
    return (
      <div style={{display: "flex", flexDirection: "column", overflow: "auto", width: "100%" }}>
        <iframe style={{width: "100%", height: "100%", flex: "1" }} onLoad={ this.handleFrameLoaded } src="https://kiwiirc.com/client/sydney-au.pirateirc.net:+6697/?nick=WebChatUser|?#ppau" />
      </div>
    )
  }
}