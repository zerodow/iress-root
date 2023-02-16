import React, {
	useEffect,
	useState,
	useCallback,
	useMemo,
	useRef,
	useLayoutEffect
} from 'react';
import { View, Text } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
	getAccActive,
	getDicPortfolioType
} from '~s/portfolio/Model/PortfolioAccountModel';
import { getTabTrading } from '~/screens/new_order/Model/TabModel.js';
import RowOrderValue from '../../Components/RowOrderInfo/RowOrderValue';
import RowEstTotalCharges from '~s/confirm_order/Components/RowOrderInfo/RowEstTotalChange/index';
import RowEstValue from '../../Components/RowOrderInfo/RowEstNetValue';
import RowStopLoss from '../../Components/RowOrderInfo/RowStopLoss';
import RowTakeProfit from '../../Components/RowOrderInfo/RowTakeProfit';
import { getObjectOrderPlaceFees } from '~/screens/new_order/Controller/ContentController.js';
import {
	getFees,
	getLifeTimeDisplay
} from '~/screens/confirm_order/Controllers/ContentController.js';
import {
	setInitialMarginPercent,
	setFees
} from '~/screens/confirm_order/HandleGetInitialMargin.js';
import { useLoadingErrorSystem } from '~/component/error_system/Hook/Redux';
import { dataStorage } from '~/storage';
import { convertPrice } from '~s/confirm_order/Controllers/ContentController';

const useGetFees = ({ newOrder, setDataFees, dic, dataVolume }) => {
	return useLayoutEffect(() => {
		const objectData = getObjectOrderPlaceFees(newOrder);
		delete objectData['duration'];
		// delete objectData['side']
		dataStorage.getFees = () => {
			getFees({ orderObj: objectData })
				.then((res) => {
					dic.current.isLoading = false;
					setDataFees(res);
					setFees(res, objectData.account_id, dataVolume);
				})
				.catch((e) => {
					dic.current.isLoading = false;
					setDataFees({});
				});
		};
		getFees({ orderObj: objectData })
			.then((res) => {
				dic.current.isLoading = false;
				setDataFees(res);
				setFees(res, objectData.account_id, dataVolume);
			})
			.catch((e) => {
				dic.current.isLoading = false;
				setDataFees({});
			});
	}, []);
};
const BlockInfoPrice = ({
	symbol,
	exchange,
	orderType,
	limitPrice,
	triggerPrice,
	quantity,
	onPlaceOrder,
	newOrder,
	tradePrice
}) => {
	const { isLoadingErrorSystem } = useLoadingErrorSystem();
	const [dataFees, setDataFees] = useState({});
	const dic = useRef({ isLoading: true });
	const orderConfirm = useMemo(() => {
		let obj = {};
		obj.order_value = newOrder.orderValue.value;
		obj.order_volume = newOrder.quantity.value;
		obj.stop_price = newOrder.stopPrice.value;
		obj.profit_price = newOrder.takeProfitLoss.value;
		obj.symbols = newOrder.symbol;
		obj.exchanges = newOrder.exchange;
		obj.life_time = newOrder.duration.label;
		return obj;
	}, [newOrder]);
	orderConfirm.life_time = getLifeTimeDisplay({ newOrder });
	const tabStrading = getTabTrading();
	dic.current.isLoading = dic.current.isLoading || isLoadingErrorSystem;
	const accActive = getAccActive();
	const currentAccount = useMemo(() => getDicPortfolioType(accActive), []);
	useGetFees({
		newOrder, dic, setDataFees, dataVolume: {
			orderVolume: newOrder && newOrder.quantity && newOrder.quantity.value,
			limitPrice,
			tradePrice,
		}
	});
	const {
		order_volume: orderVolume,
		stop_price: stopPrice,
		profit_price: profitPrice,
		symbols: symBols,
		exchanges: exChange,
		life_time: lifeTime
	} = orderConfirm;
	const {
		estimated_commission: commission,
		estimated_tax: tax,
		total_charges: totalCharges,
		estimated_net_value: estNetValue,
		estimated_initial_margin: initialMargin,
		total_fee: fees
		// order_value: orderValueFees
	} = dataFees;

	let orderValueFees = null;
	const priceValue = limitPrice || tradePrice;

	if (orderVolume && priceValue) {
		orderValueFees = orderVolume * priceValue;
	}

	const estProfit = !orderValueFees
		? '--'
		: Math.abs(orderValueFees - profitPrice * orderVolume);
	const estLost = !orderValueFees
		? '--'
		: Math.abs(orderValueFees - stopPrice * orderVolume);

	return (
		<View style={{ paddingHorizontal: 0, paddingVertical: 16 }}>
			<RowOrderValue
				isLoading={dic.current.isLoading}
				orderValue={orderValueFees}
				orderVolume={orderVolume}
				orderPrice={limitPrice}
				accountID={currentAccount.portfolio_id}
				orderType={orderType}
			/>
			{totalCharges ? (
				<RowEstTotalCharges
					isLoading={dic.current.isLoading}
					commission={commission}
					fees={fees}
					tax={tax}
					estTotalCharges={totalCharges}
					accountID={currentAccount.portfolio_id}
					dataFees={dataFees}
				/>
			) : null}

			<RowEstValue
				isLoading={dic.current.isLoading}
				lifetime={lifeTime}
				estNetValue={estNetValue}
				estInitialMargin={initialMargin}
				type={currentAccount.portfolio_type}
			/>
			{tabStrading && tabStrading['STOPLOSS'] ? (
				<RowStopLoss
					stopPrice={stopPrice}
					estLoss={estLost}
					isLoading={dic.current.isLoading}
				/>
			) : null}
			{tabStrading && tabStrading['TAKE_PROFIT'] ? (
				<RowTakeProfit
					profitPrice={profitPrice}
					estProfit={estProfit}
					isLoading={dic.current.isLoading}
				/>
			) : null}
		</View>
	);
};
BlockInfoPrice.propTypes = {};
BlockInfoPrice.defaultProps = {};
function mapStateToProps(state) {
	const { symbol, exchange, orderType, limitPrice, triggerPrice, quantity } =
		state.newOrder || {};
	const quote = state.quotes?.data[symbol + '#' + exchange];

	return {
		orderType,
		limitPrice,
		triggerPrice,
		quantity,
		tradePrice: quote?.trade_price
	};
}
export default connect(mapStateToProps)(BlockInfoPrice);
