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
import { getDecimalPriceByRule } from '~/screens/new_order/Controller/InputController.js';
import { convertedCurrentcyFormat } from '~s/confirm_order/Controllers/ContentController';
import { formatNumberNew2 } from '~/lib/base/functionUtil';
import Enum from '~/enum';
const oneHundred = 100;
const currency = '$';
const { width } = Dimensions.get('window');

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
				{I18n.t('take_profit')}
			</Text>
		</View>
	);
}
function TakeProfitPrice(props) {
	const fromCurrency = getFromCurrency();
	let decimal = getDecimalPriceByRule();
	let profitPrice = props.profitPrice;
	if (decimal === 1) {
		decimal = 2;
		profitPrice = profitPrice / oneHundred;
	}

	return (
		<View style={styles.stopLoss}>
			<Text style={[styles.txtStopLoss, { opacity: 0.5 }]}>
				{I18n.t('take_profit_price') + ` (${fromCurrency})`}:
			</Text>
			<SvgIcon
				size={16}
				name="lessThanOrEqualTo"
				color={CommonStyle.fontColor}
			/>
			<Text
				style={[styles.txtStopLoss, { color: CommonStyle.fontColor }]}
			>
				{formatNumberNew2(profitPrice, decimal)}
			</Text>
		</View>
	);
}
function EstProfit(props) {
	let { estProfit, isLoading } = props;
	const fromCurrency = getFromCurrency();
	const checkColorEst = (estProfit) => {
		if (!estProfit || estProfit === '--') {
			return CommonStyle.fontWhite;
		} else {
			return CommonStyle.color.buy;
		}
	};

	let decimal = getDecimalPriceByRule();
	if (decimal === 1) {
		decimal = 2;
		estProfit = estProfit / oneHundred;
	}
	return (
		<View style={styles.estLoss}>
			<Text style={[styles.txtStopLoss, { opacity: 0.5 }]}>
				{I18n.t('est_profit') + ` (${fromCurrency}):`}
			</Text>
			<TextLoading
				isLoading={isLoading}
				style={[
					styles.txtStopLoss,
					{ color: checkColorEst(estProfit) }
				]}
			>
				{formatNumberNew2(estProfit, decimal)}
			</TextLoading>
		</View>
	);
}
export default function RowTakeProfit(props) {
	const { profitPrice, estProfit, isLoading } = props;
	const fromCurrency = getFromCurrency();
	return (
		<View
			style={{
				flexDirection: 'row',
				justifyContent: 'flex-end',
				alignItems: 'center',
				marginTop: 16,
				marginBottom: 16
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
				<TakeProfitPrice
					toCurrency={fromCurrency}
					profitPrice={profitPrice}
				></TakeProfitPrice>
				<EstProfit
					toCurrency={fromCurrency}
					estProfit={estProfit}
					isLoading={isLoading}
				></EstProfit>
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
