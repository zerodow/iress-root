import _ from 'lodash';
export {
	storeNchanConnected,
	storeSymbolSubscribed,
	removeNchanConnected,
	unsubscribe,
	storeTimmer
} from './quotes.reducers';

const MAX_SIZE_TRADE = 20;

export const changeTradesData = (state, data) => {
	_.forEach(data, (item) => {
		// data is array of quote
		const { symbol, exchange, trade, code } = item || {};
		if (!symbol || !exchange) return;
		const { trade: curTrade } = state.data[symbol + '#' + exchange] || {};

		let newTrade = _.concat(curTrade || [], _.values(trade));
		newTrade = _.orderBy(newTrade, ['time'], ['desc']);
		newTrade = _.uniqBy(newTrade, 'id');
		newTrade = _.slice(newTrade, 0, MAX_SIZE_TRADE);

		if (!state.data[symbol + '#' + exchange]) {
			state.data[symbol + '#' + exchange] = {};
			state.data[symbol + '#' + exchange].symbol = symbol;
			state.data[symbol + '#' + exchange].exchange = exchange;
		}
		state.data[symbol + '#' + exchange].trade = newTrade;
		state.data[symbol + '#' + exchange].status = code;
	});

	return state;
};
