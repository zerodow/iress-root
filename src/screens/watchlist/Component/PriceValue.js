import React, { Component } from 'react';
import { Text, View, Animated } from 'react-native';
import _ from 'lodash';

import Enum from '~/enum';
import CommonStyle from '~/theme/theme_controller';
import * as FuncUtil from '~/lib/base/functionUtil';
import { snapTo2 } from '../Component/NestedScroll/handleFunc';
import { getDecimalPriceBySymbolExchange } from '~/screens/new_order/Controller/InputController.js';

const PRICE_DECIMAL = Enum.PRICE_DECIMAL;

const DURATION = 600;

export default class PriceValue extends Component {
	constructor(props) {
		super(props);
		this._value = new Animated.Value(100);

		this.rColor = CommonStyle.UP_COLOR[0];
		this.gColor = CommonStyle.UP_COLOR[1];
		this.bColor = CommonStyle.UP_COLOR[2];

		this.colorToCheckTheme = CommonStyle.UP_COLOR;
	}

	componentDidMount() {
		this.startFlashing(true);
	}

	componentWillUnmount() {
		this.curTimeout && clearTimeout(this.curTimeout);
		this.curTimeout = null;
	}

	componentWillReceiveProps(nextProps) {
		const isDown = this.props.value < nextProps.value;
		const isUp = this.props.value > nextProps.value;
		const isChangeFlag = this.props.resetFlag !== nextProps.resetFlag;

		if (isDown && !isChangeFlag) {
			this.rColor = CommonStyle.UP_COLOR[0];
			this.gColor = CommonStyle.UP_COLOR[1];
			this.bColor = CommonStyle.UP_COLOR[2];
		}
		if (isUp && !isChangeFlag) {
			this.rColor = CommonStyle.DOWN_COLOR[0];
			this.gColor = CommonStyle.DOWN_COLOR[1];
			this.bColor = CommonStyle.DOWN_COLOR[2];
		}

		if (isChangeFlag) {
			this.rColor = CommonStyle.UP_COLOR[0];
			this.gColor = CommonStyle.UP_COLOR[1];
			this.bColor = CommonStyle.UP_COLOR[2];
		}

		const themeChanged =
			!!this.colorToCheckTheme &&
			!!CommonStyle.UP_COLOR &&
			this.colorToCheckTheme.join(',') !== CommonStyle.UP_COLOR.join(',');
		if (themeChanged) {
			this.colorToCheckTheme = CommonStyle.UP_COLOR;
			this.rColor = CommonStyle.UP_COLOR[0];
			this.gColor = CommonStyle.UP_COLOR[1];
			this.bColor = CommonStyle.UP_COLOR[2];
		}

		if (
			(this.props.value !== nextProps.value && !nextProps.isLoading) ||
			themeChanged
		) {
			if (this.curTimeout) {
				clearTimeout(this.curTimeout);
			}
			this.curTimeout = setTimeout(() => {
				this.startFlashing();
				this.curTimeout = null;
			}, 300);
		}
	}

	startFlashing(isFirst) {
		if (!isFirst) {
			this._value.setValue(0);

			Animated.timing(this._value, {
				toValue: DURATION,
				duration: DURATION
			}).start();
		} else {
			const curValue = this._value._value;
			Animated.timing(this._value, {
				toValue: DURATION,
				duration: DURATION - curValue
			}).start();
		}
	}

	getOpacityColor() {
		return this._value.interpolate({
			inputRange: [0, 100, DURATION - 100, DURATION],
			outputRange: [0, 1, 1, 0]
		});
	}

	getPriceColor = () => {
		const endColor = `rgb(${this.rColor} , ${this.gColor} , ${this.bColor})`;

		return this._value.interpolate({
			inputRange: [0, DURATION - 1, DURATION, DURATION + 1],
			outputRange: [
				'rgb(255,255,255)',
				'rgb(255,255,255)',
				endColor,
				endColor
			]
		});
	};

	getDisplayValue = ({ value }) => {
		const { symbol, exchange } = this.props;
		if (symbol && exchange) {
			return FuncUtil.formatNumberPrice(value, getDecimalPriceBySymbolExchange({ symbol, exchange }));
		}
		return FuncUtil.formatNumberPrice(value, PRICE_DECIMAL.IRESS_PRICE);
	};
	render() {
		const { style, value, isRow } = this.props;
		if (_.isNil(value)) {
			return (
				<Text
					numberOfLines={1}
					textAlign="left"
					style={[
						{
							fontFamily: CommonStyle.fontPoppinsMedium,
							fontSize: CommonStyle.font21,
							color: CommonStyle.fontWhite
						},
						style
					]}
				>
					--
				</Text>
			);
		}
		const displayValue = this.getDisplayValue({ value });

		return (
			<View
				style={{
					flexDirection: 'row'
				}}
			>
				{isRow && <View style={{ flex: 1 }} />}
				<View>
					<Animated.View
						style={{
							position: 'absolute',
							top: 0,
							bottom: 0,
							left: -4,
							right: -4,
							borderRadius: 4,
							padding: 4,
							backgroundColor: `rgb(${this.rColor} , ${this.gColor} , ${this.bColor})`,
							opacity: this.getOpacityColor()
						}}
					/>
					<Animated.Text
						numberOfLines={1}
						textAlign="left"
						style={[
							{
								fontFamily: CommonStyle.fontPoppinsMedium,
								fontSize: CommonStyle.font17 + 1
							},
							style,
							{
								color: this.getPriceColor()
							}
						]}
					>
						{displayValue}
					</Animated.Text>
				</View>
			</View>
		);
	}
}
