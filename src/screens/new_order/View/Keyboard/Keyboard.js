import React, { useCallback } from 'react';
import * as Emitter from '@lib/vietnam-emitter';
import { connect, useSelector, shallowEqual } from 'react-redux';
import { changeLoadingCheckVetting } from '~/screens/new_order/Redux/actions.js';

import TabChangeTradingStrategy from '~/screens/new_order/View/Keyboard/TabChangeTradingStrategy.js';
import Keyboard from '~/component/virtual_keyboard/Keyboard.js';
import TabChangeOrderVolume from '~/screens/new_order/View/Keyboard/TabChangeValueOrVol.js';
import TabChangeContigent from '~/screens/new_order/View/Keyboard/TabChangeContingent';
import BidAskPrice from '~/screens/new_order/View/Keyboard/BidAskPrice.js';
import { Navigation } from 'react-native-navigation';
import SvgIcon from '~/component/svg_icon/SvgIcon.js';
import CommonStyle from '~/theme/theme_controller';
import {
	getObjectOrderPlace,
	checkVettingOrder,
	validatePreOrder
} from '~/screens/new_order/Controller/ContentController.js';
import { getChannelShowMessageNewOrder as getChannelChangeOrderError } from '~/streaming/channel';
import ENUM from '~/enum';
import { logDevice } from '~/lib/base/functionUtil';
import { getType } from '~/screens/new_order/Model/OrderEntryModel.js';
const { NEW_ORDER_INPUT_KEY, AMEND_TYPE } = ENUM;

const KeyboardNewOrder = (props) => {
	const {
		isConnected,
		isBuy,
		changeLoadingCheckVetting,
		isLoadingCheckVetting,
		newOrder,
		inputFocus,
		navigator
	} = props;
	let { forceDisabledButton } = props;
	const isLoadingOrderAttribute = useSelector(
		(state) => state.newOrder.isLoadingOrderAttribute,
		shallowEqual
	);
	const isLoadingBoxAccount = useSelector(
		(state) => state.newOrder.isLoadingBoxAccount
	);
	forceDisabledButton =
		isLoadingOrderAttribute || forceDisabledButton || isLoadingBoxAccount;

	const onConfirm = useCallback(async () => {
		const channel = getChannelChangeOrderError();
		const orderObj = getObjectOrderPlace(newOrder);
		logDevice(
			'info',
			`Check Vetting Review Order: ${JSON.stringify(orderObj)}`
		);
		const errorPreOrder = validatePreOrder(orderObj, newOrder);
		if (errorPreOrder) {
			logDevice(
				'error',
				`show error when check vetting: ${JSON.stringify(
					errorPreOrder
				)}`
			);
			const { msg, type, key } = errorPreOrder;
			return Emitter.emit(channel, {
				msg,
				type: ENUM.TYPE_MESSAGE.ERROR,
				key
			});
		}
		changeLoadingCheckVetting && changeLoadingCheckVetting(true);
		console.info('orderObj', newOrder, orderObj);
		// return changeLoadingCheckVetting && changeLoadingCheckVetting(false)
		checkVettingOrder(orderObj)
			.then((data) => {
				Navigation.showModal({
					screen:
						getType() !== AMEND_TYPE.DEFAULT
							? 'equix.ConfirmAmendOrder'
							: 'equix.ConfirmOrder',
					animated: true,
					animationType: 'fade',
					navigatorStyle: {
						navBarHidden: true,
						screenBackgroundColor: 'transparent',
						modalPresentationStyle: 'overCurrentContext'
					},
					passProps: {
						navigator
					}
				});
				changeLoadingCheckVetting && changeLoadingCheckVetting(false);
			})
			.catch((e) => {
				changeLoadingCheckVetting && changeLoadingCheckVetting(false);
			});
	}, [newOrder]);
	const renderMidleComp = useCallback(() => {
		switch (inputFocus) {
			case NEW_ORDER_INPUT_KEY.STOP_PRICE:
			case NEW_ORDER_INPUT_KEY.TAKE_PROFIT_LOSS:
				return (
					<TabChangeTradingStrategy
						inputFocus={inputFocus}
						tabs={[
							{
								title: 'Price',
								key: 'VALUE',
								value: 'VALUE',
								iconActive: (
									<SvgIcon
										name="nound_dolar"
										size={23}
										color={CommonStyle.backgroundColor}
									/>
								),
								iconDefault: (
									<SvgIcon name="nound_dolar" size={23} />
								)
							},
							{
								title: 'Percentage',
								key: 'PERCENT',
								value: 'PERCENT',
								iconActive: (
									<SvgIcon
										name="noun_discount"
										size={23}
										color={CommonStyle.backgroundColor}
									/>
								),
								iconDefault: (
									<SvgIcon name="noun_discount" size={23} />
								)
							}
						]}
					/>
				);
				break;
			case NEW_ORDER_INPUT_KEY.CONTINGENT_STRATEGY:
				return <TabChangeContigent inputFocus={inputFocus} />;
			case NEW_ORDER_INPUT_KEY.QUANTITY:
			case NEW_ORDER_INPUT_KEY.ORDER_VALUE:
				return <TabChangeOrderVolume inputFocus={inputFocus} />;
			default:
				return <BidAskPrice />;
		}
	}, [inputFocus]);
	return (
		<React.Fragment>
			<Keyboard
				forceDisabled={forceDisabledButton}
				renderMidleComp={renderMidleComp}
				isLoading={isLoadingCheckVetting}
				titleButton={isBuy ? 'Review Order' : 'Review Order'}
				isConnected={isConnected}
				isBuy={isBuy}
				onConfirm={onConfirm}
				{...props}
			/>
		</React.Fragment>
	);
};
KeyboardNewOrder.propTypes = {};
KeyboardNewOrder.defaultProps = {};
function mapStateToProps(state) {
	return {
		isLoadingCheckVetting: state.newOrder.isloadingCheckVetting,
		symbol: state.newOrder.symbol,
		exchange: state.newOrder.exchange,
		isBuy: state.newOrder.isBuy,
		isConnected: state.app.isConnected,
		orderType: state.newOrder.orderType,
		duration: state.newOrder.duration, // GTD
		destination: state.newOrder.destination,
		inputFocus: state.newOrder.inputFocus,
		newOrder: state.newOrder,
		forceDisabledButton: state.newOrder.forceDisabledButton,
		enableContingentBlock: state.newOrder.enableContingentBlock
	};
}
function mapActionToProps(dispatch) {
	return {
		changeLoadingCheckVetting: (p) => dispatch(changeLoadingCheckVetting(p))
	};
}
export default connect(mapStateToProps, mapActionToProps)(KeyboardNewOrder);
