import thunk from 'redux-thunk';
import { autoRehydrate } from 'redux-persist';
import sagaMiddlewareFactory from 'redux-saga';
import Reactotron from 'reactotron-react-native';

import { init } from '@rematch/core';
import immerPlugin from '@rematch/immer';
import loadingPlugin from '@rematch/loading';

import marketActivity from '~s/marketActivity/reducer.2';
import subWatchlist from '~s/watchlist/reducer.2';
import reactotron from '~/../utils/reactotronConfig';

import rootReducer from '../reducers/index';
import priceBoard from '../reducers/priceBoard';
import quotes from '../reducers/quotes';
import depths from '../reducers/depths';
import trades from '../reducers/trades';
import marketInfo from '../reducers/marketInfo';
import chart from '../reducers/chart';
import rootSaga from '../sagas/index';
import alertLog from '~/reducers/alertLog'
import { model as modalReducer } from '~/component/Modal';

export default function configureStore(initialState) {
	let opts = {};
	if (__DEV__) {
		const sagaMonitor = Reactotron.createSagaMonitor();
		opts = { sagaMonitor };
	}

	const sagaMiddleware = sagaMiddlewareFactory(opts);

	const enhancers = [autoRehydrate()];
	if (__DEV__) {
		enhancers.push(reactotron && reactotron.createEnhancer());
	}

	const store = init({
		models: {
			marketActivity,
			modalRematch: modalReducer,
			subWatchlist,
			quotes,
			depths,
			trades,
			marketInfo,
			chart,
			priceBoard,
			alertLog
		},
		plugins: [immerPlugin(), loadingPlugin()],
		redux: {
			reducers: rootReducer,
			middlewares: [sagaMiddleware, thunk],
			enhancers
		}
	});

	sagaMiddleware.run(rootSaga);

	return store;
}
