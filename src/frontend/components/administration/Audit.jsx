import React, { Component } from 'react'
import moment from 'moment'

import { Grid, Cell, Button, DataTable, Icon, TableHeader, Tabs, Tab, IconButton } from 'react-mdl'
import { Link } from 'react-router-dom'
import GridLoading from '../GridLoading.jsx'

import ReactUltimatePagination from 'react-ultimate-pagination-material-ui'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import {indigo500} from 'material-ui/styles/colors'

const muiTheme = getMuiTheme({
  palette: {
    textColor: indigo500,
    accentColor: indigo500,
  },
  appBar: {
    height: 50,
  },
})

export default class Audit extends Component {

  constructor(props) {
    super(props)
    this.state = {
      logEntries: [],
      errors: [],
      isLoaded: false,
      isLoading: false,
      pagination: {
        page: 1,
        totalPages: 1,
        size: 15,
      },
      searchFieldValue: "",
    }

    this.render = this.render.bind(this)
    this.loadLogs = this.loadLogs.bind(this)
    this.actionRender = this.actionRender.bind(this)
    this.onPaginationChange = this.onPaginationChange.bind(this)

    this.inputKeyPress = this.inputKeyPress.bind(this)
    this.handleSearchFieldChange = this.handleSearchFieldChange.bind(this)
    this.handleApplySearch = this.handleApplySearch.bind(this)
    this.handleClearSearch = this.handleClearSearch.bind(this)
  }

  componentDidUpdate(prevProps, prevState) {
  }

  componentDidMount(nextProps) {
    this.loadLogs()
  }

  loadLogs(pagination) {
    pagination = !!pagination ? pagination : this.state.pagination

    this.setState({
      isLoading: true,
      pagination: pagination,
    })

    let url = `/admin/audit-list?page=${pagination.page}&size=${pagination.size}`

    if (this.state.searchFieldValue){
      url += `&search=${this.state.searchFieldValue}`
    }

    window.fetch(url, {
      method: 'GET',
      credentials: "same-origin",
      headers: {
        'Content-Type': 'application/json'
      },
    })
      .then(response => response.json())
      .then((json) => {
        pagination.totalPages = Math.ceil(json.count / pagination.size) || 1

        this.setState({
          logEntries: json.logEntries,
          pagination: pagination,
          isLoading: false,
          isLoaded: false,
        })
      })
      .catch((ex) => {
        this.state.errors.push('Could not load the log entries list.')
        this.setState({
          errors: this.state.errors,
          isLoading: false,
          isLoaded: false,
        })
      })
  }

  actionRender(id) {
    return (
      <div>
        <Button raised disabled colored onClick={() => {
          //this.props.history.push('/admin/audit/log-view/' + id)
        }}>Details</Button>
      </div>
    )
  }

  onPaginationChange(newPage){
    const pagination = {
      page: newPage,
      totalPages: this.state.pagination.totalPages,
      size: this.state.pagination.size,
    }

    this.loadLogs(pagination)
  }

  inputKeyPress(event) {
    if (event.key === 'Enter') {
      this.handleApplySearch(event)
    }
  }

  handleSearchFieldChange(event) {
    this.setState({searchFieldValue: event.target.value})
  }

  handleApplySearch(event) {
    this.loadLogs()
  }

  handleClearSearch(event) {
    this.setState({
      pagination: {
        page: 1,
        totalPages: 1,
        size: 15,
      },
      searchFieldValue: "",
    })
  }

  render() {
    if (this.state.errors && this.state.errors.length > 0) {
      return (
        <Grid className="mdlwp-1200">
          <Cell col={12}>
            <div className="validationErrors">
              { this.state.errors.map((error, i) => (
                <p key={'render-error-' + i} className="validationErrors-text">
                  {error}
                </p>))}
            </div>
          </Cell>
        </Grid>
      )
    }

    return (
      <Grid className="">
        <Cell col={12}>

          <div className="form-container" style={{textAlign: "center"}}>
            <input type="text" id="search-field" ref="searchField" style={{display: "inline-block"}}
                   placeholder="Action / message search"
                   onChange={this.handleSearchFieldChange}
                   value={this.state.searchFieldValue}
                   onKeyPress={this.inputKeyPress}
            />

          <Button onClick={this.handleApplySearch}
                  style={{marginBottom: "0.25em", marginLeft: 16, paddingBottom: "10px"}}
                  className="mdl-button-success">
            <Icon name="search" style={{lineHeight: "16px"}} />
          </Button>

          <Button onClick={this.handleClearSearch}
                  style={{marginBottom: "0.25em", marginLeft: 16, paddingBottom: "10px"}}
                  className="mdl-button-boring">
            <Icon name="clear" style={{lineHeight: "16px"}} />
          </Button>

          </div>

          <div className="pagination-controls" style={{textAlign: "center"}}>
            <MuiThemeProvider muiTheme={muiTheme}>
              <ReactUltimatePagination
                currentPage={this.state.pagination.page}
                totalPages={this.state.pagination.totalPages}
                onChange={this.onPaginationChange}
              />
            </MuiThemeProvider>
          </div>

          <Grid className="no-padding">
            <Cell col={12} className="no-margin">
              <DataTable
                shadow={0}
                rows={this.state.logEntries.map(function(logEntry) {
                  return {
                    id: logEntry.id,
                    timestamp: logEntry.timestamp,
                    level: logEntry.level,
                    action: logEntry.action,
                    message: logEntry.message,
                    severity: logEntry.severity,
                    meta: logEntry.meta,
                  }
                })}
              >
                <TableHeader style={{width: "250px"}} name="timestamp" cellFormatter={(timestamp) => { return moment(timestamp).format("YYYY-MM-DD hh:mm:ss a") }}>Timestamp</TableHeader>
                <TableHeader style={{width: "150px"}} name="level">Level</TableHeader>
                <TableHeader style={{width: "250px"}} name="action">Action</TableHeader>
                <TableHeader name="message">Message</TableHeader>

                <TableHeader style={{width: "150px"}} name="id" cellFormatter={(id) => this.actionRender(id)}>Actions</TableHeader>
              </DataTable>
            </Cell>
          </Grid>

          { this.state.isLoading ?
            <GridLoading />
            : null }

        </Cell>
      </Grid>
    )
  }
}
