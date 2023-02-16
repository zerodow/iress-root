import _ from 'lodash';

import * as effects from './marketInfo.effects';
import * as reducers from './marketInfo.reducers';

export default {
	state: {
		data: {},
		symbolInfo: {}
	}, // initial state
	reducers,
	effects: (dispatch) =>
		_.mapValues(effects, (item) => item.bind(this, dispatch))
};
