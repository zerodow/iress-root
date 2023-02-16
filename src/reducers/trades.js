import _ from 'lodash';

import * as effects from './trades.effects';
import * as reducers from './trades.reducers';

global.tmpTradesData = {};

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
