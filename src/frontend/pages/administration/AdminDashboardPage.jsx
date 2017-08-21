import React, { Component } from 'react'
import accounting from 'accounting'

import { Grid, Cell, DataTable, TableHeader } from 'react-mdl'
import GridLoading from '../../components/GridLoading.jsx'
import Errors from "../../components/Errors.jsx"

export default class AdminDashboardPage extends Component {
  constructor(props) {
    super(props)

    this.state = {
      loaded: false,
      statistics: {},
    }

    this.props.executeLoadStatistics()
  }

  formatCurrency(value) {
    if (Number.isInteger(value)) {
      return accounting.formatMoney(value / 100)
    }
    return value
  }

  render() {
    if (!this.props.administrationStatistics.fulfilled || this.props.administrationStatistics.pending) {
      return (
        <GridLoading />
      )
    }

    if (!this.props.administrationStatistics.succeeded) {
      return (
        <div>
          <Errors invalidFields={['Failed to load statistics.']}
                  errorTitle="An error occurred:"/>
        </div>
      )
    }

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
                {name: "Total", value: this.props.administrationStatistics.payload.all.members.total},
                {name: "Accepted members", value: this.props.administrationStatistics.payload.all.members.acceptedMembers},
                {name: "Pending members", value: this.props.administrationStatistics.payload.all.members.pendingMembers},
                {name: "Expired members", value: this.props.administrationStatistics.payload.all.members.expiredMembers},
                {name: "Resigned members", value: this.props.administrationStatistics.payload.all.members.resignedMembers},
              ].concat(this.props.administrationStatistics.payload.all.members.acceptedNotExpiredByType.map((membershipTypeStatistics) => {
                return {
                  name: `${membershipTypeStatistics.name}`,
                  value: membershipTypeStatistics.count
                }
              }))
              }
            >
              <TableHeader name="name">Overall membership</TableHeader>
              <TableHeader name="value"></TableHeader>
            </DataTable>
          </Cell>

          <Cell col={4}>
            <DataTable
              shadow={0}
              rows={[
                {name: "New members", value: this.props.administrationStatistics.payload.days30.members.newMembers},
                {name: "Pending members", value: this.props.administrationStatistics.payload.days30.members.pendingMembers},
                {name: "Expired members", value: this.props.administrationStatistics.payload.days30.members.expiredMembers},
                {name: "Resigned members", value: this.props.administrationStatistics.payload.days30.members.resignedMembers},
              ]}
            >
              <TableHeader name="name">Membership last 30 days</TableHeader>
              <TableHeader name="value"></TableHeader>
            </DataTable>
          </Cell>

          <Cell col={4}>
            <DataTable
              shadow={0}
              rows={[
                {name: "Fees (last 30 day)", value: this.formatCurrency(this.props.administrationStatistics.payload.days30.revenue.fees)},
                {name: "Donations (last 30 day)", value: this.formatCurrency(this.props.administrationStatistics.payload.days30.revenue.donations)},
                {name: "New or unconfirmed", value: this.formatCurrency(this.props.administrationStatistics.payload.all.revenue.new)},
              ]}
            >
              <TableHeader name="name">Income</TableHeader>
              <TableHeader name="value"></TableHeader>
            </DataTable>
          </Cell>
        </Grid>

        <Grid>
          <Cell col={4}>
            <DataTable
              shadow={0}
              rows={[
                {name: "Total", value: this.props.administrationStatistics.payload.all.users.total},
                {name: "Never signed in", value: this.props.administrationStatistics.payload.all.users.withoutSignIn},
              ]}
            >
              <TableHeader name="name">Overall users</TableHeader>
              <TableHeader name="value"></TableHeader>
            </DataTable>
          </Cell>
        </Grid>

      </div>
    )
  }
}
