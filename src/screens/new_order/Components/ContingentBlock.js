/* eslint-disable camelcase */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import {
	TouchableOpacity,
	Text,
	StyleSheet,
	View,
	Dimensions
} from 'react-native';
import {
	activeContingent,
	changeFocusInput,
	changeTypeInputOrderContingent,
	setTemplatePriceValue,
	setTriggerPrice,
	changeStatusButtonConfirm,
	changeInputText,
	toggleIgnoreType as toggleIgnoreTypeAction,
	updateCurrentInputShown
} from '~/screens/new_order/Redux/actions.js';
import Enum from '~/enum';
import ContigentPriceBaseTab from './ContigentPriceBaseTab';
import * as TabModel from '~/screens/new_order/Model/PriceBaseContingentTabModel';
import * as PricePointTabModel from '~/screens/new_order/Model/PricePointKeyboardModel';
import * as ConditionModel from '~/screens/new_order/Model/PriceBaseContingentConditionModel';
import ContigentCondition from './ContigentCondition';
import InputWithControl from '~/component/virtual_keyboard/InputWithControl3';
import * as Emitter from '@lib/vietnam-emitter';
import I18n from '~/modules/language/index';
import * as Util from '~/util';
import * as Business from '~/business.js';
import { getChannelShowMessageNewOrder as getChannelChangeOrderError } from '~/streaming/channel';
import CommonStyle from '~/theme/theme_controller';
import * as AttributeModel from '~/screens/new_order/Model/AttributeModel.js';
import {
	formatPriceOnBlur,
	formatPriceOnFocus,
	getDecimalPriceByRule,
	getStepByRule
} from '../Controller/InputController';
import { createSelector } from 'reselect';
import { getGlobalState } from '~/memory/model';
import { size } from 'lodash';

const { NEW_ORDER_INPUT_KEY, TYPE_ERROR_ORDER, TYPE_MESSAGE } = Enum;

