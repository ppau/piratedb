import React, { Component } from 'react'
import moment from 'moment'

import { Grid, Cell, Button, DataTable, Icon, TableHeader, Tabs, Tab, IconButton } from 'react-mdl'
import { Link } from 'react-router-dom'
import GridLoading from '../GridLoading.jsx'

import { MEMBERSHIP_TYPES, MEMBERSHIP_STATUSES } from '../../../lib/membershipConstants'

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
});

export default class Secretary extends Component {

  constructor(props) {
    super(props)
    this.state = {
      members: [],
      errors: [],
      activeTabId: 0,
      activeTab: "all",
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
    this.loadMembers = this.loadMembers.bind(this)
    this.actionRender = this.actionRender.bind(this)
    this.onPaginationChange = this.onPaginationChange.bind(this)
    this.onActiveTabChange = this.onActiveTabChange.bind(this)

    this.inputKeyPress = this.inputKeyPress.bind(this)
    this.handleSearchFieldChange = this.handleSearchFieldChange.bind(this)
    this.handleApplySearch = this.handleApplySearch.bind(this)
    this.handleClearSearch = this.handleClearSearch.bind(this)
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.activeTabId !== this.state.activeTabId) {
      this.loadMembers()
    }
  }

  componentDidMount(nextProps) {
    this.loadMembers()
  }

  loadMembers(pagination) {
    pagination = !!pagination ? pagination : this.state.pagination

    this.setState({
      isLoading: true,
      pagination: pagination,
    })

    let url = `/admin/members?page=${pagination.page}&size=${pagination.size}&status=${this.state.activeTab}`

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
          members: json.members,
          pagination: pagination,
          isLoading: false,
          isLoaded: false,
        });
      })
      .catch((ex) => {
        this.state.errors.push('Could not load the members list.')
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
        <a
          className="mdl-button mdl-js-button mdl-button--raised mdl-button--colored"
          href={'/admin/secretary/member-view/' + id}
          onClick={(e) => {
            if (e.button === 0) {
              e.preventDefault()
              this.props.history.push('/admin/secretary/member-view/' + id)
              return false
            }
          }}>
          Details
        </a>
      </div>
    )
  }

  onPaginationChange(newPage){
    const pagination = {
      page: newPage,
      totalPages: this.state.pagination.totalPages,
      size: this.state.pagination.size,
    }

    this.loadMembers(pagination)
  }

  onActiveTabChange(tabId){
    this.setState({
      activeTabId: tabId,
      activeTab: tabId > 0 ? Object.keys(MEMBERSHIP_STATUSES)[tabId - 1] : "all",
      pagination: Object.assign({}, this.state.pagination, {
        totalPages: 1,
        page: 1,
      })
    })
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
    this.loadMembers()
  }

  handleClearSearch(event) {
    this.setState({
      activeTab: "all",
      activeTabId: 0,
      pagination: {
        page: 1,
        totalPages: 1,
        size: 15,
      },
      searchFieldValue: "",
    })
    if (this.state.activeTabId === 0) {
      setTimeout(this.loadMembers, 500)
    }
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
      <Grid className="mdlwp-1600">
        <Cell col={12}>

          <div className="form-container" style={{textAlign: "center"}}>
            <input type="text" id="search-field" ref="searchField" style={{display: "inline-block"}}
                   placeholder="Name and email search"
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

          <Tabs activeTab={this.state.activeTabId} onChange={ this.onActiveTabChange } ripple>
            { Object.keys(Object.assign({all: "all"}, MEMBERSHIP_STATUSES)).map((key, i) => {
              return (
                <Tab key={i} value={MEMBERSHIP_STATUSES[key]}>{key}</Tab>
              )
            })}
          </Tabs>

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
            <Cell col={12} hidePhone hideTablet className="no-margin">
              <DataTable
                shadow={0}
                rows={this.state.members.map(function(member) {
                  return {
                    id: member.id,
                    givenNames: member.givenNames,
                    surname: member.surname,
                    postcode: member.residentialAddress.postcode,
                    state: member.residentialAddress.state,
                    country: member.residentialAddress.country,
                    type: member.type,
                    status: member.status,
                    memberSince: member.memberSince,
                    verified: member.verified,
                    userId: member.userId,
                  }
                })}
              >
                <TableHeader name="givenNames">Given names</TableHeader>
                <TableHeader name="surname">Surname</TableHeader>
                <TableHeader name="postcode">Postcode</TableHeader>
                <TableHeader name="state">State</TableHeader>
                <TableHeader name="country">Country</TableHeader>
                <TableHeader name="type">Member Type</TableHeader>
                <TableHeader name="status">Member status</TableHeader>
                <TableHeader name="memberSince" cellFormatter={(memberSince) => { return moment(memberSince).format("YYYY-MM-DD") }}>Member since</TableHeader>
                <TableHeader name="userId" cellFormatter={(userId) => {
                  if (userId !== null) {
                    return (
                      <Icon name="done"/>
                    )
                  }
                  return (
                      <Icon name="close"/>
                  )
                }}>Has user</TableHeader>
                <TableHeader name="verified" cellFormatter={(verified) => {
                  return verified ? `Verified` : `Unverified`
                }}>Verified</TableHeader>
                <TableHeader name="id" cellFormatter={(id) => this.actionRender(id)}>Actions</TableHeader>
              </DataTable>
            </Cell>
          </Grid>

          <Grid>
            <Cell col={12} hideDesktop>
              <DataTable
                shadow={0}
                rows={this.state.members.map(function(member) {
                  return {
                    id: member.id,
                    givenNames: member.givenNames,
                    surname: member.surname,
                    state: member.residentialAddress.state,
                    type: member.type,
                    status: member.status,
                  }
                })}
              >
                <TableHeader name="givenNames">Name</TableHeader>
                <TableHeader name="surname">Surname</TableHeader>
                <TableHeader name="state">State</TableHeader>
                <TableHeader name="type">Type</TableHeader>
                <TableHeader name="id" cellFormatter={(id) => this.actionRender(id)}>Actions</TableHeader>
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
