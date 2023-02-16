import React, {
	forwardRef,
	useImperativeHandle,
	useEffect,
	useRef,
	useMemo,
	useCallback
} from 'react';
import { View, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import _ from 'lodash';

import TradeInfo from './components/TradeInfo.2';
import MarketInfo from './components/MartketInfo.2';

import { useNavigator } from '../TradeList/tradelist.hook';
import ChartDetail from '../DetailChart';
import * as Emitter from '@lib/vietnam-emitter';
import * as Channel from '~/streaming/channel';
import SymbolInfo from './symbolInfoDetail';
import BestBidAsk from './BestBidAsk';
import { DelayComp } from '~s/watchlist';
import Enum from '~/enum';
import { dataStorage } from '~/storage';
import ScreenId from '~/constants/screen_id';
import * as Business from '~/business';
const { INDICES } = Enum.SYMBOL_CLASS;
const PRICE_FILL_TYPE = Enum.PRICE_FILL_TYPE;
export const useData = (symbol, exchange) => {
	const dispatch = useDispatch();

	const getSnapshot = (p = { symbol, exchange }) => {
		if (!symbol || !exchange) return;

		dispatch.quotes.getSnapshot({ listSymbol: [p] });
		dispatch.depths.getSnapshot(p);
		dispatch.trades.getSnapshot(p);
	};

	const subAll = _.debounce(
		(p = { symbol, exchange }) => {
			if (!symbol || !exchange) return;
			dispatch.depths.sub(p);
			dispatch.quotes.sub(p);
			dispatch.trades.sub(p);
		},
		300,
		{ leading: false }
	);

	const unsubAll = _.debounce(
		(p = { symbol, exchange }) => {
			if (!symbol || !exchange) return;
			dispatch.depths.unSub(p);
			dispatch.quotes.unSub(p);
			dispatch.trades.unSub(p);
		},
		300,
		{ leading: false }
	);

	useEffect(() => {
		if (!symbol || !exchange) return undefined;
		getSnapshot({ symbol, exchange });
		dispatch.marketInfo.getMarketInfo({ exchange });

		subAll({ symbol, exchange });

		return () => {
			unsubAll({ symbol, exchange });
		};
	}, [symbol, exchange]);

	return {
		getSnapshot: () => {
			getSnapshot({ symbol, exchange });
			dispatch.chart.getSnapshot({
				symbol,
				exchange,
				filterType: PRICE_FILL_TYPE._6M
			});
		}
	};
};

let WatchlistDetail = (
	{
		symbol,
		exchange,
		navigator,
		isDisableShowNewDetail,
		showAddToWl,
		changeAllowUnmount,
		resetNested
	},
	ref
) => {
	const _tradeInfo = useRef();
	const _marketInfo = useRef();
	const { getSnapshot } = useData(symbol, exchange);
	const LoadingChannel = Channel.getChannelAlertLoading();
	const isLoading = useSelector(
		(state) =>
			state.loading.effects.quotes.getSnapshot ||
			state.loading.effects.trades.getSnapshot ||
			state.loading.effects.depths.getSnapshot
	);

	useEffect(() => {
		Emitter.emit(LoadingChannel, isLoading);
	}, [isLoading]);
	const reset = useCallback(() => {
		_tradeInfo.current && _tradeInfo.current.reset();
		_marketInfo.current && _marketInfo.current.reset();
		resetNested && resetNested();
	}, []);

	useImperativeHandle(ref, () => ({
		reset: () => {
			_tradeInfo.current && _tradeInfo.current.reset();
			_marketInfo.current && _marketInfo.current.reset();
		},
		getSnapshot
	}));
	const classSymbol = useMemo(() => {
		return Business.getClassBySymbolAndExchange({ symbol, exchange });
	}, [symbol, exchange]);

	return (
		<View>
			<DelayComp>
				<SymbolInfo
					changeAllowUnmount={changeAllowUnmount}
					showAddToWl={showAddToWl}
					isPanel
					navigator={navigator}
					symbol={symbol}
					exchange={exchange}
				/>
			</DelayComp>

			<DelayComp>
				{classSymbol !== INDICES ? (
					<BestBidAsk symbol={symbol} exchange={exchange} />
				) : null}
			</DelayComp>

			<DelayComp>
				<TradeInfo
					ref={_tradeInfo}
					symbol={symbol}
					exchange={exchange}
				/>
			</DelayComp>

			<DelayComp>
				<ChartDetail
					navigator={navigator}
					symbol={symbol}
					exchange={exchange}
				/>
			</DelayComp>

			<DelayComp>
				<MarketInfo
					reset={reset}
					changeAllowUnmount={changeAllowUnmount}
					ref={_marketInfo}
					isDisableShowNewDetail={isDisableShowNewDetail}
					symbol={symbol}
					exchange={exchange}
					navigator={navigator}
				/>
			</DelayComp>

			<View style={styles.bottomSpace} />
		</View>
	);
};

WatchlistDetail = forwardRef(WatchlistDetail);

export default WatchlistDetail;

const styles = StyleSheet.create({
	bottomSpace: {
		height: 84
	}
});
