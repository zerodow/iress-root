import React, { useEffect, useCallback, useMemo } from 'react';
import { View, Keyboard } from 'react-native';
import { useSelector } from 'react-redux';

import Row from './Row/Index';
import ListDataAnimation from '~/screens/watchlist/EditWatchList/Components/FlatListSequenceAnimation/Test.js';

const Content = () => {
	const renderItem = useCallback(({ index, item }) => {
		return (
			<Row
				index={index}
				key={`${item.exchange}#${item.symbol}`}
				item={item}
			/>
		);
	}, []);
	const renderItemSeparatorComponent = useCallback(() => {
		return <View style={{ height: 8 }} />;
	}, []);
	const renderListFooterComponent = useCallback(() => {
		return <View style={{ height: 16 }} />;
	}, []);
	const keyExtractor = useCallback((item, index) => {
		return `${item.exchange}#${item.symbol}`;
	}, []);

	const listData = useSelector(
		(state) => state.editWatchlist.getIn(['priceBoard', 'value']) || []
	);
	const dismissKeyboard = useCallback(() => {
		Keyboard.dismiss();
	}, []);
	return useMemo(() => {
		// The rest of your rendering logic
		return (
			<View
				style={{
					paddingHorizontal: 8,
					flex: 1,
					paddingVertical: 8
				}}
			>
				<ListDataAnimation
					onScrollBeginDrag={dismissKeyboard}
					keyboardShouldPersistTaps={'always'}
					showsVerticalScrollIndicator={false}
					ItemSeparatorComponent={renderItemSeparatorComponent}
					ListFooterComponent={renderListFooterComponent}
					keyExtractor={keyExtractor}
					renderItem={renderItem}
					data={listData}
				/>
			</View>
		);
	}, [listData]);
};
Content.propTypes = {};
Content.defaultProps = {};

export default Content;
