import React, { Component } from 'react';
import { Text } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import { DEFAULT_COLOR, UP_COLOR, DOWN_COLOR } from './Progressbar';
import CommonStyle from '~/theme/theme_controller';
import * as FuncUtil from '~/lib/base/functionUtil';
import Enum from '~/enum';
import CONFIG from '~/config';
import { getDecimalPriceBySymbolExchange } from '~/screens/new_order/Controller/InputController.js';
const PRICE_DECIMAL = Enum.PRICE_DECIMAL;

export default class PriceChangePoint extends Component {
	render() {
		const { style, value, isMPRC, symbol, exchange } = this.props;
		// const decimal = getDecimalPriceBySymbolExchange({ symbol, exchange })
		const decimal = getDecimalPriceBySymbolExchange({ symbol, exchange });
		let color = DEFAULT_COLOR;
		let title = '';
		if (value) {
			if (+value >= 0) {
				if (!isMPRC) {
					title += '+';
				}
				color = CommonStyle.fontGreenNew;
			} else {
				color = CommonStyle.fontNewRed;
			}
		}
		title += FuncUtil.formatNumberPrice(value, decimal);

		return (
			<Text
				numberOfLines={1}
				textAlign="right"
				style={[
					{
						fontFamily: CommonStyle.fontPoppinsMedium,
						fontSize: CommonStyle.fontSizeXS,
						color
					},
					style
				]}
			>
				{title}{' '}
			</Text>
		);
	}
}
