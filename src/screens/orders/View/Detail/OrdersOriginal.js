import React from 'react';
import { View, Text, Platform } from 'react-native';
import CommonStyle from '~/theme/theme_controller';
import I18n from '~/modules/language/';
import { formatNumberNew2 } from '~/lib/base/functionUtil';
import ENUM from '~/enum';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import TouchableOpacityOpt from '~/component/touchableOpacityOpt/';
import { getColor } from '~s/orders/Controller/OrdersFillStatusController';
import DURATION from '~/constants/durationString';
import { getDisableAmendCancelProperty } from '~s/orders/Controller/OrdersStatusController';
import { useSelector, shallowEqual } from 'react-redux';
import { handleShowAmendOrderEntry } from '~/screens/new_order/Controller/SwitchController.js';
import { handleShowCancelOrder } from '~/screens/confirm_order/Controllers/SwitchController';
import { getDisplayLifeTime } from '~/screens/orders/Controller/OrdersController.js';
const { PRICE_DECIMAL, AMEND_TYPE, FILL_STATUS, CANCEL_TYPE } = ENUM;

export const ButtonAmend = ({ data, navigator }) => {
	const {
		fill_status: fillStatus,
		order_action: orderAction,
		action_status: actionStatus
	} = data;
	const isConnected = useSelector(
		(state) => state.app.isConnected,
		shallowEqual
	);
	const { disableAmendAll } = getDisableAmendCancelProperty({
		orderAction,
		actionStatus
	});
	if (fillStatus === FILL_STATUS.FILLED || disableAmendAll) return null;
	return (
		<TouchableOpacityOpt
			disabled={!isConnected}
			onPress={() =>
				handleShowAmendOrderEntry({
					data,
					navigator,
					amendType: AMEND_TYPE.AMEND_ORIGINAL
				})
			}
			style={{
				marginTop: 16,
				borderRadius: 4,
				borderWidth: 1,
				width: 93,
				paddingVertical: 4,
				borderColor: CommonStyle.color.dusk_tabbar,
				justifyContent: 'center',
				alignItems: 'center',
				flexDirection: 'row',
				opacity: isConnected ? 1 : 0.5
			}}
		>
			<MaterialCommunityIcons
				name="pencil"
				size={12}
				color={CommonStyle.color.modify}
			/>
			<Text
				style={{
					fontSize: CommonStyle.font11,
					color: CommonStyle.color.modify,
					fontFamily: CommonStyle.fontPoppinsRegular
				}}
			>
				{I18n.t('amend')}
			</Text>
		</TouchableOpacityOpt>
	);
};

export const ButtonCancel = ({ data, navigator }) => {
	const {
		fill_status: fillStatus,
		order_action: orderAction,
		action_status: actionStatus,
		filled_quantity: filledQuantity
	} = data;
	const isConnected = useSelector(
		(state) => state.app.isConnected,
		shallowEqual
	);
	const { disableCancelAll } = getDisableAmendCancelProperty({
		orderAction,
		actionStatus,
		filledQuantity
	});
	if (fillStatus === FILL_STATUS.FILLED || disableCancelAll) return null;
	return (
		<TouchableOpacityOpt
			disabled={!isConnected}
			onPress={() =>
				handleShowCancelOrder({
					data,
					navigator,
					cancelType: CANCEL_TYPE.CANCEL_ORDER_ORIGINAL
				})
			}
			style={{
				// marginTop: 8,
				borderRadius: 4,
				borderWidth: 1,
				width: 93,
				paddingVertical: 4,
				borderColor: CommonStyle.color.dusk_tabbar,
				justifyContent: 'center',
				alignItems: 'center',
				flexDirection: 'row',
				opacity: isConnected ? 1 : 0.5
			}}
		>
			<FontAwesome
				name="close"
				size={12}
				color={CommonStyle.color.sell}
			/>
			<Text
				style={{
					paddingTop: Platform.OS === 'ios' ? 2 : 0.5,
					fontSize: CommonStyle.font11,
					color: CommonStyle.color.sell,
					fontFamily: CommonStyle.fontPoppinsRegular
				}}
			>
				{I18n.t('cancel')}
			</Text>
		</TouchableOpacityOpt>
	);
};

const Left = ({ fillStatus, data, navigator }) => {
	const color = getColor({ fillStatus });
	const { ct_status: status } = data;
	const isActive = status === 'ACTIVE' || status === 'PRE_ACTIVE';

	return (
		<View
			style={{
				width: 120,
				alignItems: 'center'
			}}
		>
			<Text
				style={{
					fontFamily: CommonStyle.fontPoppinsRegular,
					fontSize: CommonStyle.font11,
					textAlign: 'center',
					color
				}}
			>
				{fillStatus}
			</Text>
			{!isActive && (
				<>
					<ButtonAmend navigator={navigator} data={data} />
					<View
						style={{
							height: 8
						}}
					/>
					<ButtonCancel navigator={navigator} data={data} />
				</>
			)}
		</View>
	);
};

