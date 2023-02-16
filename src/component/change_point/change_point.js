import React, { useMemo } from 'react';
import { Text } from 'react-native';
import {
	formatNumberPrice
} from '~/lib/base/functionUtil';
import CommonStyle from '~/theme/theme_controller';
import ENUM from '~/enum';
import { getColorByValue } from '~/business';
import { getDecimalPriceBySymbolExchange } from '~/screens/new_order/Controller/InputController.js';
const { PRICE_DECIMAL } = ENUM;
function getFullDisplayValue(value) {
	if (value > 0) return '+' + value;
	if (value < 0) return value;
	return value;
}
const ChangePoint = ({ value, exchange, symbol }) => {
	// const decimal = getDecimalPriceBySymbolExchange({ symbol, exchange })
	const decimal = getDecimalPriceBySymbolExchange({ symbol, exchange });
	const { displayValue, color } = useMemo(() => {
		return {
			displayValue: getFullDisplayValue(
				formatNumberPrice(value, decimal)
			),
			color: getColorByValue(value)
		};
	}, [value]);

	return (
		<Text
			style={{
				fontFamily: CommonStyle.fontPoppinsRegular,
				fontSize: CommonStyle.fontSizeS,
				color
			}}
		>
			{`${displayValue}`}
		</Text>
	);
};
export default ChangePoint;
