import React, { PureComponent, useCallback, useMemo } from 'react';
import {
	View,
	StyleSheet,
	TouchableOpacity,
	Text,
	Platform
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import TouchableOpacityOpt from '~/component/touchableOpacityOpt/'

import _ from 'lodash';
import { Navigation } from 'react-native-navigation';
import Animated from 'react-native-reanimated';

import { func, dataStorage } from '~/storage';
import config from '~/config';
import ShadowTop from '~/component/shadow/index.js'
import Enum from '~/enum';
import * as Controller from '~/memory/controller';
import * as RoleUser from '~/roleUser';
import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func'

import I18n from '~/modules/language/';
import { useShadow } from '~/component/shadow/SvgShadow';
import { getSymbolClass } from '~/business';
import { changeBuySell } from '~/screens/new_order/Redux/actions.js';
import { handleShowNewOrder } from '~/screens/new_order/Controller/SwitchController.js';
import { setOrderDetail } from '~/screens/new_order/Model/OrderEntryModel';

const TradeButton = ({ isBuy, symbol, exchange, onPress, textColor }) => {
	const symbolClass = getSymbolClass({ symbol });
	const isLogin = Controller.getLoginStatus();

	const isConnected = useSelector((state) => state.app.isConnected);
	const isLoading = useSelector((state) => state.watchlist3.detailLoading);

	const { email } = Controller.getUserInfo() || {};

	const hasRole = RoleUser.checkRoleByKey(
		Enum.ROLE_DETAIL.PERFORM_BUY_SELL_UNIVERSALSEARCH_BUTTON
	);
	const hasBuySell = RoleUser.checkRoleByKey(
		Enum.ROLE_DETAIL.PERFORM_BUY_SELL_BUTTON
	);

	const { isNotHaveAccount, loginUserType } = dataStorage;

	let disabled =
		(symbolClass + '').toUpperCase() ===
		Enum.SYMBOL_CLASS_API_UPPER.INDEX ||
		isLoading ||
		!func.isAccountActive() ||
		isNotHaveAccount ||
		!isLogin ||
		!hasRole ||
		!hasBuySell ||
		email === config.username ||
		!isConnected ||
		loginUserType === 'REVIEW';
	disabled = !isConnected;

	const colorButton = useMemo(() => {
		const disableColor = '#808080';
		const buyColor = CommonStyle.color.backBuy;
		const sellColor = CommonStyle.color.backSell;
		if (isBuy) return buyColor;
		if (disabled) return disableColor;

		return sellColor;
	}, [CommonStyle.color]);

	const borderColor = useMemo(() => {
		if (isBuy) return 'transparent';
		return CommonStyle.color.backSellBorder;
	}, [CommonStyle.color, isBuy]);

	const buttonTitle = isBuy ? I18n.t('buy') : I18n.t('sell');
	const handleOnPress = useCallback(() => {
		onPress({ isBuy, symbol, exchange });
	}, [isBuy, symbol, exchange]);

	return (
		<TouchableOpacityOpt
			timeDelay={2 * 1000}
			disabled={disabled}
			onPress={handleOnPress}
			style={{ flex: 1 }}
		>
			<View
				style={[
					styles.button,
					{
						backgroundColor: colorButton
					}
				]}
			>
				<Text
					style={[
						styles.title,
						{
							color: disabled
								? CommonStyle.newsTextColor
								: textColor
						}
					]}
				>
					{buttonTitle}
				</Text>
			</View>
		</TouchableOpacityOpt>
	);
};

const BuySellButton = ({ symbol, exchange, changeAllowUnmount }) => {
	const [ShadowView, onLayout] = useShadow();
	const dispatch = useDispatch();
	const onPress = useCallback(({ isBuy, symbol, exchange }) => {
		dataStorage.isReloading = false // off loading khi back ve screen watch list
		changeAllowUnmount && changeAllowUnmount(false);
		dispatch(changeBuySell(isBuy));
		setOrderDetail({})
		
		dataStorage.isNeedSubSymbolOnNewOrder = false;
		handleShowNewOrder && handleShowNewOrder({
			symbol,
			exchange
		})
		// Navigation.showModal({
		// 	screen: 'equix.NewOrder',
		// 	animated: false,
		// 	animationType: 'none',
		// 	navigatorStyle: {
		// 		...CommonStyle.navigatorModalSpecialNoHeader,
		// 		modalPresentationStyle: 'overCurrentContext'
		// 	},
		// 	passProps: {
		// 		namePanel: Enum.NAME_PANEL.NEW_ORDER,
		// 		isSwitchFromQuickButton: true,
		// 		symbol,
		// 		exchange
		// 	}
		// });
	}, []);

	return (
		<React.Fragment>
			<Animated.View style={[styles.container, { zIndex: 1 }]}>
				<ShadowTop setting={{
					radius: 0
				}} />
				<View
					onLayout={onLayout}
					style={{ width: '100%', flexDirection: 'row', padding: 8, backgroundColor: CommonStyle.color.dark, zIndex: 9999 }}
				>
					<TradeButton
						exchange={exchange}
						symbol={symbol}
						isBuy={true}
						onPress={onPress}
						textColor={CommonStyle.color.textBuy}
					/>
					<View style={{ width: 16 }} />
					<TradeButton
						exchange={exchange}
						isBuy={false}
						symbol={symbol}
						onPress={onPress}
						textColor={CommonStyle.color.textSell}
					/>
				</View>
			</Animated.View>
		</React.Fragment>
	);
};

export default BuySellButton;

const styles = {}
function getNewestStyle() {
	const newStyle = StyleSheet.create({
		container: {
			position: 'absolute',
			bottom: -5,
			paddingBottom: 24 + 5,
			// height: 82,
			backgroundColor: CommonStyle.color.dark,
			width: '100%'
		},
		button: {
			paddingTop: 4,
			paddingBottom: 4,
			borderRadius: 8,
			minHeight: 33
		},
		title: {
			fontFamily: CommonStyle.fontPoppinsRegular,
			fontSize: CommonStyle.font17,
			textAlign: 'center'
		}
	});
	PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)
