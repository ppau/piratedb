/**
 * Created by thomas on 2017-08-23.
 */
import React, { Component } from 'react'
import { Layout, Drawer, Content, Footer, FooterSection, FooterLinkList, Icon, Switch, Spacer, Navigation, Grid, Cell } from 'react-mdl'

export default class BankDetails extends Component {
  constructor(props) {
    super(props)
    this.state = {
      reference: props.reference,
    }
  }

  render(){
    return (
      <div>
        {this.state.reference ? (
        <Grid>
          <Cell col={12}>
            <div style={{clear: "both"}}>
              <div className="info-box payment">
              <div className="info-body" style={{fontSize: 16}}>
                <p><strong>Your reference number is: {this.state.reference}</strong></p>
                <p>
                  Please quote your reference number when you make your payment.
                </p>
              </div>
              </div></div>
            </Cell>
          </Grid>
          )
              : null}
        <Grid>
          <Cell col={6}>

            <h1 className="mdl-card__title-text">Direct Deposit</h1>
            <dl>
              <dt>Account Name:</dt>
              <dd>Pirate Party Australia Incorporated</dd>
              <dt>BSB:</dt>
              <dd>012084</dd>
              <dt>Account Number:</dt>
              <dd>213142205</dd>
            </dl>
          </Cell>
          <Cell col={6}>
            <h1 className="mdl-card__title-text">Cheque</h1>
            <address>
              Pirate Party Australia Incorporated<br/>
              PO Box 385<br/>
              Figtree NSW 2525
            </address>
          </Cell>
        </Grid>
      </div>
    )
  }
}
