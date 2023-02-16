import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import _ from 'lodash';
import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func';
import { formatNumberNew2 } from '~/lib/base/functionUtil';
import Enum from '~/enum';
import I18n from '~/modules/language/';
import {
	getAccActive,
	getPorfolioTypeByCode,
	getFromCurrency
} from '~s/portfolio/Model/PortfolioAccountModel';
import { useShadow } from '~/component/shadow/SvgShadow';
import { getDecimalPriceByRule } from '~/screens/new_order/Controller/InputController.js';
import {
	Text as TextLoading,
	View as ViewLoading
} from '~/component/loading_component';
import { useSelector } from 'react-redux';
import { getInitialMargin } from '~/screens/confirm_order/HandleGetInitialMargin';
import { convertedCurrentcyFormat } from '~s/confirm_order/Controllers/ContentController';
function EstNetValue(props) {
	const { estNetValue, isLoading } = props;
	const fromCurrency = getFromCurrency();
	const colorEstNetValue = estNetValue
		? CommonStyle.color.turquoiseBlue
		: CommonStyle.fontWhite;

	const displayValue =
		getDecimalPriceByRule() === 1 ? estNetValue / 100 : estNetValue;

	return (
		<View style={styles.orderStyle}>
			<Text style={styles.txtOrderStyleTitle}>
				{I18n.t('est_net_value') + ` (${fromCurrency})`}
			</Text>
			<TextLoading
				numberOfLines={2}
				containerStyle={{
					alignSelf: 'flex-end'
				}}
				wrapperStyle={{ flex: 1 }}
				isLoading={isLoading}
				style={[styles.txtOrderStyleTitle, { color: colorEstNetValue }]}
			>
				{formatNumberNew2(
					convertedCurrentcyFormat(displayValue),
					Enum.PRICE_DECIMAL.VALUE
				)}
			</TextLoading>
		</View>
	);
}
function EstInitialMargin({ isLoading, estInitialMargin }) {
	const fromCurrency = getFromCurrency();
	const colorInitMargin = estInitialMargin
		? CommonStyle.color.turquoiseBlue
		: CommonStyle.fontWhite;

	const displayValue =
		getDecimalPriceByRule() === 1
			? estInitialMargin / 100
			: estInitialMargin;

	return (
		<View style={styles.orderStyle}>
			<Text style={styles.txtOrderStyleTitle}>
				{I18n.t('estinital_margin') + ` (${fromCurrency})`}
			</Text>
			<TextLoading
				isLoading={isLoading}
				style={[styles.txtOrderStyleTitle, { color: colorInitMargin }]}
			>
				{formatNumberNew2(
					convertedCurrentcyFormat(displayValue),
					Enum.PRICE_DECIMAL.VALUE
				)}
			</TextLoading>
		</View>
	);
}
function Lifetime(props) {
	const { lifetime } = props;
	return (
		<View style={styles.orderStyle}>
			<Text style={styles.txtOrderStyle}>{I18n.t('lifetime')}</Text>
			<Text style={styles.txtOrderStyle}>{lifetime || '--'}</Text>
		</View>
	);
}
export default function RowEstNetValue(props) {
	const [ShadowRowInfoPrice, onLayout] = useShadow();
	const { lifetime, estNetValue, isLoading } = props;
	const accActive = getAccActive();
	const typeOder = getPorfolioTypeByCode(accActive);

	const isLoadingInitialMargin = useSelector(
		(state) => state.confirmPlaceOrder.isLoadingInitialMargin
	);

	const noNetValue = _.isNil(estNetValue) || _.isNaN(estNetValue);

	const estInitialMargin = getInitialMargin();

	const noInitialMargin =
		_.isNil(estInitialMargin) || _.isNaN(estInitialMargin);

	if (noNetValue && noInitialMargin) {
		return null;
	}

	if (typeOder === 'cfd') {
		return (
			<View style={{ backgroundColor: CommonStyle.backgroundColor }}>
				<View
					style={{
						marginLeft: 8,
						marginRight: 8,
						marginTop: 8
					}}
				>
					{!noNetValue && (
						<EstNetValue
							isLoading={isLoading}
							estNetValue={estNetValue}
						/>
					)}
					{isLoading ? <View style={{ height: 2 }} /> : null}

					{!noInitialMargin && (
						<EstInitialMargin
							isLoading={isLoadingInitialMargin}
							estInitialMargin={estInitialMargin}
						/>
					)}
					{isLoading ? <View style={{ height: 2 }} /> : null}
					<Lifetime lifetime={lifetime}></Lifetime>
				</View>
				<ShadowRowInfoPrice />
			</View>
		);
	}

	if (noNetValue) return null;
	return (
		<View
			style={{
				backgroundColor: CommonStyle.backgroundColor,
				marginBottom: 16
			}}
		>
			<View
				style={{
					backgroundColor: CommonStyle.backgroundColor,
					marginTop: 8
				}}
			></View>
			<View
				style={{
					marginLeft: 8,
					marginRight: 8
				}}
			>
				<EstNetValue
					isLoading={isLoading}
					estNetValue={estNetValue}
				></EstNetValue>
				<Lifetime lifetime={lifetime}></Lifetime>
			</View>
		</View>
	);
}
const styles = {};
function getNewestStyle() {
	const newStyle = StyleSheet.create({
		orderStyle: {
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'baseline'
		},
		txtOrderStyleTitle: {
			color: CommonStyle.fontWhite,
			fontSize: CommonStyle.font13,
			fontFamily: CommonStyle.fontPoppinsRegular,
			marginLeft: 8,
			marginRight: 8,
			marginBottom: 8
		},
		txtOrderStyle: {
			color: CommonStyle.fontWhite,
			fontSize: CommonStyle.font11,
			fontFamily: CommonStyle.fontPoppinsRegular,
			marginLeft: 8,
			marginRight: 8,
			marginBottom: 8
		}
	});
	PureFunc.assignKeepRef(styles, newStyle);
}
getNewestStyle();
register(getNewestStyle);
