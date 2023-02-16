import { put, call, select, delay } from 'redux-saga/effects';
import _ from 'lodash';

import {
	requestData,
	getAllPriceBoardUrl,
	getUrlPriceboardStatic,
	getUrlPriceboardPersonal,
	checkNewsTodayUrl
} from '~/api';
import Enum from '~/enum';
import { func } from '../../storage';
import WatchListActions from './reducers';
import streamActions from '~/streaming/StreamComp/reducer';

import * as Controller from '../../memory/controller';
import SCREEN from './screenEnum';
import I18n from '~/modules/language';
import * as NewsBusiness from '~/streaming/news';
import * as Business from '../../business';
import { logDevice } from '~/lib/base/functionUtil';
import { getDispathchFunc } from '~/memory/model';

import { onChangeData } from '~s/watchlist/TradeList/tradelist.func';

const { USER_WATCHLIST } = Enum.WATCHLIST || {};
const { SP_20 } = Enum.PRICEBOARD_STATIC_ID || {};
const { PERSONAL, IRESS } = Enum.TYPE_PRICEBOARD;

export function* getNewsToday({ listSymbol, cb }) {
	const stringQuery = listSymbol.join(',');

	if (stringQuery) {
		const checkUrl = checkNewsTodayUrl(stringQuery);
		try {
			const data = yield call(requestData, checkUrl);
			if (data) {
				cb && cb(data);
				yield put(WatchListActions.watchListChangeNewToday(data));
				NewsBusiness.subNewsBySymbol(stringQuery);
			}
		} catch (error) {}
	}
}

function* getSelectedSubTitle(params) {
	switch (params) {
		case PERSONAL:
			return I18n.t('yourWatchlist');
		case IRESS:
			return I18n.t('iressMarket');
		// case US:
		// 	return I18n.t('unitedStatesMarket');
		default:
			return '';
	}
}

export function* watchlistChangeScreen({ scr, params }) {
	const { priceBoard, priceBoardSelected: priceBoardId } = yield select(
		(state) => state.watchlist3
	);

	const curPriceBoard = priceBoard[priceBoardId];
	const subtitle = curPriceBoard
		? curPriceBoard.watchlist_name || ''
		: I18n.t('favorites');

	switch (scr) {
		case SCREEN.WATCHLIST:
			yield put(
				WatchListActions.watchListSetTitle(
					subtitle,
					I18n.t('WatchListTitle')
				)
			);
			break;
		case SCREEN.CATEGORIES_WATCHLIST:
			yield put(
				WatchListActions.watchListSetTitle(
					I18n.t('categories'),
					I18n.t('WatchListTitle')
				)
			);
			break;
		case SCREEN.SELECT_WATCHLIST:
			const title = yield getSelectedSubTitle(params);
			yield put(
				WatchListActions.watchListSetTitle(
					title,
					I18n.t('WatchListTitle')
				)
			);
			break;

		case SCREEN.EDIT_WATCHLIST:
			yield put(
				WatchListActions.watchListSetTitle('', I18n.t('editWatchList'))
			);
			break;
		case SCREEN.ADD_WATCHLIST:
			yield put(
				WatchListActions.watchListSetTitle(
					'',
					I18n.t('createNewWatchList')
				)
			);

			break;
		default:
			break;
	}
}
