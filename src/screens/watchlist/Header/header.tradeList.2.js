import React, { useMemo, useRef, useImperativeHandle, forwardRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import _ from 'lodash';
import isEqual from 'react-fast-compare';

import InfiniteScroll from '../Component/InfinitScroll.3';
import { useAppState } from '../TradeList/tradelist.hook';

import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func';

import Row from './header.row';

import {
	HEIGHT_ROW_HEADER,
	NUMBER_LOOP,
	PADDING_BOTTOM,
	STATUS_BAR_HEIGHT,
	WIDTH_ROW_HEADER
} from '~s/watchlist/enum';
import { useUpdateChangeTheme } from '~/component/hook';

let HeaderTradeList = ({ onRowPress, listSymbol, isLoading }, ref) => {
	useUpdateChangeTheme();
	const _infinit = useRef({
		autoScroll: () => null,
		disAutoScroll: () => null,
		snapToTop: () => null
	});

	useAppState(
		() =>
			_infinit.current &&
			_infinit.current.autoScroll &&
			_infinit.current.autoScroll(1000),
		() =>
			_infinit.current &&
			_infinit.current.disAutoScroll &&
			_infinit.current.disAutoScroll()
	);

	// #region forwardRef
	const resetInfinit = () => {
		_infinit.current &&
			_infinit.current.snapToTop &&
			_infinit.current.snapToTop();
		_infinit.current &&
			_infinit.current.autoScroll &&
			_infinit.current.autoScroll(2000);
	};
	const stop = () => {
		setTimeout(() => {
			_infinit.current &&
				_infinit.current.disAutoScroll &&
				_infinit.current.disAutoScroll();
			_infinit.current &&
				_infinit.current.snapToTop &&
				_infinit.current.snapToTop();
		}, 1000);
	};
	useImperativeHandle(ref, () => ({
		stop,
		resetInfinit
	}));
	// #endregion

	const data =
		listSymbol ||
		useSelector((state) => {
			const { userPriceBoard, staticPriceBoard, priceBoardSelected } =
				state.priceBoard;
			const priceBoardDetail =
				userPriceBoard[priceBoardSelected] ||
				staticPriceBoard[priceBoardSelected] ||
				{};

			const { value: listSymbol, isIress = false } =
				priceBoardDetail || {};

			const result = [];
			_.forEach(listSymbol, (item, index) => {
				const { symbol, exchange } = item;
				const quote = state.quotes.data[symbol + '#' + exchange];

				if (!result[index]) {
					result[index] = {};
				}

				result[index].symbol = symbol;
				result[index].exchange = exchange;
				result[index].quote = quote;
				result[index].isIress = isIress;
			});

			return result;
		}, isEqual);

	const renderRow = ({ item }) => {
		const { symbol, exchange, quote } = item || {};

		return (
			<Row
				data={quote}
				isLoading={isLoading}
				exchange={exchange}
				onRowPress={onRowPress}
				symbol={symbol}
			/>
		);
	};

	// let dataInfi;
	// if (data && data.length === 4) {
	// 	dataInfi = [...data, data[0]]
	// } else {
	// 	dataInfi = data;
	// }
	return (
		<View style={styles.container}>
			<InfiniteScroll
				numberLoop={NUMBER_LOOP}
				ref={_infinit}
				data={data}
				heightItem={HEIGHT_ROW_HEADER}
				widthItem={WIDTH_ROW_HEADER}
				renderItem={renderRow}
			/>
		</View>
	);
};

const styles = {};
function getNewestStyle() {
	const newStyle = StyleSheet.create({
		container: {
			width: '100%',
			backgroundColor: CommonStyle.backgroundColor,
			justifyContent: 'flex-end',
			// marginBottom: PADDING_BOTTOM,
			height: HEIGHT_ROW_HEADER + STATUS_BAR_HEIGHT + PADDING_BOTTOM
		}
	});
	PureFunc.assignKeepRef(styles, newStyle);
}
getNewestStyle();
register(getNewestStyle);

HeaderTradeList = forwardRef(HeaderTradeList);
HeaderTradeList = React.memo(HeaderTradeList);

export default HeaderTradeList;
