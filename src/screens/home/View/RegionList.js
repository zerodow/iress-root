import React, {
	useLayoutEffect,
	useEffect,
	useState,
	useMemo,
	forwardRef,
	useImperativeHandle,
	useCallback,
	useRef
} from 'react';
import { View, Text, FlatList } from 'react-native';
import CommonStyle from '~/theme/theme_controller';
import I18n from '~/modules/language/';
import RegionRow from '~s/home/View/RegionRow';
import { dataStorage } from '~/storage';
import ENUM from '~/enum';
const NUMBER_ITEM = 10;
const NUMBER_HEIGHT = 39;
const { ENV_TYPE } = ENUM;
const LIST_REGION = [
	'Global',
	'Australia',
	'South Africa',
	'Central Africa',
	'United Kingdom',
	'Singapore'
];
export const useRefRegionSelectedWrapper = () => {
	const refRegionSelectedWrapper = useRef();
	return { refRegionSelectedWrapper };
};
let RegionList = ({ onSelected, listRegion, env }) => {
	const listRegionByEnv = useMemo(() => {
		try {
			return listRegion.filter((item) => {
				const { region_type: regionType } = item;
				return regionType === env;
			});
		} catch (error) {
			return [];
		}
	}, [listRegion, env]);

	const renderItem = ({ item, index }) => {
		return (
			<RegionRow item={item} index={index} showBrokerName={onSelected} />
		);
	};
	return (
		<View
			style={{
				flex: 1,
				maxHeight: NUMBER_ITEM * NUMBER_HEIGHT,
				marginHorizontal: 24
			}}
		>
			{listRegionByEnv.map((item, index) => {
				return renderItem({ item, index });
			})}
		</View>
	);
};
export default RegionList;
