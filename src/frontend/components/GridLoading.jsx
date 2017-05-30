/**
 * Created by thomas on 2016-12-08.
 */
import React, { Component } from 'react'
import {Grid, Cell, Spinner } from 'react-mdl'

export default class GridLoading extends Component {
    render() {
        return (
            <Grid className="mdlwp-1200 text-centre">
                <Cell col={12} style={{minHeight: "150px", paddingTop: "50px"}}>
                  { !!this.props.title ? (
                    <h4>{ this.props.title }</h4>
                  ) : null }
                  <div>
                    <Spinner style={{margin: "16px 0 50px 0"}} />
                  </div>
                </Cell>
            </Grid>
        )
    }
}