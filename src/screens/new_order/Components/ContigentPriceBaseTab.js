import React, { useState, useRef } from 'react';
import { View, Dimensions, Text, TouchableOpacity } from 'react-native';
import { filter, forEach, includes, isEmpty, isEqual, size, split } from 'lodash';

import TabShape from '~/component/tabs_shape/index.js';
import CommonStyle from '~/theme/theme_controller';
import * as TabModel from '~/screens/new_order/Model/PriceBaseContingentTabModel';
import { useEffect } from 'react';

const { width } = Dimensions.get('window');
const margin = 8;
const grat = 6;
const padding = 4;

function getFillColorActive(keyTab) {
	return '#57E1F1';
}

const useData = ({ fixedPriceBase, defaultActive, exchange , ctTriggerPrice }) => {
	const _data = useRef({});
	const [data, setData] = useState({
		listPriceBase: [
			{
				title: 'BID',
				key: 'BID',
				value: 'BID'
			},
			{
				title: 'ASK',
				key: 'ASK',
				value: 'ASK'
			},
			{
				title: 'LAST',
				key: 'LAST',
				value: 'LAST'
			}
		],
		priceBaseSelected: defaultActive || TabModel.model.depth
	});

	if (!isEqual(fixedPriceBase, _data.current)) {
		const fixedPriceBaseData = {};
		fixedPriceBase && forEach(fixedPriceBase, (item) => {
			item.exchange && (fixedPriceBaseData[item.exchange] = item);
		});

		const { ct_price_base_display = 'LAST,BID,ASK', ct_price_base_default = 'LAST' } =
			fixedPriceBaseData[exchange || 'Default'] ||{}

		const listPriceBase = [];
		const pushData = (key) => {
			if(includes(ct_price_base_display , key)){
				listPriceBase.push({
					title: key,
					key,
					value: key
				});
			}
		}

		pushData('BID')
		pushData('ASK')
		pushData('LAST')

		let priceBaseSelected = ''

		if(ctTriggerPrice){
			priceBaseSelected =defaultActive || TabModel.model.depth
		}else {
			priceBaseSelected = ct_price_base_default || 'LAST'
		}
		_data.current = fixedPriceBase;
		setData({ listPriceBase, priceBaseSelected });
	}

	return [data.listPriceBase, data.priceBaseSelected];
};

const ContigentPriceBaseTab = ({
	defaultActive,
	onChangeTab,
	fixedPriceBase,
	exchange,
	ctTriggerPrice
}) => {
	const [listPriceBase, priceBaseSelected] = useData({
		fixedPriceBase,
		defaultActive,
		exchange,
		ctTriggerPrice
	});

	useEffect(() => {
		onChangeTab({
			title: priceBaseSelected,
			key: priceBaseSelected,
			value: priceBaseSelected
		});
	}, []);

	if (size(listPriceBase) === 1) {
		return (
			<TouchableOpacity
				style={{
					borderColor: 'rgb(58, 66, 94)',
					backgroundColor: '#57E1F1',
					borderWidth: 1,
					borderStyle: 'solid',
					borderRadius: 4,
					alignItems: 'center',
					justifyContent: 'center',
					height: 31,
					marginRight: 16,
					width : width / 2 - 16
				}}
				onPress={() => onChangeTab(listPriceBase[0])}
			>
				<Text
					style={{
						fontWeight: '700',
						color: '#171B29',
						fontSize: 14,
						opacity: 1,
						textTransform: 'uppercase'
					}}
				>
					{listPriceBase[0].title}
				</Text>
			</TouchableOpacity>
		);
	}

	let widthTab = width / 2 - 16 
	widthTab = widthTab + (grat - padding) * (size(listPriceBase) - 1)
	widthTab = widthTab / size(listPriceBase)

	return (
		<View
			style={{
				height: 31,
				alignItems: 'center',
				paddingHorizontal: margin,
				right: -(3 - padding - padding),
			}}
		>
			<TabShape
				tabs={listPriceBase}
				onChangeTab={onChangeTab}
				widthTab={widthTab}
				defaultActive={priceBaseSelected}
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
ContigentPriceBaseTab.propTypes = {};
ContigentPriceBaseTab.defaultProps = {};
export default ContigentPriceBaseTab;
