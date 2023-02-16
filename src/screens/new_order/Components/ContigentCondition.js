import React from 'react';
import { View, Dimensions } from 'react-native';
import TabShape from '~/component/tabs_shape/index.js';
import CommonStyle from '~/theme/theme_controller';
import * as TabModel from '~/screens/new_order/Model/PriceBaseContingentConditionModel';
const { width } = Dimensions.get('window');
const margin = 8;
const grat = 6;
const padding = 4;
const widthTab = (width / 2 - 2 * margin + 3 * (grat - padding) - 1) / 4;
function getFillColorActive(keyTab) {
	return '#57E1F1';
}
const ContigentCondition = ({ defaultActive, onChangeTab }) => {
	return (
		<View
			style={{
				height: 17,
				alignItems: 'center',
				paddingHorizontal: margin,
				right: -(3 - padding - padding)
			}}
		>
			<TabShape
				tabs={[
					{
						title: '<=',
						key: 'LESS_OR_EQUAL',
						value: 'LESS_OR_EQUAL'
					},
					{
						title: '<',
						key: 'LESS',
						value: 'LESS'
					},
					{
						title: '>',
						key: 'GREATER',
						value: 'GREATER'
					},
					{
						title: '>=',
						key: 'GREATER_OR_EQUAL',
						value: 'GREATER_OR_EQUAL'
					}
				]}
				onChangeTab={onChangeTab}
				widthTab={widthTab}
				defaultActive={defaultActive || TabModel.model.depth}
				tabWidth={widthTab}
				tabHeight={31}
				grat={grat}
				strockWidth={'1'}
				padding={padding}
				strockColor={CommonStyle.color.dusk}
				fillColorDefault={CommonStyle.backgroundColor}
				fillColorActive={CommonStyle.color.modify}
				getFillColorActive={getFillColorActive}
				styleTextDefault={{
					fontFamily: CommonStyle.fontPoppinsRegular,
					fontSize: CommonStyle.fontSizeXS,
					color: CommonStyle.fontNearLight4
				}}
				styleTextActive={{
					fontFamily: CommonStyle.fontPoppinsBold,
					fontSize: CommonStyle.fontSizeXS,
					color: CommonStyle.fontDark
				}}
			/>
		</View>
	);
};
ContigentCondition.propTypes = {};
ContigentCondition.defaultProps = {};
export default ContigentCondition;
