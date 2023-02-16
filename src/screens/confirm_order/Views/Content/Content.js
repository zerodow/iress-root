import React, { useEffect, useState, useCallback, useReducer, useMemo } from 'react'
import { View, Text, ScrollView } from 'react-native'
import Uuid from 'react-native-uuid';
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import DisplayAccount from './DisplayAccount.js'
import BlockInfoSymbol from './BlockInfoSymbol.js'
import BlockInfoPrice from './BlockInfoPrice.js'
import { func, dataStorage } from '~/storage';
import { getObjectOrderPlace } from '~/screens/new_order/Controller/ContentController.js'
import { getFees } from '~/screens/confirm_order/Controllers/ContentController.js'
import { getAccActive, getPorfolioTypeByCode, getDicPortfolioType } from '~s/portfolio/Model/PortfolioAccountModel'
import { getPortfolioTotal } from '~s/portfolio/Controller/PortfolioTotalController'
import * as Business from '~/business';
import * as api from '~/api';
import BlockContingentReviewInfo from './BlockContingentReviewInfo.js';
const initialState = {
	fees: {}
}
const TYPE_ACTION = {
	SET_FEES: 'SET_FEES'
}
const reducer = (state, action) => {
	switch (action.type) {
		case TYPE_ACTION.SET_FEES:
			return { ...state, fees: action.payload }
		default:
			return state;
	}
};
const Content = (props) => {
	const [state, dispatch] = useReducer(reducer, initialState);
	const [availableOrder, setAvailableOrder] = useState('')

	const { newOrder } = props
	const orderObj = getObjectOrderPlace(newOrder) || {}
	// const currentAccount = dataStorage.currentAccount
	const accActive = getAccActive()
	const typeOder = getPorfolioTypeByCode(accActive)
	const currentAccount = useMemo(() => getDicPortfolioType(accActive), [])
	useEffect(() => {
		getPortfolioTotal(currentAccount.portfolio_id).then(res => {
			setAvailableOrder(res)
		})
	}, [])

	useEffect(() => {
		Business.showHideConfirmPlaceButton({ isShow: true })

		return () => Business.showHideConfirmPlaceButton({
			isShow: false
		})
	}, [orderObj.code])

	return (
		<View style={{
			paddingTop: 8
		}}>
			<DisplayAccount exchange={newOrder.exchange} symbol={newOrder.symbol} />
			<ScrollView disableScrollViewPanResponder={false}>
				<BlockContingentReviewInfo {...props}/>
				<BlockInfoSymbol {...props} />
				<BlockInfoPrice fees={state.fees} {...props} />
				<View style={{ height: 60 }} />
			</ScrollView>

		</View>
	)
}
Content.propTypes = {}
Content.defaultProps = {}
function mapStateToProps(state) {
	return {
		newOrder: state.newOrder
	}
}
export default connect(mapStateToProps)(Content)