const ContingentBlock = () => {
	const layout = useSelector((state) => state.newOrder.layout, shallowEqual);
	const enableContingent = useSelector(
		(state) => state.newOrder.enableContingent
	);
	const enableContingentBlock = useSelector(
		(state) => state.newOrder.enableContingentBlock
	);
	const isContingentTypePoint = useSelector(
		(state) => state.newOrder.isContingentTypePoint
	);
	const isLoadingOrderAttribute = useSelector(
		(state) => state.newOrder.isLoadingOrderAttribute
	);

	const ctTriggerPrice = useSelector(
		(state) => state.newOrder.ctTriggerPrice.value
	);
	const calculateTriggerPrice = useSelector(
		(state) => state.newOrder.calculateTriggerPrice
	);
	const textChanged = useSelector((state) => state.newOrder.textChanged);
	const toggleIgnoreType = useSelector(
		(state) => state.newOrder.toggleIgnoreType
	);
	const dispatch = useDispatch();
	const [userHasInput, setUserHasInput] = useState(false);
	const pointInputRef = useRef();
	const [triggerOnChangePricebase, setTriggerOnChangePricebase] =
		useState(false);
	const [ignoreTypePoint, setIgnoreTypePoint] = useState(true);
	const storedInput = useRef({
		point: 0,
		price: ctTriggerPrice,
		pointAutoConvert: 0, // use for alert invalid checkin
		priceAutoConvert: 0, // use for alert invalid checking
		step: Enum.STEP.STEP_PRICE,
		ignoreByPoint: true // used for ignore point or price type when price base tab changes
	});
	storedInput.current.step = getStepByRule(ctTriggerPrice);
	const priceDecimal = useRef(getDecimalPriceByRule());
	const exchange = AttributeModel.getExchange();
	const symbol = AttributeModel.getSymbol();
	const fixedPriceBase = AttributeModel.getFixedPriceBase();

	const channel = getChannelChangeOrderError();
	const [blurInput, setBlurInput] = useState(undefined);
	const [pressFnKey, setPressFnKey] = useState(undefined);
	const [startEditing, setStartEditing] = useState(false);
	const displayPriceMutilple = Business.getPriceDisplayMultiplier({
		symbol,
		exchange
	});
	const onChangeTab = useCallback(
		(tab) => {
			TabModel.setDepthTab(tab.key);
			dispatch(changeStatusButtonConfirm(false));
			setTriggerOnChangePricebase(true);
			if (isContingentTypePoint) {
				if (ignoreTypePoint) {
					restoreLastInput(true);
					calculateBackgroundPrice(false);
				} else {
					doCalculatePoints();
				}
			} else {
				if (!ignoreTypePoint) {
					restoreLastInput(false);
				} else {
					doCalculatePrice();
				}
			}
		},
		[isContingentTypePoint, ignoreTypePoint]
	);

	function useOnListenError({ updateError }) {
		const channel = getChannelChangeOrderError();
		return useEffect(() => {
			const id = Emitter.addListener(
				channel,
				null,
				({ msg, type, key }) => {
					key === TYPE_ERROR_ORDER.TRIGGER_PRICE_INVALID_ERROR &&
						updateError &&
						updateError({
							id: Util.getRandomKey(),
							isError: true
						});
				}
			);
			return () => Emitter.deleteByIdEvent(id);
		}, []);
	}

	useOnListenError({
		updateError: () => {
			const refViewWrapper =
				pointInputRef.current && pointInputRef.current.getRef();
			refViewWrapper &&
				refViewWrapper.setNativeProps &&
				refViewWrapper.setNativeProps({
					style: { borderWidth: 1, borderColor: 'red' }
				});
		}
	});

	useEffect(() => {
		// Trigger editable state after mount component after pre-fill price by auto
		setTimeout(() => {
			setStartEditing(true);
		}, 100);
		return () => {
			storedInput.current.ignoreByPoint = true;
			storedInput.current.pointAutoConvert = 0;
			storedInput.current.priceAutoConvert = 0;
			PricePointTabModel.model.isTypePoint = true;
		};
	});

	const getPriceData = (state) => {
		const { symbol, exchange } = state.newOrder;
		if (symbol) {
			const key = `${symbol}#${exchange}`;
			const { data } = state.quotes || {};
			const quote = data[key] || {};
			const {
				trade_price: tradePrice,
				ask_price: askPrice,
				bid_price: bidPrice
			} = quote;
			return {
				tradePrice,
				askPrice,
				bidPrice
			};
		}
		return {};
	};

	const onChangeCondition = useCallback(
		(tab) => {
			dispatch(changeStatusButtonConfirm(false));
			ConditionModel.setDepthTab(tab.key);
			if (isContingentTypePoint) {
				if (ignoreTypePoint) {
					restoreLastInput(true);
					calculateBackgroundPrice(false);
				} else {
					doCalculatePoints();
				}
			} else {
				if (!ignoreTypePoint) {
					restoreLastInput(false);
				} else {
					doCalculatePrice();
				}
			}
		},
		[isContingentTypePoint, ignoreTypePoint]
	);

	const getPriceSymbol = () => {
		// cache from useEffect
		const priceData = getPriceData(getGlobalState()) || {};

		if (TabModel.model.depth === 'BID') {
			return +priceData.bidPrice;
		} else if (TabModel.model.depth === 'ASK') {
			return +priceData.askPrice;
		} else {
			return +priceData.tradePrice;
		}
	};

	const pointToPrice = (point) => {
		const priceSymbol = getPriceSymbol() || 0;
		const { depth } = ConditionModel.model;
		if (depth === 'LESS' || depth === 'LESS_OR_EQUAL') {
			return Math.max(priceSymbol - point, 0);
		} else {
			return priceSymbol + point;
		}
	};
	const priceToPoint = (price) => {
		const priceSymbol = getPriceSymbol() || 0;
		const { depth } = ConditionModel.model;
		if (depth === 'LESS' || depth === 'LESS_OR_EQUAL') {
			return Math.max(priceSymbol - price, 0);
		} else {
			return Math.max(price - priceSymbol, 0);
		}
	};

	useEffect(() => {
		setIgnoreTypePoint(isContingentTypePoint);
	}, [toggleIgnoreType]);

	const doCalculatePrice = () => {
		if (!startEditing) {
			return;
		}
		const price = pointToPrice(storedInput.current.point);
		const formatedPrice = formatPriceOnBlur(price, priceDecimal.current);
		dispatch(setTriggerPrice(formatedPrice));
		storedInput.current.priceAutoConvert = price;
		pointInputRef.current &&
			pointInputRef.current.changeText(formatedPrice);
	};

	const doCalculatePoints = () => {
		if (!startEditing) {
			return;
		}
		const point = priceToPoint(storedInput.current.price);
		const updatedText = formatPriceOnBlur(point, priceDecimal.current);
		const noZero = parseFloat(updatedText).toString();
		dispatch(setTriggerPrice(noZero));
		storedInput.current.pointAutoConvert = point;
		pointInputRef.current && pointInputRef.current.changeText(noZero);
	};

	const restoreLastInput = (isPoint) => {
		let lastInput = isPoint
			? storedInput.current.point
			: storedInput.current.price;
		const res = parseFloat(lastInput);
		dispatch(setTriggerPrice(res));
		pointInputRef.current && pointInputRef.current.changeText(res + '');
	};

	// Trigger when price/point button on keyboard pressed
	useEffect(() => {
		if (calculateTriggerPrice === 'POINTS') {
			if (ignoreTypePoint) {
				// restore last input
				restoreLastInput(true);
				calculateBackgroundPrice(false);
			} else {
				doCalculatePoints();
			}
		} else {
			if (!ignoreTypePoint) {
				// restore last input
				restoreLastInput(false);
			} else {
				doCalculatePrice();
			}
		}
	}, [calculateTriggerPrice, isContingentTypePoint]);

	const calculateBackgroundPrice = (updateTriggerPrice) => {
		if (isContingentTypePoint) {
			const price = pointToPrice(storedInput.current.point);

			const formatedPrice = formatPriceOnBlur(
				price,
				priceDecimal.current
			);
			const res = parseFloat(formatedPrice);
			dispatch(setTemplatePriceValue(res));
			if (updateTriggerPrice && userHasInput) {
				dispatch(setTriggerPrice(res));
			}
		}
	};

	const onFocus = useCallback((ref) => {
		dispatch(changeFocusInput(NEW_ORDER_INPUT_KEY.CONTINGENT_STRATEGY));
	}, []);

	useEffect(() => {
		if (!textChanged && !userHasInput) {
			return;
		}
		if (`${textChanged}`.length === 0) {
			if (isContingentTypePoint) {
				storedInput.current.point = 0;
				storedInput.current.ignoreByPoint = true;
				storedInput.current.pointAutoConvert = 0;
				if (ignoreTypePoint) {
					calculateBackgroundPrice(true);
				}
			} else {
				storedInput.current.price = 0;
				storedInput.current.ignoreByPoint = false;
				dispatch(setTemplatePriceValue(0));
				storedInput.current.priceAutoConvert = 0;
			}
			dispatch(setTriggerPrice(0));
		} else {
			if (isContingentTypePoint) {
				storedInput.current.point = parseFloat(textChanged);
				storedInput.current.ignoreByPoint = true;
				if (ignoreTypePoint) {
					calculateBackgroundPrice(true);
				}
				storedInput.current.pointAutoConvert = parseFloat(textChanged);
			} else {
				storedInput.current.price = parseFloat(textChanged);
				storedInput.current.ignoreByPoint = false;
				storedInput.current.priceAutoConvert = parseFloat(textChanged);
				dispatch(setTemplatePriceValue(parseFloat(textChanged)));
				let price = parseFloat(textChanged);
				dispatch(setTriggerPrice(price));
			}
		}
	}, [textChanged]);

	useEffect(() => {
		if (!pressFnKey) {
			return;
		}
		dispatch(changeTypeInputOrderContingent(isContingentTypePoint));
	}, [pressFnKey]);

	const onChangeText = useCallback(
		(text) => {
			setStartEditing(true);
			dispatch(changeStatusButtonConfirm(false));
			dispatch(toggleIgnoreTypeAction(new Date().getTime()));
			setUserHasInput(true);
			dispatch(changeInputText(text));
		},
		[isContingentTypePoint]
	);

	const onChangeTextByFnKey = useCallback((text) => {
		setPressFnKey(new Date().getTime());
		setTimeout(() => {
			onChangeText(text);
		}, 50);
	}, []);

	useEffect(() => {
		if (!blurInput) {
			return;
		}
		const stateNewOrder = getGlobalState().newOrder;

		if (
			stateNewOrder.enableContingentBlock &&
			stateNewOrder.currentInputShown === 0 &&
			!stateNewOrder.isContingentTypePoint
		) {
			Emitter.emit(channel, {
				msg: I18n.t('limitTriggerPriceValid'),
				type: TYPE_MESSAGE.ERROR,
				key: TYPE_ERROR_ORDER.TRIGGER_PRICE_INVALID_ERROR
			});
		} else if (
			stateNewOrder.enableContingentBlock &&
			stateNewOrder.currentInputShown === 0 &&
			stateNewOrder.isContingentTypePoint
		) {
			Emitter.emit(channel, {
				msg: I18n.t('pointMustBePositive'),
				type: TYPE_MESSAGE.ERROR,
				key: TYPE_ERROR_ORDER.TRIGGER_PRICE_INVALID_ERROR
			});
		}
	}, [blurInput]);

	const onBlur = useCallback(() => {
		setBlurInput(new Date().getTime());
	}, [blurInput]);

	if (layout === Enum.ORDER_LAYOUT.BASIC || !enableContingent) {
		return null;
	}

	const toggleActive = () => {
		setUserHasInput(false);
		TabModel.resetContingentPricebase();
		ConditionModel.resetContingentCondition();
		dispatch(changeTypeInputOrderContingent(true));
		dispatch(activeContingent(true));
		dispatch(setTriggerPrice(0));
	};

	if (!enableContingentBlock) {
		return (
			<View style={{ flexDirection: 'column' }}>
				<View style={{ flexDirection: 'row' }}>
					<TouchableOpacity
						style={styles.block}
						onPress={toggleActive}
					>
						<Text style={styles.text}>REGULAR CONDITION</Text>
					</TouchableOpacity>
				</View>
				<View
					style={{
						height: 3,
						backgroundColor: 'black',
						marginTop: 8
					}}
				/>
			</View>
		);
	}

	const onChangeText2 = (text) => {
		const refViewWrapper =
			pointInputRef.current && pointInputRef.current.getRef();
		refViewWrapper &&
			refViewWrapper.setNativeProps &&
			refViewWrapper.setNativeProps({
				style: { borderWidth: 1, borderColor: CommonStyle.fontBorder }
			});
		const valueAsNumber = text ? +text : 0;
		dispatch(updateCurrentInputShown(parseFloat(valueAsNumber)));
	};

	const getDecimal = () => {
		if (`${textChanged}`.includes('.')) {
			return priceDecimal.current;
		}
		return isContingentTypePoint &&
			((!userHasInput && !`${ctTriggerPrice}`.includes('.')) ||
				(userHasInput && !`${textChanged}`.includes('.')))
			? 0
			: priceDecimal.current;
	};

	const pointerEvents = ConditionModel.model.isDisableCondition
		? 'none'
		: 'auto';

	return (
		<View
			style={{
				flexDirection: 'column',
				paddingTop: 8,
				paddingBottom: 8,
				marginTop: 8
			}}
			pointerEvents={pointerEvents}
		>
			<View
				style={{
					flexDirection: 'row',
					justifyContent: 'space-between',
					alignContent: 'center'
				}}
			>
				<Text style={styles.label}>Price Base</Text>
				<ContigentPriceBaseTab
					onChangeTab={onChangeTab}
					fixedPriceBase={fixedPriceBase}
					exchange={exchange}
					ctTriggerPrice={ctTriggerPrice}
				/>
			</View>
			<View
				style={{
					flexDirection: 'row',
					justifyContent: 'space-between',
					marginTop: 8,
					alignItems: 'center'
				}}
			>
				<Text style={styles.label}>Condition</Text>
				<ContigentCondition onChangeTab={onChangeCondition} />
			</View>
			<View
				style={{
					flexDirection: 'row',
					justifyContent: 'space-between',
					alignItems: 'center',
					marginTop: 4
				}}
			>
				<Text style={[styles.label, { marginTop: 16 }]}>
					{isContingentTypePoint ? 'Points' : 'Price'}
				</Text>
				<View
					style={{
						width: Dimensions.get('screen').width / 2 - 16,
						marginTop: 16,
						marginRight: 16
					}}
				>
					<InputWithControl
						type={NEW_ORDER_INPUT_KEY.CONTINGENT_STRATEGY}
						step={
							isContingentTypePoint ? 1 : storedInput.current.step
						}
						// key={ctTriggerPrice}
						limitInteger={15}
						ref={pointInputRef}
						onChangeText={onChangeText2}
						onFocus={onFocus}
						onBlur={onBlur}
						autoFocus={false}
						defaultValue={ctTriggerPrice + ''}
						relateValue={ctTriggerPrice}
						// decimal={isContingentTypePoint ? 0 : displayPriceMutilple === 0.01 ? 1 : 3}
						decimal={getDecimal()}
						formatValueWhenBlur={(value) => {
							return formatPriceOnBlur(value, getDecimal());
						}}
						formatValueWhenFocus={(value) => {
							return formatPriceOnFocus(value, getDecimal());
						}}
						onInput={onChangeText}
						onInputByFunctionKey={onChangeTextByFnKey}
					/>
				</View>
			</View>
			<View
				style={{ height: 3, backgroundColor: 'black', marginTop: 8 }}
			/>
		</View>
	);
};

export const ALERT = (msg) => {
	const debug = false;
	if (debug) {
		alert(msg);
	}
};

export default ContingentBlock;

const styles = StyleSheet.create({
	block: {
		borderColor: 'rgb(58, 66, 94)',
		backgroundColor: 'transparent',
		borderWidth: 1,
		borderStyle: 'solid',
		marginTop: 8,
		marginLeft: 8,
		borderRadius: 4,
		display: 'flex',
		alignItems: 'center',
		padding: 8,
		width: Dimensions.get('screen').width / 2 - 8
	},
	text: {
		color: '#FFFFFF',
		fontWeight: '400',
		fontSize: 14,
		opacity: 0.7,
		textTransform: 'uppercase'
	},
	label: {
		marginLeft: 16,
		color: '#FFFFFF',
		opacity: 0.5
	}
});
