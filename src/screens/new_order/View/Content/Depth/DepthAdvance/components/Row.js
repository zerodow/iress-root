import React, {
	useEffect,
	useState,
	useCallback,
	useMemo,
	useRef
} from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func';

import {
	formatNumberNew2,
	formatNumberPrice
} from '~/lib/base/functionUtil';

import {
	Text as TextLoading,
	View as ViewLoading
} from '~/component/loading_component';

import Enum from '~/enum';
import { useSelector, shallowEqual, useDispatch } from 'react-redux';

import { changeLimitPrice } from '~/screens/new_order/Redux/actions';
import { getValueForRedux } from '~/screens/new_order/Controller/InputController';
import { setLimitPrice } from '~/screens/new_order/Model/PriceModel';
import { getDecimalPriceByRule } from '~/screens/new_order/Controller/InputController.js';
import * as Business from '~/business';
const { PRICE_DECIMAL, STEP } = Enum;
const Value = React.memo(
	({ value, style }) => {
		const isLoading = useSelector(
			(state) => state.newOrder.isLoading,
			shallowEqual
		);
		return (
			<TextLoading isLoading={isLoading} style={style}>
				{value}
			</TextLoading>
		);
	},
	(pre, next) => pre.value === next.value
);

const Row = ({ item, type = 'bid', disabled }) => {
	const dispatch = useDispatch();
	// const decimal = getDecimalPriceByRule()
	const decimal = getDecimalPriceByRule();
	const dic = useRef({ priceNotFormat: null });
	const { price, vol, percent, priceNotFormat } = useMemo(() => {
		const { bid, ask } = item;

		if (type === 'bid') {
			return {
				percent: `${bid.percent * 100}%`,
				price: formatNumberPrice(bid.price, decimal),
				vol: formatNumberNew2(bid.quantity, PRICE_DECIMAL.VOLUME),
				priceNotFormat: bid.price
			};
		}
		return {
			percent: `${ask.percent * 100}%`,
			price: formatNumberPrice(ask.price, decimal),
			vol: formatNumberNew2(ask.quantity, PRICE_DECIMAL.VOLUME),
			priceNotFormat: ask.price
		};
	}, [item]);
	dic.current.priceNotFormat = priceNotFormat;
	const handleFillPrice = useCallback(() => {
		Business.showButtonConfirm();
		if (
			getValueForRedux(
				dic.current.priceNotFormat,
				decimal,
				STEP.STEP_PRICE
			) === null
		)
			return;
		setLimitPrice(price);
		dispatch(
			changeLimitPrice(getValueForRedux(price, decimal, STEP.STEP_PRICE))
		);
	}, [price, decimal]);
	return (
		<TouchableOpacity disabled={disabled} onPress={handleFillPrice}>
			<View>
				<View
					style={[
						StyleSheet.absoluteFillObject,
						{
							width: percent,
							borderTopRightRadius: 8,
							borderBottomRightRadius: 8,
							backgroundColor:
								getValueForRedux(
									dic.current.priceNotFormat,
									PRICE_DECIMAL.PRICE_IRESS,
									STEP.STEP_PRICE
								) === null
									? CommonStyle.backgroundColor
									: type === 'bid'
									? CommonStyle.backgroundBid
									: CommonStyle.backgroundAsk
						}
					]}
				/>
				<View
					style={{
						flexDirection: 'row',
						justifyContent: 'space-between',
						paddingVertical: 6,
						paddingLeft: 8,
						paddingRight: 8
					}}
				>
					<Value
						style={
							type === 'bid' ? styles.priceBid : styles.priceAsk
						}
						value={price}
					/>
					<Value style={styles.vol} value={vol} />
				</View>
			</View>
		</TouchableOpacity>
	);
};
Row.propTypes = {};
Row.defaultProps = {};
const styles = {};
function getNewestStyle() {
	const newStyle = StyleSheet.create({
		priceBid: {
			fontFamily: CommonStyle.fontPoppinsRegular,
			color: CommonStyle.color.buy,
			fontSize: CommonStyle.fontSizeXS
		},
		priceAsk: {
			fontFamily: CommonStyle.fontPoppinsRegular,
			color: CommonStyle.color.sell,
			fontSize: CommonStyle.fontSizeXS
		},
		vol: {
			fontFamily: CommonStyle.fontPoppinsRegular,
			color: CommonStyle.fontColor,
			fontSize: CommonStyle.fontSizeXS
		}
	});
	PureFunc.assignKeepRef(styles, newStyle);
}
getNewestStyle();
register(getNewestStyle);
export default Row;
