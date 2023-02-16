import _ from 'lodash';

import * as effects from './chart.effects';
import * as reducers from './chart.reducers';

export default {
	state: {
		data: {},
		subscribed: {},
		nchanConnected: {}
	}, // initial state
	reducers,
	effects: (dispatch) =>
		_.mapValues(effects, (item) => item.bind(this, dispatch))
};
