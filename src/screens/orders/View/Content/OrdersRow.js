import React, {
	useEffect,
	useMemo,
	useRef,
	useImperativeHandle,
	useCallback,
	useState
} from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import {
	View,
	Text,
	Dimensions,
	Platform,
	Animated as RNAnimated
} from 'react-native';
import CommonStyle from '~/theme/theme_controller';
import OrdersRowSymbolInfo from '~s/orders/View/Content/OrdersRowSymbolInfo';
import OrdersRowVolume from '~s/orders/View/Content/OrdersRowVolume';
import OrdersRowPrice from '~s/orders/View/Content/OrdersRowPrice';
import OrdersRowPieChart from '~s/orders/View/Content/OrdersRowPieChart';
import TouchableOpacityOpt from '~/component/touchableOpacityOpt/';
import I18n from '~/modules/language/';
import ENUM from '~/enum';
import Animated, { Easing } from 'react-native-reanimated';
import {
	getOrderStatusProperty,
	getFillStatusProperty,
	getDisableAmendCancelProperty,
	getStyleOfOrderLeg,
	checkOrderLegIsTriggered,
	getTextInsideCircleProperty,
	checkOrderHasCancel
} from '~s/orders/Controller/OrdersStatusController';
import Interactable from '~/component/Interactable/';
import SvgIcon from '~s/watchlist/Component/Icon2';
import { getOrderTag, registerInteractable } from '~s/orders/Model/OrdersModel';
import { handleShowCancelOrder } from '~/screens/confirm_order/Controllers/SwitchController';

const TouchableOpacityAnim =
	Animated.createAnimatedComponent(TouchableOpacityOpt);
const { ORDER_TAG, CANCEL_TYPE, SLTP_ORDER_STATUS } = ENUM;
const HEIGHT_ROW = 72;
const { width: DEVICE_WIDTH } = Dimensions.get('window');
const SNAP_POINT = {
	LEFT: 0,
	MIDDLE: 0,
	RIGHT: -68
};
const STATE = {
	TOP: -1,
	MIDDLE: 0,
	BOTTOM: 1
};

const POSITION_DISTANCE = {
	TOP: HEIGHT_ROW - 16 - 14,
	MIDDLE: HEIGHT_ROW - 16,
	BOTTOM: HEIGHT_ROW
};

const { block, cond, set, add, and, or, eq, Value, Code } = Animated;
const SIDE = {
	BUY: 'buy',
	SELL: 'sell'
};

const FirstPart = React.memo(
	({ side, _heightValue, _top }) => {
		const property = useMemo(() => {
			return side === SIDE.BUY
				? {
						text: I18n.t('side_buy'),
						color: CommonStyle.color.buy
				  }
				: {
						text: I18n.t('side_sell'),
						color: CommonStyle.color.sell
				  };
		}, [side]);
		return (
			<RNAnimated.View
				style={{
					position: 'absolute',
					justifyContent: 'center',
					top: _top,
					left: 0,
					right: 64 / 2,
					height: _heightValue,
					borderWidth: 1,
					borderRadius: 8,
					borderColor: property.color,
					backgroundColor: CommonStyle.color.dark
				}}
			>
				<Text
					style={{
						marginLeft: 8,
						fontSize: CommonStyle.font13,
						color: property.color,
						fontFamily: CommonStyle.fontPoppinsRegular
					}}
				>
					{property.text}
				</Text>
			</RNAnimated.View>
		);
	},
	(prev, next) => {
		const { side: prevSide } = prev;
		const { side } = next;
		return prevSide === side;
	}
);

const SecondPart = ({
	side,
	isStoploss,
	isTakeProfit,
	SLOrderStatus,
	SLRemainingVolume,
	SLOrderAction,
	SLActionStatus,
	TPOrderAction,
	TPActionStatus
}) => {
	const isTriggered = checkOrderLegIsTriggered({
		orderStatus: SLOrderStatus
	});
	let { color } = getStyleOfOrderLeg({
		orderStatus: SLOrderStatus,
		orderAction: SLOrderAction,
		actionStatus: SLActionStatus
	});
	if (SLOrderStatus === 'Triggered Inactive' && SLRemainingVolume === 0) {
		color = CommonStyle.color.modify;
	}
	// 11 + 1 + 1+ 1 = 14
	return (
		<View
			style={{
				position: 'absolute',
				top: 0,
				left: 0,
				right: 64 / 2,
				bottom: 16,
				borderColor: CommonStyle.color.dusk_tabbar,
				borderRadius: 8,
				borderWidth: 1,
				alignItems: 'flex-end',
				flexDirection: 'row'
			}}
		>
			<Text
				style={{
					color,
					fontSize: CommonStyle.font7,
					fontFamily: CommonStyle.fontPoppinsRegular,
					marginLeft: 8,
					marginRight: 8,
					lineHeight: 11
				}}
			>
				{I18n.t('stopLossLowerCase')}
			</Text>
			{isTriggered ? <SvgIcon name={'triggerState'} size={11} /> : null}
		</View>
	);
};

