import _ from 'lodash';

import * as effects from './quotes.effects';
import * as reducers from './quotes.reducers';

global.tmpQuotesData = {};

export default {
	state: {
		data: {},
		timer: null,
		subscribed: {},
		nchanConnected: {}
	}, // initial state
	reducers,
	effects: (dispatch) =>
		_.mapValues(effects, (item) => item.bind(this, dispatch))
};
