import { getWLCode } from '../Model/CreatePriceBoardModel';
import * as Controller from '~/memory/controller';
import { updateListSymbolAdded } from '~s/watchlist/Categories/Redux/actions';
import { getDispathchFunc } from '~/memory/model';
export function createNewPriceBoard(cb) {
	const WLCode = getWLCode();
	const store = Controller.getGlobalState();
	const dispatch = getDispathchFunc();
	const isRecallApi = false;
	const { categoriesWL = {} } = store;
	const { dicSymbolAdded } = categoriesWL;
	if (!dicSymbolAdded) return;

	const value = [];
	const watchlist = WLCode.trim();
	let rank = 0;
	Object.keys(dicSymbolAdded).map((item) => {
		const [symbol, exchange] = item.split('#');
		value.push({
			symbol,
			exchange,
			rank
		});
		rank++;
	});

	// SYNC REDUX
	dispatch.priceBoard.createPriceBoard({
		watchlistName: watchlist,
		// watchlist,
		value,
		isRecallApi
	});
	Controller.dispatch(updateListSymbolAdded({})); // Reset dic symbol added
	cb && cb();
}