const ThirdPart = ({
	side,
	isStoploss,
	isTakeProfit,
	SLOrderStatus,
	TPOrderStatus,
	SLRemainingVolume,
	TPRemainingVolume,
	SLOrderAction,
	SLActionStatus,
	TPOrderAction,
	TPActionStatus
}) => {
	const keyLanguage =
		isStoploss && isTakeProfit
			? 'takeProfitLowerCase'
			: isStoploss
			? 'stopLossLowerCase'
			: 'takeProfitLowerCase';
	const orderStatus =
		isStoploss && isTakeProfit
			? TPOrderStatus
			: isStoploss
			? SLOrderStatus
			: TPOrderStatus;
	const orderAction =
		isStoploss && isTakeProfit
			? TPOrderAction
			: isStoploss
			? SLOrderAction
			: TPOrderAction;
	const actionStatus =
		isStoploss && isTakeProfit
			? TPActionStatus
			: isStoploss
			? SLActionStatus
			: TPActionStatus;
	const remainingVolume =
		isStoploss && isTakeProfit
			? TPRemainingVolume
			: isStoploss
			? SLRemainingVolume
			: isStoploss;
	const isTriggered = checkOrderLegIsTriggered({ orderStatus });

	let { color } = getStyleOfOrderLeg({
		orderStatus,
		orderAction,
		actionStatus
	});
	if (orderStatus === 'Triggered Inactive' && remainingVolume === 0) {
		color = CommonStyle.color.modify;
	}
	const marginRight = isStoploss && isTakeProfit ? 8 : 16;
	// 11 + 1 + 2 = 16
	return (
		<View
			style={{
				position: 'absolute',
				top: 0,
				bottom: 0,
				left: 0,
				right: 64 / 2,
				borderColor: CommonStyle.color.dusk_tabbar,
				borderRadius: 8,
				borderWidth: 1,
				alignItems: 'flex-end',
				flexDirection: 'row',
				paddingBottom: 2
			}}
		>
			<Text
				style={{
					color,
					fontSize: CommonStyle.font7,
					fontFamily: CommonStyle.fontPoppinsRegular,
					marginLeft: 8,
					marginRight: marginRight,
					lineHeight: 11
				}}
			>
				{I18n.t(keyLanguage)}
			</Text>
			{isTriggered ? <SvgIcon name={'triggerState'} size={11} /> : null}
		</View>
	);
};

const ContingentPart = ({ status }) => {
	let color = CommonStyle.fontNearLight6;
	let borderColor = CommonStyle.color.dusk_tabbar;
	if (status === 'ACTIVE' || status === 'PRE_ACTIVE') {
		color = CommonStyle.color.warning;
		borderColor = CommonStyle.color.warning;
	}
	// contingentStatus
	// 12 + 1 + 2 + 2 = 17
	return (
		<View
			style={{
				position: 'absolute',
				top: 0,
				left: 0,
				right: 64 / 2,
				bottom: 14 + 16,
				borderColor,
				borderRadius: 8,
				borderWidth: 1,
				paddingTop: 2,
				flexDirection: 'row'
			}}
		>
			<Text
				style={{
					color,
					fontSize: CommonStyle.fontTiny,
					fontFamily: CommonStyle.fontPoppinsRegular,
					marginLeft: 8,
					marginRight: 8,
					lineHeight: 12
				}}
			>
				{I18n.t('condition')}
			</Text>
		</View>
	);
};

let AnimationComp = ({ value, _top }, ref) => {
	const updateHeight = useCallback(({ position, top }) => {
		value && value.setValue(position);
		_top && _top.setValue(top);
	}, []);
	useImperativeHandle(ref, () => {
		return {
			updateHeight
		};
	});
	// const withHeightBlock = () => {
	//     return block([
	//         cond(
	//             eq(positionValue, STATE.TOP),
	//             [set(value, HEIGHT_ROW - 19 - 19)],
	//             cond(
	//                 eq(positionValue, STATE.MIDDLE),
	//                 [set(value, HEIGHT_ROW - 17)],
	//                 [set(value, HEIGHT_ROW)]
	//             )
	//         )
	//     ])
	// }
	// return <Code exec={withHeightBlock()} />
	return null;
};
AnimationComp = React.forwardRef(AnimationComp);
AnimationComp = React.memo(AnimationComp, () => true);

