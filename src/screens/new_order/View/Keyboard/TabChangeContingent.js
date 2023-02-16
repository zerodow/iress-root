import React from 'react'
import { View, Dimensions } from 'react-native'
import TabShape from '~/component/tabs_shape/index.js'
import CommonStyle from '~/theme/theme_controller'
import { useDispatch, useSelector } from 'react-redux'
import { setIsTypePoint } from '~/screens/new_order/Model/PricePointKeyboardModel';
import { changeTypeInputOrderContingent, forceCalculateTriggerPrice } from '~/screens/new_order/Redux/actions.js'

const { width } = Dimensions.get('window')
const margin = 8
const grat = 10
const padding = 4
const Index = ({
	inputFocus,
	tabs = [
		{
			title: 'Price',
			key: 'PRICE',
			value: 'PRICE'
		},
		{
			title: 'Points',
			key: 'POINTS',
			value: 'POINTS'
		}
	]
}) => {
	const widthTab = (width - margin * 2 + (grat - padding)) / 2
	const dispatch = useDispatch()
	const onChangeTab = ({ key }) => {
		setIsTypePoint(key === 'POINTS');
		dispatch(changeTypeInputOrderContingent(key === 'POINTS'));
		dispatch(forceCalculateTriggerPrice(key));
	}
	const isContingentTypePoint = useSelector(state => state.newOrder.isContingentTypePoint)
	return (
		<View style={{
			flex: 1,
			height: 40,
			marginVertical: 8,
			paddingHorizontal: 8,
			width: width
		}}>
			<TabShape
				tabs={tabs}
				defaultActive={isContingentTypePoint ? 'POINTS' : 'PRICE'}
				onChangeTab={onChangeTab}
				tabWidth={widthTab}
				tabHeight={40}
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
		</View>
	)
}
Index.propTypes = {}
Index.defaultProps = {}
export default Index
