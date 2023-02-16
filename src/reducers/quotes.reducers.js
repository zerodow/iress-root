import _ from 'lodash';
export const changeQuotesData = (state, data) => {
	let curData = data || {};
	if (data.symbol) {
		curData = [data];
	}
	// data is array of quote
	_.forEach(curData, (item) => {
		const { symbol, exchange, updated, code } = item || {};
		if (symbol && exchange) {
			const { updated: curUpdate = 0 } =
				state.data[symbol + '#' + exchange] || {};
			if (+updated > +curUpdate || code) {
				state.data[symbol + '#' + exchange] = item;
			}
		}
	});

	state.isLoadingDepth = false;

	return state;
};

export const storeNchanConnected = (state, { newNChan, key }) => {
	state.nchanConnected[key] = newNChan;
	return state;
};

export const removeNchanConnected = (
	state,
	{ isAll, exchange, symbol, listChannelInfo }
) => {
	if (isAll) {
		_.forEach(state.nchanConnected, (nchan, key) => {
			nchan && nchan.close && nchan.close();
			delete state.nchanConnected[key];
		});
	} else if (listChannelInfo) {
		_.forEach(listChannelInfo, ({ symbolsAsUrl }) => {
			state.nchanConnected[symbolsAsUrl] &&
				state.nchanConnected[symbolsAsUrl].close &&
				state.nchanConnected[symbolsAsUrl].close();
			delete state.nchanConnected[symbolsAsUrl];
		});
	} else if (exchange && symbol) {
		state.nchanConnected[symbol + '#' + exchange] &&
			state.nchanConnected[symbol + '#' + exchange].close &&
			state.nchanConnected[symbol + '#' + exchange].close();
		delete state.nchanConnected[symbol + '#' + exchange];
	}

	return state;
};

export const storeSymbolSubscribed = (state, listSymbolWithExchanges) => {
	_.forEach(listSymbolWithExchanges, (symbolEx) => {
		if (state.subscribed[symbolEx]) {
			state.subscribed[symbolEx] += 1;
		} else {
			state.subscribed[symbolEx] = 1;
		}
	});

	return state;
};

export const unsubscribe = (
	state,
	{ isAll, exchange, symbol, listChannelInfo }
) => {
	if (isAll) {
		_.forEach(state.subscribed, (symbolEx) => {
			if (state.subscribed[symbolEx]) {
				state.subscribed[symbolEx] -= 1;
			}

			if (state.subscribed[symbolEx] < 1) {
				delete state.subscribed[symbolEx];
			}
		});
	} else if (listChannelInfo) {
		_.forEach(listChannelInfo, ({ symbolsEx }) => {
			_.forEach(symbolsEx, (key) => {
				if (state.subscribed[key]) {
					state.subscribed[key] -= 1;
				}

				if (state.subscribed[key] < 1) {
					delete state.subscribed[key];
				}
			});
		});
	} else if (exchange && symbol) {
		const key = symbol + '#' + exchange;
		if (state.subscribed[key]) {
			state.subscribed[key] -= 1;
		}

		if (state.subscribed[key] < 1) {
			delete state.subscribed[key];
		}
	}

	return state;
};

global.quotesChanged = false;

export const storeTimmer = (state, { dispatch, timer }) => {
	if (timer) {
		state.timer = timer;
	} else {
		if (state.timer) {
			clearInterval(state.timer);
		}

		const curTimer = setInterval(() => {
			if (!_.isEmpty(global.tmpQuotesData)) {
				dispatch.quotes.changeQuotesData(global.tmpQuotesData);
				global.tmpQuotesData = {};
				global.quotesChanged = true;
			}
		}, 1000);
		state.timer = curTimer;
	}

	return state;
};

export const changeLoadingDepths = (state, status) => {
	state.isLoadingDepth = status;

	return state;
};
