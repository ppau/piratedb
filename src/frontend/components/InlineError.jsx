import React, {Component} from 'react';

export default class InlineError extends Component {
    constructor(props) {
        super(props)
    }

    render() {
        if(!this.props.isError){
            if (this.props.emptySpace){
                return (
                    <span className="errors">&nbsp;</span>
                )
            }
          return null;
        }
        return (
            <span className="errors">
                {this.props.errorMessage}
            </span>
        )
    }
}