let TextInsideCircle = (props, ref) => {
	const [textProperty, setTextProperty] = useState({
		textStyle: {},
		text: ''
	});
	const changeTextProperty = useCallback(
		({
			filledQuantity,
			orderQuantity,
			SLOrderStatus,
			TPOrderStatus,
			isStoploss,
			isTakeProfit,
			orderObject,
			contingentStatus
		}) => {
			// const { textStyle, text } = getFillStatusProperty({
			//     filledQuantity,
			//     orderQuantity
			// })
			const { textStyle, text } = getTextInsideCircleProperty({
				filledQuantity,
				orderQuantity,
				SLOrderStatus,
				TPOrderStatus,
				isStoploss,
				isTakeProfit,
				orderObject,
				contingentStatus
			});
			setTextProperty({
				textStyle,
				text
			});
		},
		[]
	);
	useImperativeHandle(ref, () => {
		return {
			changeTextProperty
		};
	});
	return (
		<View
			style={{
				position: 'absolute',
				width: 64 - 16,
				height: 64 - 16,
				alignItems: 'center',
				justifyContent: 'center'
			}}
		>
			<Text
				adjustsFontSizeToFit
				style={[{ textAlign: 'center' }, textProperty.textStyle]}
			>
				{textProperty.text}
			</Text>
		</View>
	);
};
TextInsideCircle = React.forwardRef(TextInsideCircle);

const Left = ({ item }) => {
	const {
		side,
		filled_quantity_percent: filledQuantityPercent,
		has_stoploss: isStoploss,
		has_takeprofit: isTakeProfit,
		filled_quantity: filledQuantity,
		order_quantity: orderQuantity,
		stoploss_order_info: SLOrderInfo = {},
		takeprofit_order_info: TPOrderInfo = {},
		ct_status: contingentStatus,
		ct_price_base: contingentPriceBase,
		ct_condition: condition,
		ct_trigger_price: contingentPrice
	} = item;

	const isShowCondition =
		contingentStatus || contingentPriceBase || condition || contingentPrice;

	const {
		stoploss_order_status: SLOrderStatus,
		stoploss_order_action: SLOrderAction,
		stoploss_action_status: SLActionStatus,
		stoploss_remaining_volume: SLRemainingVolume
	} = SLOrderInfo;
	const {
		takeprofit_order_status: TPOrderStatus,
		takeprofit_order_action: TPOrderAction,
		takeprofit_action_status: TPActionStatus,
		takeprofit_remaining_volume: TPRemainingVolume
	} = TPOrderInfo;
	const _heightValue = useMemo(() => {
		return new RNAnimated.Value(HEIGHT_ROW);
	}, []);

	const _top = useMemo(() => {
		return new RNAnimated.Value(0);
	}, []);

	const refAnimation = useRef({});
	const refPieChart = useRef({});
	const refTextInsideChart = useRef({});

	useEffect(() => {
		// Thay đổi stoploss và take profit -> run animation thay đổi height của side
		let position = POSITION_DISTANCE.BOTTOM; // 2 thằng không trigger
		let top = 0;

		if ((!isStoploss && isTakeProfit) || (!isTakeProfit && isStoploss)) {
			position = POSITION_DISTANCE.MIDDLE;
		} else if (isStoploss && isTakeProfit) {
			position = POSITION_DISTANCE.TOP;
		}

		if (isShowCondition) {
			position = position - 17;
			top = 17;
		}

		refAnimation.current &&
			refAnimation.current.updateHeight &&
			refAnimation.current.updateHeight({ position, top });
	}, [isStoploss, isTakeProfit, isShowCondition]);

	useEffect(() => {
		refPieChart.current &&
			refPieChart.current.changePercent &&
			refPieChart.current.changePercent(filledQuantityPercent);
	}, [filledQuantityPercent]);
	useEffect(() => {
		refTextInsideChart.current &&
			refTextInsideChart.current.changeTextProperty &&
			refTextInsideChart.current.changeTextProperty({
				filledQuantity,
				orderQuantity,
				SLOrderStatus,
				TPOrderStatus,
				isStoploss,
				isTakeProfit,
				orderObject: item,
				contingentStatus
			});
	}, [
		filledQuantity,
		orderQuantity,
		SLOrderStatus,
		TPOrderStatus,
		isStoploss,
		isTakeProfit,
		contingentStatus
	]);
	return (
		<View style={{ width: '35%', height: '100%' }}>
			<AnimationComp
				ref={refAnimation}
				value={_heightValue}
				_top={_top}
			/>
			<ThirdPart
				side={side}
				isStoploss={isStoploss}
				isTakeProfit={isTakeProfit}
				SLOrderStatus={SLOrderStatus}
				TPOrderStatus={TPOrderStatus}
				SLOrderAction={SLOrderAction}
				SLActionStatus={SLActionStatus}
				TPOrderAction={TPOrderAction}
				TPActionStatus={TPActionStatus}
				SLRemainingVolume={SLRemainingVolume}
				TPRemainingVolume={TPRemainingVolume}
			/>
			<SecondPart
				side={side}
				isStoploss={isStoploss}
				isTakeProfit={isTakeProfit}
				SLOrderStatus={SLOrderStatus}
				SLOrderAction={SLOrderAction}
				SLActionStatus={SLActionStatus}
				TPOrderAction={TPOrderAction}
				TPActionStatus={TPActionStatus}
				SLRemainingVolume={SLRemainingVolume}
			/>
			<ContingentPart status={contingentStatus} />
			<FirstPart
				_heightValue={_heightValue}
				_top={_top}
				side={side}
				isStoploss={isStoploss}
				isTakeProfit={isTakeProfit}
			/>
			<OrdersRowPieChart
				ref={refPieChart}
				diameter={64} // Đường kính
				side={side}
				TextComp={
					<TextInsideCircle
						isStoploss={isStoploss}
						isTakeProfit={isTakeProfit}
						SLOrderStatus={SLOrderStatus}
						TPOrderStatus={TPOrderStatus}
						ref={refTextInsideChart}
						filledQuantity={filledQuantity}
						orderQuantity={orderQuantity}
						contingentStatus={contingentStatus}
					/>
				}
			/>
		</View>
	);
};

