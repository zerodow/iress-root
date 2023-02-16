import React, {
	useImperativeHandle,
	forwardRef,
	useState,
	useEffect,
	useRef,
	useCallback
} from 'react';
import {
	View,
	TouchableOpacity,
	StyleSheet,
	Dimensions,
	Text
} from 'react-native';
import { useDispatch } from 'react-redux';
import Animated from 'react-native-reanimated';
import _ from 'lodash';

import { dataStorage } from '~/storage';

import * as Business from '~/business';
import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func'

import Icon from '../Component/Icon2';
import DisplayName from '../Component/DisplayName';
import PricePercent from '../Component/PricePercent';
import PriceChangePoint from '../Component/PriceChangePoint';
import CompanyName from '../Component/CompanyName';
import PriceValue from '../Component/PriceValue';
import TradeListActions from './tradelist.actions';
import { HEIGHT_SEPERATOR, INVALID } from '~s/watchlist/enum';
import { dispatch } from '~/memory/controller';

export const HaltIcon = ({ isLoading, symbol, exchange }) => {
	const key = `${symbol}#${exchange}`;
	const { trading_halt: istradingHalt } = dataStorage.symbolEquity[key] || {};

	if (!istradingHalt || isLoading) return null;
	return (
		<Icon
			name="tradingHaltTag"
			color={CommonStyle.fontShadowRed}
			size={16}
			style={{ paddingRight: 8 }}
		/>
	);
};

export const NewIcon = ({ isLoading, isNewsToday }) => {
	if (!isNewsToday || isLoading) return null;
	return (
		<Icon
			name="newsTag"
			color={CommonStyle.colorProduct}
			size={16}
			style={{ paddingRight: 8 }}
		/>
	);
};

const { width: WIDTH_DEVICE } = Dimensions.get('window');

export const HEIGHT_ROW = 64;

export const ViewLoading = ({ width = 50, height = 24, style }) => {
	const currentStyle = StyleSheet.flatten([
		styles.viewLoading,
		{ width, height },
		style
	]);
	return <View style={currentStyle} />;
};

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

const LeftItem = ({ symbol, exchange, isNewsToday }) => {
	const companyName = Business.getCompanyName({ symbol, exchange });
	const symbolName = symbol + '.' + exchange;

	return (
		<View style={[styles.leftContainer, { paddingRight: 16 }]}>
			<View style={styles.leftContent}>
				<HaltIcon symbol={symbol} exchange={exchange} />
				<NewIcon isNewsToday={isNewsToday} />
				<DisplayName title={symbolName} />
			</View>
			<CompanyName value={companyName || '--'} />
		</View>
	);
};

const TextError = ({ children }) => {
	return (
		<Text
			style={{
				fontFamily: CommonStyle.fontPoppinsRegular,
				fontSize: CommonStyle.font15,
				color: CommonStyle.color.sell
			}}
		>
			{children}
		</Text>
	);
};

const getDisableStatus = (status) => {
	if (status === INVALID.INVALID_ACCESS) {
		return (
			<React.Fragment>
				<TextError>NO</TextError>
				<TextError>ACCESS</TextError>
			</React.Fragment>
		);
	} else if (status === INVALID.INVALID_CODE_EXCHANGES) {
		return (
			<React.Fragment>
				<TextError>INVALID</TextError>
				<TextError>CODE/EXCHANGE</TextError>
			</React.Fragment>
		);
	} else if (status === INVALID.INVALID_CODE) {
		return (
			<React.Fragment>
				<TextError>INVALID</TextError>
				<TextError>CODE</TextError>
			</React.Fragment>
		);
	} else if (status === INVALID.INVALID_EXCHANGES) {
		return (
			<React.Fragment>
				<TextError>INVALID</TextError>
				<TextError>EXCHANGE</TextError>
			</React.Fragment>
		);
	}
	return [];
};

const RightItem = ({ quote }) => {
	let content = [];
	const {
		code: status,
		trade_price: tradePrice,
		change_point: changePoint,
		change_percent: changePercent,
		match_pct_movement: mprc
	} = quote || {};

	const isMPRC = !_.isNil(mprc);

	if (status && status !== INVALID.INVALID_WATCHLIST) {
		content = getDisableStatus(status);
	} else {
		content = [];
		content.push(
			<PriceValue
				exchange={exchange}
				symbol={symbol}
				isRow value={tradePrice}
				colorFlag={changePoint}
			/>
		);

		content.push(
			<View style={styles.content}>
				<PriceChangePoint
					isMPRC={isMPRC}
					value={isMPRC ? mprc : changePoint}
				/>
				<PricePercent
					value={isMPRC ? mprc : changePercent}
					colorFlag={isMPRC ? mprc : changePoint}
				/>
			</View>
		);
	}

	return <View style={styles.rightItem}>{content}</View>;
};

