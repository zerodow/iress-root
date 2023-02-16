import React from 'react';
import {
	StyleSheet,
	Text,
	View,
	TouchableOpacity,
	Dimensions
} from 'react-native';
import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func';
import SvgIcon from '~/component/svg_icon/SvgIcon.js';
import I18n from '~/modules/language/';
import {
	Text as TextLoading,
	View as ViewLoading
} from '~/component/loading_component';
import { getFromCurrency } from '~s/portfolio/Model/PortfolioAccountModel';
import { getDecimalPriceByRule } from '~/screens/new_order/Controller/InputController';
import { formatNumberNew2 } from '~/lib/base/functionUtil';
import Enum from '~/enum';
import { convertedCurrentcyFormat } from '~s/confirm_order/Controllers/ContentController';
const { width } = Dimensions.get('window');
const oneHundred = 100;

const checkColorEst = (isColor) => {
	if (!isColor) {
		return CommonStyle.fontWhite;
	} else if (isColor === '--') {
		return CommonStyle.fontWhite;
	} else {
		return CommonStyle.fontRed;
	}
};
function ButtonStopLoss() {
	return (
		<View
			style={{
				backgroundColor: CommonStyle.color.turquoiseBlue,
				width: 101,
				alignItems: 'center',
				justifyContent: 'center',
				paddingVertical: 18,
				borderRadius: 8
			}}
		>
			<Text
				style={{
					color: CommonStyle.color.dark,
					fontSize: CommonStyle.font13,
					fontFamily: CommonStyle.fontPoppinsRegular
				}}
			>
				{I18n.t('stoploss')}
			</Text>
		</View>
	);
}
function StopPrice(props) {
	const fromCurrency = getFromCurrency();
	let stopPrice = props.stopPrice;

	let decimal = getDecimalPriceByRule();
	if (decimal === 1) {
		decimal = 2;
		stopPrice = stopPrice / oneHundred;
	}

	// getDecimalPriceBySymbolExchange
	return (
		<View style={styles.stopLoss}>
			<Text style={[styles.txtStopLoss, { opacity: 0.5 }]}>
				{I18n.t('stop_price') + ` (${fromCurrency}):`}
			</Text>
			<SvgIcon
				size={16}
				name="greaterThanOrEqualTo"
				color={CommonStyle.fontColor}
			/>
			<Text
				style={[styles.txtStopLoss, { color: CommonStyle.fontColor }]}
			>
				{formatNumberNew2(stopPrice, decimal)}
			</Text>
		</View>
	);
}
function EstLoss(props) {
	let { estLoss, isLoading } = props;
	const fromCurrency = getFromCurrency();

	let decimal = getDecimalPriceByRule();
	if (decimal === 1) {
		decimal = 2;
		estLoss = estLoss / oneHundred;
	}
	return (
		<View style={styles.estLoss}>
			<Text style={[styles.txtStopLoss, { opacity: 0.5 }]}>
				{I18n.t('est_loss') + ` (${fromCurrency}):`}
			</Text>
			<TextLoading
				isLoading={isLoading}
				style={[styles.txtStopLoss, { color: checkColorEst(estLoss) }]}
			>
				{formatNumberNew2(estLoss, decimal)}
			</TextLoading>
		</View>
	);
}
export default function RowStopLoss(props) {
	const { stopPrice, estLoss, isLoading } = props;
	const fromCurrency = getFromCurrency();
	return (
		<View
			style={{
				flexDirection: 'row',
				justifyContent: 'flex-end',
				alignItems: 'center',
				marginTop: 8
			}}
		>
			<View style={{ position: 'absolute', left: 8, zIndex: 100 }}>
				<ButtonStopLoss></ButtonStopLoss>
			</View>
			<View
				style={{
					borderWidth: 1,
					borderColor: CommonStyle.color.turquoiseBlue,
					justifyContent: 'center',
					flexDirection: 'column',
					alignItems: 'flex-end',
					borderRadius: CommonStyle.fontMin,
					marginRight: 8,
					width: width - 48,
					marginLeft: 32
				}}
			>
				<StopPrice
					toCurrency={fromCurrency}
					stopPrice={stopPrice}
				></StopPrice>
				<EstLoss
					toCurrency={fromCurrency}
					estLoss={estLoss}
					isLoading={isLoading}
				></EstLoss>
			</View>
		</View>
	);
}

const styles = {};
function getNewestStyle() {
	const newStyle = StyleSheet.create({
		stopLoss: {
			flexDirection: 'row',
			alignItems: 'center',
			paddingTop: 8,
			paddingRight: 8
		},
		txtStopLoss: {
			color: CommonStyle.fontColor,
			fontSize: CommonStyle.font11,
			fontFamily: CommonStyle.fontPoppinsRegular,
			marginRight: 4
		},
		estLoss: {
			flexDirection: 'row',
			alignItems: 'center',
			paddingTop: 4,
			paddingRight: 8,
			paddingBottom: 8
		}
	});
	PureFunc.assignKeepRef(styles, newStyle);
}
getNewestStyle();
register(getNewestStyle);
