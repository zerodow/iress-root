import _ from 'lodash';

import * as effects from './depths.effects';
import * as reducers from './depths.reducers';

global.tmpDepthsData = {};

export default {
	state: {
		data: {},
		timer: null,
		subscribed: {},
		nchanConnected: {},
		isLoadingDepth: false
	}, // initial state
	reducers,
	effects: (dispatch) =>
		_.mapValues(effects, (item) => item.bind(this, dispatch))
};
