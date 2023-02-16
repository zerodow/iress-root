import React, { useMemo, useLayoutEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Account from '../../ConfirmAmendOrder/Component/RowOrderInfo/RowAccount';
import OrderNumber from '../Components/RowOrderCancel/OrderNumber';
import CommonStyle from '~/theme/theme_controller';
import ButtonBySell from '../../ConfirmAmendOrder/Component/RowOrderInfo/ButtonBySell';
import OrderOriginal from '../Components/RowOrderCancel/OrderOriginal';
import {
	getOrderDetail,
	getIsBuy
} from '~/screens/confirm_order/ConfirmCancelOrder/Model/CancelModel';
import { getOrderIdByType } from '~/screens/confirm_order/Controllers/CancelOrderControll.js';
import { connect } from 'react-redux';
import { getPortfolioBalance } from '~s/portfolio/Controller/PortfolioTotalController';
import {
	getDicPortfolioType,
	getAccActive
} from '~s/portfolio/Model/PortfolioAccountModel';

import * as Business from '~/business';

const useGetCashBalance = ({
	accountId,
	symbol,
	exchange,
	setFormCurrency
}) => {
	return useLayoutEffect(() => {
		getPortfolioBalance(accountId, symbol, exchange)
			.then((res) => {
				setFormCurrency(res.from_currency);
			})
			.catch((err) => {
				console.log('ERROR', err);
			});
	}, [accountId]);
};
const Content = () => {
	const accActive = getAccActive();
	const currentAccount = useMemo(() => getDicPortfolioType(accActive), []);
	const accountId = currentAccount.portfolio_id;
	const [fromCurrency, setFormCurrency] = useState('--');
	const { data, isBuy } = useMemo(() => {
		return { data: getOrderDetail(), isBuy: getIsBuy() };
	}, []);
	const { symbol, exchange } = data;
	useGetCashBalance({
		symbol,
		exchange,
		accountId,
		setFormCurrency
	});
	const orderNumber = getOrderIdByType(data);
	const symbolClass = useMemo(() => {
		return Business.getClassBySymbolAndExchange({ symbol, exchange });
	}, [symbol, exchange]);
	const displayName = useMemo(() => {
		return Business.getDisplayName({ symbol, exchange });
	}, []);
	const companyName = useMemo(() => {
		return Business.getCompanyName({ symbol, exchange });
	});
	console.log(fromCurrency, 'fromCurrency');
	return (
		<View>
			<Account {...{ symbol, exchange }} />
			<OrderNumber orderNumber={orderNumber} />
			<Text
				style={{
					fontSize: CommonStyle.font13,
					fontFamily: CommonStyle.fontPoppinsRegular,
					alignSelf: 'center',
					color: CommonStyle.fontColor,
					paddingTop: 16,
					paddingBottom: 8
				}}
			>
				Are you sure you want to cancel this order?
			</Text>
			<ButtonBySell
				isBuy={isBuy}
				value={symbolClass}
				symbol={displayName}
				companyName={companyName}
			/>
			<OrderOriginal
				data={data}
				fromCurrency={fromCurrency}
				symbol={symbol}
				exchange={exchange}
			/>
		</View>
	);
};
export default Content;

const styles = StyleSheet.create({});
