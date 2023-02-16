import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { View, Text, Dimensions } from 'react-native'
import PropTypes from 'prop-types'

import TabShape from '~/component/tabs_shape/index.js'
import { useDispatch, useSelector, shallowEqual } from 'react-redux'
import { activeContingent, changeLayout, toggleContingent } from '~/screens/new_order/Redux/actions.js'

import CommonStyle from '~/theme/theme_controller'

import * as TabModel from '~/screens/new_order/Model/TabModel.js'
import { ContingentBtn } from '~/screens/new_order/Components/ContingentBtn'
import { isAmend } from '~/screens/new_order/Model/OrderEntryModel'
const { width } = Dimensions.get('window')
const margin = 16
const padding = 4
const grat = 6
const widthTab = ((width / 2) - margin + (grat - padding)) / 2
const TabLayout = React.memo(() => {
	const layout = useSelector(state => state.newOrder.layout, shallowEqual);
	const ctTriggerPrice = useSelector(state => state.newOrder.ctTriggerPrice.value);
	const [enableContingent, setEnableContingent] = useState(false);
	const dispatch = useDispatch()
	const onChangeTab = useCallback((el) => {
		TabModel.setTabLayout(el.key)
		dispatch(changeLayout(el.key))
		if (el.key === 'BASIC') {
			// Reset contingent stategy state
			dispatch(activeContingent(false));
			dispatch(toggleContingent(false));
		}
	}, [])

	useEffect(() => {
		setEnableContingent((Boolean(ctTriggerPrice) && isAmend()) || (!isAmend()));
	}, [ctTriggerPrice])
	return (
		<View
			key={layout}
			pointerEvents={TabModel.model.isDisableTab ? "none" : 'auto'}
			style={{
				minHeight: 50,
				flex: 1
			}}>
			<TabShape
				tabs={[
					{
						title: 'BASIC',
						key: 'BASIC',
						value: 'BASIC'
					},
					{
						title: 'ADVANCED',
						key: 'ADVANCE',
						value: 'ADVANCE'
					}
				]}
				defaultActive={TabModel.model.layout}
				onChangeTab={onChangeTab}
				tabWidth={widthTab}
				tabHeight={31}
				grat={grat}
				strockWidth={1}
				padding={padding}
				strockColor={CommonStyle.color.dusk}
				fillColorDefault={CommonStyle.backgroundColor}
				fillColorActive={CommonStyle.color.modify}
				styleTextDefault={
					{
						fontFamily: CommonStyle.fontPoppinsRegular,
						fontSize: CommonStyle.fontSizeXS,
						color: CommonStyle.fontNearLight4
					}
				}
				styleTextActive={
					{
						fontFamily: CommonStyle.fontPoppinsBold,
						fontSize: CommonStyle.fontSizeXS,
						color: CommonStyle.fontDark
					}
				}
			/>
			{/* Contingent strategy button */}
			{enableContingent && <ContingentBtn />}
		</View>
	)
}, () => true)
TabLayout.propTypes = {}
TabLayout.defaultProps = {}
export default TabLayout
