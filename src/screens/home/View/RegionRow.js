import React, { useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import CommonStyle from '~/theme/theme_controller';
import I18n from '~/modules/language/';
import * as Controller from '~/memory/controller';
import { oktaCreateConfig } from '~/manage/manageOktaAuth';

const NUMBER_HEIGHT = 37; // 2 for border

const RegionRow = ({ item, index, showBrokerName, regionSelected = {} }) => {
	const { region_name: regionName } = item;
	const isSelected = useMemo(() => {
		try {
			return regionSelected.region_code === item.region_code;
		} catch (error) {
			return false;
		}
	});
	const handleSelectRegion = useCallback(() => {
		const { region_code: region } = item;
		Controller.setRegion(region);
		showBrokerName && showBrokerName(item);
	}, [item]);

	return (
		<TouchableOpacity
			onPress={handleSelectRegion}
			style={{
				width: '100%',
				height: NUMBER_HEIGHT,
				borderRadius: 8,
				borderWidth: 1,
				borderColor: isSelected
					? CommonStyle.color.modify
					: CommonStyle.color.dusk,
				justifyContent: 'center',
				alignItems: 'center',
				marginTop: index === 0 ? 24 : 8,
				backgroundColor: isSelected
					? CommonStyle.color.modify
					: 'transparent'
			}}
		>
			<Text
				style={{
					fontSize: CommonStyle.font15,
					color: isSelected
						? CommonStyle.fontDark
						: CommonStyle.fontWhite,
					fontFamily: CommonStyle.fontPoppinsRegular
				}}
			>
				{regionName}
			</Text>
		</TouchableOpacity>
	);
};

export default RegionRow;
