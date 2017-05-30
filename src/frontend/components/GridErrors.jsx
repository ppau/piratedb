import React, {Component} from 'react';
import {Grid, Cell, Spinner } from 'react-mdl'
import Errors from './Errors.jsx'

export default class GridErrors extends Component {
    constructor(props){
        super(props)
        this.state = {
            title: props.title ? props.title : "Error:",
            errors: props.errors ? props.errors : [],
        }
    }
    render() {
        return (
            <Grid className="mdlwp-1200 text-centre">
                <Cell col={12} style={{minHeight: "150px"}}>
                    <Errors errorTitle={this.state.title} invalidFields={this.state.errors} />
                </Cell>
            </Grid>
        )
    }
}