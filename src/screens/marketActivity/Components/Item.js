import React, {
	useCallback,
	useRef,
	useEffect,
	useLayoutEffect,
	useMemo
} from 'react';
import {
	StyleSheet,
	TouchableOpacity,
	View,
	Text,
	Dimensions
} from 'react-native';
import _ from 'lodash';
import Animated from 'react-native-reanimated';

import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func';
import {
	HaltIcon,
	ViewLoading,
	BgForOpacity
} from '~s/watchlist/TradeList/tradeList.row';
import * as Business from '~/business';
import DisplayName from '~s/watchlist/Component/DisplayName';
import CompanyName from '~s/watchlist/Component/CompanyName';
import PriceValue from '~s/watchlist/Component/PriceValue';
import BasePricePercent from '~s/watchlist/Component/PricePercent';
import * as FuncUtil from '~/lib/base/functionUtil';
import Enum from '~/enum';
import { GROUP } from '~/screens/marketActivity/Views/HeaderFilter.js';
import { HEIGHT_SEPERATOR, HEIGHT_ROW_MARKET_INFO } from '~s/watchlist/enum';
import { dataStorage } from '~/storage';
import ScreenId from '~/constants/screen_id';
import TradeListActions, {
	LeftContent
} from '~/screens/marketActivity/market.actions.js';
import { getDecimalPriceBySymbolExchange } from '~/screens/new_order/Controller/InputController.js';
import { registerInteractable } from '~/screens/marketActivity/Models/MarketActivityModel.js';
import {
	DEFAULT_COLOR,
	UP_COLOR,
	DOWN_COLOR
} from '~s/watchlist/Component/Progressbar';
import Interactable from '~/component/Interactable/';
import {
	getSnapPoint,
	ACTIONS_WIDTH
} from '~s/watchlist/TradeList/tradelist.func';
import { shallowEqual, useSelector } from 'react-redux';
import { handleShowAlertLog } from '~s/alertLog/Controller/SwitchController';
const { width: DEVICE_WIDTH } = Dimensions.get('window');
export const HEIGHT_ROW = 84;
const PRICE_DECIMAL = Enum.PRICE_DECIMAL;
const SNAP_POINT = {
	LEFT: ACTIONS_WIDTH,
	MIDDLE: 0,
	RIGHT: 0
};
const POSITION_DISTANCE = {
	TOP: HEIGHT_ROW - 19 - 19,
	MIDDLE: HEIGHT_ROW - 19,
	BOTTOM: HEIGHT_ROW
};
const { block, cond, set, add, and, or, eq, Value, Code } = Animated;
export const RowLoading = ({ _timer, index, duration = 1000, isLoading }) => {
	if (!isLoading) return null;
	const nextRowTimout = 50;
	const durationRow = 300;
	const inputRange = [
		0,
		index * nextRowTimout,
		index * nextRowTimout + durationRow,
		duration
	];
	const outputRange = [0, 0, 1, 1];

	let opacity = 1;
	if (index * nextRowTimout + durationRow <= duration) {
		opacity = Animated.interpolate(_timer, {
			inputRange,
			outputRange
		});
	}

	return (
		<View
			style={{
				position: 'absolute',
				width: '100%',
				height: '100%',
				backgroundColor: CommonStyle.backgroundColor1
			}}
		>
			<Animated.View style={[styles.container, { opacity }]}>
				<View style={styles.leftItem}>
					<ViewLoading
						width={78}
						height={23}
						style={{ marginBottom: 8 }}
					/>
					<ViewLoading
						width={50}
						height={23}
						style={{ marginBottom: 8 }}
					/>
				</View>

				<View style={styles.rightItem}>
					<ViewLoading
						width={50}
						height={24}
						style={{ marginBottom: 8 }}
					/>
					<ViewLoading width={70} height={24} />
				</View>
			</Animated.View>
		</View>
	);
};

const PricePercent = (props) => (
	<View style={{ flexDirection: 'row' }}>
		<BasePricePercent {...props} />
	</View>
);