const Right = ({ item }) => {
	const {
		symbol,
		exchange,
		side,
		limit_price: limitPrice,
		filled_quantity: filledQuantity,
		order_quantity: totalQuantity
	} = item;
	return (
		<View
			style={{
				width: '60%',
				paddingVertical: 8,
				paddingRight: 8
			}}
		>
			<OrdersRowSymbolInfo symbol={symbol} exchange={exchange} />
			<View style={{ height: 4 }} />
			<OrdersRowVolume
				side={side}
				filledQuantity={filledQuantity}
				totalQuantity={totalQuantity}
			/>
			<OrdersRowPrice limitPrice={limitPrice} />
		</View>
	);
};

const OrderStatus = ({ orderAction, actionStatus }) => {
	const { text, backgroundColor, iconName, isShow } = getOrderStatusProperty({
		orderAction,
		actionStatus
	});
	return (
		<View
			style={{
				position: 'absolute',
				bottom: 0,
				right: 0,
				justifyContent: 'center',
				alignItems: 'center',
				borderTopWidth: 1,
				borderLeftWidth: 1,
				borderTopLeftRadius: 8,
				borderColor: backgroundColor,
				paddingHorizontal: 8,
				paddingVertical: 4
			}}
		>
			<Text
				style={{
					fontSize: CommonStyle.font7,
					fontFamily: CommonStyle.fontPoppinsRegular,
					color: backgroundColor
				}}
			>
				{text}
			</Text>
		</View>
	);
};

