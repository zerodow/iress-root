import { useRef, useCallback, useMemo } from 'react';
import { Dimensions } from 'react-native';
import Animated from 'react-native-reanimated';
import {
	getPorfolioTypeByCode,
	getAccActive
} from '~s/portfolio/Model/PortfolioAccountModel';
import ENUM from '~/enum';
import * as Business from '~/business';
import _ from 'lodash';
import CONFIG from '~/config';
import * as ContentModel from '~/component/add_symbol/Models/Content.js';
import { getDispathchFunc } from '~/memory/model';
import WatchListActions from '~s/watchlist/reducers';
import { getDicAdded } from '~s/portfolio/Model/AddToWLModel';
import { changeTextSearch } from '~s/orders/Model/OrdersModel';

const { Value } = Animated;
const { height: DEVICE_HEIGHT, width: DEVICE_WIDTH } = Dimensions.get('window');
const { PORTFOLIO_TYPE } = ENUM;
export function usePortfolioSummary(EquitySummary, CFDSummary) {
	const accActive = getAccActive();
	const portfolioType =
		getPorfolioTypeByCode(accActive) || PORTFOLIO_TYPE.EQUITY;
	const PortfolioSummaryComp =
		portfolioType === PORTFOLIO_TYPE.CFD ? CFDSummary : EquitySummary;
	return [PortfolioSummaryComp];
}

export function useShowDetail() {
	const refDetail = useRef({});
	const showDetail = useCallback(
		(symbol, exchange, data) => {
			refDetail.current &&
				refDetail.current.changeSymbol &&
				refDetail.current.changeSymbol(symbol, exchange, data);
		},
		[refDetail.current]
	);
	const hideDetail = useCallback(() => {
		refDetail.current &&
			refDetail.current.onCloseDetail &&
			refDetail.current.onCloseDetail();
	}, [refDetail.current]);
	const updateDataRealtime = useCallback(
		(positions, totalMarketValue) => {
			refDetail.current &&
				refDetail.current.updateDataRealtime &&
				refDetail.current.updateDataRealtime(
					positions,
					totalMarketValue
				);
		},
		[refDetail.current]
	);
	return [refDetail, showDetail, hideDetail, updateDataRealtime];
}
export function useSetTextSearch() {
	const ref = useRef({});
	const setTextSearch = useCallback(
		(text) => {
			ref.current &&
				ref.current.setTextSearch &&
				ref.current.setTextSearch(text);
		},
		[ref.current]
	);
	return [ref, setTextSearch];
}

export function useShowAddToWl() {
	const refAddToWl = useRef({});
	const showAddToWl = useCallback(
		({ symbol, exchange }) => {
			refAddToWl.current &&
				refAddToWl.current.show &&
				refAddToWl.current.show({ symbol, exchange });
		},
		[refAddToWl.current]
	);
	return [refAddToWl, showAddToWl];
}
export function useForceUpdateNetworkWarning() {
	const refNetworkWarning = useRef({});
	const forceUpdate = useCallback(() => {
		refNetworkWarning.current &&
			refNetworkWarning.current.forceUpdate &&
			refNetworkWarning.current.forceUpdate((prevState) => !prevState);
	}, [refNetworkWarning.current]);
	return [refNetworkWarning, forceUpdate];
}

export function useSetDetailSpaceTop(refDetail) {
	const setSpaceTOp = useCallback(() => {
		const spaceTop = usePaddingTop();
		refDetail.current &&
			refDetail.current.setSpaceTop &&
			refDetail.current.setSpaceTop(spaceTop);
	}, [refDetail.current]);
	return [setSpaceTOp];
}

export function useShowSearchAccount() {
	const refSearchAccount = useRef({});
	const showSearchAccount = useCallback(() => {
		refSearchAccount.current &&
			refSearchAccount.current.show &&
			refSearchAccount.current.show();
	}, [refSearchAccount.current]);
	const resetData = useCallback(() => {
		changeTextSearch('');
		refSearchAccount.current &&
			refSearchAccount.current.resetData &&
			refSearchAccount.current.resetData();
	}, [refSearchAccount.current]);
	return [refSearchAccount, showSearchAccount, resetData];
}

export function useShowHideTabbar() {
	const ref = useRef({});
	const showHide = useCallback(
		(status) => {
			// status: 0 -> hide, 1 -> show
			if (status) {
				ref.current &&
					ref.current.showTabbarQuick &&
					ref.current.showTabbarQuick();
			} else {
				ref.current &&
					ref.current.hideTabbarQuick &&
					ref.current.hideTabbarQuick();
			}
		},
		[ref.current]
	);
	return [ref, showHide];
}

export function useShowHideBuySell() {
	const ref = useRef({});
	const showHide = useCallback(
		(status, isQuick = false) => {
			// status: 0 -> hide, 1 -> show
			if (status) {
				ref.current && ref.current.show && ref.current.show(isQuick);
			} else {
				ref.current && ref.current.hide && ref.current.hide(isQuick);
			}
		},
		[ref.current]
	);
	return [ref, showHide];
}