const PriceVolume = ({
	isLargeValue,
	value,
	style,
	colorFlag,
	decimal = PRICE_DECIMAL.VOLUME
}) => {
	let color = DEFAULT_COLOR;
	let title = ' --';
	if (value) {
		// Large value volume / value
		if (isLargeValue) {
			color = CommonStyle.fontWhite;
			title = FuncUtil.largeValue(value, 2);
		} else {
			// Normal value change point / change percent
			title = ' ';
			if (colorFlag || colorFlag === 0) {
				if (+colorFlag >= 0) {
					title += '+';
					color = CommonStyle.fontOceanGreen;
				} else {
					// title += '-';
					color = CommonStyle.fontNewRed;
				}
			}
			title += FuncUtil.formatNumberNew2(value, decimal);
		}
	}
	if (value === 0) {
		color = CommonStyle.fontWhite;
		title = '0.00';
	}

	return (
		<Text
			numberOfLines={1}
			textAlign="right"
			style={[
				{
					fontFamily: CommonStyle.fontPoppinsMedium,
					fontSize: CommonStyle.font21,
					color
				},
				style
			]}
		>
			{title}
		</Text>
	);
};
const PriceChangePoint = ({
	isLargeValue,
	value,
	style,
	colorFlag,
	decimal = PRICE_DECIMAL.IRESS_PRICE
}) => {
	let color = DEFAULT_COLOR;
	let title = ' --';
	if (value) {
		// Large value volume / value
		if (isLargeValue) {
			color = CommonStyle.fontWhite;
			title = FuncUtil.largeValue(value, 2);
		} else {
			// Normal value change point / change percent
			title = ' ';
			if (colorFlag || colorFlag === 0) {
				if (+colorFlag >= 0) {
					title += '+';
					color = CommonStyle.fontGreenNew;
				} else {
					// title += '-';
					color = CommonStyle.fontNewRed;
				}
			}
			title += FuncUtil.formatNumberPrice(value, decimal);
		}
	}
	if (value === 0) {
		color = CommonStyle.fontWhite;
	}

	return (
		<Text
			numberOfLines={1}
			textAlign="right"
			style={[
				{
					fontFamily: CommonStyle.fontPoppinsMedium,
					fontSize: CommonStyle.font21,
					color
				},
				style
			]}
		>
			{title}
		</Text>
	);
};
const RightInfo = ({
	typeWatchlist,
	volume,
	value,
	changePercent,
	changePoint,
	symbol,
	exchange
}) => {
	// const decimal = getDecimalPriceBySymbolExchange({ symbol, exchange })
	const decimal = getDecimalPriceBySymbolExchange({ symbol, exchange });
	switch (typeWatchlist) {
		case GROUP.PERCENT_UP:
		case GROUP.PERCENT_DOWN:
			return (
				<View style={styles.rightContainer}>
					<PricePercent
						value={changePercent}
						colorFlag={changePoint}
						style={{
							fontSize: CommonStyle.font21
						}}
					/>
					<PriceChangePoint
						decimal={decimal}
						value={changePoint || 0}
						colorFlag={changePoint}
						style={{
							fontSize: CommonStyle.font17
						}}
					/>
				</View>
			);
		case GROUP.POINTS_UP:
		case GROUP.POINTS_DOWN:
			return (
				<View style={styles.rightContainer}>
					<PriceChangePoint
						decimal={decimal}
						value={changePoint || 0}
						colorFlag={changePoint}
					/>
					<PricePercent
						value={changePercent}
						colorFlag={changePoint}
						style={{
							fontSize: CommonStyle.font17
						}}
					/>
				</View>
			);
		case GROUP.VALUE:
			return (
				<View style={styles.rightContainer}>
					<PriceVolume
						isLargeValue
						value={value || 0}
						colorFlag={changePoint}
					/>
					<PricePercent
						value={changePercent}
						colorFlag={changePoint}
						style={{
							fontSize: CommonStyle.font17
						}}
					/>
				</View>
			);
		case GROUP.VOLUME:
			return (
				<View style={styles.rightContainer}>
					<PriceVolume
						isLargeValue
						value={volume || 0}
						colorFlag={changePoint}
					/>
					<PricePercent
						value={changePercent}
						colorFlag={changePoint}
						style={{
							fontSize: CommonStyle.font17
						}}
					/>
				</View>
			);
		default:
			return null;
			break;
	}
};
const CompanyNameWrapper = ({ symbol, exchange }) => {
	const companyName = Business.getCompanyName({ symbol, exchange });
	const isLoadingSymbolInfo = useSelector(
		(state) => state.marketActivity.isLoadingSymbolInfo,
		shallowEqual
	);
	return <CompanyName value={companyName} />;
};
const LeftInfo = ({ symbol, exchange, tradePrice, changePoint }) => {
	const symbolName = symbol && exchange ? symbol + '.' + exchange : '';
	return (
		<View style={styles.leftContainer}>
			<View style={styles.leftContent}>
				<HaltIcon symbol={symbol} exchange={exchange} />
				<DisplayName title={symbolName} />
			</View>

			<CompanyNameWrapper {...{ symbol, exchange }} />

			<PriceValue
				exchange={exchange}
				symbol={symbol}
				value={tradePrice}
				colorFlag={changePoint}
				resetFlag={symbol + exchange}
				style={{
					fontSize: CommonStyle.font17
				}}
			/>
		</View>
	);
};