const CancelButton = ({
	closeInteractable,
	navigator,
	data,
	disabled,
	updateActiveStatus,
	_deltaX
}) => {
	const isConnected = useSelector(
		(state) => state.app.isConnected,
		shallowEqual
	);
	const isDisabled =
		disabled || !isConnected || !checkOrderHasCancel({ data });
	return (
		<View
			style={{
				position: 'absolute',
				top: 0,
				left: 0,
				right: 0,
				height: HEIGHT_ROW,
				backgroundColor: CommonStyle.color.sell,
				borderRadius: 8,
				alignItems: 'flex-end'
			}}
			pointerEvents="box-none"
		>
			<TouchableOpacityAnim
				disabled={isDisabled}
				onPress={() => {
					Platform.OS === 'android' &&
						updateActiveStatus &&
						updateActiveStatus(false);
					handleShowCancelOrder({
						data,
						navigator,
						cancelType: CANCEL_TYPE.CANCEL_ORDER_ORIGINAL,
						cbCancelSuccess: closeInteractable
					});
				}}
				style={[
					{
						width: _deltaX.interpolate({
							inputRange: [
								SNAP_POINT.RIGHT - 1,
								SNAP_POINT.RIGHT,
								0
							],
							outputRange: [
								-(SNAP_POINT.RIGHT - 1),
								-SNAP_POINT.RIGHT,
								-SNAP_POINT.RIGHT
							]
						}),
						height: '100%',
						alignItems: 'center',
						justifyContent: 'center',
						overflow: 'hidden',
						opacity: isDisabled ? 0.5 : 1
					}
				]}
			>
				<View
					style={{
						transform: [
							{
								rotate: '-25deg'
							}
						]
					}}
				>
					<CommonStyle.icons.delete
						color={CommonStyle.fontBlack}
						size={30}
						name={'delete'}
						style={{ height: 30, width: 30 }}
					/>
				</View>
			</TouchableOpacityAnim>
		</View>
	);
};

const OrdersRow = ({
	item,
	index,
	showDetail,
	showHideTabbar,
	blurSearch,
	navigator,
	updateActiveStatus
}) => {
	const {
		order_action: orderAction,
		action_status: actionStatus,
		filled_quantity: filledQuantity
	} = item;
	const disableProperty = useMemo(() => {
		return getDisableAmendCancelProperty({
			orderAction,
			actionStatus,
			filledQuantity
		});
	}, [orderAction, actionStatus]);
	const onPress = () => {
		blurSearch && blurSearch();
		showDetail && showDetail(item);
		showHideTabbar && showHideTabbar(0);
	};
	const _deltaX = useMemo(() => {
		return new Value(0);
	}, []);
	const refInteractable = useRef();
	const onDrag = useCallback((event) => {
		const { state } = event.nativeEvent;
		state === 'start' &&
			registerInteractable({ index, fn: closeInteractable });
	}, []);
	const closeInteractable = useCallback(() => {
		refInteractable.current &&
			refInteractable.current.snapTo &&
			refInteractable.current.snapTo({ index: 1 });
	}, []);
	const orderTag = getOrderTag();
	if (orderTag === ORDER_TAG.ACTIVE) {
		return (
			<Animated.View
				style={{
					marginHorizontal: 8,
					backgroundColor: 'transparent',
					marginTop: 8,
					height: HEIGHT_ROW
				}}
			>
				<CancelButton
					closeInteractable={closeInteractable}
					navigator={navigator}
					data={item}
					disabled={disableProperty.disableCancelAll}
					updateActiveStatus={updateActiveStatus}
					_deltaX={_deltaX}
				/>
				<Interactable.View
					horizontalOnly={true}
					snapPoints={[
						{ x: SNAP_POINT.LEFT },
						{ x: SNAP_POINT.MIDDLE },
						{ x: SNAP_POINT.RIGHT }
					]}
					animatedValueX={_deltaX}
					boundaries={{
						left: -(DEVICE_WIDTH - 8 * 2 + SNAP_POINT.RIGHT),
						right: 0,
						bounce: 0
					}}
					onDrag={onDrag}
					ref={refInteractable}
				>
					<TouchableOpacityOpt
						activeOpacity={1}
						onPress={onPress}
						style={{
							flexDirection: 'row',
							borderRadius: 8,
							height: '100%',
							width: '100%',
							backgroundColor: CommonStyle.color.dark
						}}
					>
						<Left item={item} />
						<View style={{ width: 16 }} />
						<Right item={item} />
						<OrderStatus
							orderAction={orderAction}
							actionStatus={actionStatus}
						/>
					</TouchableOpacityOpt>
				</Interactable.View>
			</Animated.View>
		);
	} else {
		return (
			<TouchableOpacityOpt
				activeOpacity={1}
				onPress={onPress}
				style={{
					flexDirection: 'row',
					marginHorizontal: 8,
					backgroundColor: CommonStyle.color.dark,
					marginTop: 8,
					borderRadius: 8,
					height: HEIGHT_ROW
				}}
			>
				<Left item={item} />
				<View style={{ width: 16 }} />
				<Right item={item} />
				<OrderStatus
					orderAction={orderAction}
					actionStatus={actionStatus}
				/>
			</TouchableOpacityOpt>
		);
	}
};

export default OrdersRow;
