import React, { useLayoutEffect, useMemo, useCallback, useEffect } from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import CommonStyle from '~/theme/theme_controller';
import TouchableOpacityOpt from '~/component/touchableOpacityOpt/index';
import * as Emitter from '@lib/vietnam-emitter';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import Shadow from '~/component/shadow';
import { Navigation } from 'react-native-navigation';
import * as Business from '~/business';
import {
	changeLoadingButtonConfirm,
	dismissModalPlaceOrder
} from '~/screens/confirm_order/Redux/actions.js';
import { getObjectOrderPlace } from '~/screens/new_order/Controller/ContentController.js';
import {
	getChannelChangeOrderError,
	getChannelHideOrderError
} from '~/streaming/channel';
import * as PlaceOrderController from '~/screens/confirm_order/Controllers/PlaceController.js';
import Enum from '~/enum';
import { dataStorage, func } from '~/storage';
import { showOrders } from '~/navigation/controller.1';
import { showErrorHandlingOrder } from '~/screens/confirm_order/Controllers/SwitchController';
import { setOrderId } from '~s/confirm_order/Model/confirmOrderModel';
import { DEVICE_WIDTH } from '~/screens/watchlist/enum';
import { resetStateNewOrder } from '~/screens/new_order/Redux/actions.js';

// Your order has breached a limit. Please amend your order to continue.
// Do you still want to proceed with your order?
const { TYPE_MESSAGE, STATUS_ORD, ACTION_ORD } = Enum;
const txtErrorCode = 'Error Message: ';
const { height: heightDevice, width: widthDevices } = Dimensions.get('window');
const ErrorHandlingOrder = ({
	error: breachMessage,
	breachAction,
	errorCode,
	navigator
}) => {
	const newOrder = useSelector((state) => state.newOrder, shallowEqual);
	const dispatch = useDispatch();
	const data = useMemo(() => {
		switch (parseInt(breachAction)) {
			case 7:
				return ['Ok'];
			case 6:
				return ['Yes', 'No'];
			default:
				return ['Ok'];
		}
	}, [breachAction]);
	const cbError = useCallback(({ error, breachAction, errorCode }) => {
		const channel = getChannelChangeOrderError();
		dispatch(changeLoadingButtonConfirm(false));
		Emitter.emit(channel, {
			msg: error,
			autoHide: true,
			type: TYPE_MESSAGE.ERROR
		});
		showErrorHandlingOrder({ newOrder, error, breachAction, errorCode });
	}, []);
	const cbSuccess = ({ error, orderId }) => {
		const channel = getChannelChangeOrderError();
		setOrderId({ orderId });
		Emitter.emit(channel, {
			msg: error,
			autoHide: false,
			type: TYPE_MESSAGE.SUCCESS
		});
		setTimeout(() => {
			showOrders({ navigator });
			dispatch(resetStateNewOrder());
			Navigation.dismissModal();
			dispatch(changeLoadingButtonConfirm(false));
			dataStorage.refBottomTabBar &&
				dataStorage.refBottomTabBar.changeTabActive(4);
			dispatch(dismissModalPlaceOrder(false));
		}, 2000);
	};
	const onPressNo = () => {
		dispatch(dismissModalPlaceOrder(true));
		dispatch(changeLoadingButtonConfirm(false));
		Navigation.dismissModal();
		setTimeout(() => {
			Navigation.dismissModal();
		}, 1000);
	};
	const onPressYes = () => {
		Navigation.dismissModal();
		const objectOrder = getObjectOrderPlace(
			newOrder,
			(confirmBreachAction = true)
		);
		const channel = getChannelChangeOrderError();
		const objNotify = Business.getOrdConfirm(
			STATUS_ORD.PROCESS,
			ACTION_ORD.PLACE
		);
		Emitter.emit(channel, {
			msg: objNotify.txt,
			autoHide: false,
			type: TYPE_MESSAGE.WARNING
		});
		dispatch(changeLoadingButtonConfirm(false));
		dispatch(dismissModalPlaceOrder(false));
		PlaceOrderController.placeOrder({
			objectOrder,
			cbError,
			cbSuccess
		});
	};

	const listButton = {
		Yes: {
			onPress: onPressYes,
			color: CommonStyle.color.modify,
			textColor: CommonStyle.fontDark
		},
		No: {
			onPress: onPressNo,
			color: CommonStyle.backgroundColor,
			textColor: CommonStyle.color.modify
		},
		Ok: {
			onPress: onPressNo,
			color: CommonStyle.color.modify,
			textColor: CommonStyle.fontDark
		}
	};

	useLayoutEffect(() => {
		// Controller.setStatusModalCurrent(true)
		// return () => {
		//     setIsShowingAlertReload(false);
		// }
	}, []);

	return (
		<View
			style={{
				justifyContent: 'center',
				backgroundColor: 'rgba(0, 0, 0, 0.5)',
				flexDirection: 'row',
				alignItems: 'center',
				flex: 1
			}}
		>
			<View
				style={{
					backgroundColor: CommonStyle.backgroundColor,
					overflow: 'hidden',
					alignSelf: 'center',
					marginHorizontal: 48,
					flex: 1
				}}
			>
				<View>
					<View
						style={{
							flexDirection: 'row',
							alignItems: 'center',
							justifyContent: 'center'
						}}
					>
						<Text
							style={{
								fontSize: CommonStyle.paddingSizeOrders,
								fontFamily: CommonStyle.fontPoppinsRegular,
								color: CommonStyle.fontWhite,
								paddingVertical: 8
							}}
						>{`${txtErrorCode}(${breachAction})`}</Text>
					</View>
				</View>
				<View
					style={{ justifyContent: 'center', alignItems: 'center' }}
				>
					{/* <Text style={{
                        fontSize: CommonStyle.paddingSizeOrders,
                        fontFamily: CommonStyle.fontPoppinsRegular,
                        color: CommonStyle.fontWhite,
                        paddingTop: 16
                    }}>{`${txtErrorCode}(${code})`}</Text> */}
					<Text
						style={{
							fontSize: CommonStyle.paddingSizeOrders,
							fontFamily: CommonStyle.fontPoppinsRegular,
							color: CommonStyle.fontWhite,
							paddingTop: 8,
							paddingHorizontal: 16,
							textAlign: 'center',
							opacity: 0.5,
							paddingBottom: 24,
							maxWidth: DEVICE_WIDTH - 24 - 24
						}}
					>
						{breachMessage}
					</Text>

					<View
						style={{
							flexDirection: 'row',
							justifyContent:
								data.length === 1 ? 'center' : 'space-between',
							paddingVertical: 18,
							width: '100%',
							paddingHorizontal: 24,
							alignItems: 'center'
						}}
					>
						<Shadow
							setting={{
								width: widthDevices,
								height: 0,
								color: CommonStyle.color.shadow,
								border: 3,
								radius: 0,
								opacity: 0.5,
								x: 0,
								y: 0,
								style: {
									zIndex: 9,
									position: 'absolute',
									backgroundColor:
										CommonStyle.backgroundColor,
									top: 0,
									left: 0,
									right: 0
								}
							}}
						/>
						{data.map((item) => {
							return (
								<TouchableOpacityOpt
									style={{
										justifyContent: 'center',
										alignItems: 'center',
										borderRadius: 100,
										width: '45%',
										textAlign: 'center',
										borderWidth: 0.5,
										borderColor: CommonStyle.color.modify,
										backgroundColor: listButton[item].color
									}}
									onPress={listButton[item].onPress}
								>
									<Text
										style={{
											fontSize: CommonStyle.fontSizeS,
											textAlign: 'center',
											fontFamily:
												CommonStyle.fontPoppinsRegular,
											color: listButton[item].textColor,
											paddingVertical: 8
										}}
									>
										{item}
									</Text>
								</TouchableOpacityOpt>
							);
						})}
					</View>
				</View>
			</View>
		</View>
	);
};

export default ErrorHandlingOrder;
const styles = StyleSheet.create({});