export default ({
	item,
	typeWatchlist,
	index,
	showAddToWl,
	onRowPress,
	showNewOrder,
	onNewAlertLog
}) => {
	const {
		symbol,
		exchange,
		trade_price: tradePrice,
		change_percent: changePercent,
		change_point: changePoint,
		volume,
		total_value: totalValue
	} = item || {};
	const _deltaX = useMemo(() => {
		return new Value(0);
	}, []);
	const onDrag = useCallback((event) => {
		const { state } = event.nativeEvent;
		state === 'start' &&
			registerInteractable({ index, fn: closeInteractable });
	}, []);
	const closeInteractable = useCallback(() => {
		refInteractable.current &&
			refInteractable.current.snapTo &&
			refInteractable.current.snapTo({ index: 1 });
	}, []);
	const refInteractable = useRef();
	const handleShowAddToWl = useCallback(() => {
		closeInteractable();
		showAddToWl && showAddToWl({ symbol, exchange });
	}, [symbol, exchange]);
	const handleOnPressRow = useCallback(() => {
		closeInteractable();
		onRowPress && onRowPress({ symbol, exchange });
	}, [symbol, exchange]);
	const handleShowNewOrder = useCallback(() => {
		closeInteractable();
		showNewOrder &&
			showNewOrder({
				symbol,
				exchange,
				onHideAll: () => {
					dataStorage.currentScreenId = ScreenId.MARKET_ACTIVITY;
				}
			});
	}, [symbol, exchange]);
	const handleShowonNewAlertLog = useCallback(() => {
		closeInteractable();
		handleShowAlertLog({ symbol, exchange });
	}, [symbol, exchange]);
	return (
		<View
			style={{
				height: HEIGHT_ROW,
				paddingHorizontal: 8
			}}
		>
			<LeftContent
				onOpenNewOrder={handleShowNewOrder}
				_trans={_deltaX}
				onAddToWl={handleShowAddToWl}
				onNewAlertLog={handleShowonNewAlertLog}
			/>
			<Interactable.View
				style={{
					backgroundColor: CommonStyle.backgroundColor1
				}}
				horizontalOnly={true}
				snapPoints={[
					{ x: SNAP_POINT.LEFT },
					{ x: SNAP_POINT.MIDDLE },
					{ x: SNAP_POINT.RIGHT }
				]}
				animatedValueX={_deltaX}
				boundaries={{
					left: 0,
					right: DEVICE_WIDTH - 8 * 2 + SNAP_POINT.RIGHT,
					bounce: 0
				}}
				onDrag={onDrag}
				ref={refInteractable}
			>
				<TouchableOpacity
					onPress={handleOnPressRow}
					style={{
						backgroundColor: CommonStyle.backgroundColor1
					}}
				>
					<View style={styles.container}>
						<LeftInfo
							symbol={symbol}
							exchange={exchange}
							tradePrice={tradePrice}
							changePoint={changePoint}
						/>
						<RightInfo
							symbol={symbol}
							exchange={exchange}
							typeWatchlist={typeWatchlist}
							value={totalValue}
							volume={volume}
							changePercent={changePercent}
							changePoint={changePoint}
						/>
					</View>
				</TouchableOpacity>
			</Interactable.View>
		</View>
	);
};

const styles = {};
function getNewestStyle() {
	const newStyle = StyleSheet.create({
		container: {
			backgroundColor:
				CommonStyle.navigatorSpecial.navBarBackgroundColor2,
			borderRadius: 8,
			flexDirection: 'row',
			height: HEIGHT_ROW_MARKET_INFO,
			marginBottom: HEIGHT_SEPERATOR,
			// marginHorizontal: 8,
			paddingHorizontal: 16,
			paddingVertical: 8
		},
		leftContainer: { flex: 1, justifyContent: 'space-between' },
		leftContent: {
			alignItems: 'center',
			flexDirection: 'row'
		},
		rightContainer: {
			justifyContent: 'space-between',
			alignItems: 'flex-end'
		},
		leftItem: { flex: 1, justifyContent: 'space-between' },
		rightItem: {
			justifyContent: 'center',
			alignItems: 'flex-end'
		}
	});
	PureFunc.assignKeepRef(styles, newStyle);
}
getNewestStyle();
register(getNewestStyle);
