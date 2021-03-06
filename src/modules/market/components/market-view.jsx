import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';

import MarketActive from 'modules/market/components/market-active';
import MarketReported from 'modules/market/components/market-reported';
import NullStateMessage from 'modules/common/components/null-state-message';

import parseMarketTitle from 'modules/app/helpers/parse-market-title';
import parseQuery from 'modules/app/helpers/parse-query';
import getValue from 'utils/get-value';
import { abi } from 'services/augurjs';

import { MARKET_ID_PARAM_NAME } from 'modules/app/constants/param-names';

export default class MarketView extends Component {
  static propTypes = {
    isConnected: PropTypes.bool.isRequired,
    location: PropTypes.object.isRequired,
    updateSelectedMarketID: PropTypes.func.isRequired,
    clearSelectedMarketID: PropTypes.func.isRequired,
    loadFullMarket: PropTypes.func.isRequired,
    market: PropTypes.object.isRequired
  }

  constructor(props) {
    super(props);

    this.state = {
      isAvailable: getValue(props, 'market.id'),
      isOpen: getValue(props, 'market.isOpen'),
      marketId: null
    };
  }

  componentWillMount() {
    const marketId = abi.format_int256(parseQuery(this.props.location.search)[MARKET_ID_PARAM_NAME]);

    this.props.updateSelectedMarketID(marketId);
    this.setState({ marketId });

    if (this.props.isConnected && getValue(this.props, 'branch.id') && marketId) this.props.loadFullMarket(marketId);
  }

  componentWillReceiveProps(nextProps) {
    if (getValue(this.props, 'market.id') !== getValue(nextProps, 'market.id')) this.setState({ isAvailable: getValue(nextProps, 'market.id') });
    if (getValue(this.props, 'market.isOpen') !== getValue(nextProps, 'market.isOpen')) this.setState({ isOpen: getValue(nextProps, 'market.isOpen') });
  }

  componentWillUpdate(nextProps, nextState) {
    if (
      (
        this.props.isConnected !== nextProps.isConnected ||
        getValue(this.props, 'branch.id') !== getValue(nextProps, 'branch.id') ||
        this.state.marketId !== nextState.marketId
      ) &&
      nextProps.isConnected &&
      getValue(nextProps, 'branch.id') !== null &&
      nextState.marketId !== null
    ) {
      this.props.loadFullMarket(nextState.marketId);
    }
  }

  componentWillUnmount() {
    this.props.clearSelectedMarketID();
  }

  render() {
    const p = this.props;
    const s = this.state;

    return (
      <section id="market_view">
        {!s.isAvailable && <NullStateMessage message={'No Market Data'} />}

        {s.isAvailable &&
          <Helmet>
            <title>{parseMarketTitle(p.market.description)}</title>
          </Helmet>
        }

        {s.isAvailable && s.isOpen &&
          <MarketActive
            {...p}
            isSnitchTabVisible={getValue(p, 'market.isSnitchTabVisible')}
            isReportTabVisible={getValue(p, 'market.isReportTabVisible')}
            isPendingReport={getValue(p, 'market.isPendingReport')}
          />
        }

        {s.isAvailable && !s.isOpen && <MarketReported {...p} />}
      </section>
    );
  }
}