const VerticalLine = ({ fillStatus }) => {
	return (
		<View
			style={{
				width: 32,
				alignItems: 'center',
				backgroundColor: CommonStyle.color.dark
			}}
		>
			<View
				style={{
					flex: 1,
					width: 1,
					backgroundColor: CommonStyle.color.dusk_tabbar
				}}
			/>
			<Circle fillStatus={fillStatus} />
		</View>
	);
};

const Item = ({ label, value }) => {
	return (
		<View
			style={{
				flexDirection: 'row',
				justifyContent: 'space-between',
				marginTop: 4
			}}
		>
			<Text
				style={{
					fontFamily: CommonStyle.fontPoppinsRegular,
					color: CommonStyle.fontColor,
					fontSize: CommonStyle.font11,
					opacity: 0.5
				}}
			>
				{label}
			</Text>
			<Text
				style={{
					fontFamily: CommonStyle.fontPoppinsRegular,
					color: CommonStyle.fontColor,
					fontSize: CommonStyle.font11
				}}
			>
				{value}
			</Text>
		</View>
	);
};

const Volume = ({ orderQuantity }) => {
	return (
		<Item
			label={I18n.t('order_volume')}
			value={formatNumberNew2(orderQuantity, PRICE_DECIMAL.VOLUME)}
		/>
	);
};

const FilledVolume = ({ filledQuantity }) => {
	return (
		<Item
			label={I18n.t('filledVolume')}
			value={formatNumberNew2(filledQuantity, PRICE_DECIMAL.VOLUME)}
		/>
	);
};
const UnFilledVolume = ({ unFilledVolume }) => {
	return (
		<Item
			label={I18n.t('unFilledVolume')}
			value={formatNumberNew2(unFilledVolume, PRICE_DECIMAL.VOLUME)}
		/>
	);
};

const OrderPrice = ({ limitPrice }) => {
	return (
		<Item
			label={I18n.t('orderPrice')}
			value={formatNumberNew2(limitPrice, PRICE_DECIMAL.IRESS_PRICE)}
		/>
	);
};

const AveragePrice = ({ avgPrice }) => {
	return (
		<Item
			label={I18n.t('averagePrice')}
			value={formatNumberNew2(avgPrice, PRICE_DECIMAL.IRESS_PRICE)}
		/>
	);
};

const LifeTime = ({ duration, expiryTime }) => {
	const durationString = getDisplayLifeTime({ duration, expiryTime });
	return <Item label={I18n.t('lifeTime')} value={durationString} />;
};

const Right = ({
	remainingQuantity,
	filledQuantity,
	orderQuantity,
	limitPrice,
	avgPrice,
	duration,
	expiryTime
}) => {
	return (
		<View style={{ flex: 1, paddingRight: 16 }}>
			<Text
				style={{
					marginTop: -2,
					fontFamily: CommonStyle.fontPoppinsRegular,
					fontSize: CommonStyle.font13,
					color: CommonStyle.fontColor
				}}
			>
				{I18n.t('originalOrder')}
			</Text>
			<View style={{ height: 8 }} />
			<Volume orderQuantity={orderQuantity} />
			<FilledVolume filledQuantity={filledQuantity} />
			<UnFilledVolume unFilledVolume={remainingQuantity} />
			<OrderPrice limitPrice={limitPrice} />
			<AveragePrice avgPrice={avgPrice} />
			<LifeTime expiryTime={expiryTime} duration={duration} />
			<View style={{ height: 16 }} />
		</View>
	);
};

const Circle = ({ fillStatus }) => {
	const color = getColor({ fillStatus });
	return (
		<View
			style={{
				width: 16,
				height: 16 + 8,
				position: 'absolute',
				backgroundColor: CommonStyle.color.dark
			}}
		>
			<View
				style={{
					width: 16,
					height: 16,
					borderRadius: 8,
					backgroundColor: color
				}}
			/>
			<View
				style={{
					width: 12,
					height: 12,
					borderRadius: 6,
					top: 2,
					left: 2,
					backgroundColor: color,
					borderWidth: 1,
					borderColor: CommonStyle.fontBlack,
					position: 'absolute'
				}}
			/>
		</View>
	);
};

const OrdersOriginal = ({ data, navigator }) => {
	const {
		fill_status: fillStatus,
		filled_quantity: filledQuantity,
		order_quantity: orderQuantity,
		remaining_quantity: remainingQuantity,
		limit_price: limitPrice,
		avg_price: avgPrice,
		duration,
		expiry_time: expiryTime
	} = data;
	console.log('DCM data', data);
	return (
		<View
			style={{
				flexDirection: 'row'
			}}
		>
			<Left navigator={navigator} data={data} fillStatus={fillStatus} />
			<VerticalLine fillStatus={fillStatus} />
			<Right
				remainingQuantity={remainingQuantity}
				filledQuantity={filledQuantity}
				orderQuantity={orderQuantity}
				limitPrice={limitPrice}
				avgPrice={avgPrice}
				duration={duration}
				expiryTime={expiryTime}
			/>
		</View>
	);
};

export default OrdersOriginal;
