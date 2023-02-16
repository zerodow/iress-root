import React from 'react';
import _ from 'lodash';

import { StyleSheet, View, TouchableOpacity, Image, Text } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSelector } from 'react-redux';

import * as Business from '~/business';
import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func';

import PriceChangePoint from '~s/watchlist/Component/PriceChangePoint';
import PricePercent from '~s/watchlist/Component/PricePercent';
import PriceValue from '~s/watchlist/Component/PriceValue';
import SVGIcon from '~s/watchlist/Component/Icon2';
import DisplayName from '~s/watchlist/Component/DisplayName';
import CompanyName from '~s/watchlist/Component/CompanyName';

import { ACTIONS_WIDTH } from '~s/watchlist/TradeList/tradelist.func';
import { HEIGHT_ROW } from '~s/watchlist/TradeList/tradeList.row';
import { INVALID } from '~s/watchlist/enum';
import { dataStorage } from '~/storage';

export const DELETE_WIDTH = 68;

const img = {
	delete: require('~/img/delete.png'),
	newAlert: require('~/img/newAlert.png'),
	newOrder: require('~/img/newOrder.png'),
	searchSymbol: require('~/img/searchSymbol.png')
};

const { add, cond, lessThan } = Animated;

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

export const TextError = ({ children }) => {
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

export const ViewLoading = ({ width = 50, height = 24, style }) => {
	const currentStyle = StyleSheet.flatten([
		styles.viewLoading,
		{ width, height },
		style
	]);
	return <View style={currentStyle} />;
};

export const NewIcon = ({ isLoading, isNewsToday }) => {
	if (!isNewsToday || isLoading) return null;
	return (
		<SVGIcon
			name="newsTag"
			color={CommonStyle.colorProduct}
			size={16}
			style={{ paddingRight: 8 }}
		/>
	);
};

export const HaltIcon = ({ isLoading, symbol, exchange }) => {
	const key = `${symbol}#${exchange}`;
	const { trading_halt: istradingHalt } = dataStorage.symbolEquity[key] || {};

	if (!istradingHalt || isLoading) return null;
	return (
		<SVGIcon
			name="tradingHaltTag"
			color={CommonStyle.fontShadowRed}
			size={16}
			style={{ paddingRight: 8 }}
		/>
	);
};

export const Icon = ({ disabled, onPress, style, stylesIcon, name }) => {
	const isDisabled = !onPress || disabled;

	const IconSelf = CommonStyle.icons[name];
	if (isDisabled) {
		return (
			<View style={[styles.item, style]}>
				<IconSelf style={[styles.iconDisable, stylesIcon]} />
			</View>
		);
	}

	return (
		<TouchableOpacity
			disabled={!onPress || disabled}
			onPress={onPress}
			style={[styles.item, style]}
		>
			<IconSelf style={[styles.icon, stylesIcon]} />
		</TouchableOpacity>
	);
};

export let LeftContent = ({
	_trans,
	onAddToWl,
	onOpenNewOrder,
	onCreateAler
}) => {
	return (
		<Animated.View
			style={[
				styles.container,
				{
					minWidth: ACTIONS_WIDTH + 8,
					height: HEIGHT_ROW - 3,
					width: add(16, _trans),
					opacity: cond(lessThan(_trans, -10), 0, 1)
				}
			]}
		>
			<Icon
				name="searchSymbol"
				onPress={onAddToWl}
				stylesIcon={{ tintColor: '#000000' }}
			/>
			<View style={styles.horizontalLine} />
			<Icon
				onPress={onOpenNewOrder}
				name="newOrder"
				stylesIcon={{ tintColor: '#000000' }}
			/>
			<View style={styles.horizontalLine} />
			<Icon
				onPress={onCreateAler}
				name="newAlert"
				stylesIcon={{ tintColor: '#000000' }}
			/>
		</Animated.View>
	);
};
// LeftContent = React.memo(LeftContent);

export let RightContent = ({ _trans, isIress, onDelete }) => {
	if (isIress) return null;
	return (
		<Animated.View
			style={[
				styles.container2,
				{
					minWidth: DELETE_WIDTH + 16,
					height: HEIGHT_ROW - 3,
					width: Animated.sub(16, _trans),
					opacity: Animated.cond(
						Animated.greaterThan(_trans, 10),
						0,
						1
					)
				}
			]}
		>
			<Icon
				name="delete"
				stylesIcon={{
					transform: [{ rotate: '337.5deg' }],
					tintColor: '#000000'
				}}
				onPress={onDelete}
			/>
		</Animated.View>
	);
};

RightContent = React.memo(RightContent);

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
// BgForOpacity = React.memo(BgForOpacity);

export const RightItem = ({ quote, symbol, exchange }) => {
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
				value={tradePrice}
				colorFlag={changePoint}
				symbol={symbol}
				exchange={exchange}
			/>
		);

		content.push(
			<View style={styles.content}>
				<View style={{ flexDirection: 'row' }}>
					{isMPRC ? (
						<Text
							style={{
								fontSize: CommonStyle.font11,
								fontFamily: CommonStyle.fontPoppinsRegular,
								color: CommonStyle.fontColor,
								paddingRight: 8
							}}
						>
							MPRC:
						</Text>
					) : null}

					<PriceChangePoint
						exchange={exchange}
						symbol={symbol}
						isMPRC={isMPRC}
						value={isMPRC ? mprc : changePoint}
					/>
				</View>

				<PricePercent
					value={isMPRC ? mprc : changePercent}
					colorFlag={isMPRC ? mprc : changePoint}
				/>
			</View>
		);
	}

	return <View style={styles.rightItem}>{content}</View>;
};

export const LeftItem = ({ symbol, exchange, isNewsToday }) => {
	const companyName = useSelector(
		(state) => state.priceBoard.symbolInfo[symbol + '#' + exchange]
	);
	// const companyName = Business.getCompanyName({ symbol, exchange });
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

export const ItemContainer = ({ index, data, children }) => {
	const { _trans } = data[index] || {};
	const transform = [{ translateY: _trans || 0 }];
	return (
		<Animated.View
			key={index}
			style={{
				width: '100%',
				position: 'absolute',
				transform
			}}
		>
			{children}
		</Animated.View>
	);
};

const styles = {};
function getNewestStyle() {
	const newStyle = StyleSheet.create({
		container: {
			position: 'absolute',
			left: 9,
			top: 1,
			paddingRight: 16,
			borderRadius: 8,
			backgroundColor: CommonStyle.color.turquoiseBlue,
			justifyContent: 'center',
			flexDirection: 'row'
		},
		container2: {
			position: 'absolute',
			right: 9,
			top: 1,
			paddingLeft: 16,
			borderRadius: 8,
			backgroundColor: CommonStyle.color.sell
		},
		horizontalLine: {
			height: '100%',
			borderRightWidth: 1,
			borderColor: CommonStyle.color.dusk_tabbar
		},
		item: {
			flex: 1,
			alignItems: 'center',
			justifyContent: 'center',
			height: '100%'
		},
		icon: {
			width: 22,
			height: 22
		},
		iconDisable: {
			width: 22,
			height: 22,
			opacity: 0.5
		},
		bg: {
			width: '100%',
			height: '100%',
			position: 'absolute'
		},
		rightItem: {
			justifyContent: 'center',
			alignItems: 'flex-end'
		},
		content: {
			flexDirection: 'row'
		},
		viewLoading: {
			borderRadius: 4,
			backgroundColor: '#ffffff30'
		},
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
	PureFunc.assignKeepRef(styles, newStyle);
}
getNewestStyle();
register(getNewestStyle);
