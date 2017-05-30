import React, { Component } from 'react';
import Errors from '../Errors.jsx';

export default class Treasurer extends Component {
  constructor(props) {
    super(props);
    this.render = this.render.bind(this);
    this.state = {invoices: [], error: []};
    this.loadInvoices = this.loadInvoices.bind(this);
    this.acceptPayment = this.acceptPayment.bind(this);
    this.loadInvoices();
  }

  loadInvoices() {
    window.fetch("/invoices/unaccepted", {
      method: 'GET',
      credentials: "same-origin",
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then((response) => {
        if (response.status != 200) {
          return Promise.reject(response);
        }
        return response.json()
      })
      .then((json) => {
        this.setState({invoices: json.members})
      })
      .catch((ex) => {
      })
  }

  acceptPayment(invoice) {
    window.fetch("/invoices/unaccepted/" + invoice.reference, {
      method: 'POST',
      credentials: "same-origin",
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then((response) => {
        if (response.status != 200) {
          return Promise.reject(response);
        }
        return response.json()
      })
      .then((json) => {
        let newInvoices = this.state.invoices;
        delete newInvoices[newInvoices.indexOf(invoice)];
        this.setState({invoices: newInvoices, error: []});
      })
      .catch((ex) => {
        this.setState({error: ['Could not accept payment.']});
      })
  }

  render() {
    return (
      <div className='treasurer-page'>
        <Errors errorTitle='Error:'
                invalidFields={this.state.error}
                scrollToError={true}/>
        <table className='admin-table'>
          <thead>
            <tr>
              <th>Given names</th>
              <th>Surname</th>
              <th>Reference number</th>
              <th>Payment type</th>
              <th>Amount</th>
              <th>Accept payment</th>
            </tr>
          </thead>
          <tbody>
            {this.state.invoices.map(function(invoice) {
              return (
                <tr>
                  <td className='given-names'>{invoice.givenNames}</td>
                  <td className='surname'>{invoice.surname}</td>
                  <td className='reference-number'>{invoice.reference}</td>
                  <td className='payment-type'>{invoice.paymentType}</td>
                  <td className='amount'>{invoice.totalAmountInCents / 100}</td>
                  <td className='accept-payment'><a href='#' className='accept-link'
                                                    onClick={this.acceptPayment.bind(this, invoice)}>Accept</a>
                  </td>
                </tr>);
            }.bind(this))}
          </tbody>

        </table>
      </div>);
  }
}
