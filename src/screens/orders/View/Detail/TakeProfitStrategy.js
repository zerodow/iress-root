import React, { useCallback } from 'react';
import { View, Text, Platform } from 'react-native';
import I18n from '~/modules/language/';
import CommonStyle from '~/theme/theme_controller';
import { formatNumberNew2 } from '~/lib/base/functionUtil';
import ENUM from '~/enum';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import TouchableOpacityOpt from '~/component/touchableOpacityOpt/';
import { handleShowAmendOrderEntry } from '~/screens/new_order/Controller/SwitchController.js';
import { handleShowCancelOrder } from '~/screens/confirm_order/Controllers/SwitchController';
import {
	getDisableAmendCancelProperty,
	getSLTPOrderStatusProperty,
	getDisableSLTPProperty,
	getBackgroundColorOvalLegOrder,
	getDisableSLTPPropertyV2
} from '~s/orders/Controller/OrdersStatusController';
import SvgIcon from '~/component/svg_icon/SvgIcon';
import { useSelector, shallowEqual } from 'react-redux';
import config from '~/config';
const { PRICE_DECIMAL, AMEND_TYPE, CANCEL_TYPE, ORDER_TAG } = ENUM;

const ButtonAmend = ({
	data,
	navigator,
	orderStatus,
	actionStatus,
	orderAction
}) => {
	const isConnected = useSelector(
		(state) => state.app.isConnected,
		shallowEqual
	);
	const disabled = getDisableSLTPPropertyV2({
		orderStatus,
		actionStatus,
		orderAction
	});
	if (disabled) return null;
	return (
		<TouchableOpacityOpt
			onPress={() =>
				handleShowAmendOrderEntry({
					data,
					navigator,
					amendType: AMEND_TYPE.AMEND_TRADING_PROFITLOSS
				})
			}
			disabled={!isConnected}
			style={{
				marginTop: 16,
				borderRadius: 4,
				borderWidth: 1,
				width: 93,
				paddingVertical: 4,
				borderColor: CommonStyle.color.dusk,
				justifyContent: 'center',
				alignItems: 'center',
				flexDirection: 'row',
				opacity: disabled ? 0.5 : 1
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

const ButtonCancel = ({
	data,
	navigator,
	orderStatus,
	actionStatus,
	orderAction
}) => {
	const isConnected = useSelector(
		(state) => state.app.isConnected,
		shallowEqual
	);
	const disabled = getDisableSLTPPropertyV2({
		orderStatus,
		actionStatus,
		orderAction
	});
	if (disabled) return null;
	return (
		<TouchableOpacityOpt
			onPress={() => {
				handleShowCancelOrder({
					data,
					navigator,
					cancelType: CANCEL_TYPE.CANCEL_ORDER_TAKE_PROFIT
				});
			}}
			disabled={!isConnected}
			style={{
				marginTop: 8,
				borderRadius: 4,
				borderWidth: 1,
				width: 93,
				paddingVertical: 4,
				borderColor: CommonStyle.color.dusk,
				justifyContent: 'center',
				alignItems: 'center',
				flexDirection: 'row',
				opacity: disabled ? 0.5 : 1
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

const Left = ({
	orderStatus,
	actionStatus,
	orderAction,
	data,
	navigator,
	takeprofitRemainingVolume,
	textInsideCircle
}) => {
	let { text, color } = getSLTPOrderStatusProperty({
		orderStatus,
		actionStatus,
		orderAction
	});
	if (
		orderStatus === 'Triggered Inactive' &&
		takeprofitRemainingVolume === 0
	) {
		text = 'Triggered Filled';
		color = CommonStyle.color.modify;
	}

	const renderButton = () => {
		const { ct_status: status } = data;
		const isActive = status === 'ACTIVE' || status === 'PRE_ACTIVE';

		if (
			textInsideCircle === 'Stop Loss Triggered' ||
			textInsideCircle === 'Take Profit Triggered' ||
			textInsideCircle === 'Deleted' ||
			textInsideCircle === 'Triggered Inactive' ||
			isActive
		) {
			return null;
		}

		return (
			<React.Fragment>
				<ButtonAmend
					{...{
						data,
						navigator,
						orderStatus,
						actionStatus,
						orderAction
					}}
				/>
				<ButtonCancel
					{...{
						data,
						navigator,
						orderStatus,
						actionStatus,
						orderAction
					}}
				/>
			</React.Fragment>
		);
	};

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
				{text}
			</Text>
			{renderButton()}
		</View>
	);
};

const Circle = ({
	orderStatus,
	orderAction,
	actionStatus,
	takeprofitRemainingVolume
}) => {
	let backgroundColor = getBackgroundColorOvalLegOrder({
		orderStatus,
		orderAction,
		actionStatus
	});
	if (
		orderStatus === 'Triggered Inactive' &&
		takeprofitRemainingVolume === 0
	) {
		backgroundColor = CommonStyle.color.modify;
	}
	return (
		<View
			style={{
				width: 16,
				height: 16,
				marginRight: 8
			}}
		>
			<View
				style={{
					width: 16,
					height: 16,
					borderRadius: 8,
					backgroundColor: backgroundColor
				}}
			/>
			<View
				style={{
					width: 12,
					height: 12,
					borderRadius: 6,
					top: 2,
					left: 2,
					backgroundColor: backgroundColor,
					borderWidth: 1,
					borderColor: CommonStyle.fontBlack,
					position: 'absolute'
				}}
			/>
		</View>
	);
};

const Right = ({
	takeProfitPrice,
	takeprofitRemainingVolume,
	filledQuantity,
	orderQuantity,
	estimatedProfit,
	side,
	orderStatus,
	orderAction,
	actionStatus
}) => {
	const renderStatusTest = useCallback(() => {
		if (
			config.environment === 'IRESS_DEV2' ||
			config.environment === 'IRESS_UAT' ||
			config.environment === 'IRESS_PROD'
		) {
			return (
				<React.Fragment>
					<OrderStatus orderStatus={orderStatus} />
					<OrderAction orderAction={orderAction} />
					<ActionStatus actionStatus={actionStatus} />
				</React.Fragment>
			);
		}
		return null;
	});
	return (
		<View style={{ flex: 1, paddingRight: 16 }}>
			<View
				style={{
					marginLeft: -16,
					flexDirection: 'row',
					alignItems: 'center'
				}}
			>
				<View
					style={{
						width: 24,
						marginRight: 4,
						height: 1,
						backgroundColor: CommonStyle.color.dusk_tabbar
					}}
				/>
				<Circle
					orderAction={orderAction}
					actionStatus={actionStatus}
					orderStatus={orderStatus}
					takeprofitRemainingVolume={takeprofitRemainingVolume}
				/>
				<Text
					style={{
						fontFamily: CommonStyle.fontPoppinsRegular,
						fontSize: CommonStyle.font13,
						color: CommonStyle.fontColor
					}}
				>
					{I18n.t('takeProfitStrategy')}
				</Text>
			</View>
			<View style={{ height: 8 }} />
			<TakeProfitPrice takeProfitPrice={takeProfitPrice} side={side} />
			<FilledVolume
				filledQuantity={filledQuantity}
				orderQuantity={orderQuantity}
			/>
			<Volume orderQuantity={orderQuantity} />
			<EstimatedProfit estimatedProfit={estimatedProfit} />
			{renderStatusTest()}
			<View style={{ height: 16 }} />
		</View>
	);
};

const Item = ({ label, value, textStyle = {}, iconName }) => {
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
			<View style={{ flexDirection: 'row', alignItems: 'center' }}>
				{iconName ? (
					<SvgIcon
						style={{ marginRight: 4 }}
						name={iconName}
						color={CommonStyle.fontColor}
						size={13}
					/>
				) : null}
				<Text
					style={[
						{
							fontFamily: CommonStyle.fontPoppinsRegular,
							color: CommonStyle.fontColor,
							fontSize: CommonStyle.font11
						},
						textStyle
					]}
				>
					{value}
				</Text>
			</View>
		</View>
	);
};

const TakeProfitPrice = ({ takeProfitPrice, side }) => {
	const iconName =
		side === 'buy' ? 'lessThanOrEqualTo' : 'greaterThanOrEqualTo';
	return (
		<Item
			label={I18n.t('takeProfitPrice')}
			iconName={iconName}
			value={formatNumberNew2(takeProfitPrice, PRICE_DECIMAL.IRESS_PRICE)}
		/>
	);
};
const FilledVolume = ({ filledQuantity, orderQuantity }) => {
	const color =
		filledQuantity > 0 && filledQuantity < orderQuantity
			? CommonStyle.color.modify
			: CommonStyle.fontColor;
	const textStyle = {
		color
	};
	return (
		<Item
			textStyle={textStyle}
			label={I18n.t('filledVolume')}
			value={formatNumberNew2(filledQuantity, PRICE_DECIMAL.VOLUME)}
		/>
	);
};
const Volume = ({ orderQuantity }) => {
	return (
		<Item
			label={I18n.t('securityDetailTotalVolume')}
			value={formatNumberNew2(orderQuantity, PRICE_DECIMAL.VOLUME)}
		/>
	);
};
const EstimatedProfit = ({ estimatedProfit }) => {
	return (
		<Item
			label={I18n.t('estimatedProfit')}
			value={
				estimatedProfit === null || estimatedProfit === undefined
					? '--'
					: formatNumberNew2(
							Math.abs(estimatedProfit),
							PRICE_DECIMAL.VALUE
					  )
			}
		/>
	);
};

const OrderStatus = ({ orderStatus }) => {
	return <Item label={'Take profit order status'} value={orderStatus} />;
};

const OrderAction = ({ orderAction }) => {
	return <Item label={'Take profit order action'} value={orderAction} />;
};

const ActionStatus = ({ actionStatus }) => {
	return <Item label={'Take profit action status'} value={actionStatus} />;
};

const VerticalLine = () => {
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
		</View>
	);
};

const TakeProfitStrategy = ({
	isTakeProfit,
	takeProfitData,
	data,
	navigator,
	side,
	textInsideCircle
}) => {
	const {
		takeprofit_order_status: orderStatus,
		takeprofit_order_filled_quantity: filledQuantity,
		takeprofit_order_quantity: orderQuantity,
		takeprofit_trigger_price: takeProfitPrice,
		estimated_order_pnl: estimatedProfit,
		takeprofit_order_action: takeprofitOrderAction,
		takeprofit_action_status: takeprofitActionStatus,
		takeprofit_remaining_volume: takeprofitRemainingVolume
	} = takeProfitData;
	if (!isTakeProfit) return null;
	console.info('DCM data', data);
	return (
		<View
			style={{
				flexDirection: 'row'
			}}
		>
			<Left
				actionStatus={takeprofitActionStatus}
				orderAction={takeprofitOrderAction}
				takeprofitRemainingVolume={takeprofitRemainingVolume}
				{...{ data, navigator }}
				orderStatus={orderStatus}
				textInsideCircle={textInsideCircle}
			/>
			<VerticalLine />
			<Right
				orderStatus={orderStatus}
				orderAction={takeprofitOrderAction}
				actionStatus={takeprofitActionStatus}
				side={side}
				filledQuantity={filledQuantity}
				orderQuantity={orderQuantity}
				takeProfitPrice={takeProfitPrice}
				takeprofitRemainingVolume={takeprofitRemainingVolume}
				estimatedProfit={estimatedProfit}
			/>
		</View>
	);
};

export default TakeProfitStrategy;
