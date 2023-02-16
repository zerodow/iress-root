import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';

import Flag from '~/component/flags/flagIress.js';

import CommonStyle, { register } from '~/theme/theme_controller';
import Enum from '~/enum';
import I18n from '~/modules/language';

const getFlag = (countryCode) => {
	switch (countryCode) {
		case 'AUS':
			return Enum.FLAG.AU;

		default:
			return Enum.FLAG.US;
	}
};
const BoxSystemWatchlist = ({ item, index, onClose }) => {
	const {
		watchlist_name: watchlistName,
		watchlist,
		country_code: countryCode
	} = item;
	const priceBoardSelected = useSelector(
		(state) => state.priceBoard.priceBoardSelected
	);
	const dispatch = useDispatch();
	const onPressSystemWatchlist = useCallback(() => {
		dispatch.priceBoard.selectPriceBoard(watchlist);
		onClose && onClose();
	}, [watchlist]);

	let otherStyles = {};
	if (priceBoardSelected === priceBoardSelected + watchlist) {
		otherStyles = {
			borderWidth: 1,
			borderColor: CommonStyle.fontColorButtonSwitch
		};
	}

	return useMemo(() => {
		return (
			<TouchableOpacity onPress={onPressSystemWatchlist}>
				<View
					style={[
						styles.boxRow,
						{ marginTop: index !== 0 ? 16 : 0 },
						otherStyles
					]}
				>
					<Flag countryCode={getFlag(countryCode)} />
					<View
						style={{
							flex: 1
						}}
					>
						<Text numberOfLines={1} style={styles.textSymbol}>
							{watchlistName}
						</Text>
						<Text>
							<Text style={styles.textCompany}>{`${I18n.t(
								'watchlistCode'
							)}: `}</Text>
							<Text
								style={styles.textCode}
							>{`${watchlist}`}</Text>
						</Text>
					</View>
				</View>
			</TouchableOpacity>
		);
	}, [priceBoardSelected, watchlist, watchlistName]);
};
const styles = StyleSheet.create({
	boxRow: {
		paddingVertical: 8,
		paddingHorizontal: 16,
		borderWidth: 1,
		borderColor: CommonStyle.color.dusk,
		borderRadius: 8,
		flexDirection: 'row',
		alignItems: 'center'
	},
	textSymbol: {
		fontFamily: CommonStyle.fontPoppinsRegular,
		fontSize: CommonStyle.fontSizeM,
		color: CommonStyle.fontColor
	},
	textCompany: {
		fontFamily: CommonStyle.fontPoppinsRegular,
		fontSize: CommonStyle.fontSizeTen,
		color: CommonStyle.fontNearLight6
	},
	textCode: {
		fontFamily: CommonStyle.fontPoppinsRegular,
		fontSize: CommonStyle.fontSizeTen,
		color: CommonStyle.color.modify
	},
	boxClass: {
		paddingVertical: 2,
		paddingHorizontal: 4,
		borderRadius: 8,
		backgroundColor: 'rgb(8,108,205)',
		alignSelf: 'flex-start'
	},
	textClass: {
		fontSize: CommonStyle.fontMin,
		fontFamily: CommonStyle.fontPoppinsBold,
		color: CommonStyle.fontDark
	},
	boxSelected: {
		height: 32,
		width: 32,
		borderRadius: 100,
		justifyContent: 'center',
		alignItems: 'center'
	}
});
BoxSystemWatchlist.propTypes = {};
BoxSystemWatchlist.defaultProps = {};
export default BoxSystemWatchlist;