let LoadingComp = ({ symbol, exchange }) => {
	const [symbolName, setName] = useState(() =>
		Business.getDisplayName({ symbol, exchange })
	);
	useEffect(() => {
		const newName = Business.getDisplayName({ symbol, exchange });
		if (newName !== symbolName) {
			setName(newName);
		}
	}, [symbol, exchange]);
	return (
		<View style={styles.container}>
			<View style={styles.leftItem}>
				<DisplayName title={symbolName} />
			</View>

			<View style={styles.rightItem}>
				<ViewLoading
					width={50}
					height={20}
					style={{ marginBottom: 8 }}
				/>
				<ViewLoading width={70} height={14} />
			</View>
		</View>
	);
};
LoadingComp = React.memo(LoadingComp);

export let BgForOpacity = () => (
	<View style={[styles.bg, { paddingHorizontal: 8 }]}>
		<View
			style={{
				borderRadius: 8,
				flex: 1,
				backgroundColor: CommonStyle.backgroundColor1
			}}
		/>
	</View>
);
BgForOpacity = React.memo(BgForOpacity);

let Row = ({
	_timer,
	_trans,
	index,
	isLoading,
	item,
	onRowPress,
	onAddToWl,
	onDelete,
	onPressNewOrder
}) => {
	const _actions = useRef();
	const { symbol, exchange, isIress, quote, isNewsToday } = item || {};

	const dispatch = useDispatch();
	const id = useRef(Math.random());

	const onPress = useCallback(() => {
		onRowPress && onRowPress(index);
		dispatch.subWatchlist.resetActions();
	}, [index, dispatch]);

	const onAddWatchList = useCallback(() => {
		dispatch.subWatchlist.resetActions();
		onAddToWl && onAddToWl(index);
	}, [index, dispatch]);
	const onOpenNewOrder = useCallback(() => {
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

	if (isLoading) {
		return <RowLoading index={index} _timer={_timer} />;
	}
	if (!symbol || !symbol) return null;

	const { code: status } = quote || {};

	const isDisable = status && status !== 4;

	return (
		<TradeListActions
			ref={_actions}
			_trans={_trans}
			isIress={isIress}
			onSnap={onSnap}
			onAddToWl={onAddWatchList}
			onDeleteItem={onDeleteItem}
			onOpenNewOrder={onOpenNewOrder}
		>
			<BgForOpacity />
			<TouchableOpacity onPress={onPress} disabled={isDisable}>
				<View
					style={[styles.container, { opacity: isDisable ? 0.5 : 1 }]}
				>
					<LeftItem
						symbol={symbol}
						exchange={exchange}
						isNewsToday={isNewsToday}
					/>

					<RightItem
						symbol={symbol}
						exchange={exchange}
						quote={quote} />
				</View>
			</TouchableOpacity>
		</TradeListActions>
	);
};

Row = forwardRef(Row);
Row = React.memo(Row, (pre, next) => {
	if (_.isEqual(pre, next)) {
		return true;
	}

	return false;
});
export default Row;

const styles = {}
function getNewestStyle() {
	const newStyle = StyleSheet.create({
		bg: {
			width: '100%',
			height: '100%',
			position: 'absolute'
		},

		rowContainer: { width: WIDTH_DEVICE },
		container: {
			// height: '100%',
			backgroundColor: CommonStyle.navigatorSpecial.navBarBackgroundColor2,
			borderRadius: 8,
			flexDirection: 'row',
			height: HEIGHT_ROW,
			marginBottom: HEIGHT_SEPERATOR,
			marginHorizontal: 8,
			paddingHorizontal: 16,
			paddingVertical: 8
		},
		content: {
			flexDirection: 'row'
		},
		rightItem: {
			justifyContent: 'center',
			alignItems: 'flex-end'
		},
		leftItem: { flex: 1, justifyContent: 'space-between' },
		row1: {
			alignItems: 'center',
			flexDirection: 'row'
		},
		viewLoading: {
			borderRadius: 4,
			backgroundColor: '#ffffff30'
		},
		row2: { position: 'absolute', width: '100%' },
		leftContainer: {
			flex: 1,
			justifyContent: 'space-between',
			overflow: 'visible'
		},
		leftContent: {
			alignItems: 'center',
			flexDirection: 'row'
		}
	});
	PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)
