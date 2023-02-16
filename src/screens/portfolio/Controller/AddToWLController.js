import { getDicAdd, getSymbolInfo } from '~s/portfolio/Model/AddToWLModel';
import * as Business from '~/business';
import { forEach } from 'lodash';
import CONFIG from '~/config';
import { getDispathchFunc } from '~/memory/model';
import WatchListActions from '~s/watchlist/reducers';
const findSymbol = ({ symbol, exchange, newValue = [] }) => {
	return newValue.findIndex(
		({ symbol: symbolTmp, exchange: exchangeTmp }) => {
			return symbol === symbolTmp && exchange === exchangeTmp;
		}
	);
};
export function removeSymbolOfYourWl({ symbolObj, priceboardId, userId }) {
	const param = {
		priceboardId,
		data: {
			user_id: userId,
			watchlist: priceboardId,
			value: [symbolObj]
		}
	};
	return Business.removeSymbolPriceBoard(param);
}
export function addSymbolToYourWL() {
	const dispatch = getDispathchFunc();

	const { symbol, exchange } = getSymbolInfo();

	const dicAdd = getDicAdd();
	forEach(dicAdd, async (value, priceboardId) => {
		if (value) {
			const userId = 'iressuser';
			const newSymbol = {
				symbol,
				exchange,
				rank: new Date().getTime()
			};
			await removeSymbolOfYourWl({
				symbolObj: newSymbol,
				priceboardId,
				userId
			});
			dispatch.priceBoard.addOrRemoveSymbol({
				symbol,
				exchange,
				isDelete: false,
				priceboardId
			});
		}
	});
}