export function usePaddingTop() {
	const accActive = getAccActive();
	const portfolioType =
		getPorfolioTypeByCode(accActive) || PORTFOLIO_TYPE.EQUITY;
	return portfolioType === PORTFOLIO_TYPE.EQUITY
		? DEVICE_HEIGHT - (580 + 39)
		: DEVICE_HEIGHT - (400 + 39);
}

export function useSpaceTop(initial) {
	const _spaceTop = useMemo(() => new Value(initial), []);
	const setSpaceTop = useCallback(
		(newValue) => {
			_spaceTop.setValue(newValue);
		},
		[_spaceTop]
	);
	return [_spaceTop, setSpaceTop];
}

export function useTotalPortfolio(data = {}) {
	const accActive = getAccActive();
	const portfolioType =
		getPorfolioTypeByCode(accActive) || PORTFOLIO_TYPE.EQUITY;
	const totalPortfolio =
		portfolioType === PORTFOLIO_TYPE.EQUITY
			? data.total_portfolio
			: data.gross_liquidation_value;
	return [totalPortfolio];
}

export function useRealizePL(data = {}) {
	const accActive = getAccActive();
	const portfolioType =
		getPorfolioTypeByCode(accActive) || PORTFOLIO_TYPE.EQUITY;
	const realisePL =
		portfolioType === PORTFOLIO_TYPE.EQUITY
			? data.closed_pnl
				? data.closed_pnl
				: null
			: data.cfd_realized_pnl
			? data.cfd_realized_pnl
			: null;
	const realisePLPercent =
		portfolioType === PORTFOLIO_TYPE.EQUITY
			? data.closed_pnl_percent
				? data.closed_pnl_percent
				: null
			: data.cfd_realized_pnl_percent
			? data.cfd_realized_pnl_percent
			: null;
	return [realisePL, realisePLPercent];
}

export function useFavorites({ favPriceBoard, symbol, exchange }) {
	if (!symbol || !exchange) return false;
	const { value = [] } = favPriceBoard;
	let isFavourite = false;
	value.map((item) => {
		const { symbol: favSymbol, exchange: favExchange } = item;
		if (symbol === favSymbol && exchange === favExchange) {
			isFavourite = true;
		}
	});
	return isFavourite;
}

export function useAddToFav({ isFavourite, symbol, exchange }) {
	const dispatch = getDispathchFunc();
	dispatch.priceBoard.addOrRemoveSymbol({
		symbol,
		exchange,
		isDelete: isFavourite,
		priceboardId: ENUM.WATCHLIST.USER_WATCHLIST
	});
}

export function useCheckInclude({ watchlistId }) {
	const dicAdded = getDicAdded();
	let isInclude = false;
	if (dicAdded[watchlistId]) {
		isInclude = true;
	}
	return isInclude;
}

export function useRightLineMarkerHoldingWeight({
	percent,
	width,
	triggerDistance = 32 * 1.5
}) {
	let top = 0;
	let right = 8;
	let left = DEVICE_WIDTH / 2;
	let height = 16;
	/*
        0   percent            25 (percent)
        0   distance   width / 2 (bán kính)
    */
	const r = width / 2;
	const degree = (percent * 90) / 25;
	const delta = Math.sin((degree * Math.PI) / 180) * r; // AB = r * 2 * sin(Góc CAB)
	const percentByTriggerDistance = 25 / 2; // 1 / 4
	if (percent <= 0) {
		return null;
	} else if ((percent > 0) & (percent <= percentByTriggerDistance)) {
		left += delta / 2;
		height = 12;
	} else {
		left += 32;
	}
	return {
		top,
		right,
		left,
		height
	};
}

export function useLeftLineMarkerHoldingWeight({ percent, width }) {
	let top = 0;
	let right = DEVICE_WIDTH / 2;
	let left = 8;
	let height = 16;
	/*
        0   offset            25 (percent)
        0   distance   width / 2 (bán kính)
    */
	/*
        0     offset     25 (percent)
        0     degree     90 (Góc)
    */
	const r = width / 2;
	const offset = 100 - percent;
	const degree = (offset * 90) / 25;
	const delta = Math.sin((degree * Math.PI) / 180) * r; // AB = r * 2 * sin(Góc CAB)
	const percentByTriggerDistance = 25 / 2; // 1 / 4
	if (offset <= 0) {
		return null;
	} else if ((offset > 0) & (offset <= percentByTriggerDistance)) {
		right += delta / 2;
		height = 12;
	} else {
		right += 32;
	}
	return {
		top,
		right,
		left,
		height
	};
}

export function useMarketValueByPortfolioType({ data }) {
	const accActive = getAccActive();
	const portfolioType =
		getPorfolioTypeByCode(accActive) || PORTFOLIO_TYPE.EQUITY;
	const marketValue =
		portfolioType === PORTFOLIO_TYPE.EQUITY
			? data.market_value
			: data.initial_margin;
	return [marketValue];
}

export function useCheckPanelStatus(ref) {
	if (!ref || !ref.current) return false;
	return ref.current.isShow;
}
