/**
 * Created by thomas on 2017-01-12.
 */
import React, { Component } from 'react'
import { SelectField, Option } from 'react-mdl-extra'

export default class TestPage extends Component {
  render() {
    return (
      <div className="container">
        <SelectField label={'Select me'} value={3}>
          <Option value={1}>One</Option>
          <Option value={2}>Two</Option>
          <Option value={3}>Three</Option>
          <Option value={4}>Four</Option>
          <Option value={5}>Five</Option>
        </SelectField>
      </div>
    )
  }
}