import React, { Component } from 'react'
import moment from 'moment'

import { Grid, Cell, Button, DataTable, Icon, TableHeader, Tabs, Tab, IconButton } from 'react-mdl'
import { Link } from 'react-router-dom'
import GridLoading from '../GridLoading.jsx'

import { INVOICE_TYPES, INVOICE_STATUSES } from '../../../lib/invoiceConstants'

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
      invoices: [],
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
    this.loadInvoices = this.loadInvoices.bind(this)
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
      this.loadInvoices()
    }
  }

  componentDidMount(nextProps) {
    this.loadInvoices()
  }

  loadInvoices(pagination) {
    pagination = !!pagination ? pagination : this.state.pagination

    this.setState({
      isLoading: true,
      pagination: pagination,
    })

    let url = `/admin/invoices-list?page=${pagination.page}&size=${pagination.size}&status=${this.state.activeTab}`

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
          invoices: json.invoices,
          pagination: pagination,
          isLoading: false,
          isLoaded: false,
        })
      })
      .catch((ex) => {
        this.state.errors.push('Could not load the invoices list.')
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
          disabled className="mdl-button mdl-js-button mdl-button--raised mdl-button--colored"
          href={'/admin/invoices/invoice-view/' + id}
          onClick={(e) => {
            if (e.button === 0) {
              e.preventDefault()
              this.props.history.push('/admin/invoices/invoice-view/' + id)
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

    this.loadInvoices(pagination)
  }

  onActiveTabChange(tabId){
    this.setState({
      activeTabId: tabId,
      activeTab: tabId > 0 ? Object.keys(INVOICE_STATUSES)[tabId - 1] : "all",
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
    this.loadInvoices()
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
      setTimeout(this.loadInvoices, 500)
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
                   placeholder="IDs search"
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
            { Object.keys(Object.assign({all: "all"}, INVOICE_STATUSES)).map((key, i) => {
              return (
                <Tab key={i} value={INVOICE_STATUSES[key]}>{key}</Tab>
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
            <Cell col={12} className="no-margin">
              <DataTable
                shadow={0}
                rows={this.state.invoices.map(function(invoice) {
                  return {
                    invoice: invoice,
                    id: invoice.id,
                    totalAmountInCents: invoice.totalAmountInCents,
                    totalAmount: (invoice.totalAmountInCents / 100).toLocaleString("en-US", {style: "currency", currency: "AUD"}),
                    paymentDate: invoice.paymentDate,
                    paymentMethod: invoice.paymentMethod,
                    reference: invoice.reference,
                    memberReference: `${moment.utc(invoice.createdAt).year()}P${("00000" + invoice.id).slice(-5)}`,
                    paymentStatus: invoice.paymentStatus,
                    transactionId: invoice.transactionId,
                    createdAt: invoice.createdAt,
                    updatedAt: invoice.updatedAt,
                  }
                })}
              >
                <TableHeader name="memberReference">Reference</TableHeader>
                <TableHeader style={{width: "250px"}} name="createdAt" cellFormatter={(createdAt) => {
                  return moment(createdAt).format("YYYY-MM-DD hh:mm:ss a") }}>Created
                </TableHeader>
                <TableHeader style={{width: "250px"}} name="paymentDate" cellFormatter={(paymentDate) => {
                  return !paymentDate ? "unpaid" : moment(paymentDate).format("YYYY-MM-DD hh:mm:ss a") }}>Payment date
                </TableHeader>
                <TableHeader name="paymentMethod">Payment method</TableHeader>
                <TableHeader name="paymentStatus">Payment status</TableHeader>
                <TableHeader name="totalAmount">Amount</TableHeader>
                <TableHeader style={{width: 270}} name="invoice" cellFormatter={(invoice) => {
                  return (
                      <dl style={{margin: 0}}>
                        <dt style={{marginTop: 0}}>Member ID</dt>
                        <dd>{invoice.reference}</dd>
                        <dt>Transaction ID</dt>
                        <dd>{invoice.transactionId}</dd>
                      </dl>
                  )
                }}>IDs</TableHeader>
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
