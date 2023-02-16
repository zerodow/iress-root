import React, { useMemo, useRef } from 'react'
import { View, Text, Dimensions } from 'react-native'
import { connect, shallowEqual, useDispatch, useSelector } from 'react-redux'
import CommonStyle from '~/theme/theme_controller'
import * as ConditionModel from '~/screens/new_order/Model/PriceBaseContingentConditionModel';
import * as PriceBaseTabModel from '~/screens/new_order/Model/PriceBaseContingentTabModel';
import { formatPriceOnBlur, getDecimalPriceByRule } from '~/screens/new_order/Controller/InputController';

const PRICE_BASE_LABEL = {
	ASK: 'Ask',
	BID: 'Bid',
	LAST: 'Last'
}

const BlockContingentReviewInfo = ({ symbol, exchange, ctTriggerPrice }) => {
	const { width, height } = Dimensions.get('window')
	const heightComponent = (61 / height) * height;
	const enableContingentBlock = useSelector(state => state.newOrder.enableContingentBlock);
	const isContingentTypePoint = useSelector(state => state.newOrder.isContingentTypePoint);
	const templateTriggerPrice = useSelector(state => state.newOrder.templateTriggerPrice);
	const priceDecimal = useRef(getDecimalPriceByRule());

	const triggerPrice = useMemo(() => {
		let price = ctTriggerPrice.value;
		if (isContingentTypePoint) {
			price = templateTriggerPrice;
		}
		price = formatPriceOnBlur(price, priceDecimal.current);
		return price
	}, [ctTriggerPrice])

	const renderLeft = () => {
		return (
			<View
				style={{
					height: heightComponent,
					backgroundColor: '#FF8C06',
					justifyContent: 'center',
					alignItems: 'center',
					borderRadius: 4
				}}>
				<Text
					style={{
						fontSize: CommonStyle.font15,
						fontFamily: CommonStyle.fontPoppinsRegular,
						textAlign: 'center',
						paddingLeft: 14,
						paddingRight: 14,
						paddingTop: 4,
						paddingBottom: 4,
						color: CommonStyle.fontBlack
					}}>Contingent{'\n'}Trigger</Text>
			</View>
		)
	}

	const parseCondition = () => {
		if (ConditionModel.model.depth === 'GREATER_OR_EQUAL') {
			return '>=';
		} else if (ConditionModel.model.depth === 'LESS_OR_EQUAL') {
			return '<=';
		} else if (ConditionModel.model.depth === 'LESS') {
			return '<';
		} else return '>'
	}

	if (!enableContingentBlock) {
		return null;
	}
	return (
		<View style={{
			flexDirection: 'row',
			justifyContent: 'flex-end',
			alignItems: 'center',
			marginTop: 8,
			position: 'relative'
		}}>
			<View style={{ position: 'absolute', left: 8, zIndex: 100 }}>
				{renderLeft()}
			</View>
			<View style={{ left: 8, marginRight: 16, flex: 1 }}>
				<View style={{
					borderWidth: 1,
					left: 0,
					paddingRight: 16,
					borderColor: '#FF8C06',
					justifyContent: 'center',
					flexDirection: 'column',
					alignItems: 'flex-end',
					borderRadius: CommonStyle.fontMin,
					height: heightComponent

				}}>
					<View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
						<Text style={{ color: '#FFF', opacity: 0.5, minWidth: 80, textAlign: 'left' }}>Price Base</Text>
						<Text style={{ minWidth: 60, color: 'white', textAlign: 'right' }}>{PRICE_BASE_LABEL[PriceBaseTabModel.model.depth]}</Text>
					</View>
					<View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
						<Text style={{ color: '#FFF', opacity: 0.5, minWidth: 80, textAlign: 'left' }}>Condition</Text>
						<Text style={{ minWidth: 60, color: 'white', textAlign: 'right' }}>{parseCondition()}</Text>
					</View>
					<View style={{ flexDirection: 'row', alignContent: 'flex-end' }}>
						<Text style={{ color: '#FFF', opacity: 0.5, minWidth: 80, textAlign: 'left' }}>Price</Text>
						<Text style={{ minWidth: 60, color: 'white', textAlign: 'right' }}>{triggerPrice}</Text>
					</View>
				</View>
			</View>

		</View>
	)
}
BlockContingentReviewInfo.propTypes = {}
BlockContingentReviewInfo.defaultProps = {}
function mapStateToProps(state) {
	return {
		isBuy: state.newOrder.isBuy,
		orderType: state.newOrder.orderType,
		limitPrice: state.newOrder.limitPrice,
		triggerPrice: state.newOrder.triggerPrice,
		duration: state.newOrder.duration, // GTD
		destination: state.newOrder.destination,
		quantity: state.newOrder.quantity,
		symbol: state.newOrder.symbol,
		exchange: state.newOrder.exchange,
		expiryTime: state.newOrder.expiryTime,
		ctTriggerPrice: state.newOrder.ctTriggerPrice
	}
}
export default connect(mapStateToProps)(BlockContingentReviewInfo)
