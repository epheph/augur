import * as AugurJS from '../../../services/augurjs';

import { updateMarketTradesData } from '../../../modules/portfolio/actions/update-market-trades-data';

export function loadMarketTrades(marketID) {
	return dispatch => {
		AugurJS.loadMarketTrades(marketID, (err, marketTrades) => {
			if (err) {
				console.error('ERROR loadMarketTrades -- ', err);
				return;
			}

			if (!marketTrades) {
				return;
			}

			const trades = {};
			trades[marketID] = marketTrades;

			dispatch(updateMarketTradesData(trades));
		});
	};
}