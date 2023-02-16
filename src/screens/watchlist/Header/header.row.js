import React, { Component } from 'react';
import {
	View,
	Text,
	TouchableOpacity as RNTouch,
	Platform
} from 'react-native';
import _ from 'lodash';
import { connect } from 'react-redux';
import Animated from 'react-native-reanimated';

import { TouchableOpacity as GestureTouch } from 'react-native-gesture-handler';

import * as FuncUtil from '~/lib/base/functionUtil';
import { getDisplayName } from '~/business';
import Enum from '~/enum';
import CommonStyle from '~/theme/theme_controller';
import { HEIGHT_ROW_HEADER, WIDTH_ROW_HEADER } from '../enum';

import PriceValue from '../Component/PriceValue';
import PricePercent from '../Component/PricePercent';
import { DEFAULT_COLOR, UP_COLOR, DOWN_COLOR } from '../Component/Progressbar';
import { getDecimalPriceBySymbolExchange } from '~/screens/new_order/Controller/InputController.js';
const { PRICE_DECIMAL } = Enum;
const TouchableOpacity = Platform.OS === 'android' ? GestureTouch : RNTouch;

export class HeaderRow extends Component {
	constructor(props) {
		super(props);
		if (this.props.setRef) {
			this.props.setRef(this);
		}
	}

	renderCompanyName(displayName) {
		return (
			<Text
				numberOfLines={1}
				style={{
					fontFamily: CommonStyle.fontPoppinsBold,
					fontSize: CommonStyle.font15,
					color: CommonStyle.color.turquoiseBlueHex,
					lineHeight: CommonStyle.font15 + 6
				}}
			>
				{displayName}
			</Text>
		);
	}

	renderChangeValue(changePoint) {
		const { symbol, exchange } = this.props;
		// const decimal = getDecimalPriceBySymbolExchange({ symbol, exchange })
		const decimal = getDecimalPriceBySymbolExchange({ symbol, exchange });
		let color = DEFAULT_COLOR;
		let title = FuncUtil.formatNumberPrice(changePoint, decimal);
		if (changePoint) {
			if (+changePoint >= 0) {
				color = CommonStyle.fontGreen1;
				title = '+' + title;
			} else {
				color = CommonStyle.fontNewRed;
			}
		}

		if (changePoint === 0) {
			color = CommonStyle.fontWhite;
		}

		return (
			<Text
				numberOfLines={1}
				textAlign="right"
				style={{
					fontFamily: CommonStyle.fontPoppinsRegular,
					fontSize: CommonStyle.fontTiny,
					color,
					flex: 1
				}}
			>
				{title}
			</Text>
		);
	}

	render() {
		const {
			change_point: changePoint,
			change_percent: changePercent,
			trade_price: priceValue
		} = this.props.data || {};
		const { symbol, exchange } = this.props; // Fix exception symbol, exchange with out quote obj
		const symbolName = getDisplayName({ symbol, exchange });
		const onRowPress = () => this.props.onRowPress(symbol, exchange);
		return (
			<Animated.View
				key={symbol}
				style={{
					width: WIDTH_ROW_HEADER,
					height: HEIGHT_ROW_HEADER,
					paddingLeft: 4,
					backgroundColor: CommonStyle.backgroundColor
				}}
			>
				<TouchableOpacity onPress={onRowPress}>
					<View
						style={{
							flexDirection: 'row',
							borderWidth: 1,
							borderColor: CommonStyle.fontDark3,
							borderRadius: 8
						}}
					>
						<View
							style={{
								paddingHorizontal: 8,
								paddingVertical: 4,
								width: '100%'
							}}
						>
							{this.renderCompanyName(symbolName)}
							<PriceValue
								exchange={exchange}
								symbol={symbol}
								value={priceValue}
								colorFlag={changePoint}
								style={{
									fontFamily: CommonStyle.fontPoppinsRegular,
									fontSize: CommonStyle.font13,
									paddingBottom: 2
								}}
							/>
							<View
								style={{
									width: '100%',
									flexDirection: 'row'
								}}
							>
								{this.renderChangeValue(changePoint)}
								<PricePercent
									value={changePercent}
									colorFlag={changePoint}
									style={{
										fontFamily:
											CommonStyle.fontPoppinsRegular,
										fontSize: CommonStyle.fontTiny
									}}
								/>
							</View>
						</View>
					</View>
				</TouchableOpacity>
			</Animated.View>
		);
	}
}

const mapStateToProps = (state, { symbol, exchange, data, isLoading }) => {
	let dataAsResult = data;
	let detailLoading = isLoading;
	if (!dataAsResult) {
		dataAsResult = state.quotes.data[symbol + '#' + exchange] || false;
	}

	if (_.isNil(detailLoading)) {
		detailLoading =
			state.loading.effects.quotes.getSnapshot ||
			state.loading.effects.trades.getSnapshot ||
			state.loading.effects.depths.getSnapshot;
	}

	return {
		data: dataAsResult,
		isLoading: detailLoading
	};
};

export default connect(mapStateToProps, null, null, { forwardRef: true })(
	HeaderRow
);
