import _ from 'lodash';

export const changeChartData = (
	state,
	{ data, symbol, exchange, filterType }
) => {
	state.data[symbol + '#' + exchange + '#' + filterType] = data;

	return state;
};
