import React, { Component } from 'react'
import { render } from 'react-dom'
import Secretary from './Secretary.jsx'
import Treasurer from './Treasurer.jsx'
import { Link } from 'react-router-dom'
import { Grid, Cell, DataTable, TableHeader } from 'react-mdl'
import accounting from 'accounting'

export default class AdminDashboard extends Component {
  constructor(props) {
    super(props)
    this.statics = {
      dashboard: 1,
      secretary: 2,
      treasurer: 3,
      memberDetails: 4
    }
    this.loadSecretaryPage = this.loadSecretaryPage.bind(this)
    this.loadTreasurerPage = this.loadTreasurerPage.bind(this)
    this.state = {page: this.statics.dashboard}
  }

  loadSecretaryPage() {
    this.setState({page: this.statics.secretary})
  }

  loadTreasurerPage() {
    this.setState({page: this.statics.treasurer})
  }

  render() {
    return (
      <div className="mdlwp-1200" style={{margin: "0 auto"}}>
        <Grid>
          <Cell col={12}>
            <h3>Statistics</h3>
          </Cell>
        </Grid>

        <Grid>
          <Cell col={4}>
            <DataTable
              shadow={0}
              rows={[
                {name: "New members", value: 25},
                {name: "Expired members", value: 3},
                {name: "Resignations", value: 1},
                {name: "Pending email verification", value: 1},
              ]}
            >
              <TableHeader name="name" tooltip="Last 30 days">Membership last 30 days</TableHeader>
              <TableHeader name="value" tooltip=""></TableHeader>
            </DataTable>
          </Cell>
          <Cell col={4}>
            <DataTable
              shadow={0}
              rows={[
                {name: "Sign up donations", value: accounting.formatMoney(340)},
                {name: "General donations", value: accounting.formatMoney(2033)},
                {name: "Reversed transactions", value: 2},
              ]}
            >
              <TableHeader name="name" tooltip="Last 30 days">Income last 30 days</TableHeader>
              <TableHeader name="value" tooltip=""></TableHeader>
            </DataTable>
          </Cell>
          <Cell col={4}>
          </Cell>
        </Grid>
      </div>
    )
  }
}
