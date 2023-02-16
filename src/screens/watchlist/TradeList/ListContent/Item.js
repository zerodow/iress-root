import React, { forwardRef, useRef, useCallback } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useDispatch } from 'react-redux';
import Animated from 'react-native-reanimated';
import _ from 'lodash';

import { dataStorage } from '~/storage';

import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func'

import TradeListActions from './RowActions';
import { HEIGHT_SEPERATOR } from '~s/watchlist/enum';
import { BgForOpacity, LeftItem, RightItem, ViewLoading } from './Components';
export const HEIGHT_ROW = 64;

export const RowLoading = ({ _timer, index, duration = 1000 }) => {
	const nextRowTimout = 50;
	const durationRow = 300;

	const showItem = Animated.interpolate(_timer, {
		inputRange: [
			0,
			index * nextRowTimout,
			index * nextRowTimout + durationRow,
			duration
		],
		outputRange: [0, 0, 1, 1]
	});

	const opacity =
		index * nextRowTimout + durationRow > duration ? 1 : showItem;

	return (
		<Animated.View style={[styles.container, { opacity }]}>
			<View style={styles.leftItem}>
				<ViewLoading
					width={78}
					height={24}
					style={{ marginBottom: 8 }}
				/>
			</View>

			<View style={styles.rightItem}>
				<ViewLoading
					width={50}
					height={20}
					style={{ marginBottom: 8 }}
				/>
				<ViewLoading width={70} height={14} />
			</View>
		</Animated.View>
	);
};

export const RowDefault = ({
	onPress,
	symbol,
	exchange,
	isNewsToday,
	quote
}) => {
	const { code: status } = quote || {};

	const isDisable = status && status !== 4;

	return (
		<TouchableOpacity onPress={onPress} disabled={isDisable}>
			<View style={[styles.container, { opacity: isDisable ? 0.5 : 1 }]}>
				<LeftItem
					symbol={symbol}
					exchange={exchange}
					isNewsToday={isNewsToday}
				/>

				<RightItem symbol={symbol} exchange={exchange} quote={quote} />
			</View>
		</TouchableOpacity>
	);
};

let Row = ({
	_timer,
	_trans,
	index,
	isLoading,
	item = {},
	onRowPress,
	onAddToWl,
	onDelete,
	onPressNewOrder,
	onNewAlertLog
}) => {
	const dispatch = useDispatch();
	const id = useRef(Math.random());
	const _actions = useRef();
	const { symbol, exchange, isIress } = item;
	// #region actions
	const onPress = useCallback(() => {
		onRowPress && onRowPress(index);
		dispatch.subWatchlist.resetActions();
	}, [index, dispatch]);

	const onAddWatchList = useCallback(() => {
		dispatch.subWatchlist.resetActions();
		onAddToWl && onAddToWl(index);
	}, [index, dispatch]);
	const onCreateAler = useCallback(() => {
		onNewAlertLog && onNewAlertLog(index)
		dispatch.subWatchlist.resetActions();
	}, [index, dispatch]);
	const onOpenNewOrder = useCallback(() => {
		dispatch.subWatchlist.resetActions();
		onPressNewOrder && onPressNewOrder(index);
	}, [index, dispatch]);
	const on = useCallback(() => {
		dispatch.subWatchlist.resetActions();
		onPressNewOrder && onPressNewOrder(index);
	}, [index, dispatch]);
	const onDeleteItem = useCallback(() => {
		onDelete && onDelete(index);
	}, [index]);

	const onSnap = useCallback(
		(i) => {
			// onSnap && onSnap(i, func, index);
			if (i === 2) {
				dataStorage.functionSnapToClose = () =>
					_actions.current &&
					_actions.current.snapTo &&
					_actions.current.snapTo({ index: 1 });
			}
			const startPoint = isIress ? 0 : 1;
			i !== startPoint &&
				dispatch.subWatchlist.setRowActions({
					id: id.current,
					func: () =>
						_actions.current &&
						_actions.current.snapTo &&
						_actions.current.snapTo({ index: startPoint })
				});
		},
		[isIress, _actions.current]
	);
	// #endregion

	if (isLoading) {
		return <RowLoading index={index} _timer={_timer} />;
	}
	if (!symbol || !exchange) return null;

	return (
		<TradeListActions
			ref={_actions}
			_trans={_trans}
			isIress={isIress}
			onSnap={onSnap}
			onAddToWl={onAddWatchList}
			onDeleteItem={onDeleteItem}
			onCreateAler={onCreateAler}
			onOpenNewOrder={onOpenNewOrder}
		>
			<BgForOpacity />
			<RowDefault {...item} onPress={onPress} />
		</TradeListActions>
	);
};

Row = forwardRef(Row);
// Row = React.memo(Row, (pre, next) => {
// 	if (_.isEqual(pre, next)) {
// 		return true;
// 	}

// 	return false;
// });
export default Row;

const styles = {}
function getNewestStyle() {
	const newStyle = StyleSheet.create({
		container: {
			backgroundColor: CommonStyle.navigatorSpecial.navBarBackgroundColor2,
			borderRadius: 8,
			flexDirection: 'row',
			height: HEIGHT_ROW,
			marginBottom: HEIGHT_SEPERATOR,
			marginHorizontal: 8,
			paddingHorizontal: 16,
			paddingVertical: 8
		},

		leftItem: { flex: 1, justifyContent: 'space-between' }
	});
	PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)
