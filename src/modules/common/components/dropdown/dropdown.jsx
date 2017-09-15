import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

import Styles from 'modules/common/components/dropdown/dropdown.styles'

class Dropdown extends Component {
  constructor(props) {
    super(props)

    const defaultOption = props.options.find(option => option.value === props.default) || false

    this.state = {
      label: (defaultOption && defaultOption.label) || props.options[0].label,
      value: (defaultOption && defaultOption.value) || props.options[0].value,
      showList: false
    }

    this.dropdownSelect = this.dropdownSelect.bind(this)
    this.toggleList = this.toggleList.bind(this)
  }

  dropdownSelect(label, value) {
    if (value !== this.state.value) {
      this.setState({
        label,
        value
      })
      this.props.onChange(value)
      this.toggleList()
    }
  }

  toggleList() {
    this.setState({ showList: !this.state.showList })
  }

  render() {
    const p = this.props

    return (
      <div className={Styles.Dropdown} ref={(dropdown) => { this.refDropdown = dropdown }}>
        <button
          className={Styles.Dropdown__label}
          onClick={this.toggleList}
        >
          {this.state.label}
        </button>
        <div className={classNames(Styles.Dropdown__list, { [`${Styles.active}`]: this.state.showList })}>
          {p.options.map(option => (
            <button
              className={classNames({ [`${Styles.active}`]: option.value === this.state.value })}
              key={option.value}
              value={option.value}
              onClick={() => this.dropdownSelect(option.label, option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
        <select
          className={Styles.Dropdown__select}
          onChange={(e) => { this.dropdownSelect(e.target.options[e.target.selectedIndex].text, e.target.value) }}
          value={this.state.value}
        >
          {p.options.map(option => (
            <option
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </select>
        <i className={classNames(Styles['Dropdown__angle-down'], Styles.fa, Styles['fa-angle-down'])} />
      </div>
    )
  }
}

Dropdown.propTypes = {
  onChange: PropTypes.func.isRequired,
  default: PropTypes.string.isRequired,
  options: PropTypes.array.isRequired
}

export default Dropdown
