import _ from 'lodash';

import * as effects from './priceBoard.effects';
import * as reducers from './priceBoard.reducers';

import Enum from '~/enum';

const { TYPE_PRICEBOARD } = Enum;

export default {
	state: {
		symbolInfo: {},
		userPriceBoard: {},
		staticPriceBoard: {},
		priceBoardSelected: null,
		typePriceBoard: TYPE_PRICEBOARD.PERSONAL
	}, // initial state
	reducers,
	effects: (dispatch) =>
		_.mapValues(effects, (item) => item.bind(this, dispatch))
};
