import {
	getNumberUserWLChecked,
	getDicUserWLChecked,
	destroy,
	getActiveTabProperty
} from '../Model/';
import { setManageButtonStatus } from '../Redux/actions';
import { dispatch, getGlobalState } from '~/memory/controller';
import WatchlistActions from '~s/watchlist/reducers';
import _ from 'lodash';
import ENUM from '~/enum';
import { getUpdatePriceBoardUrl, deleteData } from '~/api';
const { MANAGE_BUTTON_STATUS, WATCHLIST } = ENUM;

export function syncManageWLButtonStatus() {
	const numberUserWLChecked = getNumberUserWLChecked();
	const manageWLButtonStatus = !numberUserWLChecked
		? MANAGE_BUTTON_STATUS.UNDO_MANAGE
		: MANAGE_BUTTON_STATUS.DELETE;
	dispatch(setManageButtonStatus(manageWLButtonStatus));
}

export function checkDupplicateWLName(newWLName) {
	try {
		let isDupplicate = false;
		const store = getGlobalState();
		const { priceBoard = {} } = store;
		const { userPriceBoard = {}, staticPriceBoard = {} } = priceBoard
		const priceBoards = { ...userPriceBoard, ...staticPriceBoard };
		Object.keys(priceBoards).map((item, index) => {
			const userWL = priceBoard[item] || {};
			const { isIress, watchlist_name: WLName } = userWL;
			if (
				!isIress &&
				(WLName + '').toUpperCase() === newWLName.toUpperCase()
			) {
				isDupplicate = true;
			}
		});
		return isDupplicate;
	} catch (error) {
		console.log('checkDupplicateWLName exception', error);
		return false;
	}
}

export function checkDupplicateWLCode(newWLCode) {
	try {
		let isDupplicate = false;
		const store = getGlobalState();
		const { priceBoard = {} } = store;
		const { userPriceBoard } = priceBoard;

		Object.keys(userPriceBoard).map((item, index) => {
			const userWL = userPriceBoard[item] || {};
			const { watchlist: WLCode } = userWL;
			if (
				(WLCode + '').toUpperCase() === newWLCode.toUpperCase()
			) {
				isDupplicate = true;
			}
		});
		return isDupplicate;
	} catch (error) {
		console.log('checkDupplicateWLCode exception', error);
		return false;
	}
}
