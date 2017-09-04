import { describe, it } from 'mocha';
import { assert } from 'chai';
import proxyquire from 'proxyquire';
import sinon from 'sinon';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import {
  UPDATE_SMALLEST_POSITIONS,
  UPDATE_ACCOUNT_TRADES_DATA,
  UPDATE_ACCOUNT_POSITIONS_DATA,
  UPDATE_COMPLETE_SETS_BOUGHT,
  updateSmallestPositions,
  updateAccountPositionsData,
  updateCompleteSetsBought
} from 'modules/my-positions/actions/update-account-trades-data';

describe('modules/my-positions/actions/update-account-trades-data.js', () => {
  proxyquire.noPreserveCache().noCallThru();

  const middlewares = [thunk];
  const mockStore = configureMockStore(middlewares);

  const MOCK_ACTION_TYPES = {
    CONVERT_TRADE_LOGS_TO_TRANSACTIONS: 'CONVERT_TRADE_LOGS_TO_TRANSACTIONS',
    UPDATE_ORDERS: 'UPDATE_ORDERS',
    LOAD_BIDS_ASKS_HISTORY: 'LOAD_BIDS_ASKS_HISTORY'
  };

  const mockConvertTradeLogsToTransactions = {
    convertTradeLogsToTransactions: () => {}
  };
  sinon.stub(mockConvertTradeLogsToTransactions, 'convertTradeLogsToTransactions', (logType, data, marketID) => ({
    type: MOCK_ACTION_TYPES.CONVERT_TRADE_LOGS_TO_TRANSACTIONS,
    logType,
    data,
    marketID
  }));
  const mockUpdateOrders = {
    updateOrders: () => {}
  };
  sinon.stub(mockUpdateOrders, 'updateOrders', (data, isAddition) => ({
    type: MOCK_ACTION_TYPES.UPDATE_ORDERS,
    data,
    isAddition
  }));

  const mockLoadBidsAsksHistory = {
    loadBidsAsksHistory: () => {}
  };
  sinon.stub(mockLoadBidsAsksHistory, 'loadBidsAsksHistory', market => ({
    type: MOCK_ACTION_TYPES.LOAD_BIDS_ASKS_HISTORY,
    data: { ...market }
  }));


  const test = (t) => {
    it(t.description, () => {
      const store = mockStore(t.state || {});

      t.assertions(store);
    });
  };

  describe('updateSmallestPositions', () => {
    test({
      description: `should return the expected action`,
      assertions: (store) => {
        store.dispatch(updateSmallestPositions('0xMARKETID', '0'));

        const actual = store.getActions();

        const expected = [
          {
            type: UPDATE_SMALLEST_POSITIONS,
            marketID: '0xMARKETID',
            smallestPosition: '0'
          }
        ];

        assert.deepEqual(actual, expected, `Didn't dispatch the expect action`);
      }
    });
  });

  describe('updateAccountBidsAsksData', () => {
    test({
      description: `should dispatch the expected actions WITH getPositionInMarket returning an error`,
      state: {
        loginAccount: {
          address: '0xUSERID'
        }
      },
      assertions: (store) => {
        const mockAugur = {
          augur: {
            api: {
              MarketFetcher: {
                getPositionInMarket: () => {}
              }
            }
          }
        };
        sinon.stub(mockAugur.augur.api.MarketFetcher, 'getPositionInMarket', ({ _account: account, _market: market }, callback) => callback({ error: 'ERROR_MESSAGE' }));

        const action = proxyquire('../../../src/modules/my-positions/actions/update-account-trades-data', {
          '../../transactions/actions/convert-logs-to-transactions': mockConvertTradeLogsToTransactions,
          '../../my-orders/actions/update-orders': mockUpdateOrders,
          '../../../services/augurjs': mockAugur
        });

        store.dispatch(action.updateAccountBidsAsksData({ '0xMARKETID': {} }, '0xMARKETID'));

        const actual = store.getActions();

        const expected = [
          {
            type: MOCK_ACTION_TYPES.CONVERT_TRADE_LOGS_TO_TRANSACTIONS,
            logType: 'MakeOrder',
            data: {
              '0xMARKETID': {}
            },
            marketID: '0xMARKETID'
          },
          {
            type: MOCK_ACTION_TYPES.UPDATE_ORDERS,
            data: {
              '0xMARKETID': {}
            },
            isAddition: true
          }
        ];

        assert.deepEqual(actual, expected, `Didn't dispatch the expect action`);
      }
    });

    test({
      description: `should dispatch the expected actions WITHOUT getPositionInMarket returning an error`,
      state: {
        loginAccount: {
          address: '0xUSERID'
        }
      },
      assertions: (store) => {
        const mockAugur = {
          augur: {
            api: {
              MarketFetcher: {
                getPositionInMarket: () => {}
              }
            }
          }
        };
        sinon.stub(mockAugur.augur.api.MarketFetcher, 'getPositionInMarket', ({ _account: account, _market: market }, callback) => callback({}));

        const action = proxyquire('../../../src/modules/my-positions/actions/update-account-trades-data', {
          '../../transactions/actions/convert-logs-to-transactions': mockConvertTradeLogsToTransactions,
          '../../my-orders/actions/update-orders': mockUpdateOrders,
          '../../../services/augurjs': mockAugur
        });

        store.dispatch(action.updateAccountBidsAsksData({ '0xMARKETID': {} }, '0xMARKETID'));

        const actual = store.getActions();

        const expected = [
          {
            type: MOCK_ACTION_TYPES.CONVERT_TRADE_LOGS_TO_TRANSACTIONS,
            logType: 'MakeOrder',
            data: {
              '0xMARKETID': {}
            },
            marketID: '0xMARKETID'
          },
          {
            type: MOCK_ACTION_TYPES.UPDATE_ORDERS,
            data: {
              '0xMARKETID': {}
            },
            isAddition: true
          },
          {
            type: UPDATE_ACCOUNT_POSITIONS_DATA,
            data: {},
            marketID: '0xMARKETID'
          },
        ];

        assert.deepEqual(actual, expected, `Didn't dispatch the expect action`);
      }
    });
  });

  describe('updateAccountCancelsData', () => {
    test({
      description: `should return the expected action`,
      assertions: (store) => {
        const action = proxyquire('../../../src/modules/my-positions/actions/update-account-trades-data', {
          '../../transactions/actions/convert-logs-to-transactions': mockConvertTradeLogsToTransactions,
          '../../my-orders/actions/update-orders': mockUpdateOrders
        });

        store.dispatch(action.updateAccountCancelsData({ '0xMARKETID': {} }, '0xMARKETID'));

        const actual = store.getActions();

        const expected = [
          {
            type: MOCK_ACTION_TYPES.CONVERT_TRADE_LOGS_TO_TRANSACTIONS,
            logType: 'CancelOrder',
            data: {
              '0xMARKETID': {}
            },
            marketID: '0xMARKETID'
          },
          {
            type: MOCK_ACTION_TYPES.UPDATE_ORDERS,
            data: {
              '0xMARKETID': {}
            },
            isAddition: false
          }
        ];

        assert.deepEqual(actual, expected, `Didn't dispatch the expect action`);
      }
    });
  });

  describe('updateAccountTradesData', () => {
    test({
      description: `should return the expected actions WITH getPositionInMarket returning an error`,
      state: {
        loginAccount: {
          address: '0xUSERID'
        }
      },
      assertions: (store) => {
        const mockAugur = {
          augur: {
            api: {
              MarketFetcher: {
                getPositionInMarket: () => {}
              }
            }
          }
        };
        sinon.stub(mockAugur.augur.api.MarketFetcher, 'getPositionInMarket', ({ _account: account, _market: market }, callback) => callback({ error: 'ERROR_MESSAGE' }));

        const action = proxyquire('../../../src/modules/my-positions/actions/update-account-trades-data', {
          '../../transactions/actions/convert-logs-to-transactions': mockConvertTradeLogsToTransactions,
          '../../../services/augurjs': mockAugur
        });

        store.dispatch(action.updateAccountTradesData({ '0xMARKETID': {} }, '0xMARKETID'));

        const actual = store.getActions();

        const expected = [
          {
            type: MOCK_ACTION_TYPES.CONVERT_TRADE_LOGS_TO_TRANSACTIONS,
            logType: 'TakeOrder',
            data: {
              '0xMARKETID': {}
            },
            marketID: '0xMARKETID'
          },
          {
            type: UPDATE_ACCOUNT_TRADES_DATA,
            market: '0xMARKETID',
            data: {}
          }
        ];

        assert.deepEqual(actual, expected, `Didn't dispatch the expect action`);
      }
    });

    test({
      description: `should return the expected actions WITH getPositionInMarket returning NO error`,
      state: {
        loginAccount: {
          address: '0xUSERID'
        }
      },
      assertions: (store) => {
        const mockAugur = {
          augur: {
            api: {
              MarketFetcher: {
                getPositionInMarket: () => {}
              }
            }
          }
        };
        sinon.stub(mockAugur.augur.api.MarketFetcher, 'getPositionInMarket', ({ _account: account, _market: market }, callback) => callback({}));

        const action = proxyquire('../../../src/modules/my-positions/actions/update-account-trades-data', {
          '../../transactions/actions/convert-logs-to-transactions': mockConvertTradeLogsToTransactions,
          '../../bids-asks/actions/load-bids-asks-history': mockLoadBidsAsksHistory,
          '../../../services/augurjs': mockAugur
        });

        store.dispatch(action.updateAccountTradesData({ '0xMARKETID': {} }, '0xMARKETID'));

        const actual = store.getActions();

        const expected = [
          {
            type: MOCK_ACTION_TYPES.CONVERT_TRADE_LOGS_TO_TRANSACTIONS,
            logType: 'TakeOrder',
            data: {
              '0xMARKETID': {}
            },
            marketID: '0xMARKETID'
          },
          {
            type: UPDATE_ACCOUNT_POSITIONS_DATA,
            data: {},
            marketID: '0xMARKETID'
          },
          {
            type: MOCK_ACTION_TYPES.LOAD_BIDS_ASKS_HISTORY,
            data: {
              market: '0xMARKETID'
            }
          },
          {
            type: UPDATE_ACCOUNT_TRADES_DATA,
            market: '0xMARKETID',
            data: {}
          }
        ];

        assert.deepEqual(actual, expected, `Didn't dispatch the expect action`);
      }
    });
  });

  describe('updateAccountPositionsData', () => {
    test({
      description: `should return the expected action`,
      assertions: (store) => {
        store.dispatch(updateAccountPositionsData({ '0xMARKETID': {} }, '0xMARKETID'));

        const actual = store.getActions();

        const expected = [
          {
            type: UPDATE_ACCOUNT_POSITIONS_DATA,
            data: {
              '0xMARKETID': {}
            },
            marketID: '0xMARKETID'
          }
        ];

        assert.deepEqual(actual, expected, `Didn't dispatch the expect action`);
      }
    });
  });

  describe('updateCompleteSetsBought', () => {
    test({
      description: `should return the expected action`,
      assertions: (store) => {
        store.dispatch(updateCompleteSetsBought({ '0xMARKETID': {} }, '0xMARKETID'));

        const actual = store.getActions();

        const expected = [
          {
            type: UPDATE_COMPLETE_SETS_BOUGHT,
            data: {
              '0xMARKETID': {}
            },
            marketID: '0xMARKETID'
          }
        ];

        assert.deepEqual(actual, expected, `Didn't dispatch the expect action`);
      }
    });
  });
});
