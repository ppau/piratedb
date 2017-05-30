/**
 * Created by thomas on 2017-01-12.
 */
import React, { Component } from 'react'

export default class DiscussionForumPage extends Component {
  handleFrameLoaded(e){
  }

  render() {
    return (
      <div className="container">
        <iframe onLoad={ this.handleFrameLoaded } src="https://kiwiirc.com/client/sydney-au.pirateirc.net:+6697/?nick=WebChatUser|?#ppau" />
      </div>
    )
  }
}